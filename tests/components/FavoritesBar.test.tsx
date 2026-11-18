// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FavoritesBar } from "@/components/FavoritesBar";
import type { Locality } from "@/types/weather";

const parakou: Locality = { id: 1, name: "Parakou", department: "Borgou", population: 255478, latitude: 9.34, longitude: 2.63 };
const cotonou: Locality = { id: 2, name: "Cotonou", department: "Littoral", population: 679012, latitude: 6.37, longitude: 2.43 };

describe("FavoritesBar", () => {
  it("invite à ajouter un favori quand la liste est vide", () => {
    render(<FavoritesBar favorites={[]} selectedId={null} onSelect={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText("Aucune localité favorite pour le moment.")).toBeTruthy();
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("liste chaque favori avec un bouton de retrait nommé", () => {
    render(<FavoritesBar favorites={[parakou, cotonou]} selectedId={null} onSelect={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Retirer Parakou des favoris" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retirer Cotonou des favoris" })).toBeTruthy();
  });

  it("un clic sur le nom sélectionne la localité (1 clic)", async () => {
    const onSelect = vi.fn();
    render(<FavoritesBar favorites={[parakou, cotonou]} selectedId={null} onSelect={onSelect} onRemove={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Cotonou" }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(cotonou);
  });

  it("le bouton « × » retire le bon favori sans le sélectionner", async () => {
    const onSelect = vi.fn();
    const onRemove = vi.fn();
    render(<FavoritesBar favorites={[parakou, cotonou]} selectedId={null} onSelect={onSelect} onRemove={onRemove} />);
    await userEvent.click(screen.getByRole("button", { name: "Retirer Parakou des favoris" }));
    expect(onRemove).toHaveBeenCalledExactlyOnceWith(1);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("marque la localité affichée avec aria-current", () => {
    render(<FavoritesBar favorites={[parakou, cotonou]} selectedId={2} onSelect={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Cotonou" }).getAttribute("aria-current")).toBe("true");
    expect(screen.getByRole("button", { name: "Parakou" }).getAttribute("aria-current")).toBeNull();
  });
});
