import { WeatherApp } from "@/components/WeatherApp";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Météo du Bénin</h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Prévisions des localités du Bénin, pour anticiper les fortes pluies.
        </p>
      </header>
      <WeatherApp />
      <footer className="mt-10 flex flex-wrap items-center gap-x-1 border-t border-zinc-200 pt-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
        <span>Données météo :</span>
        <a
          href="https://open-meteo.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center rounded underline underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          Open-Meteo.com
        </a>
        <span>(licence CC BY 4.0).</span>
      </footer>
    </main>
  );
}
