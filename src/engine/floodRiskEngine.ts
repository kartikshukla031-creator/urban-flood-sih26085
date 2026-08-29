import {
  FloodScenario,
  SimulationResult,
  RoadSegment,
  DrainageNode,
  DrainageEdge,
  CriticalFacility,
  FloodAlert,
  WhatIfParameters,
  DEMCell,
} from '../types/flood';
import {
  RAW_DRAINAGE_NODES,
  RAW_DRAINAGE_EDGES,
  RAW_ROAD_SEGMENTS,
  RAW_CRITICAL_FACILITIES,
  generateDemoDEMGrid,
} from '../data/urbanCatchmentData';
import { RainfallModel } from './rainfallModel';
import { HydrologyModel } from './hydrologyModel';
import { HydraulicDrainageEngine } from './hydraulicDrainage';
import { SurfaceAccumulationEngine } from './surfaceAccumulation';
import { ExplainabilityEngine } from './explainability';

export class FloodRiskEngine {
  private static cachedDEM: DEMCell[] | null = null;

  private static getDEM(): DEMCell[] {
    if (!this.cachedDEM) {
      this.cachedDEM = generateDemoDEMGrid();
    }
    return this.cachedDEM;
  }

  /**
   * Run full hydrodynamic simulation for a given scenario and time offset
   */
  static runSimulation(
    scenario: FloodScenario,
    timeOffsetMin: number,
    whatIfParams?: WhatIfParameters
  ): SimulationResult {
    const rainfallMult = whatIfParams?.rainfallMultiplier ?? 1.0;
    const customIntensity = whatIfParams?.customIntensityMmHr;
    const additionalBlockage = whatIfParams?.additionalBlockagePct ?? 0;
    const auxPumps = (whatIfParams?.auxiliaryPumpsLps ?? 0) + scenario.auxiliaryPumpLps;
    const retentionPct = whatIfParams?.greenInfrastructureRetentionPct ?? 0;

    // 1. Current Rainfall Dynamics
    const rainfallIntensity = RainfallModel.getIntensityAtTime(
      scenario,
      timeOffsetMin,
      rainfallMult,
      customIntensity
    );
    const cumulativeRainfall = RainfallModel.getCumulativeRainfall(
      scenario,
      timeOffsetMin,
      rainfallMult,
      customIntensity
    );

    // 2. Compute Surface Runoff Inflow for each Drainage Node Catchment
    const surfaceInflowsLps: Record<string, number> = {};
    let totalCatchmentRunoffLps = 0;

    RAW_DRAINAGE_NODES.forEach((node) => {
      const spatialMultiplier = RainfallModel.getSpatialMultiplier(node.lat, node.lng);
      const localIntensity = rainfallIntensity * spatialMultiplier;
      const runoffLps = HydrologyModel.calculateRunoffLps(
        localIntensity,
        node.catchmentAreaM2,
        node.runoffCoefficient,
        retentionPct
      );
      surfaceInflowsLps[node.id] = runoffLps;
      totalCatchmentRunoffLps += runoffLps;
    });

    // 3. Solve Hydraulic Pipe Network & Surcharges
    // Prepare base nodes and edges
    const baseNodes: DrainageNode[] = RAW_DRAINAGE_NODES.map((n) => ({
      ...n,
      currentInflowLps: 0,
      upstreamFlowLps: 0,
      totalLoadLps: 0,
      loadPercentage: 0,
      effectiveCapacityLps: n.nominalCapacityLps,
      surchargeVolumeM3: 0,
      surchargeRateLps: 0,
      status: 'NORMAL',
      vulnerabilityScore: 'LOW',
    }));

    const baseEdges: DrainageEdge[] = RAW_DRAINAGE_EDGES.map((e) => ({
      ...e,
      effectiveCapacityLps: e.nominalCapacityLps,
      currentFlowLps: 0,
      utilizationPercentage: 0,
      isSurcharging: false,
    }));

    const hydraulicSolution = HydraulicDrainageEngine.solveDrainageNetwork(
      baseNodes,
      baseEdges,
      surfaceInflowsLps,
      additionalBlockage,
      auxPumps
    );

    // 4. Compute 2D Surface Water Ponding & Road Inundation
    const demCells = this.getDEM();
    const rawRoadsWithDefaults: RoadSegment[] = RAW_ROAD_SEGMENTS.map((r) => ({
      ...r,
      currentDepthCm: 0,
      predictedDepthCm: {},
      maxPredictedDepthCm: 0,
      floodProbabilityPct: 0,
      floodOnsetEtaMin: null,
      riskLevel: 'SAFE',
      confidence: 'HIGH',
      associatedDrainLoadPct: 0,
      factorAttribution: {
        heavyRainfallPct: 0,
        drainageOverloadPct: 0,
        lowElevationPct: 0,
        highImperviousnessPct: 0,
        pipeBlockagePct: 0,
        summaryExplanation: '',
      },
      recommendedAction: '',
      isPassable: true,
    }));

    const { updatedRoads, maxDepthCm } = SurfaceAccumulationEngine.computeSurfaceDepths(
      rawRoadsWithDefaults,
      demCells,
      hydraulicSolution.nodes,
      rainfallIntensity,
      cumulativeRainfall,
      timeOffsetMin
    );

    // 5. Precompute 0-3h multi-step time series for each road (0, 30, 60, 90, 120, 180 min)
    const timeSteps = [0, 30, 60, 90, 120, 180];
    const nodeMap = new Map<string, DrainageNode>(hydraulicSolution.nodes.map((n) => [n.id, n]));

    const fullyAnalyzedRoads: RoadSegment[] = updatedRoads.map((road) => {
      const predictedDepthMap: Record<number, number> = {};
      let roadMaxDepth = road.currentDepthCm;

      timeSteps.forEach((tStep) => {
        const stepIntensity = RainfallModel.getIntensityAtTime(scenario, tStep, rainfallMult, customIntensity);
        const stepCumulative = RainfallModel.getCumulativeRainfall(scenario, tStep, rainfallMult, customIntensity);
        
        // Approximate depth at step T
        const connectedNode = nodeMap.get(road.connectedDrainageNodeId);
        const loadRatio = connectedNode ? connectedNode.loadPercentage / 100 : 0.4;
        const elevDeficit = Math.max(0, 222 - road.minElevationM);

        let stepDepth = (stepIntensity / 100) * 12.0 * (1 + stepCumulative / 80) * (1 + Math.pow(elevDeficit / 9, 1.6));
        if (connectedNode && connectedNode.surchargeRateLps > 0) {
          stepDepth += (connectedNode.surchargeRateLps / 120) * 8;
        }
        if (road.minElevationM >= 223) {
          stepDepth = Math.min(5, stepDepth * 0.2);
        }
        const finalStepDepth = Math.round(Math.min(95, Math.max(0, stepDepth)) * 10) / 10;
        predictedDepthMap[tStep] = finalStepDepth;
        if (finalStepDepth > roadMaxDepth) roadMaxDepth = finalStepDepth;
      });

      // Compute explainability and classification
      const connectedNode = nodeMap.get(road.connectedDrainageNodeId);
      const attributionResult = ExplainabilityEngine.computeAttribution(
        road,
        connectedNode,
        rainfallIntensity,
        cumulativeRainfall,
        road.currentDepthCm
      );

      return {
        ...road,
        predictedDepthCm: predictedDepthMap,
        maxPredictedDepthCm: roadMaxDepth,
        floodProbabilityPct: attributionResult.probabilityPct,
        floodOnsetEtaMin: attributionResult.etaMin,
        riskLevel: attributionResult.riskLevel,
        confidence: attributionResult.confidence,
        factorAttribution: attributionResult.factorAttribution,
        recommendedAction: attributionResult.recommendedAction,
        isPassable: road.currentDepthCm < 25,
      };
    });

    // 6. Update Critical Facilities Status
    const roadMap = new Map<string, RoadSegment>(fullyAnalyzedRoads.map((r) => [r.id, r]));
    const updatedFacilities: CriticalFacility[] = RAW_CRITICAL_FACILITIES.map((fac) => {
      const nearestRoad = roadMap.get(fac.nearestRoadId);
      const roadDepth = nearestRoad ? nearestRoad.currentDepthCm : 0;
      const roadRisk = nearestRoad ? nearestRoad.riskLevel : 'SAFE';

      let accessStatus: CriticalFacility['accessStatus'] = 'ACCESSIBLE';
      let currentRisk = roadRisk;
      let alertMsg = fac.alertMessage;

      if (roadDepth >= 35) {
        accessStatus = 'CUT_OFF';
        currentRisk = 'SEVERE';
        alertMsg = `CRITICAL WARNING: Primary access road ${nearestRoad?.name} inundated (${roadDepth} cm). Immediate traffic diversion required.`;
      } else if (roadDepth >= 15) {
        accessStatus = 'MARGINAL';
        currentRisk = 'HIGH';
        alertMsg = `ACCESS WARNING: Road ${nearestRoad?.name} flooded (${roadDepth} cm). Emergency detour advised.`;
      }

      return {
        ...fac,
        currentRisk,
        accessStatus,
        predictedDepthCm: roadDepth,
        alertMessage: alertMsg,
      };
    });

    // 7. Auto-Generate Emergency Operational Alerts
    const alerts: FloodAlert[] = [];
    const nowIso = new Date().toLocaleTimeString();

    // Facility alerts
    updatedFacilities.forEach((fac) => {
      if (fac.accessStatus === 'CUT_OFF') {
        alerts.push({
          id: `ALT_FAC_${fac.id}`,
          title: `Access Cut-off: ${fac.name}`,
          severity: 'EMERGENCY',
          locationName: fac.name,
          coordinates: [fac.lat, fac.lng],
          timeHorizonMin: timeOffsetMin,
          waterDepthCm: fac.predictedDepthCm,
          probabilityPct: 95,
          confidence: 'HIGH',
          recommendedAction: `Deploy barrier crews; divert incoming ambulances to Alternate Route via High Ridge Highway.`,
          timestamp: nowIso,
        });
      } else if (fac.accessStatus === 'MARGINAL') {
        alerts.push({
          id: `ALT_FAC_${fac.id}`,
          title: `Access Impeded: ${fac.name}`,
          severity: 'WARNING',
          locationName: fac.name,
          coordinates: [fac.lat, fac.lng],
          timeHorizonMin: timeOffsetMin,
          waterDepthCm: fac.predictedDepthCm,
          probabilityPct: 75,
          confidence: 'HIGH',
          recommendedAction: `Monitor approach road ${fac.nearestRoadId}; prepare dewatering pump.`,
          timestamp: nowIso,
        });
      }
    });

    // High Risk Road alerts
    fullyAnalyzedRoads
      .filter((r) => r.riskLevel === 'SEVERE' || r.riskLevel === 'HIGH')
      .slice(0, 5)
      .forEach((road) => {
        alerts.push({
          id: `ALT_ROAD_${road.id}`,
          title: `Street Inundation: ${road.name}`,
          severity: road.riskLevel === 'SEVERE' ? 'CRITICAL' : 'WARNING',
          locationName: road.name,
          coordinates: road.coordinates[0],
          timeHorizonMin: road.floodOnsetEtaMin ?? timeOffsetMin,
          waterDepthCm: road.currentDepthCm,
          probabilityPct: road.floodProbabilityPct,
          confidence: road.confidence,
          recommendedAction: road.recommendedAction,
          timestamp: nowIso,
        });
      });

    // Drainage Surcharge alerts
    hydraulicSolution.nodes
      .filter((n) => n.status === 'CRITICAL_SURCHARGE')
      .forEach((node) => {
        alerts.push({
          id: `ALT_DRAIN_${node.id}`,
          title: `Drainage Node Surcharge: ${node.name}`,
          severity: 'CRITICAL',
          locationName: node.name,
          coordinates: [node.lat, node.lng],
          timeHorizonMin: 0,
          waterDepthCm: Math.round(node.surchargeRateLps / 25),
          probabilityPct: 92,
          confidence: 'HIGH',
          recommendedAction: `Surcharge backflow detected (${node.surchargeRateLps} L/s). Clear trash grates and inspect downstream pipe.`,
          timestamp: nowIso,
        });
      });

    // 8. Compute Aggregate KPIs
    const totalFloodedRoadsCount = fullyAnalyzedRoads.filter((r) => r.currentDepthCm >= 10).length;
    const highRiskRoadsCount = fullyAnalyzedRoads.filter((r) => r.riskLevel === 'HIGH' || r.riskLevel === 'SEVERE').length;
    const criticalDrainageNodesCount = hydraulicSolution.nodes.filter(
      (n) => n.status === 'CRITICAL_SURCHARGE' || n.status === 'OVERLOADED'
    ).length;
    const totalSurchVolume = hydraulicSolution.nodes.reduce(
      (sum, n) => sum + (n.surchargeRateLps * (timeOffsetMin * 60)) / 1000,
      0
    );
    const avgDrainLoad = Math.round(
      hydraulicSolution.nodes.reduce((sum, n) => sum + n.loadPercentage, 0) / hydraulicSolution.nodes.length
    );

    return {
      timeOffsetMin,
      rainfallIntensityMmHr: Math.round(rainfallIntensity * 10) / 10,
      cumulativeRainfallMm: Math.round(cumulativeRainfall * 10) / 10,
      totalRunoffM3PerSec: Math.round((totalCatchmentRunoffLps / 1000) * 100) / 100,
      roads: fullyAnalyzedRoads,
      drainageNodes: hydraulicSolution.nodes,
      drainageEdges: hydraulicSolution.edges,
      facilities: updatedFacilities,
      alerts,
      totalFloodedRoadsCount,
      highRiskRoadsCount,
      maxWaterDepthCm: maxDepthCm,
      criticalDrainageNodesCount,
      activeAlertsCount: alerts.length,
      averageDrainageLoadPct: avgDrainLoad,
      totalSurchargeVolumeM3: Math.round(totalSurchVolume),
    };
  }
}
