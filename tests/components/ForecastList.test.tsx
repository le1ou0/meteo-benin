// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ForecastList } from "@/components/ForecastList";
import type { DailyForecast } from "@/types/weather";

const norm = (text: string | null | undefined) => (text ?? "").replace(/[  ]/g, " ").replace(/\s+/g, " ").trim();

/** Valeur associée à un libellé (<dt>/<dd>), comme la lirait un lecteur d'écran. */
const valueOf = (card: HTMLElement, label: string) => norm(within(card).getByText(label).nextElementSibling?.textContent);

const day = (overrides: Partial<DailyForecast> = {}): DailyForecast => ({
  date: "2026-11-18",
  weatherCode: 63,
  temperatureMax: 31.6,
  temperatureMin: 22.2,
  precipitationSum: 3.04,
  precipitationProbability: 40,
  ...overrides,
});

const DAYS = ["2026-11-18", "2026-11-19", "2026-11-20", "2026-11-21", "2026-11-22", "2026-11-23", "2026-11-24"];

describe("ForecastList", () => {
  it("affiche une carte par jour, 7 jours", () => {
    render(<ForecastList days={DAYS.map((date) => day({ date }))} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(7);
    expect(screen.getByRole("heading", { name: "Prévisions sur 7 jours" })).toBeTruthy();
  });

  it("montre la date en français, la description, min, max, pluie et probabilité", () => {
    render(<ForecastList days={[day()]} />);
    const card = screen.getByRole("listitem");

    expect(within(card).getByText("mer. 18 nov.").getAttribute("datetime")).toBe("2026-11-18");
    expect(within(card).getByText("Pluie modérée")).toBeTruthy();
    expect(valueOf(card, "Min")).toBe("22 °C");
    expect(valueOf(card, "Max")).toBe("32 °C");
    expect(valueOf(card, "Pluie")).toBe("3,0 mm");
    expect(valueOf(card, "Probabilité")).toBe("40 %");
  });

  it("signale « Vigilance pluie » à 20 mm de cumul (seuil inclus)", () => {
    render(<ForecastList days={[day({ precipitationSum: 20, precipitationProbability: 10 })]} />);
    expect(screen.getByText(/Vigilance pluie/)).toBeTruthy();
  });

  it("signale « Vigilance pluie » à 80 % de probabilité (seuil inclus)", () => {
    render(<ForecastList days={[day({ precipitationSum: 0, precipitationProbability: 80 })]} />);
    expect(screen.getByText(/Vigilance pluie/)).toBeTruthy();
  });

  it("ne signale rien juste sous les seuils (19,9 mm et 79 %)", () => {
    render(<ForecastList days={[day({ precipitationSum: 19.9, precipitationProbability: 79 })]} />);
    expect(screen.queryByText(/Vigilance pluie/)).toBeNull();
  });

  it("ne signale que les jours concernés", () => {
    render(
      <ForecastList
        days={[
          day({ date: "2026-11-18", precipitationSum: 25.5, precipitationProbability: 10 }),
          day({ date: "2026-11-19", precipitationSum: 1, precipitationProbability: 20 }),
          day({ date: "2026-11-20", precipitationSum: 0, precipitationProbability: 95 }),
        ]}
      />,
    );
    const flags = screen.getAllByRole("listitem").map((card) => /Vigilance pluie/.test(card.textContent ?? ""));
    expect(flags).toEqual([true, false, true]);
  });

  it("le signal est un texte (pas seulement une couleur)", () => {
    render(<ForecastList days={[day({ precipitationSum: 30 })]} />);
    expect(norm(screen.getByText(/Vigilance pluie/).textContent)).toBe("⚠ Vigilance pluie");
  });

  it("affiche un tiret quand la probabilité est inconnue", () => {
    render(<ForecastList days={[day({ precipitationProbability: null })]} />);
    expect(valueOf(screen.getByRole("listitem"), "Probabilité")).toBe("—");
  });

  it("n'affiche pas de vigilance quand la probabilité est inconnue et la pluie faible", () => {
    render(<ForecastList days={[day({ precipitationSum: 2, precipitationProbability: null })]} />);
    expect(screen.queryByText(/Vigilance pluie/)).toBeNull();
  });
});
