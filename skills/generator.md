# Playbook : Generator

Rôle : au début de **chaque phase**, écrire le document `docs/phase-N-nom.md`, qui sert de cahier des charges à UI/UX et Integrator. Il écrit aussi les types et les fonctions d'accès aux données quand le document le demande.

## Architecture
À décider et à écrire en tête du document de la **première** phase, selon le framework :

| Framework | Composants | Accès aux données | Types | Pages / routes |
|---|---|---|---|---|
| React (Vite) | `src/components/` | `src/lib/api.ts` | `src/types/` | `src/pages/` ou `src/routes/` |
| Vue (Vite) | `src/components/` | `src/lib/api.ts` ou `src/composables/` | `src/types/` | `src/views/` |
| Angular | `src/app/<fonctionnalité>/` | un service injectable (`*.service.ts`) | `*.model.ts` | `src/app/app.routes.ts` |

Si le sujet impose Next.js : c'est du React, mêmes règles ; seules les conventions de dossiers changent (`src/app/` pour les routes).

## Règles
1. **Données** : tout appel réseau passe par un seul endroit (`lib/api` ou un service). Jamais de `fetch` dans un composant d'affichage.
2. **Types** : TypeScript strict, pas de `any`. Types partagés dans un dossier dédié.
3. **État dans l'URL** : recherche, filtre, tri et page vivent dans l'URL (liens partageables, bouton retour fonctionnel), quand le sujet comporte une liste filtrable.
4. **États complets** : chaque écran qui charge des données gère chargement, erreur et vide.
5. **Nommage** : suivre les conventions du framework choisi (composants en `PascalCase`, etc.).
6. **Petit et lisible** : un composant qui dépasse ~100 lignes se découpe.
7. **Pas de dépendance ajoutée** sans raison claire. Aucun secret dans le code.

## Checklist avant de rendre le code
- [ ] Types stricts, aucun `any`
- [ ] Aucun appel réseau hors de la couche données
- [ ] Chargement, erreur et vide couverts
- [ ] Le build passe (il vérifie aussi les types) et le lint passe s'il existe

## Livrable de phase : `docs/phase-N-nom.md`
Avant tout code d'une phase, le Generator crée ce document à partir de `docs/_modele-phase.md` et des tâches de `ROADMAP.md`. Il ne coche **aucune** case.

Structure obligatoire :
1. **Objectif** : ce que la phase apporte, en 2 ou 3 lignes.
2. **Tâches** : les cases du ROADMAP pour cette phase, toutes décochées `[ ]`.
3. **Fichiers** : fichiers à créer ou modifier, avec le rôle responsable (UI/UX ou Integrator).
4. **Directives UI/UX** : composants, rendu, responsive, états, accessibilité attendus.
5. **Directives Integrator** : flux de données, URL, gestion d'erreurs, branchements attendus.
6. **Critères de validation** : comportements vérifiables dans le navigateur, un par ligne.
7. **Journal de review** : section vide, remplie uniquement par le Reviewer.

Règles :
- Le document est écrit **avant** le code et reste la source de vérité de la phase.
- Les directives sont précises : noms de fichiers, props, paramètres d'URL, cas limites.
- Si la phase change en cours de route, le Generator met le document à jour d'abord, puis le code suit.
- Le Generator ne coche jamais une case : seul le Reviewer le fait.
- Avant de rédiger, **vérifier les faits dont dépend le document** (comportement de l'API, documentation du framework) plutôt que les supposer.

## Si une maquette est fournie
Ajouter au document de phase une section « Maquette » (inventaire, largeur de référence, table maquette -> tokens, décision responsive) en suivant [design-to-code.md](design-to-code.md).
