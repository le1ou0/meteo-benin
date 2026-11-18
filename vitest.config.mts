import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
    setupFiles: ["./vitest.setup.ts"],
    restoreMocks: true,
    mockReset: true, // chaque test repart avec des simulations vierges (appels et comportements)
    unstubGlobals: true,
  },
});
