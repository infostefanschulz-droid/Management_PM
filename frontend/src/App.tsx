import { useEffect, useState } from "react";

type HealthResponse = {
  status: "ok" | "degraded";
  timestamp: string;
  database: "ok" | "error";
  frontend: "available" | "missing";
  storageDirectories: string[];
};

type ConfigResponse = {
  appRoot: string;
  dataDir: string;
  uploadsDir: string;
  logsDir: string;
  backupDir: string;
  databaseFilePath: string;
  frontendDistDir: string;
  servesFrontend: boolean;
  targetPlatform: string;
  databaseEngine: string;
};

const projectTypes = [
  "Magazine",
  "Flyer",
  "Werbemittel",
  "Verpackungsmaterialien",
  "CI-/Branding-Projekte",
  "individuelle Kundenprojekte",
];

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [config, setConfig] = useState<ConfigResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [healthResponse, configResponse] = await Promise.all([
          fetch("/api/system/health"),
          fetch("/api/system/config"),
        ]);

        if (!healthResponse.ok || !configResponse.ok) {
          throw new Error("Backend-Konfiguration konnte nicht geladen werden.");
        }

        const healthPayload = (await healthResponse.json()) as HealthResponse;
        const configPayload = (await configResponse.json()) as ConfigResponse;

        setHealth(healthPayload);
        setConfig(configPayload);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unbekannter Fehler beim Laden des Systemstatus.",
        );
      }
    };

    void load();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <header className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
            Media Project Management
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Windows- und SQLite-fähiges Grundlagenmodul
          </h1>
          <p className="mt-4 max-w-3xl text-sm text-slate-300 sm:text-base">
            Dieses Startmodul richtet die Anwendung für Windows Server 2019 mit
            lokalem SQLite-Speicher, lokalem Dateisystem für Uploads und einer
            statisch auslieferbaren React-Oberfläche ein.
          </p>
        </header>

        {error ? (
          <section className="rounded-3xl border border-rose-500/40 bg-rose-950/40 p-6 text-rose-100">
            <h2 className="text-lg font-semibold">Backend nicht erreichbar</h2>
            <p className="mt-2 text-sm">{error}</p>
          </section>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Systemstatus</h2>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-950/70 p-4">
                <dt className="text-sm text-slate-400">Backend</dt>
                <dd className="mt-2 text-lg font-medium">
                  {health?.status ?? "lädt"}
                </dd>
              </div>
              <div className="rounded-2xl bg-slate-950/70 p-4">
                <dt className="text-sm text-slate-400">SQLite</dt>
                <dd className="mt-2 text-lg font-medium">
                  {health?.database ?? "lädt"}
                </dd>
              </div>
              <div className="rounded-2xl bg-slate-950/70 p-4">
                <dt className="text-sm text-slate-400">Frontend-Build</dt>
                <dd className="mt-2 text-lg font-medium">
                  {health?.frontend ?? "lädt"}
                </dd>
              </div>
              <div className="rounded-2xl bg-slate-950/70 p-4">
                <dt className="text-sm text-slate-400">Zielplattform</dt>
                <dd className="mt-2 text-lg font-medium">
                  {config?.targetPlatform ?? "lädt"}
                </dd>
              </div>
            </dl>
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Unterstützte Projektarten</h2>
            <ul className="mt-5 space-y-3 text-sm text-slate-300">
              {projectTypes.map((projectType) => (
                <li
                  key={projectType}
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3"
                >
                  {projectType}
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Windows-Verzeichnisse</h2>
            <ul className="mt-5 space-y-3 text-sm text-slate-300">
              {config
                ? [
                    ["App", config.appRoot],
                    ["Daten", config.dataDir],
                    ["Uploads", config.uploadsDir],
                    ["Logs", config.logsDir],
                    ["Backups", config.backupDir],
                  ].map(([label, value]) => (
                    <li
                      key={label}
                      className="rounded-2xl bg-slate-950/70 px-4 py-3"
                    >
                      <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">
                        {label}
                      </span>
                      <span className="mt-2 block break-all font-mono text-cyan-200">
                        {value}
                      </span>
                    </li>
                  ))
                : null}
            </ul>
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Konfigurationsregeln</h2>
            <ul className="mt-5 space-y-3 text-sm text-slate-300">
              <li className="rounded-2xl bg-slate-950/70 px-4 py-3">
                Keine Docker-, PostgreSQL- oder Redis-Abhängigkeiten
              </li>
              <li className="rounded-2xl bg-slate-950/70 px-4 py-3">
                SQLite wird als lokale Datei betrieben und nicht auf UNC-Pfaden
                erwartet
              </li>
              <li className="rounded-2xl bg-slate-950/70 px-4 py-3">
                Uploads werden im lokalen Dateisystem gespeichert; die Datenbank
                hält nur Metadaten
              </li>
              <li className="rounded-2xl bg-slate-950/70 px-4 py-3">
                Das Backend liefert das gebaute Frontend statisch aus
              </li>
            </ul>
          </article>
        </section>

        <footer className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-400">
          <p>
            SQLite-Datei:{" "}
            <span className="font-mono text-slate-200">
              {config?.databaseFilePath ?? "lädt"}
            </span>
          </p>
          <p className="mt-2">
            Statische Frontend-Auslieferung:{" "}
            <span className="font-medium text-slate-200">
              {config?.servesFrontend ? "aktiv" : "inaktiv"}
            </span>
          </p>
        </footer>
      </div>
    </main>
  );
}

export default App;
