"use client";

import { useEffect, useId, useState } from "react";
import { StatusMessage } from "@/components/StatusMessage";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { MIN_QUERY_LENGTH, searchLocalities } from "@/lib/api";
import { toUserMessage } from "@/lib/errors";
import { formatPopulation } from "@/lib/format";
import type { Locality } from "@/types/weather";

const SEARCH_DELAY_MS = 400;

type SearchOutcome = { key: string; results: Locality[] } | { key: string; message: string };

interface SearchBoxProps {
  onSelect: (locality: Locality) => void;
  isFavorite: (id: number) => boolean;
}

export function SearchBox({ onSelect, isFavorite }: SearchBoxProps) {
  const inputId = useId();
  const helpId = useId();
  const [text, setText] = useState("");
  const [chosen, setChosen] = useState<string | null>(null); // texte posé par un choix : pas de nouvelle recherche
  const [attempt, setAttempt] = useState(0);
  const [outcome, setOutcome] = useState<SearchOutcome | null>(null);

  const trimmed = text.trim();
  const debounced = useDebouncedValue(trimmed, SEARCH_DELAY_MS);
  const isTyping = trimmed.length >= MIN_QUERY_LENGTH && trimmed !== debounced && trimmed !== chosen;
  // Après un choix, la liste disparaît tout de suite (sans attendre la fin de l'anti-rebond).
  const isSearching = debounced.length >= MIN_QUERY_LENGTH && trimmed !== chosen && debounced !== chosen;
  const searchKey = `${debounced}:${attempt}`;

  useEffect(() => {
    if (!isSearching) return;
    const controller = new AbortController();
    searchLocalities(debounced, controller.signal).then(
      (results) => {
        if (!controller.signal.aborted) setOutcome({ key: searchKey, results });
      },
      (error: unknown) => {
        if (!controller.signal.aborted) setOutcome({ key: searchKey, message: toUserMessage(error) });
      },
    );
    return () => controller.abort();
  }, [debounced, isSearching, searchKey]);

  // Une réponse n'est montrée que si elle répond à la recherche en cours.
  const current = isSearching && outcome?.key === searchKey ? outcome : null;
  const showLoading = isTyping || (isSearching && current === null);

  function choose(locality: Locality) {
    setChosen(locality.name);
    setText(locality.name);
    onSelect(locality);
  }

  return (
    <section aria-label="Recherche d'une localité">
      <label htmlFor={inputId} className="block text-sm font-semibold">
        Rechercher une localité
      </label>
      <input
        id={inputId}
        type="search"
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          if (event.target.value.trim() !== chosen) setChosen(null);
        }}
        placeholder="Ex. : Parakou, Cotonou…"
        autoComplete="off"
        spellCheck={false}
        aria-describedby={helpId}
        className="mt-1 h-12 w-full rounded-lg border border-zinc-300 bg-white px-4 text-base text-zinc-900 outline-none placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
      />
      <p id={helpId} className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Saisissez au moins {MIN_QUERY_LENGTH} caractères.
      </p>

      <div aria-live="polite" className="mt-3">
        {showLoading && (
          <p role="status" className="text-sm text-zinc-700 dark:text-zinc-300">
            Recherche en cours…
          </p>
        )}
        {!showLoading && current && "message" in current && (
          <StatusMessage
            tone="error"
            message={current.message}
            actionLabel="Réessayer"
            onAction={() => setAttempt((count) => count + 1)}
          />
        )}
        {!showLoading && current && "results" in current && current.results.length === 0 && (
          <StatusMessage
            message={`Aucune localité du Bénin ne correspond à « ${debounced} ».`}
            hint="Vérifiez l'orthographe ou essayez avec 3 caractères ou plus."
          />
        )}
        {!showLoading && current && "results" in current && current.results.length > 0 && (
          <ul className="divide-y divide-zinc-200 overflow-hidden rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
            {current.results.map((locality) => {
              const details = [locality.department, formatPopulation(locality.population)]
                .filter(Boolean)
                .join(" · ");
              return (
                <li key={locality.id}>
                  <button
                    type="button"
                    onClick={() => choose(locality)}
                    className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-2 text-left outline-none hover:bg-blue-50 focus-visible:bg-blue-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600 dark:hover:bg-zinc-800 dark:focus-visible:bg-zinc-800"
                  >
                    <span>
                      <span className="block font-semibold">{locality.name}</span>
                      {details && <span className="block text-sm text-zinc-600 dark:text-zinc-400">{details}</span>}
                    </span>
                    {isFavorite(locality.id) && (
                      <span className="shrink-0 text-amber-500">
                        <span aria-hidden="true">★</span>
                        <span className="sr-only">Déjà en favori</span>
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
