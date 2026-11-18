# Phase 3 : Finition et vérification mobile

Rédigé par : Generator · Date : 2026-11-18 · Statut : **terminée**

## Objectif
Vérifier et consolider le socle sur ce qui compte pour l'utilisateur final : un écran de téléphone de 360 px sans défilement horizontal, une accessibilité de base, et l'assurance qu'aucune situation d'erreur n'affiche une page blanche ou un message technique.

## Constat de départ (relecture du code)
Deux trous par rapport à la règle « jamais de page blanche ni de message technique » :
1. **Réponse de l'API incomplète** : `fetchForecast` ne vérifie que la présence de `current` et de `daily.time`. Une série plus courte ou une valeur manquante afficherait « NaN °C » ou « undefined ».
2. **Exception d'affichage inattendue** : sans `error.tsx`, une exception pendant le rendu produirait l'écran d'erreur générique de Next.js, en anglais et technique.

## Décisions
- **Valider la réponse des prévisions** : toutes les valeurs numériques nécessaires doivent être des nombres finis et les séries doivent couvrir tous les jours ; sinon `ApiError` (`http`, message « réponse inattendue ») que l'interface sait déjà afficher avec « Réessayer ».
- **`error.tsx` et `not-found.tsx` en français**, avec bouton « Réessayer » et lien « Retour à l'accueil ».
- **Cibles tactiles de 44 px au minimum** pour tous les boutons (déjà prévu au design ; à vérifier).
- La navigation au clavier de base (Tab, Entrée, Espace) est déjà couverte par des vrais `<button>`. Les flèches dans la liste des résultats sont un bonus de la phase 5.

## Tâches
- [x] Utilisable à 360 px de large, sans défilement horizontal
- [x] Jamais de page blanche ni de message technique
- [x] Accessibilité de base (labels, focus visible, contrastes)

## Fichiers
| Fichier | Action | Rôle |
|---|---|---|
| `src/lib/api.ts` | modifier | Integrator : validation stricte de la réponse des prévisions |
| `src/app/error.tsx` | créer | Integrator + UI/UX : écran d'erreur en français avec « Réessayer » |
| `src/app/not-found.tsx` | créer | UI/UX : page introuvable en français |

## Directives Integrator
- Dans `fetchForecast`, après lecture : `current.time` doit être une chaîne ; `temperature_2m`, `apparent_temperature`, `relative_humidity_2m`, `wind_speed_10m`, `weather_code` des nombres finis ; `daily.time` non vide ; `weather_code`, `temperature_2m_max`, `temperature_2m_min`, `precipitation_sum` des tableaux d'au moins `daily.time.length` nombres finis. Sinon : `ApiError("http", "Le service météo a renvoyé une réponse inattendue.")`. La probabilité de pluie reste facultative (`null`).
- `error.tsx` (composant client) : props `{ error, retry }` (Next 16), message « Une erreur est survenue. L'application n'a pas pu s'afficher correctement. », bouton « Réessayer » qui appelle `retry()`, jamais le texte de l'erreur.

## Hors périmètre
Flèches de navigation dans la liste (phase 5) · `global-error.tsx` (erreur du layout racine, très improbable).

## Critères de validation
Vérifiés dans Chrome (puppeteer) et par axe-core.
- [x] 360 px : aucun défilement horizontal dans les 4 états (accueil, résultats, « aucune localité », météo + 7 jours), en clair et en sombre ; idem à 320 px
- [x] Tous les boutons et liens font au moins 44 px de haut à 360 px
- [x] axe-core : 0 violation (4 états × 360, 768 et 1280 px × clair et sombre)
- [x] Tab atteint, dans l'ordre : le champ, les résultats, les favoris, le bouton favori ; chaque élément a un indicateur de focus visible ; Entrée sur un résultat affiche sa météo
- [x] Réponse de l'API avec valeurs manquantes (série trop courte, `null`, texte) : message « réponse inattendue » + « Réessayer », jamais « NaN » ni « undefined »
- [x] Exception d'affichage simulée : écran « Une erreur est survenue » en français + « Réessayer » (pas d'écran technique)
- [x] URL inconnue (`/nimporte`) : page « Page introuvable » en français
- [x] Captures lisibles à 360 px (clair et sombre) et à 1280 px
- [x] `npm run typecheck`, `npm run lint`, `npm test` et `npm run build` passent

