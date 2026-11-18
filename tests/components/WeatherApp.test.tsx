// @vitest-environment jsdom
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, fetchForecast, searchLocalities } from "@/lib/api";
import { FAVORITES_KEY } from "@/lib/favorites";
import { localityToQuery, parseLocalityQuery } from "@/lib/locality-url";
import type { Forecast, Locality } from "@/types/weather";

vi.mock("@/lib/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api")>()),
  searchLocalities: vi.fn(),
  fetchForecast: vi.fn(),
}));

const searchMock = vi.mocked(searchLocalities);
const forecastMock = vi.mocked(fetchForecast);
const norm = (text: string | null | undefined) => (text ?? "").replace(/[  ]/g, " ").replace(/\s+/g, " ").trim();

const parakou: Locality = { id: 2392204, name: "Parakou", department: "Borgou", population: 255478, latitude: 9.33716, longitude: 2.63031 };
const cotonou: Locality = { id: 2394819, name: "Cotonou", department: "Littoral", population: 679012, latitude: 6.36, longitude: 2.43 };

const DATES = ["2026-11-18", "2026-11-19", "2026-11-20", "2026-11-21", "2026-11-22", "2026-11-23", "2026-11-24"];
const HOURS = Array.from({ length: 24 }, (_, hour) => ({
  time: `2026-11-18T${String((17 + hour) % 24).padStart(2, "0")}:00`,
  temperature: 25 + (hour % 8),
  precipitation: hour === 5 ? 2.4 : 0,
}));
const forecast = (temperature: number, rain = 0, hourly = HOURS): Forecast => ({
  hourly,
  current: { time: "2026-11-18T17:15", temperature, apparentTemperature: temperature + 2, humidity: 40, windSpeed: 5, weatherCode: 63, isDay: true },
  daily: DATES.map((date, index) => ({
    date,
    weatherCode: 3,
    temperatureMax: 33,
    temperatureMin: 21,
    precipitationSum: index === 2 ? rain : 0,
    precipitationProbability: 10,
  })),
});

const wait = (ms: number) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });

/** Charge l'application « à neuf », comme après un rechargement de la page. */
async function loadApp() {
  vi.resetModules();
  const { WeatherApp } = await import("@/components/WeatherApp");
  const user = userEvent.setup({ delay: null });
  render(<WeatherApp />);
  return { user, input: screen.getByRole("searchbox", { name: "Rechercher une localité" }) };
}

async function pick(user: ReturnType<typeof userEvent.setup>, input: HTMLElement, text: string, name: RegExp) {
  await user.clear(input);
  await user.type(input, text);
  await wait(400);
  await user.click(screen.getByRole("button", { name }));
  await wait(0);
}

const favoriteNames = () =>
  within(screen.getByRole("region", { name: "Mes favoris" })).queryAllByRole("listitem").map((item) => norm(item.textContent).replace("×", "").trim());

