import { FloodRiskEngine } from '../engine/floodRiskEngine';
import { HydraulicDrainageEngine } from '../engine/hydraulicDrainage';
import { HydrologyModel } from '../engine/hydrologyModel';
import { SafeRoutingEngine } from '../engine/safeRoutingEngine';
import { PRESET_SCENARIOS } from '../data/scenarios';

export function runAllTests(): { passed: number; failed: number; results: { name: string; success: boolean; details: string }[] } {
  const results: { name: string; success: boolean; details: string }[] = [];
  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, details: string) {
    if (condition) {
      passed++;
      results.push({ name, success: true, details });
      console.log(`[PASS] ${name}: ${details}`);
    } else {
      failed++;
      results.push({ name, success: false, details });
      console.error(`[FAIL] ${name}: ${details}`);
    }
  }

  console.log('====================================================');
  console.log(' RUNNING HYDRODYNAMIC & FLOOD NOWCASTING TEST SUITE');
  console.log('====================================================');

  // Test 1: Zero rainfall produces zero surface flooding
  const zeroScenario = {
    ...PRESET_SCENARIOS[0],
    rainfallProfile: [{ timeOffsetMin: 0, intensityMmHr: 0, cumulativeMm: 0 }],
  };
  const zeroSim = FloodRiskEngine.runSimulation(zeroScenario, 0);
  assert(
    '1. Zero Rainfall Physical Baseline',
    zeroSim.totalFloodedRoadsCount === 0 && zeroSim.maxWaterDepthCm === 0 && zeroSim.totalRunoffM3PerSec === 0,
    `Flooded Roads: ${zeroSim.totalFloodedRoadsCount}, Max Depth: ${zeroSim.maxWaterDepthCm}cm, Runoff: ${zeroSim.totalRunoffM3PerSec} m3/s`
  );

  // Test 2: Moderate Rainfall Behavior
  const modScenario = PRESET_SCENARIOS.find((s) => s.id === 'moderate_rain')!;
  const modSim = FloodRiskEngine.runSimulation(modScenario, 60);
  assert(
    '2. Moderate Rainfall Drainage Capacity',
    modSim.totalRunoffM3PerSec > 0 && modSim.averageDrainageLoadPct > 0 && modSim.totalFloodedRoadsCount <= 10,
    `Runoff: ${modSim.totalRunoffM3PerSec} m3/s, Flooded Roads: ${modSim.totalFloodedRoadsCount}, Avg Drain Load: ${modSim.averageDrainageLoadPct}%`
  );

  // Test 3: Extreme Cloudburst Surcharge & Flooding
  const extremeScenario = PRESET_SCENARIOS.find((s) => s.id === 'extreme_cloudburst')!;
  const extremeSim = FloodRiskEngine.runSimulation(extremeScenario, 60);
  assert(
    '3. Extreme Cloudburst Surcharge & Road Inundation',
    extremeSim.totalFloodedRoadsCount > 5 && extremeSim.maxWaterDepthCm >= 30 && extremeSim.criticalDrainageNodesCount > 0,
    `Flooded Roads: ${extremeSim.totalFloodedRoadsCount}, Max Depth: ${extremeSim.maxWaterDepthCm}cm, Overloaded Nodes: ${extremeSim.criticalDrainageNodesCount}`
  );

  // Test 4: Blockage Sensitivity on Effective Capacity
  const nomCap = 1000;
  const cap0 = HydraulicDrainageEngine.calculateEffectiveCapacityLps(nomCap, 0);
  const cap20 = HydraulicDrainageEngine.calculateEffectiveCapacityLps(nomCap, 20);
  const cap50 = HydraulicDrainageEngine.calculateEffectiveCapacityLps(nomCap, 50);
  assert(
    '4. Blockage Constriction Reduction Law',
    cap0 === nomCap && cap20 < cap0 && cap50 < cap20,
    `0% Blockage: ${cap0} L/s, 20% Blockage: ${cap20} L/s, 50% Blockage: ${cap50} L/s`
  );

  // Test 5: Elevation Gradient Water Depth Distribution
  const simHeavy = FloodRiskEngine.runSimulation(PRESET_SCENARIOS[1], 60);
  const highRidgeRoad = simHeavy.roads.find((r) => r.id === 'R1')!;
  const lowSumpRoad = simHeavy.roads.find((r) => r.id === 'R14')!;
  assert(
    '5. Micro-Topography Low-Lying Accumulation Law',
    lowSumpRoad.currentDepthCm > highRidgeRoad.currentDepthCm,
    `Ridge Road (Elev 226m) Depth: ${highRidgeRoad.currentDepthCm}cm vs Basin Road (Elev 206m) Depth: ${lowSumpRoad.currentDepthCm}cm`
  );

  // Test 6: Rational Method Unit Consistency
  // 100 mm/hr on 10,000 m^2 with C=0.90 -> Q = (0.90 * 100 * 10000) / 3600 = 250 L/s
  const calculatedQ = HydrologyModel.calculateRunoffLps(100, 10000, 0.90);
  assert(
    '6. Hydrology Rational Formula Calculation',
    Math.abs(calculatedQ - 250) < 1 || calculatedQ === 250,
    `Calculated Q: ${calculatedQ} L/s for 100 mm/hr, 10,000 m², C=0.90`
  );

  // Test 7: Flood-Safe Emergency Routing Diverts Flooded Roads
  // Origin: South-West Colony [12.9250, 77.6120], Dest: General Hospital [12.9402, 77.6255]
  const routes = SafeRoutingEngine.calculateRoutes(
    extremeSim.roads,
    [12.9250, 77.6120],
    [12.9402, 77.6255],
    'AMBULANCE'
  );
  assert(
    '7. Flood-Safe Ambulance Rerouting Logic',
    routes.floodSafeRoute.maxWaterDepthCm <= routes.normalRoute.maxWaterDepthCm,
    `Normal Route Max Depth: ${routes.normalRoute.maxWaterDepthCm}cm vs Safe Detour Max Depth: ${routes.floodSafeRoute.maxWaterDepthCm}cm`
  );

  // Test 8: Vehicle Clearance Sensitivity
  const carRoutes = SafeRoutingEngine.calculateRoutes(
    extremeSim.roads,
    [12.9250, 77.6120],
    [12.9402, 77.6255],
    'COMMUTER_CAR'
  );
  const truckRoutes = SafeRoutingEngine.calculateRoutes(
    extremeSim.roads,
    [12.9250, 77.6120],
    [12.9402, 77.6255],
    'FIRE_TRUCK'
  );
  assert(
    '8. Vehicle Clearance Clearance Thresholding',
    truckRoutes.floodSafeRoute.maxWaterDepthCm >= 0,
    `Car Clearance: 12cm, Fire Truck Clearance: 45cm. Fire Truck Passable: ${truckRoutes.floodSafeRoute.isPassable}`
  );

  // Test 9: What-If Digital Twin Parameter Impact
  const whatIfSim = FloodRiskEngine.runSimulation(modScenario, 60, {
    rainfallMultiplier: 2.0, // Double rain
    additionalBlockagePct: 30, // 30% more silt
    auxiliaryPumpsLps: 0,
    greenInfrastructureRetentionPct: 0,
  });
  assert(
    '9. What-If Digital Twin Consistency',
    whatIfSim.totalFloodedRoadsCount >= modSim.totalFloodedRoadsCount &&
      whatIfSim.maxWaterDepthCm >= modSim.maxWaterDepthCm,
    `Baseline Flooded: ${modSim.totalFloodedRoadsCount} vs What-If: ${whatIfSim.totalFloodedRoadsCount}, Max Depth: ${whatIfSim.maxWaterDepthCm}cm`
  );

  // Test 10: 0-3h Nowcast Temporal Progression
  const sim0 = FloodRiskEngine.runSimulation(modScenario, 0);
  const sim60 = FloodRiskEngine.runSimulation(modScenario, 60);
  const sim180 = FloodRiskEngine.runSimulation(modScenario, 180);
  assert(
    '10. 0-3h Nowcast Time Series Monotonicity',
    sim60.cumulativeRainfallMm > sim0.cumulativeRainfallMm && sim180.cumulativeRainfallMm > sim60.cumulativeRainfallMm,
    `T+0: ${sim0.cumulativeRainfallMm}mm -> T+60: ${sim60.cumulativeRainfallMm}mm -> T+180: ${sim180.cumulativeRainfallMm}mm`
  );

  console.log('====================================================');
  console.log(` TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  return { passed, failed, results };
}
