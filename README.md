# Météo du Bénin

Application web, en français, qui affiche la météo de n'importe quelle localité du Bénin : conditions actuelles, prévisions sur 7 jours, **vigilance pluie** et localités favorites. Elle est pensée pour les agents des préfectures, des mairies et de la protection civile, qui doivent anticiper les fortes pluies.

Les données viennent de l'API publique [Open-Meteo](https://open-meteo.com/) (sans clé). **Aucun serveur n'est développé** : l'application appelle l'API directement depuis le navigateur.

## Ce qui fonctionne
**Socle**
- **Recherche de localité** : le champ propose les localités du Bénin correspondant au texte, avec leur nom, leur département et leur population quand elle est connue. La recherche démarre à partir de 2 caractères et n'envoie une requête que lorsque l'utilisateur a fini de taper (400 ms sans frappe).
- **Météo actuelle** : température, température ressentie, humidité, vent, description en français (« Pluie modérée »…) et pictogramme, avec l'heure de mise à jour (heure du Bénin).
- **Prévisions sur 7 jours** : date en français (« mer. 18 nov. »), températures minimale et maximale, cumul de pluie (une décimale) et probabilité de pluie.
- **Vigilance pluie** : un jour est signalé, de façon bien visible (badge « ⚠ Vigilance pluie » + liseré rouge), si le cumul prévu atteint 20 mm ou si la probabilité atteint 80 % (seuils inclus).
- **Favoris** : ajout et retrait en un clic, sans doublon, retrouvés en un clic, conservés après rechargement et fermeture du navigateur (`localStorage`).
- **Chargement, aucun résultat, erreurs** : chaque étape informe l'utilisateur. Une panne de l'API ou du réseau affiche un message clair avec un bouton « Réessayer » ; jamais de page blanche ni de message technique.

**Règles de gestion** : dates et heures du Bénin (GMT+1) quel que soit le fuseau de l'ordinateur ; températures arrondies à l'entier (°C), vent en km/h, pluie en mm avec une décimale ; utilisable sur un écran de 360 px comme sur ordinateur, sans défilement horizontal.

**Bonus réalisés**
- **Adresse partageable** : la localité affichée apparaît dans l'adresse (`?lieu=Parakou&id=…&lat=…&lon=…`) ; ouvrir cette adresse affiche directement la même localité, sans nouvelle recherche. Recharger la page et les boutons précédent et suivant du navigateur fonctionnent.
- **Navigation au clavier dans la liste des résultats** : `↓` depuis le champ ouvre la liste, `↑` `↓` `Début` `Fin` la parcourent, `Échap` revient au champ, `Entrée` choisit.
- **Graphique heure par heure sur 24 heures** : courbe de température et barres de pluie pour les prochaines 24 heures (heure du Bénin), avec une légende, un résumé en texte et un tableau de données pour les lecteurs d'écran. Les heures sont demandées dans la **même requête** que les prévisions (aucun appel de plus) ; si l'API ne les fournit pas, seul le graphique disparaît.
- **Bouton « Ma position »** : affiche la météo de l'endroit où se trouve l'utilisateur, avec un message clair s'il refuse la géolocalisation (et un bouton « Réessayer »).
- **Tests automatisés** (238 tests) : traduction des codes météo, règle de vigilance, formats, favoris, adresse partageable, géolocalisation, accès à l'API (dont les heures), graphique et comportement des composants.

## Prérequis
- Node.js 20.9 ou plus récent, et npm.

## Installation et démarrage
```bash
npm install
npm run dev          # http://localhost:3000
```

Pour tester la version de production :
```bash
npm run build
npm start            # http://localhost:3000
```

Aucune configuration ni clé d'API n'est nécessaire.

## Vérifications
| Commande | Rôle |
|---|---|
| `npm test` | lance les 238 tests (Vitest, sans accès au réseau) |
| `npm run typecheck` | vérifie les types TypeScript |
| `npm run lint` | ESLint |
| `npm run build` | build de production |

