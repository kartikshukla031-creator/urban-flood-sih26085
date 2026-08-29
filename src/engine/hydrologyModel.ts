/**
 * Hydrology Runoff Module
 * Uses the standard Rational Method to compute urban peak runoff:
 * Q = (C * I * A) / 3600  (in Liters/second)
 * 
 * Where:
 * - C: Dimensionless Runoff Coefficient (0.25 permeable vegetation to 0.95 impervious concrete/asphalt)
 * - I: Rainfall intensity (mm/hr)
 * - A: Catchment surface area (m²)
 * - Conversion factor: 1 mm/hr * 1 m² = 10^-3 m³/hr = (1 / 3600) L/s
 */

export class HydrologyModel {
  /**
   * Calculate instantaneous runoff discharge rate (Liters per second)
   */
  static calculateRunoffLps(
    rainfallIntensityMmHr: number,
    catchmentAreaM2: number,
    runoffCoefficient: number,
    retentionReductionPct: number = 0
  ): number {
    if (rainfallIntensityMmHr <= 0 || catchmentAreaM2 <= 0) return 0;

    // Effective runoff coefficient after green retention/SUDS
    const effectiveC = Math.max(0.05, runoffCoefficient * (1 - retentionReductionPct / 100));

    // Rational formula: 1 mm * 1 m^2 = 1 Liter
    // 1 mm/hr * 1 m^2 = 1 Liter / hour = (1 / 3600) Liters / second
    // Q (L/s) = (effectiveC * rainfallIntensityMmHr * catchmentAreaM2) / 3600
    const dischargeLps = (effectiveC * rainfallIntensityMmHr * catchmentAreaM2) / 3600;
    return Math.round(dischargeLps * 10) / 10;
  }

  /**
   * Calculate cumulative runoff volume in cubic meters (m³) over duration deltaMinutes
   */
  static calculateRunoffVolumeM3(
    averageRunoffLps: number,
    durationMinutes: number
  ): number {
    const volumeLiters = averageRunoffLps * (durationMinutes * 60);
    return Math.round((volumeLiters / 1000) * 10) / 10;
  }
}
