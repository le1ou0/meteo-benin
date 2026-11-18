# Playbook : Reviewer

Rôle : relire le code avant chaque commit, avec un regard critique et exigeant. À la fin de chaque phase, il vérifie le travail de UI/UX et Integrator par rapport à `docs/phase-N-nom.md`, puis **met à jour le document et `ROADMAP.md`**.

## Commandes obligatoires
Utiliser les scripts du `package.json` du projet. Les gabarits créés pour le kit ont tous un `build` qui **vérifie aussi les types** :
```bash
npm run build         # build de production (types inclus)
npm run lint          # seulement si le script existe (React : oxlint ; Vue et Angular : aucun par défaut)
npm test              # seulement si des tests existent
```

## Checklist de revue
**Architecture**
- [ ] Aucun appel réseau hors de la couche données
- [ ] Types dans un dossier dédié, pas de `any`
- [ ] Pas de logique métier dans les composants d'affichage

**Qualité**
- [ ] Noms clairs, fonctions courtes, pas de code mort ni de `console.log`
- [ ] Pas de duplication évidente, pas de dépendance inutile
- [ ] Aucun fichier du gabarit inutilisé

**Robustesse**
- [ ] Chargement, erreur, liste vide et « introuvable » gérés
- [ ] Paramètres d'URL validés
- [ ] Aucune clé secrète dans le code

**UI / accessibilité**
- [ ] `alt`, labels, focus visible, navigation clavier
- [ ] Responsive vérifié (375 / 768 / 1280 px)

**Git**
- [ ] Commit petit, message `feat:` / `fix:` / `chore:` / `docs:` / `refactor:`
- [ ] Un commit = une fonctionnalité qui marche

## Format du retour de revue
Classer chaque remarque : **Bloquant** (bug, casse l'architecture), **Important** (qualité, accessibilité), **Mineur** (style). Corriger les bloquants avant de commiter.

## Clôture de phase (obligatoire)
Une fois le code de la phase écrit, le Reviewer :
1. Lance les commandes obligatoires.
2. Vérifie **chaque critère de validation** du document de phase, dans le navigateur quand c'est visuel ou interactif.
3. Applique la checklist de revue ci-dessus.
4. Met à jour `docs/phase-N-nom.md` :
   - coche `[x]` uniquement les tâches **réellement validées**, laisse `[ ]` les autres ;
   - remplit le **Journal de review** : date, commandes lancées, résultat, remarques classées, **ce qui n'a pas pu être vérifié**.
5. Met à jour `ROADMAP.md` : coche les mêmes tâches que dans le document de phase.
6. Commite le code et les mises à jour de documentation.

Règles :
- Pas de case cochée sans preuve (commande qui passe ou comportement constaté).
- Si un point est **Bloquant**, la phase n'est pas clôturée : le Reviewer renvoie le travail avec la liste des corrections.
- Le document de phase et `ROADMAP.md` doivent toujours dire la même chose.
- Dire ce qui n'a pas été vérifié, sans enjoliver.

## Avant la livraison
Tester l'installation sur un **clone neuf** du dépôt (`git clone`, `npm ci` ou `npm install`, build, démarrage) en suivant le README à la lettre : cela révèle des défauts invisibles sur la machine de travail.

## Si une maquette est fournie
Comparer le rendu à la maquette (structure, couleurs, typographie, espacements, états) et consigner écarts corrigés, acceptés et non comparables, comme décrit dans [design-to-code.md](design-to-code.md).
