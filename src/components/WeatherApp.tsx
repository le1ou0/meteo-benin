"use client";

import { FavoritesBar } from "@/components/FavoritesBar";
import { MyLocationButton } from "@/components/MyLocationButton";
import { SearchBox } from "@/components/SearchBox";
import { WeatherPanel } from "@/components/WeatherPanel";
import { useFavorites } from "@/hooks/useFavorites";
import { useSelectedLocality } from "@/hooks/useSelectedLocality";

export function WeatherApp() {
  const { selected, select } = useSelectedLocality();
  const { favorites, add, remove, isFavorite } = useFavorites();

  const selectedIsFavorite = selected !== null && isFavorite(selected.id);

  function toggleFavorite() {
    if (!selected) return;
    if (selectedIsFavorite) remove(selected.id);
    else add(selected);
  }

  return (
    <div className="space-y-6">
      <SearchBox onSelect={select} isFavorite={isFavorite} />
      <MyLocationButton onLocate={select} />
      <FavoritesBar favorites={favorites} selectedId={selected?.id ?? null} onSelect={select} onRemove={remove} />
      <WeatherPanel locality={selected} isFavorite={selectedIsFavorite} onToggleFavorite={toggleFavorite} />
    </div>
  );
}
