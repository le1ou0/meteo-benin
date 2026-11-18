export interface WeatherDescription {
  label: string;
  icon: string;
}

interface Entry {
  label: string;
  icon: string;
  nightIcon?: string;
}

/** Codes météo WMO utilisés par Open-Meteo, traduits en français. */
const CODES: Record<number, Entry> = {
  0: { label: "Ciel dégagé", icon: "☀️", nightIcon: "🌙" },
  1: { label: "Plutôt dégagé", icon: "🌤️", nightIcon: "🌙" },
  2: { label: "Partiellement nuageux", icon: "⛅", nightIcon: "☁️" },
  3: { label: "Couvert", icon: "☁️" },
  45: { label: "Brouillard", icon: "🌫️" },
  48: { label: "Brouillard givrant", icon: "🌫️" },
  51: { label: "Bruine légère", icon: "🌦️" },
  53: { label: "Bruine modérée", icon: "🌦️" },
  55: { label: "Bruine dense", icon: "🌦️" },
  56: { label: "Bruine verglaçante légère", icon: "🌧️" },
  57: { label: "Bruine verglaçante dense", icon: "🌧️" },
  61: { label: "Pluie faible", icon: "🌦️" },
  63: { label: "Pluie modérée", icon: "🌧️" },
  65: { label: "Pluie forte", icon: "🌧️" },
  66: { label: "Pluie verglaçante légère", icon: "🌧️" },
  67: { label: "Pluie verglaçante forte", icon: "🌧️" },
  71: { label: "Chute de neige faible", icon: "❄️" },
  73: { label: "Chute de neige modérée", icon: "❄️" },
  75: { label: "Chute de neige forte", icon: "❄️" },
  77: { label: "Grains de neige", icon: "❄️" },
  80: { label: "Averses faibles", icon: "🌦️" },
  81: { label: "Averses modérées", icon: "🌧️" },
  82: { label: "Averses violentes", icon: "🌧️" },
  85: { label: "Averses de neige faibles", icon: "❄️" },
  86: { label: "Averses de neige fortes", icon: "❄️" },
  95: { label: "Orage", icon: "⛈️" },
  96: { label: "Orage avec grêle légère", icon: "⛈️" },
  99: { label: "Orage avec grêle forte", icon: "⛈️" },
};

export const KNOWN_WEATHER_CODES: number[] = Object.keys(CODES).map(Number);

export function describeWeather(code: number, isDay = true): WeatherDescription {
  const entry = CODES[code];
  if (!entry) return { label: "Conditions inconnues", icon: "❔" };
  return { label: entry.label, icon: !isDay && entry.nightIcon ? entry.nightIcon : entry.icon };
}
