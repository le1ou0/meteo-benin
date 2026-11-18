"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { localityToQuery, parseLocalityQuery } from "@/lib/locality-url";
import type { Locality } from "@/types/weather";

const URL_CHANGE_EVENT = "meteo-benin:urlchange";

function subscribe(listener: () => void) {
  window.addEventListener("popstate", listener); // boutons précédent / suivant
  window.addEventListener(URL_CHANGE_EVENT, listener);
  return () => {
    window.removeEventListener("popstate", listener);
    window.removeEventListener(URL_CHANGE_EVENT, listener);
  };
}

const getSearch = () => window.location.search;
const getServerSearch = () => ""; // la page est préparée sans localité : pas d'écart d'hydratation

/**
 * La localité affichée vit dans l'adresse (`?lieu=…`) : on peut la partager, recharger la page
 * ou revenir en arrière. Ouvrir l'adresse affiche directement la même localité.
 */
export function useSelectedLocality() {
  const search = useSyncExternalStore(subscribe, getSearch, getServerSearch);
  const selected = useMemo(() => parseLocalityQuery(search), [search]);

  const select = useCallback((locality: Locality) => {
    const query = localityToQuery(locality);
    if (query === window.location.search) return;
    window.history.pushState(null, "", query);
    window.dispatchEvent(new Event(URL_CHANGE_EVENT));
  }, []);

  return { selected, select };
}
