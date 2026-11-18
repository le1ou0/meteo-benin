import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <h1 className="text-3xl font-bold">Page introuvable</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">Cette adresse ne correspond à aucune page de l&apos;application.</p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white outline-none hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
      >
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}
