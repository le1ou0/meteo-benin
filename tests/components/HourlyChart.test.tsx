// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HourlyChart } from "@/components/HourlyChart";
import type { HourlyPoint } from "@/types/weather";

const norm = (text: string | null | undefined) => (text ?? "").replace(/[  ]/g, " ").replace(/\s+/g, " ").trim();

const series = (count = 24): HourlyPoint[] =>
  Array.from({ length: count }, (_, hour) => ({
    time: `2026-11-18T${String((17 + hour) % 24).padStart(2, "0")}:00`,
    temperature: 20 + hour / 2,
    precipitation: hour % 6 === 0 ? 1.5 : 0,
  }));

describe("HourlyChart", () => {
  it("n'affiche rien avec moins de 2 points (pas de graphique vide)", () => {
    expect(render(<HourlyChart points={[]} />).container.innerHTML).toBe("");
    expect(render(<HourlyChart points={series(1)} />).container.innerHTML).toBe("");
  });

  it("affiche un titre et une courbe de température", () => {
    const { container } = render(<HourlyChart points={series()} />);
    expect(screen.getByRole("heading", { name: "Prochaines 24 heures" })).toBeTruthy();
    expect(container.querySelectorAll("polyline")).toHaveLength(1);
    expect(container.querySelector("polyline")?.getAttribute("points")?.split(" ")).toHaveLength(24);
  });

  it("dessine une barre seulement pour les heures de pluie", () => {
    const { container } = render(<HourlyChart points={series()} />);
    expect(container.querySelectorAll("rect")).toHaveLength(4); // heures 0, 6, 12 et 18
  });

  it("n'a aucune barre quand il ne pleut pas", () => {
    const dry = series().map((point) => ({ ...point, precipitation: 0 }));
    expect(render(<HourlyChart points={dry} />).container.querySelectorAll("rect")).toHaveLength(0);
  });

  it("étiquette l'axe toutes les 3 heures, en heure du Bénin", () => {
    const { container } = render(<HourlyChart points={series()} />);
    const labels = Array.from(container.querySelectorAll("svg text")).map((text) => norm(text.textContent)).filter((text) => text.endsWith(" h"));
    expect(labels).toEqual(["17 h", "20 h", "23 h", "02 h", "05 h", "08 h", "11 h", "14 h"]);
  });

  it("indique l'échelle de température à gauche", () => {
    const { container } = render(<HourlyChart points={series()} />);
    const scale = Array.from(container.querySelectorAll("svg text")).map((text) => text.textContent).filter((text) => text?.endsWith("°"));
    expect(scale).toEqual(["33°", "19°"]); // max 31,5 -> 33 ; min 20 -> 19
  });

  it("garde la courbe dans le cadre même avec des températures négatives ou identiques", () => {
    for (const temperature of [-5, 0, 30]) {
      const flat = series().map((point) => ({ ...point, temperature }));
      const { container, unmount } = render(<HourlyChart points={flat} />);
      const ys = (container.querySelector("polyline")?.getAttribute("points") ?? "").split(" ").map((pair) => Number(pair.split(",")[1]));
      expect(ys.every((y) => Number.isFinite(y) && y >= 0 && y <= 200)).toBe(true);
      unmount();
    }
  });

  it("résume les valeurs en texte visible (min, max, cumul de pluie)", () => {
    render(<HourlyChart points={series()} />);
    expect(norm(screen.getByText(/Température de/).textContent)).toBe("Température de 20 °C à 32 °C, cumul de pluie de 6,0 mm sur les 24 prochaines heures.");
  });

  it("cache le dessin aux lecteurs d'écran et propose un tableau de données complet", () => {
    const { container } = render(<HourlyChart points={series()} />);
    expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");

    const table = screen.getByRole("table", { name: /Détail heure par heure/ });
    const rows = within(table).getAllByRole("row");
    expect(rows).toHaveLength(25); // en-tête + 24 heures
    expect(Array.from(rows[1].children).map((cell) => norm(cell.textContent))).toEqual(["17 h", "20 °C", "1,5 mm"]);
  });

  it("n'utilise pas la couleur seule : la légende nomme la courbe et les barres", () => {
    render(<HourlyChart points={series()} />);
    const legend = within(screen.getByRole("figure"));
    expect(legend.getByText("Température")).toBeTruthy();
    expect(legend.getByText("Pluie")).toBeTruthy();
  });
});
