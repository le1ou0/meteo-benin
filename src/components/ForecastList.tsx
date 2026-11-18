import { describeWeather } from "@/lib/weather-codes";
import { formatDayLabel, formatPercent, formatRain, formatTemperature } from "@/lib/format";
import { isRainAlert } from "@/lib/rules";
import type { DailyForecast } from "@/types/weather";

export function ForecastList({ days }: { days: DailyForecast[] }) {
  return (
    <section aria-labelledby="forecast-title" className="fade-in">
      <h3 id="forecast-title" className="text-sm font-semibold tracking-wide text-blue-800 dark:text-sky-300">
        Prévisions sur 7 jours
      </h3>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {days.map((day) => {
          const { label, icon } = describeWeather(day.weatherCode);
          const alert = isRainAlert(day.precipitationSum, day.precipitationProbability);
          const probability = day.precipitationProbability;
          return (
            <li
              key={day.date}
              className={`rounded-2xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:bg-zinc-900 ${
                alert
                  ? "border-zinc-200 border-l-4 border-l-red-600 dark:border-zinc-800 dark:border-l-red-500"
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <time dateTime={day.date} className="text-base font-bold">
                    {formatDayLabel(day.date)}
                  </time>
                  <p className="mt-1 flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
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
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-zinc-600 dark:text-zinc-400">Min</dt>
                  <dd className="font-semibold text-indigo-700 dark:text-indigo-300">{formatTemperature(day.temperatureMin)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-zinc-600 dark:text-zinc-400">Max</dt>
                  <dd className="font-semibold text-orange-700 dark:text-orange-300">{formatTemperature(day.temperatureMax)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-zinc-600 dark:text-zinc-400">Pluie</dt>
                  <dd className="font-semibold text-rain">{formatRain(day.precipitationSum)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-zinc-600 dark:text-zinc-400">Probabilité</dt>
                  <dd className="font-semibold text-rain">{formatPercent(probability)}</dd>
                </div>
              </dl>
              {probability !== null && (
                <div aria-hidden="true" className="mt-3 h-1.5 overflow-hidden rounded-full bg-rain-soft">
                  <div
                    className="h-full rounded-full bg-rain"
                    style={{ width: `${Math.min(100, Math.max(0, probability))}%` }}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
