import { describeWeather } from "@/lib/weather-codes";
import { formatPercent, formatTemperature, formatTime, formatWind } from "@/lib/format";
import type { CurrentWeather } from "@/types/weather";

export function CurrentWeatherCard({ current }: { current: CurrentWeather }) {
  const { label, icon } = describeWeather(current.weatherCode, current.isDay);

  return (
    <section
      aria-labelledby="current-title"
      className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h3 id="current-title" className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
        Météo actuelle
      </h3>
      <div className="mt-2 flex items-center gap-4">
        <span aria-hidden="true" className="text-6xl leading-none">
          {icon}
        </span>
        <div>
          <p className="text-5xl font-bold leading-none">{formatTemperature(current.temperature)}</p>
          <p className="mt-1 text-lg">{label}</p>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <div>
          <dt className="text-zinc-600 dark:text-zinc-400">Ressentie</dt>
          <dd className="font-semibold">{formatTemperature(current.apparentTemperature)}</dd>
        </div>
        <div>
          <dt className="text-zinc-600 dark:text-zinc-400">Humidité</dt>
          <dd className="font-semibold">{formatPercent(current.humidity)}</dd>
        </div>
        <div>
          <dt className="text-zinc-600 dark:text-zinc-400">Vent</dt>
          <dd className="font-semibold">{formatWind(current.windSpeed)}</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">
        Mis à jour à {formatTime(current.time)} (heure du Bénin)
      </p>
    </section>
  );
}
