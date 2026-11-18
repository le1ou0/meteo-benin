"use client";

import { useState } from "react";
import { FavoritesBar } from "@/components/FavoritesBar";
import { SearchBox } from "@/components/SearchBox";
import { WeatherPanel } from "@/components/WeatherPanel";
import { useFavorites } from "@/hooks/useFavorites";
import type { Locality } from "@/types/weather";

export function WeatherApp() {
  const [selected, setSelected] = useState<Locality | null>(null);
  const { favorites, add, remove, isFavorite } = useFavorites();

  const selectedIsFavorite = selected !== null && isFavorite(selected.id);

  function toggleFavorite() {
    if (!selected) return;
    if (selectedIsFavorite) remove(selected.id);
    else add(selected);
  }

  return (
    <div className="space-y-6">
      <SearchBox onSelect={setSelected} isFavorite={isFavorite} />
      <FavoritesBar favorites={favorites} selectedId={selected?.id ?? null} onSelect={setSelected} onRemove={remove} />
      <WeatherPanel locality={selected} isFavorite={selectedIsFavorite} onToggleFavorite={toggleFavorite} />
    </div>
  );
}
