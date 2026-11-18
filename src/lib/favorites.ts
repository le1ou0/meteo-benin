import type { Locality } from "../types/weather";

export const FAVORITES_KEY = "meteo-benin:favoris";

type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "setItem">;

/** Ajoute une localité sans jamais créer de doublon (clé : `id`). */
export function addFavorite(list: Locality[], locality: Locality): Locality[] {
  return list.some((item) => item.id === locality.id) ? list : [...list, locality];
}

export function removeFavorite(list: Locality[], id: number): Locality[] {
  return list.filter((item) => item.id !== id);
}

export function isFavorite(list: Locality[], id: number): boolean {
  return list.some((item) => item.id === id);
}

function isLocality(value: unknown): value is Locality {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "number" &&
    typeof item.name === "string" &&
    typeof item.latitude === "number" &&
    typeof item.longitude === "number"
  );
}

/** Lecture tolérante : tout ce qui n'est pas une localité valide est ignoré. */
export function parseFavorites(raw: unknown): Locality[] {
  if (!Array.isArray(raw)) return [];
  const result: Locality[] = [];
  for (const item of raw) {
    if (!isLocality(item)) continue;
    result.push({
      id: item.id,
      name: item.name,
      department: typeof item.department === "string" ? item.department : null,
      population: typeof item.population === "number" ? item.population : null,
      latitude: item.latitude,
      longitude: item.longitude,
    });
  }
  return result.reduce(addFavorite, [] as Locality[]);
}

export function loadFavorites(storage?: ReadableStorage): Locality[] {
  try {
    const source = storage ?? globalThis.localStorage;
    const text = source.getItem(FAVORITES_KEY);
    return text ? parseFavorites(JSON.parse(text)) : [];
  } catch {
    return [];
  }
}

export function saveFavorites(list: Locality[], storage?: WritableStorage): void {
  try {
    (storage ?? globalThis.localStorage).setItem(FAVORITES_KEY, JSON.stringify(list));
  } catch {
    // Stockage indisponible (navigation privée, quota) : les favoris restent en mémoire.
  }
}
