interface StatusMessageProps {
  message: string;
  hint?: string;
  tone?: "info" | "error";
  actionLabel?: string;
  onAction?: () => void;
}

/** Message d'état (aucun résultat, erreur) avec une action facultative. */
export function StatusMessage({ message, hint, tone = "info", actionLabel, onAction }: StatusMessageProps) {
  const isError = tone === "error";
  return (
    <div
      role={isError ? "alert" : undefined}
      className={`rounded-lg border px-4 py-3 text-sm ${
        isError
          ? "border-red-300 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100"
          : "border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
      }`}
    >
      <p className="font-medium">{message}</p>
      {hint && <p className="mt-1 opacity-80">{hint}</p>}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-3 inline-flex min-h-11 items-center rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white outline-none hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
