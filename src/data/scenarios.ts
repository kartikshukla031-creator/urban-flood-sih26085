import { FloodScenario, EmergencyVehicle } from '../types/flood';

export const PRESET_SCENARIOS: FloodScenario[] = [
  {
    id: 'moderate_rain',
    name: '1. Moderate Monsoon Rain',
    description: 'Steady 45-60 mm/hr rainfall across catchment. Primary drainage network operates within design thresholds.',
    badge: 'MODERATE (55 mm/h)',
    rainfallProfile: [
      { timeOffsetMin: 0, intensityMmHr: 35, cumulativeMm: 0 },
      { timeOffsetMin: 30, intensityMmHr: 50, cumulativeMm: 21 },
      { timeOffsetMin: 60, intensityMmHr: 60, cumulativeMm: 48 },
      { timeOffsetMin: 90, intensityMmHr: 55, cumulativeMm: 76 },
      { timeOffsetMin: 120, intensityMmHr: 40, cumulativeMm: 100 },
      { timeOffsetMin: 180, intensityMmHr: 20, cumulativeMm: 130 },
    ],
    defaultBlockagePct: 10,
    auxiliaryPumpLps: 0,
  },
  {
    id: 'heavy_rain',
    name: '2. Heavy Convective Rainfall',
    description: 'Intense rainstorm reaching 110 mm/hr. Localized surcharge begins at central sump M10 and subway underpass M11.',
    badge: 'HEAVY (110 mm/h)',
    rainfallProfile: [
      { timeOffsetMin: 0, intensityMmHr: 60, cumulativeMm: 0 },
      { timeOffsetMin: 30, intensityMmHr: 80, cumulativeMm: 35 },
      { timeOffsetMin: 60, intensityMmHr: 110, cumulativeMm: 82 },
      { timeOffsetMin: 90, intensityMmHr: 130, cumulativeMm: 142 },
      { timeOffsetMin: 120, intensityMmHr: 95, cumulativeMm: 198 },
      { timeOffsetMin: 180, intensityMmHr: 50, cumulativeMm: 270 },
    ],
    defaultBlockagePct: 20,
    auxiliaryPumpLps: 0,
  },
  {
    id: 'extreme_cloudburst',
    name: '3. Extreme Cloudburst & Surcharge (Severe)',
    description: 'Sudden high-intensity cloudburst peak of 165 mm/hr. Multiple road corridors experience 30-55 cm inundation and drainage backflow.',
    badge: 'CLOUDBURST (165 mm/h)',
    rainfallProfile: [
      { timeOffsetMin: 0, intensityMmHr: 90, cumulativeMm: 0 },
      { timeOffsetMin: 30, intensityMmHr: 135, cumulativeMm: 56 },
      { timeOffsetMin: 60, intensityMmHr: 165, cumulativeMm: 131 },
      { timeOffsetMin: 90, intensityMmHr: 150, cumulativeMm: 210 },
      { timeOffsetMin: 120, intensityMmHr: 110, cumulativeMm: 275 },
      { timeOffsetMin: 180, intensityMmHr: 70, cumulativeMm: 365 },
    ],
    defaultBlockagePct: 30,
    auxiliaryPumpLps: 0,
  },
  {
    id: 'heavy_blocked_drainage',
    name: '4. Heavy Rain + 45% Silt Blockage',
    description: 'Heavy rain coupled with neglected solid waste and silt blockage in major trunk pipes P14-P16, causing severe premature surcharge.',
    badge: 'BLOCKED DRAINS (45%)',
    rainfallProfile: [
      { timeOffsetMin: 0, intensityMmHr: 60, cumulativeMm: 0 },
      { timeOffsetMin: 30, intensityMmHr: 85, cumulativeMm: 36 },
      { timeOffsetMin: 60, intensityMmHr: 115, cumulativeMm: 86 },
      { timeOffsetMin: 90, intensityMmHr: 125, cumulativeMm: 146 },
      { timeOffsetMin: 120, intensityMmHr: 90, cumulativeMm: 200 },
      { timeOffsetMin: 180, intensityMmHr: 45, cumulativeMm: 267 },
    ],
    defaultBlockagePct: 45,
    auxiliaryPumpLps: 0,
  },
  {
    id: 'emergency_response_demo',
    name: '5. Emergency Ambulance Corridor Test',
    description: 'High inundation cutting off arterial R14 & R15. Evaluates flood-safe Dijkstra routing for Trauma Ambulance to City General Hospital.',
    badge: 'SAFE ROUTING DEMO',
    rainfallProfile: [
      { timeOffsetMin: 0, intensityMmHr: 70, cumulativeMm: 0 },
      { timeOffsetMin: 30, intensityMmHr: 100, cumulativeMm: 42 },
      { timeOffsetMin: 60, intensityMmHr: 130, cumulativeMm: 99 },
      { timeOffsetMin: 90, intensityMmHr: 120, cumulativeMm: 161 },
      { timeOffsetMin: 120, intensityMmHr: 80, cumulativeMm: 211 },
      { timeOffsetMin: 180, intensityMmHr: 40, cumulativeMm: 271 },
    ],
    defaultBlockagePct: 30,
    auxiliaryPumpLps: 0,
  },
];

export const EMERGENCY_VEHICLES: EmergencyVehicle[] = [
  {
    type: 'AMBULANCE',
    name: 'Emergency Ambulance / ALS',
    icon: 'Ambulance',
    maxClearanceCm: 18, // Vulnerable low clearance
    safetyPenaltyMultiplier: 8.0,
    averageSpeedKmh: 45,
  },
  {
    type: 'FIRE_TRUCK',
    name: 'Heavy Fire Tender / Rescue Unit',
    icon: 'Flame',
    maxClearanceCm: 45, // Heavy 4x4 clearance
    safetyPenaltyMultiplier: 3.0,
    averageSpeedKmh: 40,
  },
  {
    type: 'POLICE_CRUISER',
    name: 'Police Rapid Response Vehicle',
    icon: 'Shield',
    maxClearanceCm: 22,
    safetyPenaltyMultiplier: 6.0,
    averageSpeedKmh: 50,
  },
  {
    type: 'PUBLIC_BUS',
    name: 'City Electric Transit Bus',
    icon: 'Bus',
    maxClearanceCm: 35,
    safetyPenaltyMultiplier: 4.5,
    averageSpeedKmh: 30,
  },
  {
    type: 'COMMUTER_CAR',
    name: 'Standard Light Passenger Car',
    icon: 'Car',
    maxClearanceCm: 12, // Engine stall risk >15cm
    safetyPenaltyMultiplier: 10.0,
    averageSpeedKmh: 35,
  },
];
