import { WeatherApp } from "@/components/WeatherApp";

export default function Home() {
  return (
    <>
      <header className="bg-gradient-to-br from-blue-700 via-blue-800 to-blue-950 text-white">
        <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-8 sm:pt-10">
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight sm:text-4xl">
            <span aria-hidden="true" className="text-4xl leading-none sm:text-5xl">
              ⛅
            </span>
            Météo du Bénin
          </h1>
          <p className="mt-2 max-w-xl text-blue-100">
            Prévisions des localités du Bénin, pour anticiper les fortes pluies.
          </p>
        </div>
      </header>
      <main className="mx-auto -mt-8 w-full max-w-3xl flex-1 px-4 pb-10">
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
    </>
  );
}
