# Phase 1 : Données et règles

Rédigé par : Generator · Date : 2026-11-18 · Statut : **terminée**

## Objectif
Poser la couche données et les règles métier, testables sans interface : appels à l'API, traduction des codes météo, formats d'affichage, règle de vigilance et gestion des favoris. Les écrans des phases suivantes ne feront qu'afficher ce que ces modules calculent.

## Faits vérifiés sur l'API (réponses réelles, 2026-11-18)
**Géocodage** `https://geocoding-api.open-meteo.com/v1/search?name=&countryCode=BJ&language=fr&count=`
- Réponse : `{ results: [...], generationtime_ms }`. **La clé `results` est absente** (pas un tableau vide) quand rien ne correspond.
- Un résultat : `id`, `name`, `admin1` (= **département**), `population` (**clé parfois absente**, ou `null`), `latitude`, `longitude`, `timezone`, `feature_code`, `country_code`.
- **2 caractères = correspondance exacte seulement** (`Co` renvoie 0 résultat) ; la recherche approchée commence à 3 caractères. 1 caractère ou vide = liste vide.
- `countryCode=BJ` suffit : aucun résultat hors Bénin (Lagos, Ouagadougou : 0).
- Le type de lieu est dans `feature_code`. Les localités sont les codes `PPL*` (`PPL`, `PPLA`, `PPLA2`, `PPLA3`, `PPLC`, `PPLG`, `PPLX`...). Les aéroports (`AIRP`, `AIRF`, ex. « Cotonou Airport ») ne sont pas des localités : **à écarter**.

**Prévisions** `https://api.open-meteo.com/v1/forecast`
- Paramètres : `latitude`, `longitude`, `current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day`, `daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max`, `timezone=Africa/Porto-Novo`, `forecast_days=7`.
- Unités par défaut : °C, % , **km/h**, mm. Aucune conversion nécessaire.
- `daily.time` = 7 dates `AAAA-MM-JJ` **déjà dans le fuseau demandé** ; `current.time` = `AAAA-MM-JJTHH:MM` **heure locale du Bénin, sans décalage** (ex. `2026-11-18T17:15`). Fuseau `Africa/Porto-Novo` = GMT+1.
- Aucune valeur nulle observée sur les 7 jours, mais **traiter `precipitation_probability_max` comme pouvant être nul**.
- Codes météo observés : 0, 1, 2, 3, 51, 53, 95 ; la table de traduction couvre tous les codes WMO.
- Heure par heure (bonus) : `hourly=temperature_2m,precipitation&forecast_hours=24` renvoie 24 points.

**Formats** (vérifiés avec `Intl`) : `mer. 18 nov.`, `12,3` (une décimale, virgule), `80 %`. Le fuseau choisi dans `Intl` (`Africa/Porto-Novo`) rend la date indépendante du fuseau de l'ordinateur.

## Décisions de conception
- **Un seul module d'accès réseau** (`src/lib/api.ts`) ; aucun `fetch` ailleurs.
- **Erreurs typées** (`ApiError` avec un `kind` : `network`, `timeout`, `rate-limit` pour le 429, `http`) pour afficher des messages clairs en français, jamais un message technique.
- **Délai maximal de 8 s** par appel, combiné avec le signal d'annulation de l'appelant.
- **Modules purs sans dépendance entre eux** (`weather-codes`, `format`, `rules`, `favorites`) : testables avec Node directement, sans bibliothèque de test.
- **Favoris stockés** dans `localStorage` sous la clé `meteo-benin:favoris` : liste de localités complètes (nom, département, coordonnées), pour les retrouver en un clic sans nouvel appel de recherche. Lecture tolérante : contenu invalide ou stockage indisponible = liste vide.
- **Pictogrammes en emoji**, accompagnés du texte (jamais seuls) : pas de dépendance, lisibles par les lecteurs d'écran avec `aria-hidden` sur l'emoji.

## Tâches
- [x] Projet Next.js créé, dépôt git, premier commit
- [x] Types TypeScript (localité, météo actuelle, prévision journalière)
- [x] Accès à l'API (recherche de localités, prévisions) avec délai maximal et erreurs claires
- [x] Traduction des codes météo en français avec pictogramme
- [x] Formats : dates du Bénin en français, températures, vent, pluie
- [x] Règle « Vigilance pluie » (>= 20 mm ou >= 80 %)
- [x] Favoris : ajout sans doublon, retrait, conservation dans le navigateur

