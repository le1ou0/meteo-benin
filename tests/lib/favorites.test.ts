import { describe, expect, it, vi } from "vitest";
import {
  FAVORITES_KEY,
  addFavorite,
  isFavorite,
  loadFavorites,
  parseFavorites,
  removeFavorite,
  saveFavorites,
} from "@/lib/favorites";
import type { Locality } from "@/types/weather";

const locality = (id: number, name = `Localité ${id}`): Locality => ({
  id,
  name,
  department: "Borgou",
  population: 1000 * id,
  latitude: 9 + id / 100,
  longitude: 2 + id / 100,
});

const memoryStorage = (initial: string | null = null) => {
  const store = { value: initial };
  return {
    store,
    getItem: vi.fn(() => store.value),
    setItem: vi.fn((_key: string, value: string) => {
      store.value = value;
    }),
  };
};

describe("addFavorite", () => {
  it("ajoute une localité à la fin", () => {
    const list = addFavorite([locality(1)], locality(2));
    expect(list.map((item) => item.id)).toEqual([1, 2]);
  });

  it("n'ajoute jamais deux fois la même localité", () => {
    let list: Locality[] = [];
    list = addFavorite(list, locality(1));
    list = addFavorite(list, locality(1));
    list = addFavorite(list, { ...locality(1), name: "Nom différent, même id" });
    expect(list).toHaveLength(1);
  });

  it("ne modifie pas la liste d'origine", () => {
    const original = [locality(1)];
    addFavorite(original, locality(2));
    expect(original).toHaveLength(1);
  });
});

describe("removeFavorite / isFavorite", () => {
  it("retire seulement la localité demandée", () => {
    const list = removeFavorite([locality(1), locality(2), locality(3)], 2);
    expect(list.map((item) => item.id)).toEqual([1, 3]);
  });

  it("ne fait rien si la localité n'est pas dans la liste", () => {
    expect(removeFavorite([locality(1)], 99)).toHaveLength(1);
  });

  it("indique si une localité est en favori", () => {
    const list = [locality(1)];
    expect(isFavorite(list, 1)).toBe(true);
    expect(isFavorite(list, 2)).toBe(false);
  });
});

describe("parseFavorites (lecture tolérante)", () => {
  it("renvoie une liste vide si ce n'est pas un tableau", () => {
    for (const value of [null, undefined, 5, "texte", {}, true]) {
      expect(parseFavorites(value)).toEqual([]);
    }
  });

  it("ignore les entrées invalides et garde les valides", () => {
    const list = parseFavorites([
      null,
      5,
      { id: "x", name: "mauvais id", latitude: 1, longitude: 2 },
      { id: 1, name: "ok", latitude: 1, longitude: 2 },
      { id: 2, latitude: 1, longitude: 2 },
      { id: 3, name: "sans coordonnées" },
    ]);
    expect(list.map((item) => item.id)).toEqual([1]);
  });

  it("complète les champs facultatifs absents ou de mauvais type", () => {
    const [item] = parseFavorites([{ id: 1, name: "Parakou", latitude: 9, longitude: 2, department: 5, population: "beaucoup" }]);
    expect(item).toEqual({ id: 1, name: "Parakou", department: null, population: null, latitude: 9, longitude: 2 });
  });

  it("retire les doublons présents dans le stockage", () => {
    const list = parseFavorites([locality(1), locality(1), locality(2)]);
    expect(list.map((item) => item.id)).toEqual([1, 2]);
  });
});

describe("loadFavorites / saveFavorites", () => {
  it("relit exactement ce qui a été enregistré", () => {
    const storage = memoryStorage();
    const list = [locality(1), locality(2)];
    saveFavorites(list, storage);
    expect(storage.setItem).toHaveBeenCalledWith(FAVORITES_KEY, JSON.stringify(list));
    expect(loadFavorites(storage)).toEqual(list);
  });

  it("renvoie une liste vide quand rien n'est enregistré", () => {
    expect(loadFavorites(memoryStorage(null))).toEqual([]);
  });

  it("renvoie une liste vide si le contenu n'est pas du JSON", () => {
    expect(loadFavorites(memoryStorage("{pas du json"))).toEqual([]);
  });

  it("renvoie une liste vide si la lecture lève une exception", () => {
    const storage = {
      getItem: () => {
        throw new Error("SecurityError");
      },
    };
    expect(loadFavorites(storage)).toEqual([]);
  });

  it("ne plante pas si l'écriture est impossible (quota, navigation privée)", () => {
    const storage = {
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    };
    expect(() => saveFavorites([locality(1)], storage)).not.toThrow();
  });

  it("renvoie une liste vide quand localStorage n'existe pas", () => {
    vi.stubGlobal("localStorage", undefined);
    expect(loadFavorites()).toEqual([]);
  });

  it("utilise la clé « meteo-benin:favoris »", () => {
    expect(FAVORITES_KEY).toBe("meteo-benin:favoris");
  });
});