beforeEach(() => {
  vi.useFakeTimers();
  window.localStorage.clear();
  window.history.replaceState(null, "", "/");
  searchMock.mockImplementation(async (query) => (/par/i.test(query) ? [parakou] : /cot/i.test(query) ? [cotonou] : []));
  forecastMock.mockImplementation(async (point) => forecast(point.latitude > 8 ? 31.6 : 28.2, 25));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("WeatherApp : parcours complet", () => {
  it("accueille l'utilisateur avant tout choix", async () => {
    await loadApp();
    expect(screen.getByText("Recherchez une localité ou choisissez un favori pour voir la météo.")).toBeTruthy();
    expect(screen.getByText("Aucune localité favorite pour le moment.")).toBeTruthy();
    expect(forecastMock).not.toHaveBeenCalled();
  });

  it("recherche, choix, puis météo actuelle et 7 jours avec vigilance", async () => {
    const { user, input } = await loadApp();
    await pick(user, input, "Parakou", /Parakou/);

    expect(screen.getByRole("heading", { level: 2, name: "Parakou" })).toBeTruthy();
    expect(norm(screen.getByText(/Borgou/, { selector: "p" }).textContent)).toBe("Borgou · 255 478 hab.");
    expect(norm(screen.getByText(/32 °C/, { selector: "p" }).textContent)).toBe("32 °C");
    expect(screen.getAllByRole("listitem", { name: "" }).filter((item) => /Min/.test(item.textContent ?? ""))).toHaveLength(7);
    // 25 mm prévus le 3e jour : une seule vigilance
    expect(screen.getAllByText(/Vigilance pluie/)).toHaveLength(1);
    expect(forecastMock).toHaveBeenCalledExactlyOnceWith(parakou, expect.any(AbortSignal));
  });

  it("affiche un squelette pendant le chargement de la météo", async () => {
    forecastMock.mockReturnValue(new Promise(() => {}));
    const { user, input } = await loadApp();
    await pick(user, input, "Parakou", /Parakou/);
    expect(screen.getByRole("status", { name: "Chargement de la météo" })).toBeTruthy();
  });

  it("une panne de l'API propose « Réessayer », qui relance l'appel", async () => {
    forecastMock
      .mockRejectedValueOnce(new ApiError("network", "Impossible de joindre le service météo. Vérifiez votre connexion."))
      .mockResolvedValueOnce(forecast(30));
    const { user, input } = await loadApp();
    await pick(user, input, "Parakou", /Parakou/);

    expect(screen.getByRole("alert").textContent).toContain("Impossible de joindre le service météo.");
    await user.click(screen.getByRole("button", { name: "Réessayer" }));
    await wait(0);

    expect(forecastMock).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByRole("heading", { name: "Prévisions sur 7 jours" })).toBeTruthy();
  });

  it("changer de localité pendant un chargement n'affiche jamais l'ancienne", async () => {
    let resolveSlow: (value: Forecast) => void = () => {};
    forecastMock
      .mockImplementationOnce(() => new Promise<Forecast>((resolve) => { resolveSlow = resolve; }))
      .mockResolvedValueOnce(forecast(22));
    const { user, input } = await loadApp();

    await pick(user, input, "Parakou", /Parakou/); // chargement lent
    await pick(user, input, "Cotonou", /Cotonou/); // réponse rapide
    expect(screen.getByRole("heading", { level: 2, name: "Cotonou" })).toBeTruthy();

    await act(async () => { resolveSlow(forecast(11)); }); // Parakou arrive en retard
    expect(norm(screen.getByText(/°C/, { selector: "p.text-5xl" }).textContent)).toBe("22 °C");
  });
});

describe("WeatherApp : favoris", () => {
  const toggle = () => screen.getByRole("button", { pressed: false }) ;

  it("ajoute aux favoris, sans doublon, et les enregistre dans le navigateur", async () => {
    const { user, input } = await loadApp();
    await pick(user, input, "Parakou", /Parakou/);

    await user.click(toggle());
    expect(favoriteNames()).toEqual(["Parakou"]);
    expect(screen.getByRole("button", { name: /Retirer des favoris/ }).getAttribute("aria-pressed")).toBe("true");
    expect(JSON.parse(window.localStorage.getItem(FAVORITES_KEY) ?? "[]")).toEqual([parakou]);

    // le même clic deux fois de suite ne crée pas de doublon : retrait puis nouvel ajout
    await user.click(screen.getByRole("button", { name: /Retirer des favoris/ }));
    await user.click(toggle());
    expect(favoriteNames()).toEqual(["Parakou"]);
  });

  it("retrouve les favoris après un rechargement de la page, en un clic", async () => {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify([parakou, cotonou]));
    const { user } = await loadApp();

    expect(favoriteNames()).toEqual(["Parakou", "Cotonou"]);
    await user.click(screen.getByRole("button", { name: "Cotonou" }));
    await wait(0);

    expect(screen.getByRole("heading", { level: 2, name: "Cotonou" })).toBeTruthy();
    expect(forecastMock).toHaveBeenCalledExactlyOnceWith(cotonou, expect.any(AbortSignal));
  });

  it("retire un favori avec le bouton « × »", async () => {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify([parakou, cotonou]));
    const { user } = await loadApp();

    await user.click(screen.getByRole("button", { name: "Retirer Parakou des favoris" }));
    expect(favoriteNames()).toEqual(["Cotonou"]);
    expect(JSON.parse(window.localStorage.getItem(FAVORITES_KEY) ?? "[]")).toEqual([cotonou]);
  });

  it("ignore un stockage contenant des doublons ou des entrées invalides", async () => {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify([parakou, parakou, { id: "x" }, null]));
    await loadApp();
    expect(favoriteNames()).toEqual(["Parakou"]);
  });

  it("ignore un stockage corrompu (ce n'est pas du JSON)", async () => {
    window.localStorage.setItem(FAVORITES_KEY, "{pas du json");
    await loadApp();
    expect(favoriteNames()).toEqual([]);
    expect(screen.getByText("Aucune localité favorite pour le moment.")).toBeTruthy();
  });
});

