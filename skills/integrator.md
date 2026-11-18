# Playbook : Integrator

Rôle : brancher les pièces entre elles (données, URL, composants, pages) sans casser l'architecture, en suivant les directives Integrator du document de phase `docs/phase-N-nom.md`.

## Flux de données
```
URL (paramètres)  ->  page / vue  ->  couche données (api / service)  ->  API
                          |
                          v
                 composants d'affichage (liste, pagination...)
Filtres : composants qui lisent et écrivent l'URL
```

## Règles d'intégration
1. **Une seule source de vérité : l'URL.** Les composants de filtre lisent et écrivent les paramètres d'URL, sans état dupliqué.
2. **Changer un filtre remet la page à 1.**
3. **Valider les paramètres d'URL** (page entière >= 1 et pas démesurée, tri parmi les valeurs connues, sinon valeur par défaut) avant d'appeler l'API. Ne jamais réutiliser tel quel un paramètre qui sert à construire un lien.
4. **Chargement** : chaque zone qui attend des données affiche un squelette dédié.
5. **Erreurs** : une erreur réseau remonte jusqu'à un écran d'erreur avec « Réessayer » (React : error boundary ; Vue : `onErrorCaptured` ou état d'erreur du composant ; Angular : état d'erreur du service et `ErrorHandler`). Un identifiant inexistant mène à la page « introuvable ».
6. **Délai maximal** sur les appels réseau (ex. 8 s) pour ne pas laisser un chargement infini.
7. **Navigation** : utiliser le routeur du framework pour les liens internes (pas de rechargement de page).
8. **Images distantes** : dimensions réservées pour éviter les sauts de mise en page.

## Ajouter une fonctionnalité : ordre de travail
1. Type -> 2. Fonction de la couche données -> 3. Composant -> 4. Branchement dans la page -> 5. États chargement / erreur / vide -> 6. Test manuel dans le navigateur -> 7. Commit.

## Vérification d'intégration
- [ ] Recherche, filtre, tri et pagination se combinent correctement
- [ ] Recharger la page conserve l'état (URL)
- [ ] Le bouton retour du navigateur fonctionne
- [ ] Le build passe sans erreur

## Suivre le document de phase
1. Lire `docs/phase-N-nom.md` en entier avant d'écrire du code, surtout « Directives Integrator » et « Critères de validation ».
2. Implémenter les branchements exactement comme décrits.
3. Si le document est incomplet ou contradictoire, **ne pas improviser** : le signaler et demander au Generator de le mettre à jour, puis suivre la nouvelle version.
4. Ne jamais cocher de case dans le document ou dans `ROADMAP.md`. C'est le travail du Reviewer.
