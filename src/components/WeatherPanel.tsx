"use client";

import { CurrentWeatherCard } from "@/components/CurrentWeatherCard";
import { ForecastList } from "@/components/ForecastList";
import { HourlyChart } from "@/components/HourlyChart";
import { StatusMessage } from "@/components/StatusMessage";
import { useForecast } from "@/hooks/useForecast";
import { formatPopulation } from "@/lib/format";
import { MY_POSITION_ID } from "@/lib/locality-url";
import type { Locality } from "@/types/weather";

interface WeatherPanelProps {
  locality: Locality | null;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

function Skeleton() {
  return (
    <div role="status" aria-label="Chargement de la météo" className="animate-pulse space-y-4">
      <span className="sr-only">Chargement de la météo…</span>
      <div className="h-40 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-28 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        ))}
      </div>
    </div>
  );
}

export function WeatherPanel({ locality, isFavorite, onToggleFavorite }: WeatherPanelProps) {
  const { state, retry } = useForecast(locality);

  if (!locality) {
    return (
      <StatusMessage message="Recherchez une localité ou choisissez un favori pour voir la météo." />
    );
  }

  const details = [locality.department, formatPopulation(locality.population)].filter(Boolean).join(" · ");

  return (
    <section aria-labelledby="locality-title" className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="locality-title" className="text-2xl font-bold">
            {locality.name}
          </h2>
          {details && <p className="text-sm text-zinc-600 dark:text-zinc-400">{details}</p>}
        </div>
        {locality.id !== MY_POSITION_ID && (
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-pressed={isFavorite}
            className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
              isFavorite
                ? "border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100"
                : "border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            }`}
          >
            <span aria-hidden="true">{isFavorite ? "★" : "☆"}</span>
            {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          </button>
        )}
      </div>

      {(state.status === "loading" || state.status === "idle") && <Skeleton />}
      {state.status === "error" && (
        <StatusMessage tone="error" message={state.message} actionLabel="Réessayer" onAction={retry} />
      )}
      {state.status === "success" && (
        <>
          <CurrentWeatherCard current={state.data.current} />
          <HourlyChart points={state.data.hourly} />
          <ForecastList days={state.data.daily} />
        </>
      )}
    </section>
  );
}
