import type { Locality } from "../types/weather";

/** Identifiant réservé à « Ma position » (les localités de l'API ont un identifiant strictement positif). */
export const MY_POSITION_ID = 0;

const MAX_TEXT_LENGTH = 80;

/** Adresse partageable d'une localité : `?lieu=Parakou&id=2392204&lat=9.33716&lon=2.63031&dep=Borgou&pop=255478`. */
export function localityToQuery(locality: Locality): string {
  const params = new URLSearchParams({
    lieu: locality.name,
    id: String(locality.id),
    lat: String(locality.latitude),
    lon: String(locality.longitude),
  });
  if (locality.department) params.set("dep", locality.department);
  if (locality.population !== null) params.set("pop", String(locality.population));
  return `?${params}`;
}

const toNumber = (raw: string | null): number => (raw === null || raw.trim() === "" ? Number.NaN : Number(raw));

/** Relit une adresse : toute valeur invalide donne `null` (jamais d'exception, jamais de valeur douteuse). */
export function parseLocalityQuery(search: string): Locality | null {
  const params = new URLSearchParams(search);
  const name = params.get("lieu")?.trim() ?? "";
  const id = toNumber(params.get("id"));
  const latitude = toNumber(params.get("lat"));
  const longitude = toNumber(params.get("lon"));

  if (name === "" || name.length > MAX_TEXT_LENGTH) return null;
  if (!Number.isInteger(id) || id < 0) return null;
  if (!(Math.abs(latitude) <= 90) || !(Math.abs(longitude) <= 180)) return null;

  const department = params.get("dep")?.trim() ?? "";
  const population = toNumber(params.get("pop"));
  return {
    id,
    name,
    department: department !== "" && department.length <= MAX_TEXT_LENGTH ? department : null,
    population: Number.isInteger(population) && population >= 0 ? population : null,
    latitude,
    longitude,
  };
}
