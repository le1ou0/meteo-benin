import { describe, expect, it } from "vitest";
import { RAIN_ALERT_MM, RAIN_ALERT_PROBABILITY, isRainAlert } from "@/lib/rules";

describe("isRainAlert (Vigilance pluie)", () => {
  it("utilise les seuils de l'énoncé : 20 mm et 80 %", () => {
    expect(RAIN_ALERT_MM).toBe(20);
    expect(RAIN_ALERT_PROBABILITY).toBe(80);
  });

  it.each<[number, number | null, boolean]>([
    // sous les deux seuils
    [0, 0, false],
    [19.9, 79, false],
    [19.99, 79.9, false],
    [5, 50, false],
    // le cumul seul suffit, seuil inclus
    [20, 0, true],
    [20.1, 0, true],
    [25.5, null, true],
    [120, 100, true],
    // la probabilité seule suffit, seuil inclus
    [0, 80, true],
    [0, 95, true],
    [0, 100, true],
    // probabilité inconnue : traitée comme 0
    [0, null, false],
    [19.9, null, false],
  ])("%s mm / %s %% -> %s", (rainMm, probability, expected) => {
    expect(isRainAlert(rainMm, probability)).toBe(expected);
  });
});
