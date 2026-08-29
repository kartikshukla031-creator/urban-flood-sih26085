import { RoadSegment, EmergencyVehicle, RouteOption, VehicleType } from '../types/flood';
import { EMERGENCY_VEHICLES } from '../data/scenarios';

interface GraphNode {
  coordKey: string; // "lat,lng"
  lat: number;
  lng: number;
  neighbors: Array<{
    targetKey: string;
    road: RoadSegment;
    distanceM: number;
  }>;
}

export class SafeRoutingEngine {
  /**
   * Build adjacency graph from road segments
   */
  private static buildGraph(roads: RoadSegment[]): Map<string, GraphNode> {
    const graph = new Map<string, GraphNode>();

    const getKey = (lat: number, lng: number) => `${lat.toFixed(4)},${lng.toFixed(4)}`;

    roads.forEach((road) => {
      if (road.coordinates.length < 2) return;
      const startCoord = road.coordinates[0];
      const endCoord = road.coordinates[road.coordinates.length - 1];

      const startKey = getKey(startCoord[0], startCoord[1]);
      const endKey = getKey(endCoord[0], endCoord[1]);

      if (!graph.has(startKey)) {
        graph.set(startKey, { coordKey: startKey, lat: startCoord[0], lng: startCoord[1], neighbors: [] });
      }
      if (!graph.has(endKey)) {
        graph.set(endKey, { coordKey: endKey, lat: endCoord[0], lng: endCoord[1], neighbors: [] });
      }

      const dist = road.lengthM;

      // Bidirectional urban road traversal
      graph.get(startKey)!.neighbors.push({ targetKey: endKey, road, distanceM: dist });
      graph.get(endKey)!.neighbors.push({ targetKey: startKey, road, distanceM: dist });
    });

    return graph;
  }

  /**
   * Find shortest node key nearest to given coordinate
   */
  private static findNearestNodeKey(graph: Map<string, GraphNode>, lat: number, lng: number): string {
    let bestKey = '';
    let minDist = Infinity;

    graph.forEach((node, key) => {
      const d = Math.hypot(node.lat - lat, node.lng - lng);
      if (d < minDist) {
        minDist = d;
        bestKey = key;
      }
    });

    return bestKey;
  }

  /**
   * Compute dynamic Dijkstra route between origin and destination
   */
  static calculateRoutes(
    roads: RoadSegment[],
    originCoords: [number, number],
    destCoords: [number, number],
    vehicleType: VehicleType = 'AMBULANCE'
  ): {
    normalRoute: RouteOption;
    floodSafeRoute: RouteOption;
  } {
    const graph = this.buildGraph(roads);
    const vehicle = EMERGENCY_VEHICLES.find((v) => v.type === vehicleType) || EMERGENCY_VEHICLES[0];

    const originKey = this.findNearestNodeKey(graph, originCoords[0], originCoords[1]);
    const destKey = this.findNearestNodeKey(graph, destCoords[0], destCoords[1]);

    // 1. Calculate Standard / Shortest Route (distance only, unconstrained)
    const normalRoute = this.runDijkstra(graph, originKey, destKey, vehicle, false);

    // 2. Calculate Flood-Safe Detour (penalizes water depth > clearance and flood risk)
    const floodSafeRoute = this.runDijkstra(graph, originKey, destKey, vehicle, true);

    return { normalRoute, floodSafeRoute };
  }

