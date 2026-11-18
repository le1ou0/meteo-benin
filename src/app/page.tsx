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
    </main>
  );
}
