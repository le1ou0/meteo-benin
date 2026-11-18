"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchForecast } from "@/lib/api";
import { toUserMessage } from "@/lib/errors";
import type { Forecast, Locality } from "@/types/weather";

export type ForecastState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: Forecast }
  | { status: "error"; message: string };

type Outcome = { key: string; data: Forecast } | { key: string; message: string };

/**
 * Charge la météo de la localité et annule l'appel en cours si elle change.
 * Chaque réponse porte la clé de la requête qui l'a produite : l'état est dérivé
 * à l'affichage, donc une réponse périmée n'est jamais montrée.
 */
export function useForecast(locality: Locality | null) {
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [attempt, setAttempt] = useState(0);
  const requestKey = locality ? `${locality.id}:${attempt}` : null;

  useEffect(() => {
    if (!locality || requestKey === null) return;
    const controller = new AbortController();
    fetchForecast(locality, controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setOutcome({ key: requestKey, data });
      },
      (error: unknown) => {
        if (!controller.signal.aborted) setOutcome({ key: requestKey, message: toUserMessage(error) });
      },
    );
    return () => controller.abort();
  }, [locality, requestKey]);

  let state: ForecastState = { status: "idle" };
  if (locality) {
    if (outcome?.key !== requestKey) state = { status: "loading" };
    else if ("data" in outcome) state = { status: "success", data: outcome.data };
    else state = { status: "error", message: outcome.message };
  }

  const retry = useCallback(() => setAttempt((count) => count + 1), []);
  return { state, retry };
}
