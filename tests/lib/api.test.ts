import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

const GEOCODING = {
  results: [
    { id: 2392204, name: "Parakou", admin1: "Borgou", population: 255478, latitude: 9.33716, longitude: 2.63031, feature_code: "PPLA" },
    { id: 6296402, name: "Parakou Airport", admin1: "Borgou", latitude: 9.35, longitude: 2.61667, feature_code: "AIRP" },
    { id: 7, name: "Village sans population", latitude: 9, longitude: 2, feature_code: "PPL" },
  ],
};

const FORECAST = {
  current: { time: "2026-11-18T17:15", temperature_2m: 31.8, apparent_temperature: 33.7, relative_humidity_2m: 38, wind_speed_10m: 0.8, weather_code: 2, is_day: 1 },
  daily: {
    time: ["2026-11-18", "2026-11-19"],
    weather_code: [3, 63],
    temperature_2m_max: [33.1, 30.2],
    temperature_2m_min: [19.7, 21.4],
    precipitation_sum: [0, 22.5],
    precipitation_probability_max: [0, null],
  },
};

/** Recharge le module : chaque test repart avec des caches vides. */
async function loadApi() {
  vi.resetModules();
  return import("@/lib/api");
}

const fetchMock = vi.fn();
const calledUrl = () => new URL(String(fetchMock.mock.calls.at(-1)?.[0]));

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("searchLocalities", () => {
  it("ne fait aucun appel sous 2 caractères", async () => {
    const { searchLocalities } = await loadApi();
    expect(await searchLocalities("")).toEqual([]);
    expect(await searchLocalities(" ")).toEqual([]);
    expect(await searchLocalities("P")).toEqual([]);
    expect(await searchLocalities("  P  ")).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("interroge le géocodage limité au Bénin, en français", async () => {
    fetchMock.mockResolvedValue(json(GEOCODING));
    const { searchLocalities } = await loadApi();
    await searchLocalities("Parakou");

    const url = calledUrl();
    expect(url.origin + url.pathname).toBe("https://geocoding-api.open-meteo.com/v1/search");
    expect(Object.fromEntries(url.searchParams)).toEqual({ name: "Parakou", countryCode: "BJ", language: "fr", count: "10" });
  });

  it("convertit les résultats et écarte les aéroports", async () => {
    fetchMock.mockResolvedValue(json(GEOCODING));
    const { searchLocalities } = await loadApi();
    const results = await searchLocalities("Parakou");

    expect(results).toEqual([
      { id: 2392204, name: "Parakou", department: "Borgou", population: 255478, latitude: 9.33716, longitude: 2.63031 },
      { id: 7, name: "Village sans population", department: null, population: null, latitude: 9, longitude: 2 },
    ]);
  });

  it("renvoie une liste vide quand la clé `results` est absente", async () => {
    fetchMock.mockResolvedValue(json({ generationtime_ms: 0.4 }));
    const { searchLocalities } = await loadApi();
    expect(await searchLocalities("zzzzqq")).toEqual([]);
  });

  it("mémorise la réponse (casse et espaces ignorés) : un seul appel", async () => {
    fetchMock.mockResolvedValue(json(GEOCODING));
    const { searchLocalities } = await loadApi();
    await searchLocalities("Parakou");
    await searchLocalities("  PARAKOU ");
    await searchLocalities("parakou");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("ne mémorise pas un échec : la tentative suivante refait l'appel", async () => {
    fetchMock.mockResolvedValueOnce(json({}, 500)).mockResolvedValueOnce(json(GEOCODING));
    const { searchLocalities } = await loadApi();
    await expect(searchLocalities("Parakou")).rejects.toThrow();
    expect(await searchLocalities("Parakou")).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe("fetchForecast", () => {
  const point = { latitude: 9.33716, longitude: 2.63031 };

  it("demande la météo actuelle et 7 jours, à l'heure du Bénin", async () => {
    fetchMock.mockResolvedValue(json(FORECAST));
    const { fetchForecast } = await loadApi();
    await fetchForecast(point);

    const params = calledUrl().searchParams;
    expect(calledUrl().origin + calledUrl().pathname).toBe("https://api.open-meteo.com/v1/forecast");
    expect(params.get("latitude")).toBe("9.33716");
    expect(params.get("longitude")).toBe("2.63031");
    expect(params.get("timezone")).toBe("Africa/Porto-Novo");
    expect(params.get("forecast_days")).toBe("7");
    expect(params.get("current")?.split(",")).toEqual(
      expect.arrayContaining(["temperature_2m", "apparent_temperature", "relative_humidity_2m", "wind_speed_10m", "weather_code", "is_day"]),
    );
    expect(params.get("daily")?.split(",")).toEqual(
      expect.arrayContaining(["weather_code", "temperature_2m_max", "temperature_2m_min", "precipitation_sum", "precipitation_probability_max"]),
    );
  });

  it("convertit la réponse (noms lisibles, booléen, probabilité inconnue = null)", async () => {
    fetchMock.mockResolvedValue(json(FORECAST));
    const { fetchForecast } = await loadApi();
    const forecast = await fetchForecast(point);

    expect(forecast.current).toEqual({
      time: "2026-11-18T17:15",
      temperature: 31.8,
      apparentTemperature: 33.7,
      humidity: 38,
      windSpeed: 0.8,
      weatherCode: 2,
      isDay: true,
    });
    expect(forecast.daily).toEqual([
      { date: "2026-11-18", weatherCode: 3, temperatureMax: 33.1, temperatureMin: 19.7, precipitationSum: 0, precipitationProbability: 0 },
      { date: "2026-11-19", weatherCode: 63, temperatureMax: 30.2, temperatureMin: 21.4, precipitationSum: 22.5, precipitationProbability: null },
    ]);
  });

  it("traite is_day = 0 comme la nuit", async () => {
    fetchMock.mockResolvedValue(json({ ...FORECAST, current: { ...FORECAST.current, is_day: 0 } }));
    const { fetchForecast } = await loadApi();
    expect((await fetchForecast(point)).current.isDay).toBe(false);
  });

  it("tolère l'absence totale de probabilités de pluie", async () => {
    const daily: Partial<typeof FORECAST.daily> = { ...FORECAST.daily };
    delete daily.precipitation_probability_max;
    fetchMock.mockResolvedValue(json({ ...FORECAST, daily }));
    const { fetchForecast } = await loadApi();
    const forecast = await fetchForecast(point);
    expect(forecast.daily.every((day) => day.precipitationProbability === null)).toBe(true);
  });

  it("refuse une réponse sans `current` ou `daily`", async () => {
    const { fetchForecast, ApiError } = await loadApi();
    for (const body of [{}, { current: FORECAST.current }, { daily: FORECAST.daily }]) {
      fetchMock.mockResolvedValueOnce(json(body));
      const error = await fetchForecast({ latitude: Math.random() * 10, longitude: 1 }).catch((e: unknown) => e);
      expect(error).toBeInstanceOf(ApiError);
    }
  });

  it("mémorise 10 minutes, puis redemande", async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(async () => json(FORECAST));
    const { fetchForecast } = await loadApi();

    await fetchForecast(point);
    await fetchForecast(point);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(9 * 60 * 1000);
    await fetchForecast(point);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(2 * 60 * 1000);
    await fetchForecast(point);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("ne mélange pas deux localités différentes", async () => {
    fetchMock.mockImplementation(async () => json(FORECAST));
    const { fetchForecast } = await loadApi();
    await fetchForecast({ latitude: 9.337, longitude: 2.63 });
    await fetchForecast({ latitude: 6.367, longitude: 2.433 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe("erreurs de l'API et du réseau", () => {
  const point = { latitude: 1, longitude: 1 };

  it.each([
    [429, "rate-limit", /requêtes/],
    [500, "http", /problème/],
    [503, "http", /problème/],
    [404, "http", /problème/],
  ])("HTTP %s -> kind « %s » avec un message en français", async (status, kind, message) => {
    fetchMock.mockResolvedValue(json({}, status));
    const { fetchForecast, ApiError } = await loadApi();
    const error = await fetchForecast(point).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ kind, status });
    expect((error as Error).message).toMatch(message);
  });

  it("une panne réseau devient kind « network »", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    const { fetchForecast } = await loadApi();
    await expect(fetchForecast(point)).rejects.toMatchObject({ kind: "network", message: expect.stringMatching(/Impossible de joindre/) });
  });

  it("une réponse qui n'est pas du JSON devient kind « http »", async () => {
    fetchMock.mockResolvedValue(new Response("<html>erreur</html>", { status: 200 }));
    const { fetchForecast } = await loadApi();
    await expect(fetchForecast(point)).rejects.toMatchObject({ kind: "http" });
  });

  it("le délai maximal devient kind « timeout »", async () => {
    // Le délai est déjà écoulé : le signal de délai est annulé d'emblée.
    vi.spyOn(AbortSignal, "timeout").mockReturnValue(AbortSignal.abort());
    fetchMock.mockImplementation((_url: string, init: RequestInit) => Promise.reject(init.signal?.reason));
    const { fetchForecast } = await loadApi();
    await expect(fetchForecast(point)).rejects.toMatchObject({ kind: "timeout", message: expect.stringMatching(/trop de temps/) });
  });

  it("une annulation voulue n'est PAS une ApiError", async () => {
    fetchMock.mockImplementation((_url: string, init: RequestInit) => Promise.reject(init.signal?.reason));
    const { fetchForecast, ApiError } = await loadApi();
    const controller = new AbortController();
    controller.abort();
    const error = await fetchForecast(point, controller.signal).catch((e: unknown) => e);
    expect(error).not.toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ name: "AbortError" });
  });

  it("n'expose jamais de détail technique dans les messages", async () => {
    const { fetchForecast } = await loadApi();
    for (const response of [json({}, 429), json({}, 500), new Response("x")]) {
      fetchMock.mockResolvedValueOnce(response);
      const error = (await fetchForecast({ latitude: Math.random(), longitude: 1 }).catch((e: unknown) => e)) as Error;
      expect(error.message).not.toMatch(/TypeError|undefined|JSON|fetch|stack|\b500\b|\b429\b/i);
    }
  });
});
