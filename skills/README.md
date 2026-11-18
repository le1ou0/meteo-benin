# Skills : playbooks du projet

| Fichier | Quand l'utiliser |
|---|---|
| [generator.md](generator.md) | Début de phase : écrire le document `docs/phase-N-nom.md` |
| [ui-ux.md](ui-ux.md) | Construire l'interface en suivant le document de phase |
| [integrator.md](integrator.md) | Brancher données, URL et composants en suivant le document de phase |
| [nextjs.md](nextjs.md) | Le projet est en Next.js : pièges vérifiés et solutions |
| [design-to-code.md](design-to-code.md) | Une maquette est fournie : l'inventorier, poser les tokens, la comparer |
| [reviewer.md](reviewer.md) | Fin de phase : vérifier, puis mettre à jour le document et `ROADMAP.md` |

## Cycle d'une phase
```
Generator    écrit docs/phase-N-nom.md (tâches décochées)
    |
UI/UX + Integrator    codent en suivant les directives du document
    |
Reviewer     vérifie tout, coche les tâches validées dans
             docs/phase-N-nom.md ET ROADMAP.md, remplit le journal de review
    |
commit
```
Seul le Reviewer coche des cases.
