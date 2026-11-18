# Phase 7 : Design et ergonomie

Rédigé par : Generator · Date : 2026-11-18 · Statut : **terminée**

> Ce document a été rédigé pendant la phase, après le code (contrainte de temps).

## Objectif
Rendre l'interface plus agréable et plus claire, sans la surcharger, et sans toucher au comportement : seuls les styles changent (textes, rôles et identifiants sont conservés).

## Décisions
- **Charte graphique** : bleu de marque ; **cyan pour la pluie** (jeton `--rain`, variante sombre) ; rouge réservé à la vigilance ; orange (maximale) et indigo (minimale) ; ambre pour les favoris. Voir le README.
- **Structure** : bandeau d'en-tête en dégradé ; recherche, « Ma position » et favoris regroupés dans une carte posée sur le bandeau ; carte météo actuelle avec trois indicateurs (ressentie, humidité, vent) ; prévisions en cartes avec jauge de probabilité de pluie.
- **Favoris** : bloc dédié (étoile, titre), pastilles avec étoile décorative (dessinée en CSS, absente du texte réel), favori affiché en bleu, bouton « × » qui devient rouge au survol, état vide expliqué.
- **Ce qui est cliquable se voit** : texte d'aide au-dessus des résultats (« Choisissez une localité pour afficher sa météo »), flèche « › » (CSS) sur chaque ligne, curseur « main » sur tous les boutons actifs.
- **Pas de majuscules forcées par le CSS** sur les titres : un script qui lit le texte affiché aurait lu « PRÉVISIONS SUR 7 JOURS ».
- **Mouvement** : apparition douce (`fade-in`), désactivée avec `prefers-reduced-motion`.

## Critères de validation
- [x] Aucun texte, rôle ni identifiant modifié : les 240 tests automatisés passent
- [x] Les parcours Chrome des phases 2, 3 et des bonus passent sans régression (46/46, 16/16, 25/25)
- [x] axe-core : 0 violation avec les nouvelles couleurs (clair et sombre, 360, 768, 1280 px), aucun défilement horizontal, cibles de 44 px
- [x] La couleur de la pluie est appliquée aux valeurs, à la jauge et au graphique (couleur calculée vérifiée : `rgb(14, 116, 144)` en clair)
- [x] Captures relues à 360 px et 1280 px : en-tête, carte de recherche, carte météo, favoris, résultats

## Journal de review
**Reviewer · 2026-11-18**

- Un défaut trouvé par les tests de la phase 2 et de la phase 3 : les titres de section en majuscules (CSS) faisaient échouer les scripts qui lisent le texte affiché ; les majuscules forcées ont été retirées.
- Les tests unitaires (240) couvrent aussi le nouveau texte d'aide des résultats (affiché avec des résultats, absent sans résultat).
- Mineur : l'étoile des favoris et la flèche des résultats sont du contenu CSS (`::before`, `::after`) : elles ne sont pas lues par les lecteurs d'écran, ce qui est voulu (décoratives).
- Non vérifié : rendu sur un vrai téléphone, autres navigateurs que Chrome.
