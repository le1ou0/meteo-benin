# Feuille de route : [NOM DU PROJET]

[Une phrase : ce que fait l'application, framework, API ou données utilisées.]
Légende : `[x]` fait et vérifié, `[ ]` à faire. Durée disponible : [à renseigner].

## Règles de travail
- Une phase suit ce cycle : **Generator** écrit `docs/phase-N-nom.md` -> **UI/UX + Integrator** codent selon ce document -> **Reviewer** vérifie, coche les tâches validées dans le document et ici, remplit le journal de review -> commit (voir `skills/`).
- Seul le Reviewer coche des cases. Le document de phase et ce fichier doivent toujours être alignés.
- Avant de clôturer une phase : build (types inclus), lint s'il existe, test s'il existe.
- Le MVP (phases 0 à 3) passe avant tout bonus.
- Documents de phase : dossier `docs/` (`docs/phase-0-fondations.md`, ...).

---

## Phase 0 : Fondations
- [ ] Projet créé, dépôt git, premier commit
- [ ] Types et couche d'accès aux données
- [ ] Layout global : langue, titre, en-tête, pied de page

## Phase 1 : Fonctionnalité principale (MVP)
- [ ] [Liste ou écran principal, d'après le sujet]
- [ ] Chargement et squelettes
- [ ] Validation des paramètres d'URL, si le sujet a des filtres

## Phase 2 : Interactions (MVP)
- [ ] [Recherche / filtres / tri / pagination, selon le sujet]
- [ ] État synchronisé avec l'URL
- [ ] [...]

## Phase 3 : Détail ou second écran (MVP)
- [ ] [Route de détail, ou formulaire, selon le sujet]
- [ ] Retour à l'écran précédent qui conserve l'état
- [ ] « Introuvable » si la ressource n'existe pas

## Phase 4 : Robustesse
- [ ] Écran d'erreur avec « Réessayer »
- [ ] Page « introuvable »
- [ ] État « aucun résultat » avec action
- [ ] Délai maximal des appels réseau

## Phase 5 : Finition
- [ ] Responsive vérifié à 375 / 768 / 1280 px
- [ ] Accessibilité : labels, `alt`, focus visible, navigation clavier
- [ ] Transitions et survols discrets

## Phase 6 : Bonus (seulement si le temps le permet)
1. [ ] [Favoris, thème, tests... selon le sujet]

## Phase 7 : Livraison
- [ ] README (modèle : `README.modele.md`)
- [ ] Nettoyage : pas de `console.log`, pas de fichiers du gabarit inutilisés
- [ ] Revue finale avec `skills/reviewer.md`
- [ ] Test sur un clone neuf
- [ ] Historique git propre
- [ ] Démo préparée (modèle : `docs/_modele-demo.md`)

---

## Répartition du temps (à adapter à la durée réelle)
| Part | Contenu |
|---|---|
| 10 % | Lire le sujet, poser des questions, écrire cette feuille de route |
| 10 % | Phase 0 : projet qui tourne |
| 40 % | Phases 1 à 3 : le MVP |
| 10 % | Phase 4 : états d'erreur et vides |
| 5 % | Phase 5 : finition |
| 15 % | Phase 7 : README, revue, démo |
| 10 % | Réserve |

## Décisions techniques
- [Une ligne par décision importante, avec la raison.]
