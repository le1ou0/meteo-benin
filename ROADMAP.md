# Feuille de route : Météo des localités du Bénin

Application web en français qui affiche la météo de n'importe quelle localité du Bénin, avec l'API publique Open-Meteo (sans clé). Next.js (App Router), TypeScript, Tailwind. Tout se passe dans le navigateur : aucun serveur à développer.
Légende : `[x]` fait et vérifié, `[ ]` à faire.

## Règles de travail
- Cycle d'une phase : **Generator** écrit `docs/phase-N-nom.md` -> **UI/UX + Integrator** codent selon ce document -> **Reviewer** vérifie, coche les tâches validées ici et dans le document, remplit le journal -> commit (voir `skills/`).
- Seul le Reviewer coche des cases, jamais sans preuve. Le document de phase et ce fichier restent alignés.
- Avant de clôturer une phase : `npm run typecheck`, `npm run lint`, `npm run build`.
- **Le socle d'abord** : un socle qui fonctionne et un README honnête valent mieux qu'une application complète qui ne démarre pas.
- Un commit par fonctionnalité qui marche, poussé régulièrement.

---

## Phase 1 : Données et règles
- [x] Projet Next.js créé, dépôt git, premier commit
- [x] Types TypeScript (localité, météo actuelle, prévision journalière)
- [x] Accès à l'API (recherche de localités, prévisions) avec délai maximal et erreurs claires
- [x] Traduction des codes météo en français avec pictogramme
- [x] Formats : dates du Bénin en français, températures, vent, pluie
- [x] Règle « Vigilance pluie » (>= 20 mm ou >= 80 %)
- [x] Favoris : ajout sans doublon, retrait, conservation dans le navigateur

## Phase 2 : Socle fonctionnel
- [ ] Recherche : champ, 2 caractères minimum, requête seulement quand on a fini de taper
- [ ] Liste des résultats : nom, département, population si connue
- [ ] Météo actuelle : température, ressentie, humidité, vent, description en français, pictogramme
- [ ] Prévisions sur 7 jours : date en français, min, max, cumul et probabilité de pluie
- [ ] « Vigilance pluie » bien visible sur les jours concernés
- [ ] Favoris : ajouter, retirer, retrouver en un clic, conservés après rechargement
- [ ] États : chargement, aucun résultat, erreur avec « Réessayer »

## Phase 3 : Finition et vérification mobile
- [ ] Utilisable à 360 px de large, sans défilement horizontal
- [ ] Jamais de page blanche ni de message technique
- [ ] Accessibilité de base (labels, focus visible, contrastes)

## Phase 4 : Livraison
- [ ] README : installation, démarrage, choix techniques, ce qui fonctionne, ce qui manque et pourquoi
- [ ] Nettoyage : pas de `console.log`, pas de fichiers inutiles
- [ ] Démarrage vérifié sur un clone neuf en suivant le README
- [ ] Dépôt en ligne, poussé

## Phase 5 : Bonus (dans cet ordre, seulement si le temps le permet)
1. [ ] Adresse partageable : la localité dans l'URL
2. [ ] Navigation complète au clavier dans la liste des résultats
3. [ ] Tests automatisés (traduction des codes météo, règle de vigilance)
4. [ ] Bouton « Ma position »
5. [ ] Graphique température et pluie sur 24 heures
6. [ ] Mise en ligne

---

## Décisions techniques
- **Tout côté navigateur** : composants client, appels directs à Open-Meteo.
- **Peu d'appels** (l'API refuse au-delà d'une limite, code 429) : attente de fin de saisie, annulation des requêtes périmées, mémorisation des réponses.
- **Aucune dépendance en plus** de Next et React (aucun accès réseau supplémentaire à prévoir).