## Fichiers
| Fichier | Rôle |
|---|---|
| `src/types/weather.ts` | types `Locality`, `CurrentWeather`, `DailyForecast`, `Forecast` |
| `src/lib/api.ts` | `searchLocalities(query, signal)`, `fetchForecast(locality, signal)`, `ApiError` |
| `src/lib/weather-codes.ts` | `describeWeather(code, isDay)` -> `{ label, icon }` |
| `src/lib/format.ts` | `formatDayLabel`, `formatTemperature`, `formatWind`, `formatRain`, `formatPercent`, `formatTime`, `formatPopulation` |
| `src/lib/rules.ts` | `isRainAlert(rainMm, probability)`, constantes de seuil |
| `src/lib/favorites.ts` | `addFavorite`, `removeFavorite`, `isFavorite` (purs) ; `loadFavorites`, `saveFavorites` (stockage) |

## Directives Integrator
**`searchLocalities(query, signal?)`**
- Retourne `[]` sans appel si `query.trim().length < 2`.
- Appelle le géocodage avec `name`, `countryCode=BJ`, `language=fr`, `count=10`.
- Si `results` est absent : retourne `[]`. Écarte les résultats dont `feature_code` ne commence pas par `PPL`. Convertit `admin1` en `department` (`null` si absent) et `population` en `number | null`.
- Mémorise les réponses par texte normalisé (minuscules, espaces retirés) pour ne pas redemander la même chose.

**`fetchForecast(locality, signal?)`**
- Appelle les prévisions avec les paramètres ci-dessus. Retourne `{ current, daily }` avec 7 jours ; `precipitationProbability` vaut `null` si la valeur est absente.
- Mémorise la réponse 10 minutes par localité.

**Erreurs** : `ApiError.kind` = `timeout` (délai dépassé), `rate-limit` (HTTP 429), `http` (autre statut non 2xx), `network` (échec réseau). Une annulation volontaire (`AbortError`) **n'est pas une erreur** : elle est relancée telle quelle pour que l'appelant l'ignore.

**`describeWeather(code, isDay)`** : libellés français des codes WMO 0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99 (ex. 63 = « Pluie modérée »). Code inconnu = « Conditions inconnues ». Un pictogramme jour et un pictogramme nuit pour 0, 1 et 2.

