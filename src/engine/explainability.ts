import { RoadSegment, DrainageNode, FactorAttribution, RiskLevel, ConfidenceLevel } from '../types/flood';

export class ExplainabilityEngine {
  /**
   * Compute transparent, normalized factor attribution for street-level flood risk
   * Answers: "WHY is this road high risk?"
   */
  static computeAttribution(
    road: RoadSegment,
    connectedNode: DrainageNode | undefined,
    rainfallIntensityMmHr: number,
    cumulativeRainfallMm: number,
    depthCm: number
  ): {
    factorAttribution: FactorAttribution;
    probabilityPct: number;
    riskLevel: RiskLevel;
    confidence: ConfidenceLevel;
    etaMin: number | null;
    recommendedAction: string;
  } {
    const nodeLoadPct = connectedNode ? connectedNode.loadPercentage : 30;
    const nodeBlockagePct = connectedNode ? connectedNode.blockagePercentage : 10;
    const elevationDeficit = Math.max(0, 225 - road.minElevationM); // 0 at top ridge, 20m at sink

    // 1. Raw contribution weights
    const rawRain = Math.min(100, (rainfallIntensityMmHr / 140) * 100 + (cumulativeRainfallMm / 100) * 40);
    const rawDrain = Math.min(100, (nodeLoadPct / 120) * 100);
    const rawElev = Math.min(100, (elevationDeficit / 18) * 100);
    const rawImperv = Math.min(100, road.imperviousness * 100);
    const rawBlockage = Math.min(100, (nodeBlockagePct / 50) * 100);

    // Sum of components
    const totalRaw = rawRain + rawDrain + rawElev + rawImperv + rawBlockage;

    // Normalized percentages summing to 100%
    const heavyRainfallPct = Math.round((rawRain / Math.max(1, totalRaw)) * 100);
    const drainageOverloadPct = Math.round((rawDrain / Math.max(1, totalRaw)) * 100);
    const lowElevationPct = Math.round((rawElev / Math.max(1, totalRaw)) * 100);
    const highImperviousnessPct = Math.round((rawImperv / Math.max(1, totalRaw)) * 100);
    const pipeBlockagePct = Math.max(0, 100 - (heavyRainfallPct + drainageOverloadPct + lowElevationPct + highImperviousnessPct));

    // 2. Derive deterministic Physical/ML Flood Probability (0-100%)
    let prob = 0;
    if (depthCm >= 35) prob = Math.min(99, 85 + Math.round((depthCm - 35) * 0.4));
    else if (depthCm >= 20) prob = Math.min(84, 65 + Math.round((depthCm - 20) * 1.3));
    else if (depthCm >= 10) prob = Math.min(64, 40 + Math.round((depthCm - 10) * 2.5));
    else if (depthCm >= 3) prob = Math.min(39, 15 + Math.round((depthCm - 3) * 3.5));
    else prob = Math.min(14, Math.round(depthCm * 4));

    // 3. Risk Level
    let riskLevel: RiskLevel = 'SAFE';
    if (depthCm >= 40 || prob >= 85) riskLevel = 'SEVERE';
    else if (depthCm >= 20 || prob >= 60) riskLevel = 'HIGH';
    else if (depthCm >= 8 || prob >= 30) riskLevel = 'MODERATE';

    // 4. Flood Onset ETA (Minutes to exceed passability threshold of 15cm)
    let etaMin: number | null = null;
    if (depthCm >= 15) {
      etaMin = 0; // Already inundated
    } else if (riskLevel === 'HIGH' || riskLevel === 'SEVERE') {
      const remainingDeficitCm = 15 - depthCm;
      const rateCmPerMin = Math.max(0.2, (rainfallIntensityMmHr / 60) * 0.25 * (nodeLoadPct / 100));
      etaMin = Math.round(remainingDeficitCm / rateCmPerMin);
    } else if (riskLevel === 'MODERATE') {
      etaMin = 45;
    }

    // 5. Confidence Level
    let confidence: ConfidenceLevel = 'HIGH';
    if (rainfallIntensityMmHr > 130) confidence = 'MEDIUM'; // High convective variance
    if (depthCm < 5 && rainfallIntensityMmHr > 60) confidence = 'MEDIUM';

    // 6. Action Directives
    let recommendedAction = 'Maintain normal traffic speed; monitoring drainage inflow.';
    if (riskLevel === 'SEVERE') {
      recommendedAction = 'MUNICIPAL BARRICADE REQUIRED. Divert all light vehicles. Deploy high-capacity dewatering pump unit.';
    } else if (riskLevel === 'HIGH') {
      recommendedAction = 'Issue caution advisory. Impassable for low-clearance vehicles. Clear culvert trash racks.';
    } else if (riskLevel === 'MODERATE') {
      recommendedAction = 'Moderate surface pooling. Reduce lane speed to 25 km/h. Inspect drain grates.';
    }

    // 7. Human-readable explanation summary
    const topFactors: string[] = [];
    if (heavyRainfallPct > 25) topFactors.push(`Intense rainfall (${heavyRainfallPct}%)`);
    if (drainageOverloadPct > 20) topFactors.push(`Drainage pipe overload (${drainageOverloadPct}%)`);
    if (lowElevationPct > 20) topFactors.push(`Low-lying basin depression (${lowElevationPct}%)`);
    if (pipeBlockagePct > 15) topFactors.push(`Silt/debris pipe blockage (${pipeBlockagePct}%)`);

    const summaryExplanation = topFactors.length > 0
      ? topFactors.join(' + ')
      : 'Standard topography and runoff capacity.';

    return {
      factorAttribution: {
        heavyRainfallPct,
        drainageOverloadPct,
        lowElevationPct,
        highImperviousnessPct,
        pipeBlockagePct,
        summaryExplanation,
      },
      probabilityPct: prob,
      riskLevel,
      confidence,
      etaMin,
      recommendedAction,
    };
  }
}
