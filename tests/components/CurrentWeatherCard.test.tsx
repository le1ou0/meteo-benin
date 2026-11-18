// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CurrentWeatherCard } from "@/components/CurrentWeatherCard";
import type { CurrentWeather } from "@/types/weather";

const norm = (text: string | null | undefined) => (text ?? "").replace(/[  ]/g, " ").replace(/\s+/g, " ").trim();

const current = (overrides: Partial<CurrentWeather> = {}): CurrentWeather => ({
  time: "2026-11-18T17:15",
  temperature: 31.6,
  apparentTemperature: 33.4,
  humidity: 54,
  windSpeed: 7.6,
  weatherCode: 63,
  isDay: true,
  ...overrides,
});

const valueOf = (label: string) => norm(screen.getByText(label).nextElementSibling?.textContent);

describe("CurrentWeatherCard", () => {
  it("affiche la température arrondie et la description française", () => {
    render(<CurrentWeatherCard current={current()} />);
    expect(norm(screen.getByText(/32 °C/, { selector: "p" }).textContent)).toBe("32 °C");
    expect(screen.getByText("Pluie modérée")).toBeTruthy();
  });

  it("affiche température ressentie, humidité et vent", () => {
    render(<CurrentWeatherCard current={current()} />);
    expect(valueOf("Ressentie")).toBe("33 °C");
    expect(valueOf("Humidité")).toBe("54 %");
    expect(valueOf("Vent")).toBe("8 km/h");
  });

  it("indique l'heure de mise à jour, heure du Bénin, sans conversion", () => {
    render(<CurrentWeatherCard current={current({ time: "2026-11-18T05:07" })} />);
    expect(screen.getByText("Mis à jour à 05:07 (heure du Bénin)")).toBeTruthy();
  });

  it("cache le pictogramme aux lecteurs d'écran", () => {
    const { container } = render(<CurrentWeatherCard current={current()} />);
    const icon = container.querySelector("span[aria-hidden='true']");
    expect(icon?.textContent?.length).toBeGreaterThan(0);
  });

  it("choisit le pictogramme de nuit quand il fait nuit", () => {
    const day = render(<CurrentWeatherCard current={current({ weatherCode: 0, isDay: true })} />);
    const dayIcon = day.container.querySelector("span[aria-hidden='true']")?.textContent;
    day.unmount();
    const night = render(<CurrentWeatherCard current={current({ weatherCode: 0, isDay: false })} />);
    const nightIcon = night.container.querySelector("span[aria-hidden='true']")?.textContent;
    expect(nightIcon).not.toBe(dayIcon);
  });
});
