import type { CurrentWeather, DailyForecast, Forecast, HourlyPoint, Locality } from "../types/weather";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const TIME_ZONE = "Africa/Porto-Novo";
const REQUEST_TIMEOUT_MS = 8000;
const FORECAST_TTL_MS = 10 * 60 * 1000;
export const MIN_QUERY_LENGTH = 2;

export type ApiErrorKind = "network" | "timeout" | "rate-limit" | "http";

/** Erreur de l'API ou du réseau, avec un message déjà lisible par l'utilisateur. */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }
}

async function getJson<T>(
  url: string,
  params: Record<string, string | number>,
  signal?: AbortSignal,
): Promise<T> {
  const query = new URLSearchParams(Object.entries(params).map(([key, value]) => [key, String(value)]));
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;

  let response: Response;
  try {
    response = await fetch(`${url}?${query}`, { signal: combined });
  } catch (error) {
    if (signal?.aborted) throw error; // annulation voulue : ce n'est pas une erreur
    if (timeout.aborted) {
      throw new ApiError("timeout", "Le service météo met trop de temps à répondre.");
    }
    throw new ApiError("network", "Impossible de joindre le service météo. Vérifiez votre connexion.");
  }

  if (response.status === 429) {
    throw new ApiError("rate-limit", "Trop de requêtes envoyées. Patientez quelques secondes puis réessayez.", 429);
  }
  if (!response.ok) {
    throw new ApiError("http", "Le service météo a rencontré un problème. Réessayez dans un instant.", response.status);
  }
  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError("http", "Le service météo a renvoyé une réponse inattendue.", response.status);
  }
}

// --- Recherche de localités ---------------------------------------------

interface RawLocality {
  id: number;
  name: string;
  admin1?: string | null;
  population?: number | null;
  latitude: number;
  longitude: number;
  feature_code?: string;
}

const isNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

const searchCache = new Map<string, Locality[]>();

/** Localités du Bénin correspondant au texte. `[]` sans appel sous 2 caractères. */
export async function searchLocalities(query: string, signal?: AbortSignal): Promise<Locality[]> {
  const text = query.trim();
  if (text.length < MIN_QUERY_LENGTH) return [];

  const key = text.toLowerCase();
  const cached = searchCache.get(key);
  if (cached) return cached;

  const data = await getJson<{ results?: RawLocality[] }>(
    GEOCODING_URL,
    { name: text, countryCode: "BJ", language: "fr", count: 10 },
    signal,
  );

  // `results` est absent quand rien ne correspond ; les aéroports ne sont pas des localités.
  const localities = (data.results ?? [])
    .filter((item) => item.feature_code?.startsWith("PPL"))
    .map<Locality>((item) => ({
      id: item.id,
      name: item.name,
      department: item.admin1 ?? null,
      population: typeof item.population === "number" ? item.population : null,
      latitude: item.latitude,
      longitude: item.longitude,
    }));

  searchCache.set(key, localities);
  return localities;
}

// --- Prévisions ------------------------------------------------------------

interface RawForecast {
  current?: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
    is_day: number;
  };
  daily?: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    precipitation_probability_max?: Array<number | null>;
  };
  hourly?: {
    time?: string[];
    temperature_2m?: Array<number | null>;
    precipitation?: Array<number | null>;
  };
}

/** Données horaires : facultatives. Un point invalide est ignoré ; sans données, le graphique est masqué. */
function parseHourly(raw: RawForecast["hourly"]): HourlyPoint[] {
  if (!raw || !Array.isArray(raw.time) || !Array.isArray(raw.temperature_2m) || !Array.isArray(raw.precipitation)) return [];
  const points: HourlyPoint[] = [];
  raw.time.forEach((time, index) => {
    const temperature = raw.temperature_2m?.[index];
    const precipitation = raw.precipitation?.[index];
    if (typeof time === "string" && isNumber(temperature) && isNumber(precipitation)) {
      points.push({ time, temperature, precipitation });
    }
  });
  return points;
}

const forecastCache = new Map<string, { at: number; data: Forecast }>();

/** Météo actuelle et prévisions sur 7 jours, à partir de la latitude et de la longitude. */
export async function fetchForecast(
  point: Pick<Locality, "latitude" | "longitude">,
  signal?: AbortSignal,
): Promise<Forecast> {
  const key = `${point.latitude.toFixed(3)},${point.longitude.toFixed(3)}`;
  const cached = forecastCache.get(key);
  if (cached && Date.now() - cached.at < FORECAST_TTL_MS) return cached.data;

  const raw = await getJson<RawForecast>(
    FORECAST_URL,
    {
      latitude: point.latitude,
      longitude: point.longitude,
      current: "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day",
      daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max",
      hourly: "temperature_2m,precipitation",
      forecast_hours: 24,
      timezone: TIME_ZONE,
      forecast_days: 7,
    },
    signal,
  );

  const { current, daily } = raw;
  const unexpected = () => new ApiError("http", "Le service météo a renvoyé une réponse inattendue.");
  if (!current || !daily?.time) throw unexpected();

  // Une valeur manquante ne doit jamais s'afficher sous la forme « NaN » ou « undefined ».
  const currentNumbers = [
    current.temperature_2m,
    current.apparent_temperature,
    current.relative_humidity_2m,
    current.wind_speed_10m,
    current.weather_code,
    current.is_day,
  ];
  const days = daily.time.length;
  const series = [daily.weather_code, daily.temperature_2m_max, daily.temperature_2m_min, daily.precipitation_sum];
  const hasValidSeries = series.every(
    (values) => Array.isArray(values) && values.length >= days && values.slice(0, days).every(isNumber),
  );
  if (typeof current.time !== "string" || !currentNumbers.every(isNumber) || days === 0 || !hasValidSeries) {
    throw unexpected();
  }

  const currentWeather: CurrentWeather = {
    time: current.time,
    temperature: current.temperature_2m,
    apparentTemperature: current.apparent_temperature,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    weatherCode: current.weather_code,
    isDay: current.is_day === 1,
  };
  const dailyForecasts = daily.time.map<DailyForecast>((date, index) => ({
    date,
    weatherCode: daily.weather_code[index],
    temperatureMax: daily.temperature_2m_max[index],
    temperatureMin: daily.temperature_2m_min[index],
    precipitationSum: daily.precipitation_sum[index],
    precipitationProbability: daily.precipitation_probability_max?.[index] ?? null,
  }));

  const data: Forecast = { current: currentWeather, daily: dailyForecasts, hourly: parseHourly(raw.hourly) };
  forecastCache.set(key, { at: Date.now(), data });
  return data;
}
