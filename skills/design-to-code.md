# Playbook : Design to code

Rôle : quand une maquette est fournie, la transformer en directives vérifiables, puis contrôler que le résultat lui ressemble. Ce playbook complète le cycle habituel : le **Generator** ajoute une section « Maquette » au document de phase, **UI/UX** l'applique, le **Reviewer** compare et consigne les écarts.

## Entrées acceptées
- Image (PNG, JPG), PDF, ou lien **public**. Un lien Figma privé n'est pas lisible : demander une exportation en image ou en PDF.
- Une image se lit directement. Une maquette en plusieurs écrans ou états : demander une image par écran ou état.

## Étape 1 : inventaire (Generator)
Avant de coder, lire la maquette et noter dans le document de phase, section « Maquette » :
- **Écrans et états** présents (liste, détail, chargement, erreur, vide, survol, focus, désactivé).
- **Largeur de référence** (ex. 1440 px) et présence ou non d'une version mobile.
- **Grille et marges** : colonnes, gouttières, largeur maximale du contenu.
- **Couleurs** en valeurs hexadécimales (fond, texte, accent, bordures, états).
- **Typographie** : famille, tailles, graisses, interlignes, casse.
- **Espacements, rayons, ombres, bordures**.
- **Composants** et leurs variantes ; **icônes** et **images**.
- **Textes exacts** (ne rien inventer ni reformuler).

Toute valeur lue à l'œil et non mesurée est marquée **« estimée »**.

## Étape 2 : tokens avant composants (UI/UX)
Poser d'abord les valeurs de la maquette dans la feuille de styles globale du projet (variables CSS ou configuration du thème) et la police du projet. Le document de phase contient la table de correspondance :

| Élément de la maquette | Valeur | Token / classe |
|---|---|---|
| Fond de page | `#...` | `--couleur-fond` |
| Titre principal | 32 px, 700 | `text-3xl font-bold` |

Si une police n'est pas disponible, choisir l'équivalent le plus proche et le noter.

## Étape 3 : ordre d'implémentation (UI/UX)
1. Structure et hiérarchie (grille, blocs, ordre).
2. Composants et leurs variantes.
3. États (survol, focus, vide, erreur, chargement).
4. Détails fins (ombres, marges, micro-interactions).

Ne pas ajouter de fonctionnalité absente de la maquette, ne pas supprimer ce qu'elle montre.

## Étape 4 : responsive
- La maquette ne couvre qu'une largeur : **décider** du comportement des autres (empiler, masquer, réduire) et l'écrire dans le document de phase.
- Vérifier à 375, 768 et à la largeur de référence.

## Étape 5 : comparaison (Reviewer)
Capturer la page dans Chrome à la largeur de la maquette :
```bash
google-chrome --headless=new --no-sandbox --hide-scrollbars \
  --virtual-time-budget=8000 --window-size=1440,900 \
  --screenshot=capture.png http://localhost:<port>/
```
Comparer côte à côte avec la maquette, dans cet ordre :
1. **Structure** : mêmes blocs, même ordre, même grille.
2. **Couleurs** : valeurs exactes.
3. **Typographie** : famille, tailles, graisses, interlignes.
4. **Espacements et rayons** : tolérance d'environ 2 px.
5. **États** : survol, focus, vide, erreur.

Consigner dans le journal : écarts **corrigés**, écarts **acceptés** (avec la raison) et ce qui n'a **pas pu être comparé**.

## Règles
- L'accessibilité reste prioritaire : si une couleur de la maquette échoue au contraste (WCAG AA), le signaler et proposer l'ajustement minimal, sans l'appliquer en silence.
- Pas de valeurs arbitraires dispersées dans les composants : tout passe par les tokens.
- Un écart voulu par rapport à la maquette est écrit dans le document de phase, jamais fait silencieusement.

## Checklist
**Generator**
- [ ] Section « Maquette » dans le document de phase (inventaire, largeur de référence, valeurs estimées signalées)
- [ ] Table de correspondance maquette -> tokens
- [ ] Décision responsive écrite

**UI/UX**
- [ ] Tokens posés avant les composants
- [ ] Structure puis détails, rien d'ajouté ni de retiré

**Reviewer**
- [ ] Captures comparées à la maquette (structure, couleurs, typographie, espacements, états)
- [ ] Écarts corrigés, acceptés et non comparables consignés
- [ ] Contraste et accessibilité vérifiés
