import { DrainageNode, DrainageEdge, NodeStatus, VulnerabilityLevel } from '../types/flood';

export class HydraulicDrainageEngine {
  /**
   * Calculate nominal Manning capacity for a circular gravity pipe in Liters/second
   * Q = (1/n) * A * R^(2/3) * S^(1/2)
   */
  static calculateManningCapacityLps(
    diameterM: number,
    slope: number,
    manningN: number = 0.015
  ): number {
    if (diameterM <= 0 || slope <= 0 || manningN <= 0) return 0;
    const safeSlope = Math.max(0.0005, slope);
    // Area = (pi * D^2) / 4
    // Hydraulic Radius = D / 4
    // Q (m3/s) = (0.3117 / n) * D^(8/3) * S^(1/2)
    const dischargeM3s = (0.3117 / manningN) * Math.pow(diameterM, 8 / 3) * Math.sqrt(safeSlope);
    return Math.round(dischargeM3s * 1000); // L/s
  }

  /**
   * Compute effective capacity after accounting for silt, debris, and structural blockage
   */
  static calculateEffectiveCapacityLps(
    nominalCapacityLps: number,
    blockagePercentage: number
  ): number {
    const clampedBlockage = Math.min(99, Math.max(0, blockagePercentage));
    // Non-linear hydraulic constriction loss: Q_eff = Q_nom * (1 - Blockage/100)^1.5
    const reductionFactor = Math.pow(1 - clampedBlockage / 100, 1.5);
    return Math.max(0, Math.round(nominalCapacityLps * reductionFactor));
  }

  /**
   * Run hydraulic topological flow propagation across the drainage network
   */
  static solveDrainageNetwork(
    nodes: DrainageNode[],
    edges: DrainageEdge[],
    surfaceInflowsLps: Record<string, number>, // nodeId -> surface runoff inflow in L/s
    additionalGlobalBlockagePct: number = 0,
    auxiliaryPumpCapacityLps: number = 0
  ): { nodes: DrainageNode[]; edges: DrainageEdge[] } {
    // 1. Initialize node and edge state
    const nodeMap = new Map<string, DrainageNode>();
    const edgeMap = new Map<string, DrainageEdge>();

    edges.forEach((rawEdge) => {
      const totalBlockage = Math.min(95, rawEdge.blockagePercentage + additionalGlobalBlockagePct);
      const effectiveCap = this.calculateEffectiveCapacityLps(rawEdge.nominalCapacityLps, totalBlockage);
      edgeMap.set(rawEdge.id, {
        ...rawEdge,
        blockagePercentage: totalBlockage,
        effectiveCapacityLps: effectiveCap,
        currentFlowLps: 0,
        utilizationPercentage: 0,
        isSurcharging: false,
      });
    });

    nodes.forEach((rawNode) => {
      const nodeBlockage = Math.min(95, rawNode.blockagePercentage + additionalGlobalBlockagePct);
      const effectiveCap = this.calculateEffectiveCapacityLps(rawNode.nominalCapacityLps, nodeBlockage);
      nodeMap.set(rawNode.id, {
        ...rawNode,
        blockagePercentage: nodeBlockage,
        effectiveCapacityLps: effectiveCap,
        currentInflowLps: surfaceInflowsLps[rawNode.id] || 0,
        upstreamFlowLps: 0,
        totalLoadLps: 0,
        loadPercentage: 0,
        surchargeRateLps: 0,
        surchargeVolumeM3: 0,
        status: 'NORMAL',
        vulnerabilityScore: 'LOW',
      });
    });

    // 2. Sort nodes by elevation descending (topological gravity flow direction)
    const sortedNodeIds = Array.from(nodeMap.values())
      .sort((a, b) => b.invertElevationM - a.invertElevationM)
      .map((n) => n.id);

    // 3. Propagate flows down the network
    for (const nodeId of sortedNodeIds) {
      const node = nodeMap.get(nodeId)!;
      const directInflow = node.currentInflowLps;
      const totalInflow = directInflow + node.upstreamFlowLps;
      node.totalLoadLps = Math.round(totalInflow);

      // Find all outgoing pipes from this node
      const outgoingEdges = Array.from(edgeMap.values()).filter((e) => e.startNodeId === nodeId);
      const totalOutPipeCapacity = outgoingEdges.reduce((sum, e) => sum + e.effectiveCapacityLps, 0);

      // Effective outlet capacity of this node
      const maxDischargeCapacity = Math.max(totalOutPipeCapacity, node.effectiveCapacityLps) + (auxiliaryPumpCapacityLps > 0 && nodeId === 'M10' ? auxiliaryPumpCapacityLps : 0);

      // Evaluate surcharge
      if (totalInflow > maxDischargeCapacity && maxDischargeCapacity > 0) {
        node.surchargeRateLps = Math.round(totalInflow - maxDischargeCapacity);
        node.loadPercentage = Math.round((totalInflow / maxDischargeCapacity) * 100);
        node.status = 'CRITICAL_SURCHARGE';
      } else {
        node.surchargeRateLps = 0;
        node.loadPercentage = maxDischargeCapacity > 0 ? Math.round((totalInflow / maxDischargeCapacity) * 100) : 0;
        if (node.loadPercentage > 100) node.status = 'OVERLOADED';
        else if (node.loadPercentage > 75) node.status = 'ELEVATED';
        else node.status = 'NORMAL';
      }

      // Distribute flow into outgoing pipes
      const actualDischarge = Math.min(totalInflow, maxDischargeCapacity);
      if (outgoingEdges.length > 0 && totalOutPipeCapacity > 0) {
        outgoingEdges.forEach((outEdge) => {
          const share = outEdge.effectiveCapacityLps / totalOutPipeCapacity;
          const pipeFlow = Math.min(outEdge.effectiveCapacityLps, actualDischarge * share);
          outEdge.currentFlowLps = Math.round(pipeFlow);
          outEdge.utilizationPercentage = Math.round((outEdge.currentFlowLps / Math.max(1, outEdge.effectiveCapacityLps)) * 100);
          outEdge.isSurcharging = outEdge.utilizationPercentage >= 100 || node.status === 'CRITICAL_SURCHARGE';

          // Deliver downstream to recipient node
          const downstreamNode = nodeMap.get(outEdge.endNodeId);
          if (downstreamNode) {
            downstreamNode.upstreamFlowLps += pipeFlow;
          }
        });
      }

      // Compute Drainage Vulnerability Score
      node.vulnerabilityScore = this.evaluateVulnerability(node);
    }

    return {
      nodes: Array.from(nodeMap.values()),
      edges: Array.from(edgeMap.values()),
    };
  }

  /**
   * Transparent Vulnerability Scoring based on Load, Surcharge, Blockage & Topography
   */
  private static evaluateVulnerability(node: DrainageNode): VulnerabilityLevel {
    let score = 0;
    if (node.loadPercentage >= 120) score += 40;
    else if (node.loadPercentage >= 90) score += 25;
    else if (node.loadPercentage >= 70) score += 15;

    if (node.blockagePercentage >= 35) score += 25;
    else if (node.blockagePercentage >= 20) score += 15;

    if (node.surchargeRateLps > 0) score += 25;

    // Low elevation sink penalty
    if (node.surfaceElevationM <= 208) score += 15;

    if (score >= 70) return 'CRITICAL';
    if (score >= 45) return 'HIGH';
    if (score >= 25) return 'MEDIUM';
    return 'LOW';
  }
}
