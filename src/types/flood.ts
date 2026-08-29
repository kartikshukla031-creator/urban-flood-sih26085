// Types definition for SIH26085 - Urban Flood Nowcasting System

export type RiskLevel = 'SAFE' | 'MODERATE' | 'HIGH' | 'SEVERE';
export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type NodeStatus = 'NORMAL' | 'ELEVATED' | 'OVERLOADED' | 'CRITICAL_SURCHARGE';
export type VulnerabilityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type LandUseType = 'ROAD' | 'COMMERCIAL_CONCRETE' | 'RESIDENTIAL_PAVED' | 'GREEN_PERMEABLE' | 'WATER_BODY';
export type FacilityType = 'HOSPITAL' | 'FIRE_STATION' | 'POLICE_HQ' | 'TRANSIT_HUB' | 'SCHOOL' | 'SHELTER';
export type AccessStatus = 'ACCESSIBLE' | 'MARGINAL' | 'CUT_OFF';
export type VehicleType = 'AMBULANCE' | 'FIRE_TRUCK' | 'POLICE_CRUISER' | 'PUBLIC_BUS' | 'COMMUTER_CAR';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface DEMCell {
  id: string;
  gridX: number;
  gridY: number;
  lat: number;
  lng: number;
  elevationM: number;
  slopePercent: number;
  aspectDeg: number;
  landUse: LandUseType;
  runoffCoefficient: number; // e.g. 0.90 for roads, 0.25 for green
  catchmentAreaM2: number;
  flowDirectionTargetId?: string;
  accumulatedWaterDepthCm: number;
  surfaceWaterVolumeM3: number;
}

export interface DrainageNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
  invertElevationM: number;
  surfaceElevationM: number;
  catchmentAreaM2: number;
  runoffCoefficient: number;
  nominalCapacityLps: number;
  effectiveCapacityLps: number;
  currentInflowLps: number;
  upstreamFlowLps: number;
  totalLoadLps: number;
  loadPercentage: number; // (totalLoad / effectiveCapacity) * 100
  blockagePercentage: number; // 0-100%
  surchargeVolumeM3: number;
  surchargeRateLps: number;
  status: NodeStatus;
  vulnerabilityScore: VulnerabilityLevel;
  maintenancePriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  connectedPipes: string[];
}

export interface DrainageEdge {
  id: string;
  name: string;
  startNodeId: string;
  endNodeId: string;
  lengthM: number;
  diameterM: number;
  slope: number;
  manningN: number;
  nominalCapacityLps: number;
  effectiveCapacityLps: number;
  currentFlowLps: number;
  utilizationPercentage: number;
  blockagePercentage: number;
  isSurcharging: boolean;
  coordinates: [number, number][]; // [[lat, lng], [lat, lng]]
}

export interface FactorAttribution {
  heavyRainfallPct: number;
  drainageOverloadPct: number;
  lowElevationPct: number;
  highImperviousnessPct: number;
  pipeBlockagePct: number;
  summaryExplanation: string;
}

export interface RoadSegment {
  id: string;
  name: string;
  roadType: 'arterial' | 'collector' | 'local' | 'expressway';
  coordinates: [number, number][];
  lengthM: number;
  widthM: number;
  elevationM: number;
  minElevationM: number;
  slopePercent: number;
  imperviousness: number;
  connectedDrainageNodeId: string;
  
  // Dynamic flood simulation results
  currentDepthCm: number;
  predictedDepthCm: Record<number, number>; // key: time offset in minutes (0, 30, 60, 90, 120, 180)
  maxPredictedDepthCm: number;
  floodProbabilityPct: number;
  floodOnsetEtaMin: number | null; // minutes to reach 15cm critical threshold
  riskLevel: RiskLevel;
  confidence: ConfidenceLevel;
  associatedDrainLoadPct: number;
  factorAttribution: FactorAttribution;
  recommendedAction: string;
  isPassable: boolean;
}

export interface CriticalFacility {
  id: string;
  name: string;
  type: FacilityType;
  lat: number;
  lng: number;
  elevationM: number;
  nearestRoadId: string;
  currentRisk: RiskLevel;
  accessStatus: AccessStatus;
  predictedDepthCm: number;
  alertMessage: string;
  recommendedAccessRoute?: string;
}

export interface EmergencyVehicle {
  type: VehicleType;
  name: string;
  icon: string;
  maxClearanceCm: number; // Max water depth vehicle can safely traverse
  safetyPenaltyMultiplier: number;
  averageSpeedKmh: number;
}

export interface RouteOption {
  vehicleType: VehicleType;
  routeType: 'NORMAL_SHORTEST' | 'FLOOD_SAFE_DETOUR';
  distanceKm: number;
  estimatedTravelTimeMin: number;
  estimatedTimeMin: number;
  maxWaterDepthCm: number;
  averageRiskScore: number; // 0-100
  isPassable: boolean;
  roadIds: string[];
  coordinates: [number, number][];
  detourSummary: string;
  riskSummary: string;
}

export interface RainfallNowcastPoint {
  timeOffsetMin: number; // 0, 30, 60, 90, 120, 180
  intensityMmHr: number;
  cumulativeMm: number;
  spatialCenterLat?: number;
  spatialCenterLng?: number;
}

export interface FloodScenario {
  id: string;
  name: string;
  description: string;
  badge: string;
  rainfallProfile: RainfallNowcastPoint[];
  defaultBlockagePct: number;
  auxiliaryPumpLps: number;
}

export interface WhatIfParameters {
  rainfallMultiplier: number; // 0.5x to 2.5x
  customIntensityMmHr?: number;
  additionalBlockagePct: number; // 0 to 80%
  auxiliaryPumpsLps: number; // 0 to 600 L/s
  greenInfrastructureRetentionPct: number; // 0 to 40%
}

export interface FloodAlert {
  id: string;
  title: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'EMERGENCY';
  locationName: string;
  coordinates: [number, number];
  timeHorizonMin: number;
  waterDepthCm: number;
  probabilityPct: number;
  confidence: ConfidenceLevel;
  recommendedAction: string;
  timestamp: string;
}

export interface SimulationResult {
  timeOffsetMin: number;
  rainfallIntensityMmHr: number;
  cumulativeRainfallMm: number;
  totalRunoffM3PerSec: number;
  roads: RoadSegment[];
  drainageNodes: DrainageNode[];
  drainageEdges: DrainageEdge[];
  facilities: CriticalFacility[];
  alerts: FloodAlert[];
  
  // Aggregate Metrics
  totalFloodedRoadsCount: number; // Depth > 10cm
  highRiskRoadsCount: number; // Risk HIGH or SEVERE
  maxWaterDepthCm: number;
  criticalDrainageNodesCount: number;
  activeAlertsCount: number;
  averageDrainageLoadPct: number;
  totalSurchargeVolumeM3: number;
}
