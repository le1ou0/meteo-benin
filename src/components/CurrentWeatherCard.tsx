import { describeWeather } from "@/lib/weather-codes";
import { formatPercent, formatTemperature, formatTime, formatWind } from "@/lib/format";
import type { CurrentWeather } from "@/types/weather";

const TILE = "flex flex-col items-center justify-between gap-1 rounded-xl bg-white/80 p-3 text-center shadow-sm dark:bg-zinc-800/70";
const LABEL = "flex flex-col items-center text-zinc-600 dark:text-zinc-400";

export function CurrentWeatherCard({ current }: { current: CurrentWeather }) {
  const { label, icon } = describeWeather(current.weatherCode, current.isDay);

  return (
    <section
      aria-labelledby="current-title"
      className="fade-in overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-blue-50 p-5 shadow-sm sm:p-6 dark:border-zinc-800 dark:from-sky-950 dark:via-zinc-900 dark:to-zinc-900"
    >
      <h3 id="current-title" className="text-sm font-semibold tracking-wide text-blue-800 dark:text-sky-300">
        Météo actuelle
      </h3>
      <div className="mt-3 flex items-center gap-5">
        <span aria-hidden="true" className="text-7xl leading-none drop-shadow-sm">
          {icon}
        </span>
        <div>
          <p className="text-5xl font-bold leading-none sm:text-6xl">{formatTemperature(current.temperature)}</p>
          <p className="mt-2 text-lg">{label}</p>
        </div>
      </div>
      <dl className="mt-5 grid grid-cols-3 gap-2 text-sm sm:gap-3">
        <div className={TILE}>
          <dt className={LABEL}>
            <span aria-hidden="true">🌡️</span> Ressentie
          </dt>
          <dd className="text-base font-semibold">{formatTemperature(current.apparentTemperature)}</dd>
        </div>
        <div className={TILE}>
          <dt className={LABEL}>
            <span aria-hidden="true">💧</span> Humidité
          </dt>
          <dd className="text-base font-semibold">{formatPercent(current.humidity)}</dd>
        </div>
        <div className={TILE}>
          <dt className={LABEL}>
            <span aria-hidden="true">💨</span> Vent
          </dt>
          <dd className="text-base font-semibold">{formatWind(current.windSpeed)}</dd>
        </div>
      </dl>
      <p className="mt-4 text-xs text-zinc-600 dark:text-zinc-400">
        Mis à jour à {formatTime(current.time)} (heure du Bénin)
      </p>
    </section>
  );
}
