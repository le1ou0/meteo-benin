"use client";

import { useEffect } from "react";
import { StatusMessage } from "@/components/StatusMessage";

/** Dernier filet de sécurité : une exception d'affichage ne montre jamais un écran technique. */
export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <h1 className="mb-4 text-3xl font-bold">Météo du Bénin</h1>
      <StatusMessage
        tone="error"
        message="Une erreur est survenue."
        hint="L'application n'a pas pu s'afficher correctement. Réessayez dans un instant."
        actionLabel="Réessayer"
        onAction={() => retry()}
      />
    </main>
  );
}
