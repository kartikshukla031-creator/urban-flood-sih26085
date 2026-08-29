import { FloodScenario, RainfallNowcastPoint } from '../types/flood';

export class RainfallModel {
  /**
   * Interpolate rainfall intensity (mm/hr) at a specific time offset (minutes)
   */
  static getIntensityAtTime(
    scenario: FloodScenario,
    timeOffsetMin: number,
    rainfallMultiplier: number = 1.0,
    customIntensity?: number
  ): number {
    if (customIntensity !== undefined && customIntensity >= 0) {
      return customIntensity * rainfallMultiplier;
    }

    const profile = scenario.rainfallProfile;
    if (!profile || profile.length === 0) return 0;

    // Boundary conditions
    if (timeOffsetMin <= profile[0].timeOffsetMin) {
      return profile[0].intensityMmHr * rainfallMultiplier;
    }
    const lastPoint = profile[profile.length - 1];
    if (timeOffsetMin >= lastPoint.timeOffsetMin) {
      return lastPoint.intensityMmHr * rainfallMultiplier;
    }

    // Linear piecewise interpolation between nowcast keyframes
    for (let i = 0; i < profile.length - 1; i++) {
      const p1 = profile[i];
      const p2 = profile[i + 1];
      if (timeOffsetMin >= p1.timeOffsetMin && timeOffsetMin <= p2.timeOffsetMin) {
        const factor = (timeOffsetMin - p1.timeOffsetMin) / (p2.timeOffsetMin - p1.timeOffsetMin);
        const interpolated = p1.intensityMmHr + factor * (p2.intensityMmHr - p1.intensityMmHr);
        return Math.max(0, interpolated * rainfallMultiplier);
      }
    }

    return 0;
  }

  /**
   * Calculate cumulative rainfall depth in mm up to time offset T
   */
  static getCumulativeRainfall(
    scenario: FloodScenario,
    timeOffsetMin: number,
    rainfallMultiplier: number = 1.0,
    customIntensity?: number
  ): number {
    // Integrate numerically using trapezoidal rule with 5-minute dt
    const dtMin = 5;
    let cumulative = 0;
    for (let t = 0; t < timeOffsetMin; t += dtMin) {
      const i1 = this.getIntensityAtTime(scenario, t, rainfallMultiplier, customIntensity);
      const i2 = this.getIntensityAtTime(scenario, t + dtMin, rainfallMultiplier, customIntensity);
      const avgIntensity = (i1 + i2) / 2; // mm/hr
      const depthMm = avgIntensity * (dtMin / 60); // mm
      cumulative += depthMm;
    }
    return Math.round(cumulative * 10) / 10;
  }

  /**
   * Spatial rainfall multiplier using distance from storm centroid
   * Simulates realistic spatial storm cell variation across the 3.5 km² catchment
   */
  static getSpatialMultiplier(lat: number, lng: number, stormCenterLat: number = 12.9350, stormCenterLng: number = 77.6200): number {
    const distKm = Math.hypot((lat - stormCenterLat) * 111, (lng - stormCenterLng) * 111 * Math.cos((lat * Math.PI) / 180));
    // Convective core with 1.8km radius of max intensity, tapering to 0.75x at outskirts
    const decay = Math.exp(-0.5 * Math.pow(distKm / 1.6, 2));
    return 0.75 + 0.35 * decay;
  }
}
