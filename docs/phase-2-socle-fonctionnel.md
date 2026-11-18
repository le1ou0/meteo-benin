# Phase 2 : Socle fonctionnel

Rédigé par : Generator · Date : 2026-11-18 · Statut : **en cours**

## Objectif
Une application utilisable de bout en bout : on cherche une localité du Bénin, on voit sa météo actuelle et ses prévisions sur 7 jours, on la met en favori et on la retrouve en un clic, même après un rechargement. Chaque étape informe l'utilisateur (chargement, aucun résultat, erreur avec « Réessayer »).

La « Vigilance pluie » est intégrée ici (elle fait partie de la carte d'un jour) ; la phase 3 vérifie l'ensemble sur mobile et en accessibilité.

## Décisions de conception
- **Tout côté navigateur** : `src/app/page.tsx` reste un composant serveur minimal qui rend `WeatherApp` (composant client). Les appels vont directement à Open-Meteo, via `src/lib/api.ts` (phase 1).
- **Un seul écran** : recherche et favoris en haut, météo de la localité choisie en dessous. Pas de routes.
- **Peu d'appels** : attente de **400 ms** après la dernière frappe, **2 caractères minimum**, annulation de la requête précédente (`AbortController`), mémorisation des réponses (déjà dans `api.ts`).
- **Favoris** : `useSyncExternalStore` branché sur `localStorage`. Le rendu serveur et le premier rendu client montrent une liste vide (pas d'écart d'hydratation), puis la liste réelle apparaît. Synchronisés entre onglets (événement `storage`).
- **Messages d'erreur** : seuls les messages des `ApiError` (déjà en français) sont affichés. Toute autre erreur affiche « Une erreur inattendue est survenue. » : jamais de message technique.
- **Aucune bibliothèque** en plus de Next, React et Tailwind. Pictogrammes en emoji avec `aria-hidden`, toujours accompagnés du texte.
- **À 2 caractères l'API ne renvoie que des correspondances exactes** (« Co » = aucun résultat) : le message « aucune localité » est donc normal, avec une aide « essayez avec 3 caractères ou plus ».

## Tâches
- [ ] Recherche : champ, 2 caractères minimum, requête seulement quand on a fini de taper
- [ ] Liste des résultats : nom, département, population si connue
- [ ] Météo actuelle : température, ressentie, humidité, vent, description en français, pictogramme
- [ ] Prévisions sur 7 jours : date en français, min, max, cumul et probabilité de pluie
- [ ] « Vigilance pluie » bien visible sur les jours concernés
- [ ] Favoris : ajouter, retirer, retrouver en un clic, conservés après rechargement
- [ ] États : chargement, aucun résultat, erreur avec « Réessayer »

## Fichiers
| Fichier | Action | Rôle |
|---|---|---|
| `src/app/layout.tsx` | modifier | UI/UX : `lang="fr"`, titre « Météo du Bénin », description |
| `src/app/page.tsx` | remplacer | Integrator : en-tête + `<WeatherApp />` |
| `src/hooks/useDebouncedValue.ts` | créer | Integrator |
| `src/hooks/useFavorites.ts` | créer | Integrator |
| `src/hooks/useForecast.ts` | créer | Integrator |
| `src/components/WeatherApp.tsx` | créer | Integrator : état « localité choisie », assemblage |
| `src/components/SearchBox.tsx` | créer | UI/UX + Integrator |
| `src/components/FavoritesBar.tsx` | créer | UI/UX |
| `src/components/WeatherPanel.tsx` | créer | UI/UX : titre, bouton favori, états |
| `src/components/CurrentWeatherCard.tsx` | créer | UI/UX |
| `src/components/ForecastList.tsx` | créer | UI/UX : 7 cartes de jour + vigilance |
| `src/components/StatusMessage.tsx` | créer | UI/UX : message + action (erreur, vide) |

## Directives UI/UX
**Page** : conteneur centré `max-w-3xl`, marges `px-4`, `py-6`. Style sobre : fond clair, cartes blanches bordées, texte lisible, une couleur d'accent (bleu). Mode sombre cohérent avec `dark:`. Titre `<h1>` « Météo du Bénin » et une phrase d'introduction : « Prévisions des localités du Bénin, pour anticiper les fortes pluies. »

**`SearchBox`**
- `<label>` visible « Rechercher une localité », `<input type="search">`, `autoComplete="off"`, texte d'aide : « Saisissez au moins 2 caractères. »
- Sous le champ, une zone `aria-live="polite"` :
  - moins de 2 caractères saisis (mais non vide) : l'aide seule ;
  - chargement : « Recherche en cours… » (`role="status"`) ;
  - résultats : liste `<ul>` de boutons ; chaque bouton affiche **le nom** en gras et, dessous, « Département · population » (la population seulement si connue, le département seulement s'il existe) ; une étoile pleine si la localité est déjà en favori ;
  - aucun résultat : « Aucune localité du Bénin ne correspond à « texte ». » + « Vérifiez l'orthographe ou essayez avec 3 caractères ou plus. » ;
  - erreur : message de l'erreur + bouton « Réessayer ».
- Choisir un résultat : vide la liste, remplace le champ par le nom de la localité, et charge sa météo.

**`FavoritesBar`** : titre `<h2>` « Mes favoris ». Aucun favori : « Aucune localité favorite pour le moment. » Sinon, une rangée qui passe à la ligne (`flex-wrap`) de « pilules » : un bouton principal (nom) qui sélectionne la localité, et un petit bouton « × » avec `aria-label="Retirer Parakou des favoris"`. La localité affichée est mise en évidence (`aria-current="true"`).

**`WeatherPanel`**
- Aucun choix : message d'accueil « Recherchez une localité ou choisissez un favori pour voir la météo. »
- Chargement : squelettes (`role="status"`, texte « Chargement de la météo… »), qui gardent la mise en page.
- Erreur : message + bouton « Réessayer ».
- Succès : `<h2>` avec le nom de la localité, sous-titre « Département · population », et le bouton favori : « ☆ Ajouter aux favoris » / « ★ Retirer des favoris » (`aria-pressed`). Puis la carte de météo actuelle, puis les prévisions.

**`CurrentWeatherCard`** : grand pictogramme, température en gros (`text-5xl`), description française (ex. « Pluie modérée »), puis trois valeurs : « Ressentie », « Humidité », « Vent ». Ligne discrète : « Mis à jour à 17:15 (heure du Bénin) ».

**`ForecastList`** : `<h3>` « Prévisions sur 7 jours ». Liste de 7 cartes. Chaque carte :
- la date en français (`mer. 18 nov.`) dans un `<time dateTime="2026-11-18">`, le pictogramme et la description ;
- « Min 20 °C » et « Max 33 °C » ;
- « Pluie 0,0 mm » et « Probabilité 0 % » (« — » si inconnue) ;
- si `isRainAlert(...)` : un badge **« ⚠ Vigilance pluie »** rouge à texte blanc, plus un liseré rouge à gauche de la carte (le signal n'est donc jamais porté par la seule couleur).
- Mise en page : 1 colonne sur mobile ; 2 colonnes à partir de 640 px.

**Accessibilité** : focus visible sur tous les boutons, pictogrammes `aria-hidden`, titres hiérarchisés (`h1` > `h2` > `h3`), cibles tactiles d'au moins 44 px.

## Directives Integrator
- **`useDebouncedValue(value, delayMs)`** : renvoie la valeur après `delayMs` sans changement.
- **`useFavorites()`** : renvoie `{ favorites, add, remove, isFavorite }`. Magasin externe avec cache en mémoire, `loadFavorites()` à la première lecture, `saveFavorites()` à chaque écriture, abonnement à l'événement `storage`, instantané serveur = liste vide constante.
- **`useForecast(locality | null)`** : renvoie `{ status: 'idle' | 'loading' | 'success' | 'error', data, error, retry }`. Annule la requête en cours au changement de localité ou au démontage ; ignore les `AbortError` ; `retry()` relance l'appel.
- **`SearchBox`** : état `idle | loading | success | error`. Un seul appel par texte stabilisé de 2 caractères ou plus ; chaque nouvelle recherche annule la précédente ; une réponse périmée n'écrase jamais une plus récente ; un texte d'au moins 2 caractères qui change avant la fin du délai n'émet aucun appel.
- **`WeatherApp`** : détient la localité choisie ; la passe à `WeatherPanel` ; fournit `onSelect` à `SearchBox` et `FavoritesBar`.
- Toute erreur est convertie en message : `error instanceof ApiError ? error.message : "Une erreur inattendue est survenue."`.

## Hors périmètre
Adresse partageable, navigation clavier avancée dans la liste, tests automatisés, « Ma position », graphique 24 h, mise en ligne (phase 5) · README (phase 4).

## Critères de validation
Vérifiés dans Chrome (puppeteer), requêtes réseau comptées et pannes simulées par interception.
- [ ] Taper « Parakou » lettre par lettre émet **une seule** requête de géocodage (et aucune avant 2 caractères)
- [ ] Les résultats affichent nom, département et population (« Parakou », « Borgou », « 255 478 hab. ») ; aucun aéroport
- [ ] « zzzzqq » affiche « Aucune localité du Bénin ne correspond… » ; 1 caractère affiche seulement l'aide
- [ ] Choisir « Parakou » affiche : température, ressentie, humidité, vent, description française, pictogramme et l'heure de mise à jour
- [ ] 7 cartes de jour avec date française (`mer. 18 nov.`), min, max, cumul de pluie (1 décimale) et probabilité
- [ ] Un jour à 20 mm ou à 80 % affiche « Vigilance pluie » ; un jour à 19,9 mm / 79 % ne l'affiche pas (vérifié avec une réponse simulée)
- [ ] Ajouter aux favoris : la localité apparaît dans « Mes favoris » ; l'ajouter deux fois = 1 seule entrée ; la retirer la supprime
- [ ] Après rechargement de la page, et dans un nouvel onglet, les favoris sont toujours là ; un clic dessus affiche sa météo
- [ ] Pendant le chargement : squelette ou « Recherche en cours… » visible
- [ ] API en erreur (500), injoignable ou lente : message en français + « Réessayer » ; après rétablissement, « Réessayer » affiche le résultat sans recharger ; aucune page blanche
- [ ] Changer de localité pendant un chargement n'affiche jamais les données de l'ancienne
- [ ] `npm run typecheck`, `npm run lint` et `npm run build` passent

## Journal de review
*(rempli par le Reviewer)*
