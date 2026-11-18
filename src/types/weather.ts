export interface Locality {
  id: number;
  name: string;
  /** Département (champ `admin1` de l'API). */
  department: string | null;
  population: number | null;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  /** Heure locale du Bénin, sans décalage (ex. `2026-11-18T17:15`). */
  time: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  /** km/h */
  windSpeed: number;
  weatherCode: number;
  isDay: boolean;
}

export interface DailyForecast {
  /** `AAAA-MM-JJ`, déjà dans le fuseau du Bénin. */
  date: string;
  weatherCode: number;
  temperatureMax: number;
  temperatureMin: number;
  /** mm */
  precipitationSum: number;
  /** % ; `null` si l'API ne le fournit pas. */
  precipitationProbability: number | null;
}

export interface HourlyPoint {
  /** Heure locale du Bénin, sans décalage (ex. `2026-11-18T17:00`). */
  time: string;
  temperature: number;
  /** mm */
  precipitation: number;
}

export interface Forecast {
  current: CurrentWeather;
  daily: DailyForecast[];
  /** Prochaines 24 heures ; vide si l'API ne les fournit pas (le graphique est alors masqué). */
  hourly: HourlyPoint[];
}
