import { describe, expect, it } from "vitest";
import { MY_POSITION_ID, localityToQuery, parseLocalityQuery } from "@/lib/locality-url";
import type { Locality } from "@/types/weather";

const parakou: Locality = { id: 2392204, name: "Parakou", department: "Borgou", population: 255478, latitude: 9.33716, longitude: 2.63031 };

describe("localityToQuery / parseLocalityQuery (adresse partageable)", () => {
  it("écrit la localité dans l'adresse", () => {
    const params = new URLSearchParams(localityToQuery(parakou));
    expect(Object.fromEntries(params)).toEqual({ lieu: "Parakou", id: "2392204", lat: "9.33716", lon: "2.63031", dep: "Borgou", pop: "255478" });
  });

  it("relit exactement la localité écrite (aller-retour)", () => {
    expect(parseLocalityQuery(localityToQuery(parakou))).toEqual(parakou);
  });

  it("gère les localités sans département ni population", () => {
    const hameau: Locality = { id: 7, name: "Petit hameau", department: null, population: null, latitude: 9, longitude: 2 };
    const query = localityToQuery(hameau);
    expect(query).not.toContain("dep=");
    expect(query).not.toContain("pop=");
    expect(parseLocalityQuery(query)).toEqual(hameau);
  });

  it("gère les accents, espaces et caractères spéciaux dans le nom", () => {
    const place: Locality = { id: 5, name: "Sèmè-Kpodji & co / « test »", department: "Ouémé", population: null, latitude: 6.38, longitude: 2.6 };
    expect(parseLocalityQuery(localityToQuery(place))).toEqual(place);
  });

  it("gère les coordonnées négatives et « Ma position »", () => {
    const position: Locality = { id: MY_POSITION_ID, name: "Ma position", department: null, population: null, latitude: -1.5, longitude: -0.25 };
    expect(parseLocalityQuery(localityToQuery(position))).toEqual(position);
  });

  it("accepte une adresse sans « ? » au début", () => {
    expect(parseLocalityQuery("lieu=Parakou&id=1&lat=9&lon=2")).toMatchObject({ name: "Parakou", id: 1 });
  });

  it.each([
    ["adresse vide", ""],
    ["sans nom", "?id=1&lat=9&lon=2"],
    ["nom vide", "?lieu=&id=1&lat=9&lon=2"],
    ["nom d'espaces", "?lieu=%20%20&id=1&lat=9&lon=2"],
    ["nom trop long", `?lieu=${"a".repeat(81)}&id=1&lat=9&lon=2`],
    ["sans identifiant", "?lieu=X&lat=9&lon=2"],
    ["identifiant négatif", "?lieu=X&id=-3&lat=9&lon=2"],
    ["identifiant décimal", "?lieu=X&id=1.5&lat=9&lon=2"],
    ["identifiant texte", "?lieu=X&id=abc&lat=9&lon=2"],
    ["latitude absente", "?lieu=X&id=1&lon=2"],
    ["longitude absente", "?lieu=X&id=1&lat=9"],
    ["latitude vide", "?lieu=X&id=1&lat=&lon=2"],
    ["latitude hors limites", "?lieu=X&id=1&lat=91&lon=2"],
    ["longitude hors limites", "?lieu=X&id=1&lat=9&lon=181"],
    ["latitude texte", "?lieu=X&id=1&lat=nord&lon=2"],
    ["latitude infinie", "?lieu=X&id=1&lat=Infinity&lon=2"],
    ["autre paramètre seulement", "?q=Parakou"],
  ])("rejette une adresse invalide : %s", (_label, search) => {
    expect(parseLocalityQuery(search)).toBeNull();
  });

  it("ignore un département ou une population invalides sans rejeter la localité", () => {
    const place = parseLocalityQuery(`?lieu=X&id=1&lat=9&lon=2&dep=${"d".repeat(81)}&pop=beaucoup`);
    expect(place).toEqual({ id: 1, name: "X", department: null, population: null, latitude: 9, longitude: 2 });
    expect(parseLocalityQuery("?lieu=X&id=1&lat=9&lon=2&pop=-5")?.population).toBeNull();
    expect(parseLocalityQuery("?lieu=X&id=1&lat=9&lon=2&pop=12.5")?.population).toBeNull();
  });

  it("ne laisse passer aucun balisage : le nom reste du texte", () => {
    const place = parseLocalityQuery("?lieu=%3Cscript%3Ealert(1)%3C%2Fscript%3E&id=1&lat=9&lon=2");
    expect(place?.name).toBe("<script>alert(1)</script>"); // React l'échappera à l'affichage
  });
});