## Journal de review
**Reviewer · 2026-11-18**

Commandes : `npm run typecheck` OK · `npm run lint` OK · `npm test` OK (166 tests) · `npm run build` OK.
Vérification : serveur de production piloté par Chrome ; les réponses de l'API sont **simulées** pour l'audit d'interface (voir remarques). **16 vérifications sur 16** réussies, plus la non-régression du test de la phase 2 (**46/46**) sur la build contenant la correction de `SearchBox`.

**Preuves**
- Défilement horizontal : **aucun** à 320, 360, 768 et 1280 px, en clair et en sombre, dans les 4 états (accueil, résultats, « aucune localité », météo + 7 jours).
- Cibles tactiles : tous les boutons, liens et champs font au moins 44 px de haut à 320 et 360 px.
- axe-core : **0 violation** sur 24 analyses (4 états × 3 largeurs × 2 thèmes).
- Clavier : le premier Tab atteint le champ de recherche, le suivant le premier résultat ; Entrée affiche sa météo ; chaque élément atteint a un indicateur de focus visible ; Maj+Tab revient en arrière sans piège ; la barre d'espace active le bouton favori.
- Réponses de l'API incomplètes (série trop courte, température `null`, valeur de type texte, aucun jour, objet vide) : à chaque fois « Le service météo a renvoyé une réponse inattendue » + « Réessayer », **jamais** « NaN », « undefined » ou « null ».
- Exception d'affichage simulée (nom de localité de type objet) : écran « Une erreur est survenue. L'application n'a pas pu s'afficher correctement. » + « Réessayer », sans aucun texte technique.
- `/nimporte` : page « Page introuvable » en français, lien « Retour à l'accueil », statut HTTP **404**.
- Captures relues à 360 px et 1280 px : mise en page propre, « Vigilance pluie » bien visible (badge texte + liseré rouge), cartes lisibles.

**Défauts corrigés pendant la phase**
- **Important (corrigé)** : une réponse de prévisions incomplète aurait affiché « NaN °C ». `fetchForecast` valide maintenant que toutes les valeurs nécessaires sont des nombres finis et que les séries couvrent tous les jours.
- **Important (corrigé)** : sans `error.tsx`, une exception d'affichage montrait l'écran générique de Next.js. Ajout de `error.tsx` et `not-found.tsx` en français.
- **Important (corrigé, trouvé par les tests de composants)** : après le choix d'une localité, la liste des résultats restait visible environ 0,4 s (durée de l'anti-rebond). Elle disparaît maintenant immédiatement.
- **Mineur (corrigé)** : le navigateur soulignait les noms de localités comme des fautes d'orthographe ; correction orthographique désactivée sur ce champ.

**Remarques**
- **Mineur (test, pas l'application)** : ma première exécution utilisait l'API réelle pour chaque état et chaque largeur (des dizaines d'appels en quelques minutes) et a expiré à l'étape clavier. Je n'ai pas pu déterminer si l'API réelle avait temporairement refusé les appels (l'énoncé prévient du HTTP 429) : elle répondait normalement juste après. L'audit utilise désormais des réponses simulées, ce qui le rend déterministe et épargne l'API.
- **Mineur (test)** : à 320 et 360 px, la sélection du texte par triple clic ne fonctionne pas en émulation tactile ; le test utilise `Ctrl+A`.

**Non vérifié**
- Aucun vrai téléphone, aucun lecteur d'écran (NVDA, VoiceOver), Chrome uniquement.
- Le comportement face à une **vraie** limitation de l'API (HTTP 429) n'est vérifié que par simulation.
- Les flèches de navigation dans la liste des résultats ne sont pas implémentées (bonus de la phase 5) ; la navigation par Tab et Entrée fonctionne.
- Les scripts de test d'interface ne sont pas dans le dépôt (les tests automatisés versionnés sont dans `tests/`).

