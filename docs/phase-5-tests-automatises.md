# Phase 5 (bonus) : Tests automatisés

Rédigé par : Generator · Date : 2026-11-18 · Statut : **terminée**

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
- [x] Outillage : Vitest, jsdom, Testing Library, script `npm test`, aucun appel réseau possible
- [x] Tests unitaires : règle de vigilance
- [x] Tests unitaires : traduction des codes météo
- [x] Tests unitaires : formats (dates du Bénin, températures, vent, pluie, pourcentage, population)
- [x] Tests unitaires : favoris (sans doublon, lecture tolérante, stockage)
- [x] Tests unitaires : accès à l'API (paramètres, filtrage, erreurs, annulation, délai, mémorisation)
- [x] Tests de composants : prévisions, favoris, recherche (anti-rebond, états), parcours complet

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
- [x] `npm test` passe, sans aucun accès réseau (le blocage de `fetch` n'a jamais déclenché)
- [x] La suite passe aussi avec `TZ=Pacific/Kiritimati`, `TZ=America/Los_Angeles` et `TZ=UTC` (les dates restent celles du Bénin)
- [x] Chacun des 12 « défauts injectés » ci-dessous fait échouer au moins un test (la review les injecte un par un, puis les retire)
- [x] `npm run typecheck`, `npm run lint` et `npm run build` passent (les fichiers de test sont aussi vérifiés)
- [x] `npm test` n'ajoute aucune dépendance d'exécution (uniquement des `devDependencies`)

**Défauts injectés par la review** : (1) seuil de vigilance 20 mm -> 21 ; (2) seuil de probabilité 80 -> 81 ; (3) libellé du code 63 modifié ; (4) un code retiré de la table ; (5) arrondi de la température retiré ; (6) séparateur décimal de la pluie en point ; (7) `addFavorite` sans test de doublon ; (8) anti-rebond de 400 ms supprimé ; (9) aéroports non filtrés ; (10) HTTP 429 traité comme `http` ; (11) clé de cache de recherche sensible à la casse ; (12) fuseau de la date retiré.

## Journal de review
**Reviewer · 2026-11-18**

Commandes : `npm test` OK (**219 tests, 12 fichiers**, environ 2 s) · `npm run typecheck` OK · `npm run lint` OK · `npm run build` OK.

**Preuves**
- **Les tests détectent les défauts** : les 12 défauts prévus ont été injectés un par un dans le code, puis retirés. **12 sur 12 détectés**, et la suite repasse entièrement après remise en état. Détail : seuil de vigilance 20 -> 21 (4 tests en échec), seuil 80 -> 81 (3), libellé du code 63 modifié (4), code 99 retiré (2), arrondi de la température retiré (10), pluie avec point décimal (8), `addFavorite` sans test de doublon (3), anti-rebond supprimé (2), aéroports non filtrés (2), HTTP 429 traité comme `http` (1), clé de cache sensible à la casse (1), fuseau du Bénin retiré (6, sous `TZ=Pacific/Kiritimati`).
- **Fuseaux horaires** : la suite complète passe avec `TZ=Pacific/Kiritimati`, `America/Los_Angeles`, `UTC` et `Africa/Porto-Novo` (219/219 chaque fois).
- **Aucun accès réseau** : `fetch` est remplacé avant chaque test par une fonction qui lève une erreur ; aucun test ne l'a déclenchée.
- **Dépendances** : les dépendances d'exécution restent `next`, `react` et `react-dom` ; Vitest, jsdom et Testing Library sont uniquement des `devDependencies`.
- **Stabilité** : 3 exécutions successives de la suite complète, résultats identiques.

**Défaut de l'application trouvé par les tests**
- **Important (corrigé)** : après le choix d'une localité, la liste de résultats restait affichée environ 0,4 s (le temps de l'anti-rebond) avant de disparaître. Corrigé dans `SearchBox` ; un test le protège.

**Remarques**
- **Mineur (outillage)** : Vitest 4 et jsdom 26 ont été choisis plutôt que les dernières versions (Vitest 5, jsdom 31), qui exigent Node 22 ou plus : `npm test` reste ainsi utilisable avec Node 20. Non essayé avec Node 20 (tout est testé avec Node 24).
- **Mineur (outillage)** : Testing Library n'avance les faux minuteurs que pour Jest ; `vitest.setup.ts` lui fournit l'équivalent, ce qui rend l'horloge simulée déterministe. Sans cela, les tests de composants se bloquaient.
- Les simulations sont remises à zéro avant chaque test (`mockReset`) : sans cela, les compteurs d'appels s'accumulaient d'un test à l'autre.

**Non vérifié**
- Le contrôle par défauts injectés a été fait sur le code antérieur aux bonus (les 166 premiers tests) ; les tests ajoutés pour les bonus n'ont pas fait l'objet du même contrôle.
- Aucune mesure de couverture de code.
- Les hooks ne sont testés qu'à travers les composants.

