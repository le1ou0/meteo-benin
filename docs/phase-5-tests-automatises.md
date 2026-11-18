# Phase 5 (bonus) : Tests automatisés

Rédigé par : Generator · Date : 2026-11-18 · Statut : **en cours**

## Objectif
Protéger les règles de gestion et les comportements du socle par des tests rejouables avec une seule commande (`npm test`), sans réseau, afin que toute modification qui casse une règle (vigilance, traduction, favoris, anti-rebond, erreurs) soit détectée immédiatement.

## Décisions
- **Vitest 4 + jsdom 26 + Testing Library** : choisis pour fonctionner avec **Node 20 et plus** (comme Next 16). Les versions les plus récentes (Vitest 5, jsdom 31) exigent Node 22 ou plus et auraient empêché `npm test` chez un lecteur en Node 20.
- **Aucun appel réseau** : `fetch` est remplacé avant chaque test par une fonction qui lève une erreur ; chaque test qui a besoin d'une réponse la simule explicitement.
- **Tests dans un dossier `tests/` à la racine**, qui reprend l'arborescence de `src/` (`tests/lib`, `tests/components`) ; imports explicites depuis `vitest` (pas de globales), alias `@` identique à celui de l'application.
- **Le temps est simulé** (`vi.useFakeTimers`) pour l'anti-rebond de 400 ms et le délai de 10 minutes du cache.
- **Les tests de composants vérifient le comportement visible** (textes, rôles, événements), pas l'implémentation.
- **Un test qui ne peut pas échouer ne vaut rien** : la review casse volontairement chaque règle et vérifie qu'au moins un test échoue.

## Tâches
- [ ] Outillage : Vitest, jsdom, Testing Library, script `npm test`, aucun appel réseau possible
- [ ] Tests unitaires : règle de vigilance
- [ ] Tests unitaires : traduction des codes météo
- [ ] Tests unitaires : formats (dates du Bénin, températures, vent, pluie, pourcentage, population)
- [ ] Tests unitaires : favoris (sans doublon, lecture tolérante, stockage)
- [ ] Tests unitaires : accès à l'API (paramètres, filtrage, erreurs, annulation, délai, mémorisation)
- [ ] Tests de composants : prévisions, favoris, recherche (anti-rebond, états), parcours complet

## Fichiers
| Fichier | Contenu |
|---|---|
| `vitest.config.ts`, `vitest.setup.ts` | configuration, blocage du réseau, nettoyage |
| `tests/lib/rules.test.ts` | seuils de vigilance, valeurs limites, `null` |
| `tests/lib/weather-codes.test.ts` | les 28 codes, code inconnu, pictogramme de nuit |
| `tests/lib/format.test.ts` | formats français, jours et mois, arrondis, valeurs vides |
| `tests/lib/favorites.test.ts` | ajout, retrait, doublons, lecture et écriture du stockage |
| `tests/lib/api.test.ts` | requêtes envoyées, conversion des réponses, erreurs, annulation, délai, cache |
| `tests/components/ForecastList.test.tsx` | 7 jours, badge de vigilance, probabilité inconnue |
| `tests/components/CurrentWeatherCard.test.tsx` | valeurs et arrondis |
| `tests/components/FavoritesBar.test.tsx` | liste vide, sélection, retrait |
| `tests/components/SearchBox.test.tsx` | 2 caractères, anti-rebond, résultats, vide, erreur et « Réessayer », réponse périmée |
| `tests/components/WeatherApp.test.tsx` | parcours : recherche, choix, météo, favori |

## Critères de validation
- [ ] `npm test` passe, sans aucun accès réseau (le blocage de `fetch` n'a jamais déclenché)
- [ ] La suite passe aussi avec `TZ=Pacific/Kiritimati`, `TZ=America/Los_Angeles` et `TZ=UTC` (les dates restent celles du Bénin)
- [ ] Chacun des 12 « défauts injectés » ci-dessous fait échouer au moins un test (la review les injecte un par un, puis les retire)
- [ ] `npm run typecheck`, `npm run lint` et `npm run build` passent (les fichiers de test sont aussi vérifiés)
- [ ] `npm test` n'ajoute aucune dépendance d'exécution (uniquement des `devDependencies`)

**Défauts injectés par la review** : (1) seuil de vigilance 20 mm -> 21 ; (2) seuil de probabilité 80 -> 81 ; (3) libellé du code 63 modifié ; (4) un code retiré de la table ; (5) arrondi de la température retiré ; (6) séparateur décimal de la pluie en point ; (7) `addFavorite` sans test de doublon ; (8) anti-rebond de 400 ms supprimé ; (9) aéroports non filtrés ; (10) HTTP 429 traité comme `http` ; (11) clé de cache de recherche sensible à la casse ; (12) fuseau de la date retiré.

## Journal de review
*(rempli par le Reviewer)*
