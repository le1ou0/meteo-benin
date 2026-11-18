import { describe, expect, it } from "vitest";
import {
  formatDayLabel,
  formatPercent,
  formatPopulation,
  formatRain,
  formatTemperature,
  formatTime,
  formatWind,
} from "@/lib/format";

/** Remplace les espaces insécables par des espaces simples pour comparer. */
const plain = (text: string | null) => text?.replace(/[  ]/g, " ");

describe("formatDayLabel (dates du Bénin, en français)", () => {
  it.each([
    ["2026-11-18", "mer. 18 nov."],
    ["2026-12-31", "jeu. 31 déc."],
    ["2027-01-01", "ven. 1 janv."],
    ["2028-02-29", "mar. 29 févr."],
    ["2026-08-15", "sam. 15 août"],
  ])("%s -> %s", (iso, expected) => {
    expect(formatDayLabel(iso)).toBe(expected);
  });

  it("renvoie le texte tel quel quand la date est invalide", () => {
    expect(formatDayLabel("pas une date")).toBe("pas une date");
    expect(formatDayLabel("")).toBe("");
  });
});

describe("formatTemperature (°C arrondis à l'entier)", () => {
  it.each([
    [31.8, "32 °C"],
    [31.4, "31 °C"],
    [31.5, "32 °C"],
    [0, "0 °C"],
    [-0.4, "0 °C"],
    [-0.6, "-1 °C"],
    [19.7, "20 °C"],
  ])("%s -> %s", (value, expected) => {
    expect(plain(formatTemperature(value))).toBe(expected);
  });
});

describe("formatWind (km/h arrondis)", () => {
  it.each([
    [0.8, "1 km/h"],
    [7.6, "8 km/h"],
    [12, "12 km/h"],
  ])("%s -> %s", (value, expected) => {
    expect(plain(formatWind(value))).toBe(expected);
  });
});

describe("formatRain (mm avec une décimale et une virgule)", () => {
  it.each([
    [0, "0,0 mm"],
    [12.34, "12,3 mm"],
    [20, "20,0 mm"],
    [19.96, "20,0 mm"],
    [0.96, "1,0 mm"],
    [103.2, "103,2 mm"],
  ])("%s -> %s", (value, expected) => {
    expect(plain(formatRain(value))).toBe(expected);
  });

  it("n'utilise jamais le point décimal", () => {
    expect(formatRain(7.5)).not.toContain(".");
  });
});

describe("formatPercent", () => {
  it("arrondit et ajoute le signe %", () => {
    expect(plain(formatPercent(80))).toBe("80 %");
    expect(plain(formatPercent(43.4))).toBe("43 %");
  });

  it("affiche un tiret quand la valeur est inconnue", () => {
    expect(formatPercent(null)).toBe("—");
  });
});

describe("formatTime (heure du Bénin, sans conversion)", () => {
  it("extrait HH:MM", () => {
    expect(formatTime("2026-11-18T17:15")).toBe("17:15");
    expect(formatTime("2026-11-18T00:05")).toBe("00:05");
  });

  it("garde le texte quand le format est inattendu", () => {
    expect(formatTime("n'importe quoi")).toBe("n'importe quoi");
  });
});

describe("formatPopulation", () => {
  it("sépare les milliers à la française et ajoute « hab. »", () => {
    expect(plain(formatPopulation(255478))).toBe("255 478 hab.");
    expect(plain(formatPopulation(679012))).toBe("679 012 hab.");
    expect(plain(formatPopulation(950))).toBe("950 hab.");
  });

  it("renvoie null quand la population est inconnue", () => {
    expect(formatPopulation(null)).toBeNull();
  });
});
