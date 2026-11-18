# Phase 4 : Livraison

Rédigé par : Generator · Date : 2026-11-18 · Statut : **terminée**

> Ce document a été rédigé pendant la phase, après le README (contrainte de temps), et non avant le code comme les phases précédentes.

## Objectif
Rendre le projet utilisable par quelqu'un d'autre : un README exact qui permet d'installer et de démarrer l'application, un dépôt sans fichier inutile, et la preuve que les instructions fonctionnent sur une copie neuve.

## Tâches
- [x] README : installation, démarrage, choix techniques, ce qui fonctionne, ce qui manque et pourquoi
- [x] Nettoyage : pas de `console.log`, pas de fichiers inutiles
- [x] Démarrage vérifié sur un clone neuf en suivant le README
- [x] Dépôt en ligne, poussé

## Critères de validation
- [x] Toutes les commandes citées dans le README existent dans `package.json` ; tous ses liens relatifs sont valides
- [x] Sur un clone neuf : `npm install`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` et `npm start` réussissent
- [x] Sur ce clone, un parcours réel avec l'API réelle fonctionne (recherche, choix, 7 jours)
- [x] `knip` : aucun fichier, export ni dépendance inutilisés ; `console.*` : uniquement `console.error` dans `error.tsx`
- [x] Les fichiers personnels de travail ne sont ni dans le dépôt ni dans son historique
- [x] Le dépôt est accessible en ligne et à jour avec la dernière version

## Journal de review
**Reviewer · 2026-11-18**

**Preuves**
- README : 10 sections ; commandes `dev`, `build`, `start`, `lint`, `typecheck`, `test` toutes présentes dans `package.json` ; lien relatif `ROADMAP.md` valide.
- **Clone neuf** (dépôt cloné dans un dossier vide, 55 fichiers suivis, aucun `node_modules`, aucun fichier personnel) : `npm install` EXIT 0 ; `typecheck` EXIT 0 ; `lint` EXIT 0 ; `npm test` EXIT 0 (**166 tests passent**) ; `build` EXIT 0 ; `npm start` : `/` répond 200, `<html lang="fr">`, titre « Météo du Bénin », champ de recherche présent.
- Parcours réel sur le clone, à 360 px, avec l'API réelle : « Parakou », 7 jours, météo actuelle (ressentie, humidité), attribution Open-Meteo, aucun défilement horizontal, 0 erreur console.
- Nettoyage : 5 SVG du gabarit supprimés (aucune référence) ; `knip` propre après retrait d'un export inutile ; un seul `console.error` (`error.tsx`) ; aucun `TODO`.

**Remarques**
- **Mineur** : la compatibilité avec Node 20 (version minimale annoncée) n'a pas été essayée ; tout est testé avec Node 24. Indiqué dans le README.
- Dépôt public https://github.com/le1ou0/meteo-benin : page accessible sans authentification (HTTP 200), clone HTTPS anonyme réussi, aucun fichier personnel, dernier commit distant identique au dernier commit local. Application déployée : voir `docs/phase-6-bonus-fonctionnalites.md`.