describe("WeatherApp : adresse partageable", () => {
  it("écrit la localité choisie dans l'adresse", async () => {
    const { user, input } = await loadApp();
    await pick(user, input, "Parakou", /Parakou/);
    expect(parseLocalityQuery(window.location.search)).toEqual(parakou);
  });

  it("ouvrir l'adresse affiche directement la même localité, sans aucune recherche", async () => {
    window.history.replaceState(null, "", localityToQuery(cotonou));
    await loadApp();
    await wait(0);

    expect(screen.getByRole("heading", { level: 2, name: "Cotonou" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Prévisions sur 7 jours" })).toBeTruthy();
    expect(searchMock).not.toHaveBeenCalled();
    expect(forecastMock).toHaveBeenCalledExactlyOnceWith(cotonou, expect.any(AbortSignal));
  });

  it("une adresse invalide est ignorée : l'écran d'accueil s'affiche", async () => {
    window.history.replaceState(null, "", "/?lieu=X&id=abc&lat=9&lon=2");
    await loadApp();
    expect(screen.getByText("Recherchez une localité ou choisissez un favori pour voir la météo.")).toBeTruthy();
    expect(forecastMock).not.toHaveBeenCalled();
  });

  it("le bouton précédent du navigateur revient à la localité précédente", async () => {
    const { user, input } = await loadApp();
    await pick(user, input, "Parakou", /Parakou/);
    const parakouUrl = window.location.search;
    await pick(user, input, "Cotonou", /Cotonou/);
    expect(screen.getByRole("heading", { level: 2, name: "Cotonou" })).toBeTruthy();

    await act(async () => {
      window.history.pushState(null, "", parakouUrl); // ce que fait le navigateur au retour arrière
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    await wait(0);
    expect(screen.getByRole("heading", { level: 2, name: "Parakou" })).toBeTruthy();
  });

  it("choisir deux fois la même localité n'ajoute pas d'entrée d'historique", async () => {
    const { user, input } = await loadApp();
    await pick(user, input, "Parakou", /Parakou/);
    const length = window.history.length;
    await pick(user, input, "Parakou", /Parakou/);
    expect(window.history.length).toBe(length);
  });

  it("un favori choisi met aussi à jour l'adresse", async () => {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify([parakou]));
    const { user } = await loadApp();
    await user.click(screen.getByRole("button", { name: "Parakou" }));
    expect(parseLocalityQuery(window.location.search)).toEqual(parakou);
  });
});

describe("WeatherApp : « Ma position »", () => {
  const setGeolocation = (value: unknown) => Object.defineProperty(window.navigator, "geolocation", { value, configurable: true });
  afterEach(() => setGeolocation(undefined));

  it("affiche la météo de la position de l'utilisateur, sans bouton favori", async () => {
    setGeolocation({ getCurrentPosition: (ok: PositionCallback) => ok({ coords: { latitude: 9.337164, longitude: 2.630311 } } as GeolocationPosition) });
    const { user } = await loadApp();
    await user.click(screen.getByRole("button", { name: /Ma position/ }));
    await wait(0);

    expect(screen.getByRole("heading", { level: 2, name: "Ma position" })).toBeTruthy();
    expect(forecastMock).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ latitude: 9.34, longitude: 2.63 }), expect.any(AbortSignal));
    expect(screen.queryByRole("button", { name: /favoris/ })).toBeNull();
    expect(parseLocalityQuery(window.location.search)).toMatchObject({ id: 0, name: "Ma position", latitude: 9.34, longitude: 2.63 });
  });

  it("explique clairement un refus de géolocalisation, avec « Réessayer »", async () => {
    setGeolocation({ getCurrentPosition: (_ok: PositionCallback, fail: PositionErrorCallback) => fail({ code: 1 } as GeolocationPositionError) });
    const { user } = await loadApp();
    await user.click(screen.getByRole("button", { name: /Ma position/ }));

    expect(screen.getByRole("alert").textContent).toContain("Vous avez refusé la géolocalisation.");
    expect(forecastMock).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Réessayer" })).toBeTruthy();
  });

  it("prévient quand le navigateur ne sait pas géolocaliser", async () => {
    setGeolocation(undefined);
    delete (window.navigator as unknown as Record<string, unknown>).geolocation;
    const { user } = await loadApp();
    await user.click(screen.getByRole("button", { name: /Ma position/ }));
    expect(screen.getByRole("alert").textContent).toContain("ne permet pas la géolocalisation");
  });

  it("« Réessayer » relance la localisation et réussit", async () => {
    const getCurrentPosition = vi.fn()
      .mockImplementationOnce((_ok: PositionCallback, fail: PositionErrorCallback) => fail({ code: 3 } as GeolocationPositionError))
      .mockImplementationOnce((ok: PositionCallback) => ok({ coords: { latitude: 6.36, longitude: 2.43 } } as GeolocationPosition));
    setGeolocation({ getCurrentPosition });
    const { user } = await loadApp();
    await user.click(screen.getByRole("button", { name: /Ma position/ }));
    expect(screen.getByRole("alert").textContent).toContain("trop de temps");

    await user.click(screen.getByRole("button", { name: "Réessayer" }));
    await wait(0);
    expect(getCurrentPosition).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("heading", { level: 2, name: "Ma position" })).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });
});

describe("WeatherApp : graphique sur 24 heures", () => {
  it("affiche le graphique heure par heure avec la météo", async () => {
    const { user, input } = await loadApp();
    await pick(user, input, "Parakou", /Parakou/);
    expect(screen.getByRole("heading", { name: "Prochaines 24 heures" })).toBeTruthy();
    expect(screen.getByRole("table", { name: /Détail heure par heure/ })).toBeTruthy();
  });

  it("masque seulement le graphique quand l'API ne fournit pas les heures", async () => {
    forecastMock.mockResolvedValue(forecast(30, 0, []));
    const { user, input } = await loadApp();
    await pick(user, input, "Parakou", /Parakou/);
    expect(screen.queryByRole("heading", { name: "Prochaines 24 heures" })).toBeNull();
    expect(screen.getByRole("heading", { name: "Prévisions sur 7 jours" })).toBeTruthy();
  });
});
