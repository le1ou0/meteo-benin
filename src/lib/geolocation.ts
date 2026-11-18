/** Codes d'erreur de l'API de géolocalisation du navigateur. */
const PERMISSION_DENIED = 1;
const POSITION_UNAVAILABLE = 2;
const TIMEOUT = 3;

export const GEOLOCATION_UNSUPPORTED = "Votre navigateur ne permet pas la géolocalisation. Recherchez une localité.";

/** Message clair en français pour chaque cas, y compris le refus de l'utilisateur. */
export function geolocationMessage(code: number): string {
  switch (code) {
    case PERMISSION_DENIED:
      return "Vous avez refusé la géolocalisation. Autorisez-la dans votre navigateur ou recherchez une localité.";
    case POSITION_UNAVAILABLE:
      return "Votre position n'a pas pu être déterminée. Recherchez une localité.";
    case TIMEOUT:
      return "La localisation prend trop de temps. Réessayez ou recherchez une localité.";
    default:
      return "La localisation a échoué. Recherchez une localité.";
  }
}

/** Arrondit à 2 décimales (environ 1 km) : suffisant pour la météo, et l'adresse partagée reste peu précise. */
export const roundCoordinate = (value: number): number => Math.round(value * 100) / 100;
