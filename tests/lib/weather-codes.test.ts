import { describe, expect, it } from "vitest";
import { KNOWN_WEATHER_CODES, describeWeather } from "@/lib/weather-codes";

const EXPECTED: Array<[number, string]> = [
  [0, "Ciel dégagé"],
  [1, "Plutôt dégagé"],
  [2, "Partiellement nuageux"],
  [3, "Couvert"],
  [45, "Brouillard"],
  [48, "Brouillard givrant"],
  [51, "Bruine légère"],
  [53, "Bruine modérée"],
  [55, "Bruine dense"],
  [56, "Bruine verglaçante légère"],
  [57, "Bruine verglaçante dense"],
  [61, "Pluie faible"],
  [63, "Pluie modérée"],
  [65, "Pluie forte"],
  [66, "Pluie verglaçante légère"],
  [67, "Pluie verglaçante forte"],
  [71, "Chute de neige faible"],
  [73, "Chute de neige modérée"],
  [75, "Chute de neige forte"],
  [77, "Grains de neige"],
  [80, "Averses faibles"],
  [81, "Averses modérées"],
  [82, "Averses violentes"],
  [85, "Averses de neige faibles"],
  [86, "Averses de neige fortes"],
  [95, "Orage"],
  [96, "Orage avec grêle légère"],
  [99, "Orage avec grêle forte"],
];

describe("describeWeather (codes WMO en français)", () => {
  it.each(EXPECTED)("code %s -> « %s »", (code, label) => {
    expect(describeWeather(code).label).toBe(label);
  });

  it("couvre exactement les 28 codes WMO d'Open-Meteo", () => {
    expect([...KNOWN_WEATHER_CODES].sort((a, b) => a - b)).toEqual(EXPECTED.map(([code]) => code));
  });

  it("donne un pictogramme à chaque code", () => {
    for (const code of KNOWN_WEATHER_CODES) {
      expect(describeWeather(code).icon.length).toBeGreaterThan(0);
    }
  });

  it("exemple de l'énoncé : la pluie modérée", () => {
    expect(describeWeather(63)).toMatchObject({ label: "Pluie modérée" });
  });

  it("utilise un pictogramme de nuit pour les codes 0, 1 et 2", () => {
    for (const code of [0, 1, 2]) {
      expect(describeWeather(code, false).icon).not.toBe(describeWeather(code, true).icon);
    }
  });

  it("garde le même pictogramme de jour et de nuit quand il n'y a pas de variante", () => {
    expect(describeWeather(63, false).icon).toBe(describeWeather(63, true).icon);
  });

  it.each([-1, 4, 62, 1234, Number.NaN])("code inconnu %s : message neutre, sans erreur", (code) => {
    expect(describeWeather(code)).toEqual({ label: "Conditions inconnues", icon: "❔" });
  });
});