## Choix techniques
- **Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS 4.** Une seule page ; tous les composants qui parlent à l'API sont des composants client. Aucune dépendance d'exécution en plus de Next et React.
- **Peu d'appels à l'API** (elle refuse au-delà d'une limite, HTTP 429) : attente de fin de saisie, 2 caractères minimum, annulation de la requête précédente, mémorisation des recherches et des prévisions (10 minutes).
- **Couche d'accès unique** (`src/lib/api.ts`) : aucun `fetch` ailleurs. Les erreurs sont typées (`network`, `timeout`, `rate-limit`, `http`) pour afficher un message précis en français ; délai maximal de 8 secondes par appel ; réponse de l'API validée (une valeur manquante ne devient jamais « NaN »).
- **Localités seulement** : l'API de géocodage renvoie aussi des aéroports ; seuls les lieux habités (`feature_code` commençant par `PPL`) sont proposés, et la recherche est limitée au Bénin (`countryCode=BJ`).
- **Dates du Bénin** : `Intl.DateTimeFormat` avec le fuseau `Africa/Porto-Novo`, donc indépendantes du fuseau et de la langue de l'ordinateur. L'heure de mise à jour est celle renvoyée par l'API, sans conversion.
- **Adresse partageable** : la localité vit dans l'adresse, relue avec une validation stricte (une adresse invalide affiche l'accueil). Les coordonnées de « Ma position » sont arrondies à 2 décimales (environ 1 km) avant d'apparaître dans l'adresse.
- **Favoris** : `useSyncExternalStore` branché sur `localStorage` (pas d'écart d'hydratation), lecture tolérante (contenu invalide ignoré), synchronisés entre onglets.
- **État dérivé à l'affichage** : chaque réponse porte la clé de la requête qui l'a produite, donc une réponse tardive d'une ancienne recherche ou d'une ancienne localité n'est jamais affichée.
- **Pictogrammes en emoji**, toujours accompagnés du texte (aucune information portée par l'image seule).
- **Accessibilité** : libellés des champs, focus visible, cibles tactiles d'au moins 44 px, zones `aria-live`, aucune information portée par la seule couleur, thème clair et sombre automatique.

## Structure du projet
```
src/
  app/            page, mise en page, écrans d'erreur et « page introuvable »
  components/     recherche, favoris, météo actuelle, prévisions, messages d'état
  hooks/          anti-rebond, favoris (localStorage), chargement des prévisions
  lib/            api.ts (seul accès réseau), codes météo, formats, règles, favoris
  types/          types TypeScript
tests/            tests unitaires (lib/) et de composants (components/)
docs/             un document par phase de développement, avec son journal de vérification
skills/           consignes de travail utilisées pendant le développement
ROADMAP.md        feuille de route et avancement
```

## Méthode de travail
Le projet a été développé avec un assistant IA (Claude), par phases : pour chaque phase, un document écrit **avant** le code (`docs/phase-N-*.md`) fixe les tâches et les critères de validation, puis le code est écrit, puis chaque critère est vérifié (commandes, tests, essais dans Chrome) et consigné dans le journal du document. Seules les cases réellement vérifiées sont cochées dans [`ROADMAP.md`](ROADMAP.md).

## Ce qui manque, et pourquoi
Le socle, les règles de gestion et la plupart des bonus ont été traités ; un seul élément facultatif n'a **pas** été réalisé :
- **Mise en ligne** : non faite faute de temps. L'application se démarre en local en suivant ce README.

## Limites connues
- Avec **2 caractères**, l'API de géocodage ne renvoie que des correspondances **exactes** (la recherche approchée commence à 3 caractères) : taper « Co » ne propose rien. L'application l'explique à l'utilisateur.
- L'aspect des **emoji** dépend du système d'exploitation.
- Testé avec **Node 24** uniquement ; la compatibilité avec Node 20 (version minimale annoncée par Next.js 16) n'a pas été essayée.
- Vérifié avec **Chrome** (ordinateur et émulation d'un écran de 360 px) ; pas essayé sur un vrai téléphone, ni avec un vrai GPS (la géolocalisation est vérifiée avec une position simulée), ni avec un lecteur d'écran.
- « Ma position » affiche la météo de l'endroit où l'on se trouve, **même hors du Bénin** (la restriction au Bénin concerne les localités proposées par la recherche).
- Les essais dans Chrome (parcours complet, pannes simulées, audit d'accessibilité) ont été faits pendant le développement avec des scripts qui ne sont **pas** versionnés ; leurs résultats sont dans les journaux de `docs/`. Seuls les 238 tests de `tests/` sont rejouables avec `npm test`.
- Les prévisions en cas de limitation de l'API (HTTP 429) sont vérifiées par simulation, pas avec une vraie limitation.

## Crédits
Données météo : [Open-Meteo.com](https://open-meteo.com/) (licence [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)).
