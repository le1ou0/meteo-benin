"use client";

import { useState } from "react";
import { StatusMessage } from "@/components/StatusMessage";
import { GEOLOCATION_UNSUPPORTED, geolocationMessage, roundCoordinate } from "@/lib/geolocation";
import { MY_POSITION_ID } from "@/lib/locality-url";
import type { Locality } from "@/types/weather";

type LocateState = { status: "idle" } | { status: "locating" } | { status: "error"; message: string };

export function MyLocationButton({ onLocate }: { onLocate: (locality: Locality) => void }) {
  const [state, setState] = useState<LocateState>({ status: "idle" });

  function locate() {
    if (!("geolocation" in navigator)) {
      setState({ status: "error", message: GEOLOCATION_UNSUPPORTED });
      return;
    }
    setState({ status: "locating" });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({ status: "idle" });
        onLocate({
          id: MY_POSITION_ID,
          name: "Ma position",
          department: null,
          population: null,
          latitude: roundCoordinate(position.coords.latitude),
          longitude: roundCoordinate(position.coords.longitude),
        });
      },
      (error) => setState({ status: "error", message: geolocationMessage(error.code) }),
      { timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={locate}
        disabled={state.status === "locating"}
        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-900 outline-none hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
      >
        <span aria-hidden="true">📍</span>
        Ma position
      </button>
      <div aria-live="polite" className="mt-2">
        {state.status === "locating" && (
          <p role="status" className="text-sm text-zinc-700 dark:text-zinc-300">
            Localisation en cours…
          </p>
        )}
        {state.status === "error" && (
          <StatusMessage tone="error" message={state.message} actionLabel="Réessayer" onAction={locate} />
        )}
      </div>
    </div>
  );
}
