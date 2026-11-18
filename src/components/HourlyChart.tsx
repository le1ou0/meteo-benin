import { formatRain, formatTemperature } from "@/lib/format";
import type { HourlyPoint } from "@/types/weather";

const WIDTH = 360;
const HEIGHT = 200;
const PAD = { top: 14, right: 12, bottom: 26, left: 34 };
const LABEL_EVERY = 3; // une étiquette d'heure toutes les 3 heures

/** « 2026-11-18T17:00 » -> « 17 h » (heure du Bénin, sans conversion). */
const hourLabel = (time: string) => `${time.slice(11, 13)} h`;

/**
 * Température (courbe) et pluie (barres) heure par heure sur les prochaines 24 heures.
 * Le graphique est décoratif pour les lecteurs d'écran : le résumé et le tableau de données le remplacent.
 */
export function HourlyChart({ points }: { points: HourlyPoint[] }) {
  if (points.length < 2) return null;

  const innerWidth = WIDTH - PAD.left - PAD.right;
  const innerHeight = HEIGHT - PAD.top - PAD.bottom;
  const temperatures = points.map((point) => point.temperature);
  const minTemperature = Math.floor(Math.min(...temperatures) - 1);
  const maxTemperature = Math.ceil(Math.max(...temperatures) + 1);
  const maxRain = Math.max(1, ...points.map((point) => point.precipitation));
  const totalRain = points.reduce((sum, point) => sum + point.precipitation, 0);

  const x = (index: number) => PAD.left + (index * innerWidth) / (points.length - 1);
  const yTemperature = (value: number) =>
    PAD.top + innerHeight - ((value - minTemperature) / (maxTemperature - minTemperature)) * innerHeight;
  const barWidth = Math.max(2, innerWidth / points.length - 3);
  const barHeight = (rain: number) => (rain / maxRain) * innerHeight * 0.45;
  const baseline = PAD.top + innerHeight;
  const line = points.map((point, index) => `${x(index).toFixed(1)},${yTemperature(point.temperature).toFixed(1)}`).join(" ");

  const summary = `Température de ${formatTemperature(Math.min(...temperatures))} à ${formatTemperature(
    Math.max(...temperatures),
  )}, cumul de pluie de ${formatRain(totalRain)} sur les ${points.length} prochaines heures.`;

  return (
    <section
      aria-labelledby="hourly-title"
      className="fade-in rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h3 id="hourly-title" className="text-sm font-semibold tracking-wide text-blue-800 dark:text-sky-300">
        Prochaines 24 heures
      </h3>
      <figure className="mt-3">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} aria-hidden="true" className="h-auto w-full">
          <line x1={PAD.left} x2={WIDTH - PAD.right} y1={PAD.top} y2={PAD.top} className="stroke-zinc-200 dark:stroke-zinc-800" />
          <line x1={PAD.left} x2={WIDTH - PAD.right} y1={baseline} y2={baseline} className="stroke-zinc-300 dark:stroke-zinc-700" />
          <text x={PAD.left - 6} y={PAD.top + 4} textAnchor="end" className="fill-zinc-600 text-[10px] dark:fill-zinc-400">
            {maxTemperature}°
          </text>
          <text x={PAD.left - 6} y={baseline} textAnchor="end" className="fill-zinc-600 text-[10px] dark:fill-zinc-400">
            {minTemperature}°
          </text>
          {points.map((point, index) =>
            point.precipitation > 0 ? (
              <rect
                key={`rain-${point.time}`}
                x={x(index) - barWidth / 2}
                y={baseline - barHeight(point.precipitation)}
                width={barWidth}
                height={barHeight(point.precipitation)}
                className="fill-rain/70"
              />
            ) : null,
          )}
          <polyline points={line} fill="none" strokeWidth={2} strokeLinejoin="round" className="stroke-blue-700 dark:stroke-blue-400" />
          {points.map((point, index) =>
            index % LABEL_EVERY === 0 ? (
              <text key={`label-${point.time}`} x={x(index)} y={HEIGHT - 8} textAnchor="middle" className="fill-zinc-600 text-[10px] dark:fill-zinc-400">
                {hourLabel(point.time)}
              </text>
            ) : null,
          )}
        </svg>
        <figcaption className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
          <span className="mr-4 inline-flex items-center gap-1">
            <span aria-hidden="true" className="inline-block h-0.5 w-4 bg-blue-700 dark:bg-blue-400" />
            Température
          </span>
          <span className="inline-flex items-center gap-1">
            <span aria-hidden="true" className="inline-block h-3 w-3 bg-rain/70" />
            Pluie
          </span>
          <span className="mt-1 block text-xs text-zinc-600 dark:text-zinc-400">{summary}</span>
        </figcaption>
      </figure>

      <table className="sr-only">
        <caption>Détail heure par heure, heure du Bénin</caption>
        <thead>
          <tr>
            <th scope="col">Heure</th>
            <th scope="col">Température</th>
            <th scope="col">Pluie</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.time}>
              <th scope="row">{hourLabel(point.time)}</th>
              <td>{formatTemperature(point.temperature)}</td>
              <td>{formatRain(point.precipitation)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