  private static runDijkstra(
    graph: Map<string, GraphNode>,
    startKey: string,
    endKey: string,
    vehicle: EmergencyVehicle,
    isFloodAware: boolean
  ): RouteOption {
    const distances = new Map<string, number>();
    const previous = new Map<string, { prevKey: string; road: RoadSegment }>();
    const unvisited = new Set<string>();

    graph.forEach((_, key) => {
      distances.set(key, Infinity);
      unvisited.add(key);
    });

    distances.set(startKey, 0);

    while (unvisited.size > 0) {
      let currentKey: string | null = null;
      let minDistance = Infinity;

      unvisited.forEach((key) => {
        const d = distances.get(key)!;
        if (d < minDistance) {
          minDistance = d;
          currentKey = key;
        }
      });

      if (!currentKey || minDistance === Infinity || currentKey === endKey) {
        break;
      }

      unvisited.delete(currentKey);
      const currentNode = graph.get(currentKey)!;

      for (const edge of currentNode.neighbors) {
        if (!unvisited.has(edge.targetKey)) continue;

        let edgeCost = edge.distanceM;
        const depth = edge.road.currentDepthCm;

        if (isFloodAware) {
          if (depth > vehicle.maxClearanceCm * 1.5) {
            // Effectively impassable
            edgeCost *= 500;
          } else if (depth > 0) {
            const depthRatio = depth / vehicle.maxClearanceCm;
            edgeCost *= 1 + vehicle.safetyPenaltyMultiplier * Math.pow(depthRatio, 2.2);
          }

          if (edge.road.riskLevel === 'SEVERE') edgeCost *= 4.0;
          else if (edge.road.riskLevel === 'HIGH') edgeCost *= 2.2;
        }

        const alt = distances.get(currentKey)! + edgeCost;
        if (alt < distances.get(edge.targetKey)!) {
          distances.set(edge.targetKey, alt);
          previous.set(edge.targetKey, { prevKey: currentKey, road: edge.road });
        }
      }
    }

    // Reconstruct Path
    const pathCoords: [number, number][] = [];
    const roadIds: string[] = [];
    let curr = endKey;
    let totalDistM = 0;
    let maxDepthEncountered = 0;
    let totalRiskScore = 0;

    while (previous.has(curr)) {
      const step = previous.get(curr)!;
      roadIds.unshift(step.road.id);
      totalDistM += step.road.lengthM;
      if (step.road.currentDepthCm > maxDepthEncountered) {
        maxDepthEncountered = step.road.currentDepthCm;
      }
      totalRiskScore += step.road.floodProbabilityPct;
      curr = step.prevKey;
    }

    // Collect all coordinates along path
    roadIds.forEach((rId) => {
      const r = Array.from(graph.values())
        .flatMap((n) => n.neighbors)
        .find((edge) => edge.road.id === rId)?.road;
      if (r) {
        r.coordinates.forEach((c) => pathCoords.push(c));
      }
    });

    const distanceKm = Math.round((totalDistM / 1000) * 100) / 100;
    const avgSpeed = vehicle.averageSpeedKmh * (maxDepthEncountered > 15 ? 0.6 : 1.0);
    const estimatedTimeMin = Math.round((distanceKm / Math.max(5, avgSpeed)) * 60);
    const averageRisk = roadIds.length > 0 ? Math.round(totalRiskScore / roadIds.length) : 0;
    const isPassable = maxDepthEncountered <= vehicle.maxClearanceCm * 1.3;

    const detourSummary = isFloodAware
      ? isPassable
        ? `Flood-Safe Detour: High ground corridor avoiding severe inundation hotspots (Max depth: ${maxDepthEncountered}cm).`
        : `Warning: Severe city-wide flooding. Even safe detour encounters ${maxDepthEncountered}cm depth.`
      : `Standard Direct Route: Shortest traversal (${distanceKm} km), max depth ${maxDepthEncountered}cm.`;

    const riskSummary = isPassable
      ? 'Passable for selected emergency vehicle.'
      : `IMPASSABLE: Exceeds vehicle safety clearance threshold (${vehicle.maxClearanceCm}cm).`;

    return {
      vehicleType: vehicle.type,
      routeType: isFloodAware ? 'FLOOD_SAFE_DETOUR' : 'NORMAL_SHORTEST',
      distanceKm,
      estimatedTimeMin,
      estimatedTravelTimeMin: estimatedTimeMin,
      maxWaterDepthCm: maxDepthEncountered,
      averageRiskScore: averageRisk,
      isPassable,
      roadIds,
      coordinates: pathCoords,
      detourSummary,
      riskSummary,
    };
  }
}
