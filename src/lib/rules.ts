/** Seuils de la « Vigilance pluie » (inclus). */
export const RAIN_ALERT_MM = 20;
export const RAIN_ALERT_PROBABILITY = 80;

/** Vigilance si le cumul prévu atteint 20 mm ou si la probabilité atteint 80 %. */
export function isRainAlert(rainMm: number, probability: number | null): boolean {
  return rainMm >= RAIN_ALERT_MM || (probability ?? 0) >= RAIN_ALERT_PROBABILITY;
}
