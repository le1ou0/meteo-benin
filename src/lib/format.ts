/** Fuseau du Bénin (GMT+1), quel que soit le fuseau de l'ordinateur. */
const TIME_ZONE = "Africa/Porto-Novo";
const NBSP = " ";

const dayFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: TIME_ZONE,
});
const rainFormatter = new Intl.NumberFormat("fr-FR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const populationFormatter = new Intl.NumberFormat("fr-FR");

/** `2026-11-18` -> `mer. 18 nov.` */
export function formatDayLabel(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ? isoDate : dayFormatter.format(date);
}

export const formatTemperature = (value: number): string => `${Math.round(value)}${NBSP}°C`;
export const formatWind = (value: number): string => `${Math.round(value)}${NBSP}km/h`;
export const formatRain = (value: number): string => `${rainFormatter.format(value)}${NBSP}mm`;
export const formatPercent = (value: number | null): string =>
  value === null ? "—" : `${Math.round(value)}${NBSP}%`;

/** `2026-11-18T17:15` -> `17:15` (heure du Bénin, sans conversion). */
export function formatTime(isoDateTime: string): string {
  return /T(\d{2}:\d{2})/.exec(isoDateTime)?.[1] ?? isoDateTime;
}

/** `255478` -> `255 478 hab.` ; `null` si la population est inconnue. */
export function formatPopulation(population: number | null): string | null {
  return population === null ? null : `${populationFormatter.format(population)}${NBSP}hab.`;
}
