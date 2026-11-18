import { afterEach, beforeEach, vi } from "vitest";

// Aucun test ne doit appeler le réseau : tout appel non simulé échoue bruyamment.
beforeEach(() => {
  vi.stubGlobal("fetch", () => {
    throw new Error("Appel réseau non simulé dans un test");
  });
});

// Testing Library n'avance les faux minuteurs que pour Jest : on lui donne l'équivalent,
// ce qui garde l'horloge simulée entièrement déterministe (aucun lien avec le temps réel).
beforeEach(() => {
  vi.stubGlobal("jest", { advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms) });
});

// Nettoie le DOM entre deux tests de composants.
afterEach(async () => {
  if (typeof document !== "undefined") {
    const { cleanup } = await import("@testing-library/react");
    cleanup();
  }
});
