import type { Locality } from "@/types/weather";

interface FavoritesBarProps {
  favorites: Locality[];
  selectedId: number | null;
  onSelect: (locality: Locality) => void;
  onRemove: (id: number) => void;
}

export function FavoritesBar({ favorites, selectedId, onSelect, onRemove }: FavoritesBarProps) {
  return (
    <section aria-labelledby="favorites-title">
      <h2 id="favorites-title" className="text-sm font-semibold">
        Mes favoris
      </h2>
      {favorites.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Aucune localité favorite pour le moment.</p>
      ) : (
        <ul className="mt-2 flex flex-wrap gap-2">
          {favorites.map((locality) => {
            const isSelected = locality.id === selectedId;
            return (
              <li
                key={locality.id}
                className={`flex items-center overflow-hidden rounded-full border ${
                  isSelected
                    ? "border-blue-700 bg-blue-700 text-white"
                    : "border-zinc-300 bg-white text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(locality)}
                  aria-current={isSelected ? "true" : undefined}
                  className="min-h-11 py-2 pl-4 pr-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
                >
                  {locality.name}
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(locality.id)}
                  aria-label={`Retirer ${locality.name} des favoris`}
                  className="min-h-11 min-w-11 py-2 pr-2 text-lg leading-none outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
