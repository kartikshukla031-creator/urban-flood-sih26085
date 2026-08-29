import { DEMCell, RoadSegment, DrainageNode } from '../types/flood';

export class SurfaceAccumulationEngine {
  /**
   * Compute 2D Surface Water Movement and Street Ponding Depths
   */
  static computeSurfaceDepths(
    roads: RoadSegment[],
    demCells: DEMCell[],
    drainageNodes: DrainageNode[],
    rainfallIntensityMmHr: number,
    cumulativeRainfallMm: number,
    timeOffsetMin: number
  ): { updatedRoads: RoadSegment[]; maxDepthCm: number } {
    const nodeMap = new Map<string, DrainageNode>(drainageNodes.map((n) => [n.id, n]));
    let maxOverallDepthCm = 0;

    const updatedRoads = roads.map((road) => {
      const connectedNode = nodeMap.get(road.connectedDrainageNodeId);
      const nodeSurchargeLps = connectedNode ? connectedNode.surchargeRateLps : 0;
      const nodeLoadPct = connectedNode ? connectedNode.loadPercentage : 0;

      // 1. Direct surface runoff on road corridor
      // Road Area
      const roadAreaM2 = road.lengthM * road.widthM;
      // Inflow rate to road surface (L/s)
      const directRunoffLps = (road.imperviousness * rainfallIntensityMmHr * roadAreaM2) / 3600;

      // 2. Micro-topography accumulation factor:
      // Base elevation vs Lowest elevation in zone (200m)
      // Slopes below 1.0% retain water, steep slopes drain faster
      const elevationDeficitM = Math.max(0, 222 - road.minElevationM); // Low lying index (0 at ridge, 18m at sump)
      const topoVulnerabilityMultiplier = 1 + Math.pow(elevationDeficitM / 8.0, 1.8);
      const slopeDrainageFactor = Math.max(0.2, Math.min(1.0, 1.0 - (road.slopePercent / 4.0)));

      // 3. Surcharge contribution from connected manholes
      const surchargeContributionLps = nodeSurchargeLps * 0.45;

      // 4. Net Surface Ponding Dynamics
      // Balance between generation (direct + surcharge + run-on) vs surface runoff discharge
      const netWaterRateLps = (directRunoffLps * slopeDrainageFactor) + surchargeContributionLps;

      // Infiltration / residual drainage rate (L/s)
      const drainAbsorptionLps = connectedNode ? connectedNode.effectiveCapacityLps * 0.4 : 200;
      const netPondingLps = Math.max(0, netWaterRateLps - (nodeLoadPct < 100 ? drainAbsorptionLps : 0));

      // Dynamic depth calculation over time (incorporates cumulative rainfall effect)
      const accumulationFactor = Math.min(1.5, cumulativeRainfallMm / 60.0);
      let calculatedDepthCm = (netPondingLps / Math.max(1, roadAreaM2)) * 12.0 * (1 + accumulationFactor) * topoVulnerabilityMultiplier;

      // If high ridge elevation (>223m), gravity sheds water rapidly
      if (road.minElevationM >= 223) {
        calculatedDepthCm = Math.min(6, calculatedDepthCm * 0.25);
      }

      // If extreme underpass / depression sink (<206m) with overloaded drainage
      if (road.minElevationM <= 206 && (nodeLoadPct > 90 || nodeSurchargeLps > 0)) {
        calculatedDepthCm = Math.max(calculatedDepthCm, (cumulativeRainfallMm * 0.22) * (nodeLoadPct / 100) * 1.6);
      }

      // Clamp depth within realistic physical boundaries
      const clampedDepthCm = Math.round(Math.min(95, Math.max(0, calculatedDepthCm)) * 10) / 10;
      if (clampedDepthCm > maxOverallDepthCm) {
        maxOverallDepthCm = clampedDepthCm;
      }

      return {
        ...road,
        currentDepthCm: clampedDepthCm,
        associatedDrainLoadPct: Math.round(nodeLoadPct),
      };
    });

    return { updatedRoads, maxDepthCm: maxOverallDepthCm };
  }
}
