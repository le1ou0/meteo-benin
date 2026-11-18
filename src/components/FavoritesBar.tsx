import type { Locality } from "@/types/weather";

interface FavoritesBarProps {
  favorites: Locality[];
  selectedId: number | null;
  onSelect: (locality: Locality) => void;
  onRemove: (id: number) => void;
}

export function FavoritesBar({ favorites, selectedId, onSelect, onRemove }: FavoritesBarProps) {
  return (
    <section
      aria-labelledby="favorites-title"
      className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 sm:p-4 dark:border-zinc-700 dark:bg-zinc-800/50"
    >
      <h2 id="favorites-title" className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <span aria-hidden="true" className="text-base leading-none text-amber-500">
          ★
        </span>
        Mes favoris
      </h2>

      {favorites.length === 0 ? (
        <div className="mt-2">
          <p className="text-sm text-zinc-700 dark:text-zinc-300">Aucune localité favorite pour le moment.</p>
          <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
            Ouvrez une localité, puis choisissez « Ajouter aux favoris » pour la retrouver ici en un clic.
          </p>
        </div>
      ) : (
        <ul className="mt-3 flex flex-wrap gap-2">
          {favorites.map((locality) => {
            const isSelected = locality.id === selectedId;
            return (
              <li
                key={locality.id}
                className={`flex items-center overflow-hidden rounded-full border shadow-sm transition-colors ${
                  isSelected
                    ? "border-blue-700 bg-blue-700 text-white"
                    : "border-zinc-200 bg-white text-zinc-900 hover:border-blue-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(locality)}
                  aria-current={isSelected ? "true" : undefined}
                  className={`min-h-11 py-2 pl-4 pr-2 text-sm font-semibold outline-none before:mr-1.5 before:content-['★'] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600 ${
                    isSelected ? "before:text-amber-300" : "before:text-amber-500"
                  }`}
                >
                  {locality.name}
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(locality.id)}
                  aria-label={`Retirer ${locality.name} des favoris`}
                  className={`min-h-11 min-w-11 py-2 pr-3 text-lg leading-none outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600 ${
                    isSelected ? "text-blue-100 hover:text-white" : "text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
                  }`}
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
