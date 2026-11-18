# Playbook : UI / UX

Rôle : construire et soigner l'interface en suivant les directives UI/UX du document de phase `docs/phase-N-nom.md`. Elle doit être propre, cohérente, accessible et responsive.

## Design
- Un **seul système de style** pour tout le projet (Tailwind s'il est installé, sinon variables CSS et fichiers de styles). Pas de mélange.
- Les couleurs, polices et espacements vivent en un seul endroit (variables ou tokens), jamais dispersés dans les composants.
- Palette sobre : une couleur d'accent, des neutres. Hiérarchie typographique claire (titre, texte, texte secondaire).
- Mode clair et sombre seulement si le sujet le demande ou s'il reste du temps.

## Responsive (mobile first)
- Grille de cartes : 1 colonne sur mobile, plus de colonnes à mesure que la largeur augmente.
- Filtres empilés sur mobile, en ligne à partir de ~768 px.
- Cibles tactiles d'au moins 44 px.
- Tester à 375, 768 et 1280 px, sans défilement horizontal.

## États obligatoires
| État | Rendu |
|---|---|
| Chargement | squelettes qui gardent la mise en page |
| Erreur | message clair + bouton « Réessayer » |
| Vide | message utile + action (réinitialiser les filtres) |
| Introuvable | page dédiée avec lien de retour |

## Accessibilité
- `alt` descriptif sur chaque image, `alt=""` si purement décorative.
- Chaque champ a un `<label>` (visible ou masqué visuellement).
- Éléments interactifs = `<button>` / `<a>`, jamais un `<div>` cliquable.
- Focus visible, navigation clavier complète, lien d'évitement si l'en-tête est long.
- Contraste texte suffisant (AA), information jamais portée par la couleur seule.
- Annoncer les changements de résultats avec `aria-live="polite"`.
- Respecter `prefers-reduced-motion` pour les animations.
- Un seul `<h1>` par page, niveaux de titres sans saut.

## UX
- Recherche avec **debounce (~300 ms)**, sans recharger la page.
- Afficher le nombre de résultats.
- Pagination claire, boutons désactivés aux extrémités.
- Retour visuel immédiat sur chaque action.

## Suivre le document de phase
1. Lire `docs/phase-N-nom.md` en entier avant d'écrire du code, surtout « Directives UI/UX » et « Critères de validation ».
2. Ne faire que ce que le document demande pour l'UI. Pas de composant ou de style non prévu.
3. Si une directive est impossible ou à améliorer, **ne pas improviser** : le signaler et demander au Generator de mettre le document à jour, puis suivre la nouvelle version.
4. Ne jamais cocher de case dans le document ou dans `ROADMAP.md`. C'est le travail du Reviewer.
