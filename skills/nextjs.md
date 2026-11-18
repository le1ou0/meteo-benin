# Playbook : Next.js (React)

À utiliser avec les autres playbooks quand le projet est en Next.js. Tout ce qui suit a été **vérifié sur Next.js 16.4.6** (App Router). Si `create-next-app@latest` installe une version plus récente, relire les documents locaux avant de se fier à cette liste.

## Avant de coder
1. Lire `AGENTS.md` (généré par `create-next-app`) : il demande de lire la documentation fournie **dans le projet**, `node_modules/next/dist/docs/`, avant d'écrire du code. Cette version de Next diffère de ce que les modèles ont appris.
2. Le gabarit active `cacheComponents: true` et `partialPrefetching: true` dans `next.config.ts` : voir « Cache Components » ci-dessous.

## Pièges rencontrés (et la solution)
| Piège | Solution |
|---|---|
| **`npm run build` échoue sans réseau** : le gabarit charge la police Geist depuis Google (`next/font/google`). Le serveur de dev, lui, continue (avertissement). | Retirer l'import et les deux constantes de police de `src/app/layout.tsx`, enlever les variables de police de `className`, et mettre des polices système dans `globals.css` (`--font-sans: system-ui, sans-serif; --font-mono: ui-monospace, monospace;`). Vérifié : build, `tsc` et lint passent réseau bloqué. |
| `tsc --noEmit` échoue sur un clone neuf (`Cannot find name 'PageProps'`) | Script `"typecheck": "next typegen && tsc --noEmit"` : les types de routes sont générés par Next. |
| Erreur de build sur l'accès à `searchParams`, `params` ou à une donnée non mise en cache | Avec Cache Components, tout accès dynamique doit être sous un `<Suspense>`. La **page reste synchrone** et passe la promesse (`searchParams`, `params`) à un composant `async` placé sous `<Suspense>`. |
| Données à réutiliser / mettre en cache | `"use cache"` en tête de la fonction, avec `cacheLife("hours")` (import depuis `next/cache`). |
| `error.tsx` | Composant client avec les props `error` et `retry` (Next 16) ; `retry()` relance le rendu et les appels. Ne jamais afficher `error.message`. |
| `notFound()` appelé sous `Suspense` | La page « introuvable » s'affiche mais le statut HTTP reste **200** (Next ajoute `noindex`). Comportement documenté. Les routes inconnues répondent 404. |
| Avertissement « LCP … `loading="eager"` » en console | `priority` est déprécié : utiliser `loading="eager"` sur les images visibles dès l'affichage. Si une miniature partage la source de l'image principale, la mettre aussi en `eager`. |
| Images distantes | Autoriser le domaine dans `next.config.ts` (`images.remotePatterns`) et renseigner `sizes`. |
| Rendu en `next/image` avec `fill` | Le conteneur doit être `relative` avec une taille (ex. `aspect-square`). |

## URL comme état (liste filtrable)
- Lire : `searchParams` dans la page (promesse) ; `useSearchParams()` dans un composant client, **sous `<Suspense>`**.
- Écrire : `router.replace(..., { scroll: false })` pour la frappe (pas d'entrée d'historique par touche), `router.push` pour catégorie, tri, pagination (le bouton retour les restaure).
- Valider les paramètres (page = entier sûr >= 1, tri parmi les valeurs connues) et ne jamais réutiliser tel quel un paramètre qui sert à construire un lien (ex. `from`).

## Vérifier avec Chrome en ligne de commande
- Capture : `google-chrome --headless=new --no-sandbox --hide-scrollbars --virtual-time-budget=8000 --window-size=1280,900 --screenshot=out.png URL`.
- Chrome headless déclare `(hover: hover)` faux, et Tailwind 4 enveloppe les styles `hover:` dedans : sans pointeur déclaré, aucun survol ne s'applique. Pour les tester : `--blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4`. Tailwind 4 anime la propriété `scale`, pas `transform`.
- Plusieurs onglets d'un même profil partagent le cache HTTP : désactiver le cache ou utiliser un contexte isolé dans les tests automatisés.

## Ports
- `next dev` utilise 3000 ; vérifier avec `ss -ltnp | grep :3000` avant d'arrêter un processus qu'on n'a pas lancé. Utiliser d'autres ports pour les serveurs de test (ex. 3100).
