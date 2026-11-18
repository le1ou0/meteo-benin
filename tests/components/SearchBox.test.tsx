// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SearchBox } from "@/components/SearchBox";
import { ApiError, searchLocalities } from "@/lib/api";
import type { Locality } from "@/types/weather";

vi.mock("@/lib/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api")>()),
  searchLocalities: vi.fn(),
}));

const searchMock = vi.mocked(searchLocalities);
const norm = (text: string) => text.replace(/[  ]/g, " ").replace(/\s+/g, " ").trim();

const parakou: Locality = { id: 2392204, name: "Parakou", department: "Borgou", population: 255478, latitude: 9.33716, longitude: 2.63031 };
const abomey: Locality = { id: 2, name: "Abomey", department: "Zou", population: 117824, latitude: 7.18, longitude: 1.99 };
const hameau: Locality = { id: 3, name: "Petit hameau", department: null, population: null, latitude: 9, longitude: 2 };

/** Fait avancer le temps simulé et laisse les promesses se résoudre. */
const wait = (ms: number) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });

function setup(isFavorite: (id: number) => boolean = () => false) {
  const onSelect = vi.fn();
  const user = userEvent.setup({ delay: null });
  render(<SearchBox onSelect={onSelect} isFavorite={isFavorite} />);
  return { user, onSelect, input: screen.getByRole("searchbox", { name: "Rechercher une localité" }) };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("SearchBox : règles de saisie", () => {
  it("affiche l'aide « Saisissez au moins 2 caractères »", () => {
    setup();
    expect(screen.getByText("Saisissez au moins 2 caractères.")).toBeTruthy();
  });

  it("n'appelle pas l'API avec un seul caractère", async () => {
    const { user, input } = setup();
    await user.type(input, "P");
    await wait(2000);
    expect(searchMock).not.toHaveBeenCalled();
    expect(screen.queryByText("Recherche en cours…")).toBeNull();
  });

  it("n'envoie pas une requête à chaque touche : une seule, 400 ms après la dernière frappe", async () => {
    searchMock.mockResolvedValue([parakou]);
    const { user, input } = setup();

    await user.type(input, "Parakou");
    expect(searchMock).not.toHaveBeenCalled();

    await wait(399);
    expect(searchMock).not.toHaveBeenCalled();

    await wait(1);
    expect(searchMock).toHaveBeenCalledTimes(1);
    expect(searchMock).toHaveBeenCalledWith("Parakou", expect.any(AbortSignal));
  });

  it("repart de zéro si on retape avant la fin du délai", async () => {
    searchMock.mockResolvedValue([parakou]);
    const { user, input } = setup();

    await user.type(input, "Par");
    await wait(300);
    await user.type(input, "akou");
    await wait(300);
    expect(searchMock).not.toHaveBeenCalled();

    await wait(100);
    expect(searchMock).toHaveBeenCalledTimes(1);
    expect(searchMock).toHaveBeenCalledWith("Parakou", expect.any(AbortSignal));
  });

  it("ignore les espaces autour du texte", async () => {
    searchMock.mockResolvedValue([]);
    const { user, input } = setup();
    await user.type(input, "  Cotonou  ");
    await wait(400);
    expect(searchMock).toHaveBeenCalledExactlyOnceWith("Cotonou", expect.any(AbortSignal));
  });

  it("indique « Recherche en cours… » pendant l'attente de la réponse", async () => {
    searchMock.mockReturnValue(new Promise(() => {}));
    const { user, input } = setup();
    await user.type(input, "Parakou");
    await wait(400);
    expect(screen.getByRole("status").textContent).toBe("Recherche en cours…");
  });
});

describe("SearchBox : résultats", () => {
  it("affiche nom, département et population de chaque localité", async () => {
    searchMock.mockResolvedValue([parakou, abomey, hameau]);
    const { user, input } = setup();
    await user.type(input, "Pa");
    await wait(400);

    const items = screen.getAllByRole("listitem").map((item) => norm(item.textContent ?? ""));
    expect(items).toEqual(["ParakouBorgou · 255 478 hab.", "AbomeyZou · 117 824 hab.", "Petit hameau"]);
  });

  it("n'affiche ni département ni population quand ils sont inconnus", async () => {
    searchMock.mockResolvedValue([hameau]);
    const { user, input } = setup();
    await user.type(input, "Pe");
    await wait(400);
    expect(norm(screen.getByRole("listitem").textContent ?? "")).toBe("Petit hameau");
  });

  it("indique qu'il faut choisir une localité (texte d'aide visible avec les résultats)", async () => {
    searchMock.mockResolvedValue([parakou]);
    const { user, input } = setup();
    await user.type(input, "Pa");
    expect(screen.queryByText(/Choisissez une localité pour afficher sa météo/)).toBeNull();
    await wait(400);
    expect(screen.getByText(/Choisissez une localité pour afficher sa météo/)).toBeTruthy();
  });

  it("n'affiche pas l'aide quand il n'y a aucun résultat", async () => {
    searchMock.mockResolvedValue([]);
    const { user, input } = setup();
    await user.type(input, "zzzzqq");
    await wait(400);
    expect(screen.queryByText(/Choisissez une localité pour afficher sa météo/)).toBeNull();
  });

  it("signale les localités déjà en favori", async () => {
    searchMock.mockResolvedValue([parakou, abomey]);
    const { user, input } = setup((id) => id === parakou.id);
    await user.type(input, "Pa");
    await wait(400);

    const [first, second] = screen.getAllByRole("listitem");
    expect(first.textContent).toContain("Déjà en favori");
    expect(second.textContent).not.toContain("Déjà en favori");
  });

  it("choisir une localité la transmet, remplit le champ et masque la liste", async () => {
    searchMock.mockResolvedValue([parakou, abomey]);
    const { user, onSelect, input } = setup();
    await user.type(input, "Pa");
    await wait(400);

    await user.click(screen.getByRole("button", { name: /Abomey/ }));
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(abomey);
    expect((input as HTMLInputElement).value).toBe("Abomey");
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("ne relance pas de recherche après un choix", async () => {
    searchMock.mockResolvedValue([parakou]);
    const { user, input } = setup();
    await user.type(input, "Parakou");
    await wait(400);
    await user.click(screen.getByRole("button", { name: /Parakou/ }));
    await wait(2000);
    expect(searchMock).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("relance une recherche si on modifie le texte après un choix", async () => {
    searchMock.mockResolvedValue([parakou]);
    const { user, input } = setup();
    await user.type(input, "Parakou");
    await wait(400);
    await user.click(screen.getByRole("button", { name: /Parakou/ }));
    await user.clear(input);
    await user.type(input, "Cotonou");
    await wait(400);
    expect(searchMock).toHaveBeenLastCalledWith("Cotonou", expect.any(AbortSignal));
  });
});

describe("SearchBox : aucun résultat et erreurs", () => {
  it("explique qu'aucune localité ne correspond, avec un conseil", async () => {
    searchMock.mockResolvedValue([]);
    const { user, input } = setup();
    await user.type(input, "zzzzqq");
    await wait(400);
    expect(screen.getByText("Aucune localité du Bénin ne correspond à « zzzzqq ».")).toBeTruthy();
    expect(screen.getByText("Vérifiez l'orthographe ou essayez avec 3 caractères ou plus.")).toBeTruthy();
  });

  it("affiche le message d'erreur en français avec « Réessayer », puis réussit au nouvel essai", async () => {
    searchMock
      .mockRejectedValueOnce(new ApiError("http", "Le service météo a rencontré un problème. Réessayez dans un instant."))
      .mockResolvedValueOnce([parakou]);
    const { user, input } = setup();
    await user.type(input, "Parakou");
    await wait(400);

    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("Le service météo a rencontré un problème.");
    await user.click(screen.getByRole("button", { name: "Réessayer" }));
    await wait(0);

    expect(searchMock).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByRole("button", { name: /Parakou/ })).toBeTruthy();
  });

  it("n'affiche jamais le détail d'une erreur inattendue", async () => {
    searchMock.mockRejectedValue(new TypeError("Cannot read properties of undefined (reading 'x')"));
    const { user, input } = setup();
    await user.type(input, "Parakou");
    await wait(400);
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("Une erreur inattendue est survenue.");
    expect(alert.textContent).not.toMatch(/TypeError|undefined|properties/);
  });
});

describe("SearchBox : réponses dans le désordre", () => {
  it("ignore une réponse tardive qui ne correspond plus au texte saisi", async () => {
    let resolveFirst: (value: Locality[]) => void = () => {};
    searchMock
      .mockImplementationOnce(() => new Promise<Locality[]>((resolve) => { resolveFirst = resolve; }))
      .mockResolvedValueOnce([parakou]);
    const { user, input } = setup();

    await user.type(input, "Abo");
    await wait(400); // 1re requête (lente) partie
    await user.clear(input);
    await user.type(input, "Parakou");
    await wait(400); // 2e requête (rapide) : Parakou s'affiche

    expect(screen.getByRole("button", { name: /Parakou/ })).toBeTruthy();

    await act(async () => { resolveFirst([abomey]); }); // la réponse périmée arrive enfin
    expect(screen.queryByRole("button", { name: /Abomey/ })).toBeNull();
    expect(screen.getByRole("button", { name: /Parakou/ })).toBeTruthy();
  });

  it("annule la requête précédente quand le texte change", async () => {
    const signals: AbortSignal[] = [];
    searchMock.mockImplementation((_query, signal) => {
      if (signal) signals.push(signal);
      return new Promise<Locality[]>(() => {});
    });
    const { user, input } = setup();

    await user.type(input, "Abo");
    await wait(400);
    await user.type(input, "mey");
    await wait(400);

    expect(signals).toHaveLength(2);
    expect(signals[0].aborted).toBe(true);
    expect(signals[1].aborted).toBe(false);
  });
});

describe("SearchBox : navigation au clavier dans la liste", () => {
  const three: Locality[] = [parakou, abomey, hameau];
  const focusedName = () => screen.getByRole("searchbox").ownerDocument.activeElement?.textContent ?? "";

  async function openList() {
    searchMock.mockResolvedValue(three);
    const ctx = setup();
    await ctx.user.type(ctx.input, "Pa");
    await wait(400);
    return ctx;
  }

  it("↓ depuis le champ place le focus sur le premier résultat", async () => {
    const { user, input } = await openList();
    input.focus();
    await user.keyboard("{ArrowDown}");
    expect(focusedName()).toContain("Parakou");
  });

  it("↓ et ↑ parcourent les résultats, sans sortir de la liste par le bas", async () => {
    const { user, input } = await openList();
    input.focus();
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(focusedName()).toContain("Abomey");
    await user.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}");
    expect(focusedName()).toContain("Petit hameau");
    await user.keyboard("{ArrowUp}");
    expect(focusedName()).toContain("Abomey");
  });

  it("↑ sur le premier résultat ramène au champ de recherche", async () => {
    const { user, input } = await openList();
    input.focus();
    await user.keyboard("{ArrowDown}{ArrowUp}");
    expect(document.activeElement).toBe(input);
  });

  it("Échap ramène au champ depuis n'importe quel résultat", async () => {
    const { user, input } = await openList();
    input.focus();
    await user.keyboard("{ArrowDown}{ArrowDown}{Escape}");
    expect(document.activeElement).toBe(input);
  });

  it("Début et Fin vont au premier et au dernier résultat", async () => {
    const { user, input } = await openList();
    input.focus();
    await user.keyboard("{ArrowDown}{End}");
    expect(focusedName()).toContain("Petit hameau");
    await user.keyboard("{Home}");
    expect(focusedName()).toContain("Parakou");
  });

  it("Entrée sur un résultat le choisit", async () => {
    const { user, onSelect, input } = await openList();
    input.focus();
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(abomey);
  });

  it("↓ ne fait rien (et ne bloque pas la saisie) quand il n'y a aucun résultat", async () => {
    const { user, input } = setup();
    input.focus();
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(input);
  });
});

describe("SearchBox : touche Entrée dans le champ", () => {
  it("lance la recherche immédiatement, sans attendre l'anti-rebond", async () => {
    searchMock.mockResolvedValue([parakou, abomey]);
    const { user, input } = setup();
    await user.type(input, "Pa");
    expect(searchMock).not.toHaveBeenCalled();
    await user.keyboard("{Enter}");
    await wait(0);
    expect(searchMock).toHaveBeenCalledExactlyOnceWith("Pa", expect.any(AbortSignal));
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("ne fait rien sous 2 caractères", async () => {
    const { user, input } = setup();
    await user.type(input, "P");
    await user.keyboard("{Enter}");
    await wait(2000);
    expect(searchMock).not.toHaveBeenCalled();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("ne lance pas deux requêtes (Entrée puis fin du délai)", async () => {
    searchMock.mockResolvedValue([parakou, abomey]);
    const { user, input } = setup();
    await user.type(input, "Pa");
    await user.keyboard("{Enter}");
    await wait(2000);
    expect(searchMock).toHaveBeenCalledTimes(1);
  });

  it("un second Entrée ouvre le résultat unique", async () => {
    searchMock.mockResolvedValue([parakou]);
    const { user, onSelect, input } = setup();
    await user.type(input, "Pa");
    await user.keyboard("{Enter}");
    await wait(0);
    expect(onSelect).not.toHaveBeenCalled();
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(parakou);
  });

  it("un second Entrée ouvre le résultat dont le nom est identique au texte tapé", async () => {
    searchMock.mockResolvedValue([abomey, parakou]);
    const { user, onSelect, input } = setup();
    await user.type(input, "parakou");
    await user.keyboard("{Enter}");
    await wait(0);
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(parakou);
  });

  it("ne choisit pas au hasard quand plusieurs résultats sont possibles", async () => {
    searchMock.mockResolvedValue([parakou, abomey]);
    const { user, onSelect, input } = setup();
    await user.type(input, "Pa");
    await user.keyboard("{Enter}");
    await wait(0);
    await user.keyboard("{Enter}");
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("après une erreur, Entrée relance la recherche", async () => {
    searchMock
      .mockRejectedValueOnce(new ApiError("network", "Impossible de joindre le service météo. Vérifiez votre connexion."))
      .mockResolvedValueOnce([parakou]);
    const { user, input } = setup();
    await user.type(input, "Parakou");
    await user.keyboard("{Enter}");
    await wait(0);
    expect(screen.getByRole("alert")).toBeTruthy();
    await user.keyboard("{Enter}");
    await wait(0);
    expect(searchMock).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByRole("button", { name: /Parakou/ })).toBeTruthy();
  });
});
