import { describe, expect, it } from "vitest";
import { GEOLOCATION_UNSUPPORTED, geolocationMessage, roundCoordinate } from "@/lib/geolocation";

describe("geolocationMessage", () => {
  it("explique clairement le refus de l'utilisateur", () => {
    expect(geolocationMessage(1)).toMatch(/refusé la géolocalisation/);
  });

  it("explique que la position est indisponible", () => {
    expect(geolocationMessage(2)).toMatch(/n'a pas pu être déterminée/);
  });

  it("explique que la localisation est trop lente", () => {
    expect(geolocationMessage(3)).toMatch(/trop de temps/);
  });

  it("garde un message en français pour un code inconnu", () => {
    expect(geolocationMessage(99)).toMatch(/échoué/);
  });

  it("propose toujours de rechercher une localité à la place", () => {
    for (const code of [1, 2, 3, 99]) expect(geolocationMessage(code)).toMatch(/localité/);
    expect(GEOLOCATION_UNSUPPORTED).toMatch(/Recherchez une localité/);
  });

  it("ne montre jamais de détail technique", () => {
    for (const code of [1, 2, 3, 99]) expect(geolocationMessage(code)).not.toMatch(/PERMISSION_DENIED|GeolocationPositionError|code/i);
  });
});

describe("roundCoordinate", () => {
  it.each([
    [9.337164, 9.34],
    [2.630311, 2.63],
    [-1.505, -1.5],
    [6.999, 7],
    [0, 0],
  ])("%s -> %s", (value, expected) => {
    expect(roundCoordinate(value)).toBe(expected);
  });
});