**`format.ts`** : température arrondie à l'entier avec `°C` ; vent en km/h arrondi ; pluie en mm avec une décimale et virgule ; probabilité avec `%` ; `formatDayLabel('2026-11-18')` = `mer. 18 nov.` quel que soit le fuseau de l'ordinateur ; `formatTime('2026-11-18T17:15')` = `17:15` (l'heure du Bénin, sans conversion) ; population avec séparateur de milliers français, ou `null`.

**`isRainAlert(rainMm, probability)`** : `true` si `rainMm >= 20` **ou** `probability >= 80` (`null` traité comme 0). Les seuils sont **inclus** (20 mm exactement et 80 % exactement déclenchent la vigilance).

**Favoris** : `addFavorite(list, locality)` ne crée jamais de doublon (clé : `id`) et conserve l'ordre d'ajout ; `removeFavorite(list, id)` ; `isFavorite(list, id)`. `loadFavorites()` valide chaque entrée (id, name, latitude, longitude présents et du bon type) et ignore le reste.

## Hors périmètre
Tout écran et tout composant (phase 2) · bonus.

## Critères de validation
Vérifiés par un script Node (modules purs) et par des appels réels à l'API.
- [x] `isRainAlert` : 19,9 mm / 79 % = non ; 20 mm = oui ; 80 % = oui ; 0 mm / `null` = non
- [x] `describeWeather(63).label` = « Pluie modérée » ; tous les codes listés ont un libellé non vide ; un code inconnu ne plante pas
- [x] `formatDayLabel('2026-11-18')` = `mer. 18 nov.` avec `TZ=America/Los_Angeles` et avec `TZ=Pacific/Kiritimati`
- [x] Températures arrondies (`31,8` donne `32 °C`), pluie `12,34` donne `12,3 mm`, vent entier
- [x] `addFavorite` deux fois la même localité = 1 seule entrée ; `removeFavorite` la retire
- [x] `loadFavorites` avec contenu corrompu ou stockage indisponible = liste vide, sans exception
- [x] `searchLocalities('Parakou')` renvoie Parakou avec département « Borgou » et population ; ne renvoie aucun aéroport ; `searchLocalities('P')` = `[]` sans appel réseau ; `searchLocalities('zzzzqq')` = `[]`
- [x] `fetchForecast` (Parakou) renvoie 7 jours et un `current` complet
- [x] Une requête annulée n'est pas une erreur ; un 429 ou un délai dépassé donne le bon `kind`
- [x] `npm run typecheck`, `npm run lint` et `npm run build` passent

## Journal de review
**Reviewer · 2026-11-18**

Commandes : `npm run typecheck` OK · `npm run lint` OK · `npm run build` OK.
Vérification : script Node qui importe directement les modules TypeScript (aucune bibliothèque de test), avec **appels réels à l'API** et simulations d'erreurs. **46 vérifications sur 46** réussies, plus 2 vérifications du délai maximal et de l'annulation en cours de route.

**Preuves**
- Vigilance : 19,9 mm / 79 % = non ; 20 mm = oui ; 80 % = oui ; 0 mm / `null` = non ; 5 mm / 95 % = oui.
- Codes météo : code 63 = « Pluie modérée » ; les 28 codes WMO prévus ont un libellé et un pictogramme ; un code inconnu (1234, -1) ne plante pas ; pictogramme de nuit pour le code 0.
- Formats : `formatDayLabel('2026-11-18')` = `mer. 18 nov.` avec `TZ` = America/Los_Angeles, Pacific/Kiritimati, UTC et Asia/Tokyo (identique) ; `31,8` -> `32 °C` ; `12,34` -> `12,3 mm` ; `7,6` -> `8 km/h` ; `255478` -> `255 478 hab.` ; `null` -> `—`.
- Favoris : ajouter deux fois la même localité = 1 entrée ; ordre conservé ; retrait ; relecture identique ; JSON corrompu, valeurs invalides et stockage qui lève une exception = liste vide sans plantage ; doublons du stockage retirés.
- API réelle : « Parakou » = département Borgou, population 255 478, coordonnées correctes, **aucun aéroport** ; « P » et texte vide = `[]` **sans appel réseau** ; « zzzzqq » (clé `results` absente) = `[]` ; « Cot » = Cotonou (Littoral, 679 012) ; « Co » (2 caractères, correspondance exacte seulement) = `[]` sans erreur ; prévisions de Parakou = 7 jours, `current` complet et typé, `max >= min` chaque jour.
- Mémorisation : « Parakou » redemandé (casse et espaces différents) = 0 nouvel appel ; prévisions redemandées = 0 nouvelle requête.
- Erreurs : HTTP 429 = `rate-limit` ; HTTP 500 = `http` ; panne réseau = `network` ; réponse illisible ou sans `current`/`daily` = `ApiError` (pas de `TypeError`) ; API muette = `timeout` après **8,0 s** ; annulation volontaire (avant et pendant l'attente) = `AbortError`, **pas** une `ApiError`. Tous les messages sont en français et sans détail technique.

**Remarques**
- **Mineur (test, pas l'application)** : `AbortSignal.timeout` n'empêche pas Node de se terminer ; mon premier script s'arrêtait avant les 8 secondes. Dans un navigateur, la page garde la boucle en vie. Corrigé dans le script de test.
- **À savoir pour l'interface** : avec 2 caractères, l'API ne renvoie que des correspondances **exactes** (« Co » = aucun résultat) ; l'écran affichera donc « aucune localité » à 2 caractères la plupart du temps. C'est le comportement de l'API, pas un défaut.

**Non vérifié**
- Aucun écran n'existe encore (phase 2) : l'affichage n'est pas vérifié.
- `localStorage` réel d'un navigateur : simulé avec un faux stockage (le comportement en navigateur sera vérifié en phase 2).
- Les scripts de vérification ne sont pas dans le dépôt (les tests automatisés sont un bonus de la phase 5).

