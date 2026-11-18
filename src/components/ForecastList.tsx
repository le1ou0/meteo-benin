import { describeWeather } from "@/lib/weather-codes";
import { formatDayLabel, formatPercent, formatRain, formatTemperature } from "@/lib/format";
import { isRainAlert } from "@/lib/rules";
import type { DailyForecast } from "@/types/weather";

export function ForecastList({ days }: { days: DailyForecast[] }) {
  return (
    <section aria-labelledby="forecast-title">
      <h3 id="forecast-title" className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
        Prévisions sur 7 jours
      </h3>
      <ul className="mt-2 grid gap-3 sm:grid-cols-2">
        {days.map((day) => {
          const { label, icon } = describeWeather(day.weatherCode);
          const alert = isRainAlert(day.precipitationSum, day.precipitationProbability);
          return (
            <li
              key={day.date}
              className={`rounded-xl border bg-white p-4 dark:bg-zinc-900 ${
                alert
                  ? "border-zinc-200 border-l-4 border-l-red-600 dark:border-zinc-800 dark:border-l-red-500"
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <time dateTime={day.date} className="font-semibold">
                    {formatDayLabel(day.date)}
                  </time>
                  <p className="mt-1 flex items-center gap-2 text-sm">
                    <span aria-hidden="true" className="text-2xl leading-none">
                      {icon}
                    </span>
                    <span>{label}</span>
                  </p>
                </div>
                {alert && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-sm font-semibold text-white">
                    <span aria-hidden="true">⚠</span> Vigilance pluie
                  </span>
                )}
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-zinc-600 dark:text-zinc-400">Min</dt>
                  <dd className="font-semibold">{formatTemperature(day.temperatureMin)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-zinc-600 dark:text-zinc-400">Max</dt>
                  <dd className="font-semibold">{formatTemperature(day.temperatureMax)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-zinc-600 dark:text-zinc-400">Pluie</dt>
                  <dd className="font-semibold">{formatRain(day.precipitationSum)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-zinc-600 dark:text-zinc-400">Probabilité</dt>
                  <dd className="font-semibold">{formatPercent(day.precipitationProbability)}</dd>
                </div>
              </dl>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
