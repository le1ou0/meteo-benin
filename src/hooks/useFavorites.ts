"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  FAVORITES_KEY,
  addFavorite,
  isFavorite as hasFavorite,
  loadFavorites,
  removeFavorite,
  saveFavorites,
} from "@/lib/favorites";
import type { Locality } from "@/types/weather";

// Les favoris vivent dans localStorage. Un magasin externe évite tout écart
// d'hydratation : le serveur et le premier rendu client voient une liste vide.
const EMPTY: Locality[] = [];
let cache: Locality[] | null = null;
const listeners = new Set<() => void>();

function getSnapshot(): Locality[] {
  if (cache === null) cache = loadFavorites();
  return cache;
}

function getServerSnapshot(): Locality[] {
  return EMPTY;
}

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Un autre onglet a modifié les favoris : relire le stockage.
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === FAVORITES_KEY) {
      cache = null;
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function update(next: Locality[]) {
  cache = next;
  saveFavorites(next);
  emit();
}

export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const add = useCallback((locality: Locality) => update(addFavorite(getSnapshot(), locality)), []);
  const remove = useCallback((id: number) => update(removeFavorite(getSnapshot(), id)), []);
  const isFavorite = useCallback((id: number) => hasFavorite(favorites, id), [favorites]);
  return { favorites, add, remove, isFavorite };
}
