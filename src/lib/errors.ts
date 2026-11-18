import { ApiError } from "./api";

/** Message affichable à l'utilisateur : jamais de détail technique. */
export function toUserMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Une erreur inattendue est survenue.";
}
