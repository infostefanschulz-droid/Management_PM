# Management_PM

Windows-kompatibles Grundgerüst für eine modulare Projektmanagement-Software im Medienbereich.

## Enthaltenes Grundlagenmodul

- React + TypeScript + Vite + Tailwind CSS im Frontend
- Fastify + TypeScript im Backend
- Prisma mit SQLite
- statische Auslieferung des gebauten Frontends durch das Backend
- Windows-orientierte Verzeichnis- und Service-Konfiguration

## Projektstruktur

- `/frontend` – React-Oberfläche für Systemstatus und Betriebsparameter
- `/backend` – Fastify-API, Prisma-Schema und statische Auslieferung
- `/scripts` – PowerShell-Skripte für Windows-Deployment

## Wichtige Windows-Pfade

Standardwerte für Produktion:

- Anwendung: `D:\MediaPM`
- SQLite: `D:\MediaPM\data\app.sqlite`
- Uploads: `D:\MediaPM\storage`
- Logs: `D:\MediaPM\logs`
- Backups: `D:\MediaPM_Backup`

Die Anwendung erwartet lokale Pfade. UNC-/Netzwerkpfade für die SQLite-Datei werden abgewiesen.

## Voraussetzungen

- Node.js 22+
- npm 10+
- Windows Server 2019 für den Zielbetrieb

## Einrichtung

```powershell
cd D:\MediaPM
copy .\backend\.env.example .\backend\.env
npm install
npm --prefix .\backend install
npm --prefix .\frontend install
```

Für lokale Entwicklung im Repository kann `backend/.env` bei `DATABASE_URL="file:./dev.db"` bleiben. Für Windows-Deployment `DATABASE_URL` auf `file:/D:/MediaPM/data/app.sqlite` setzen.

## Wichtige Skripte

Root:

```powershell
npm run build
npm run lint
npm run dev:backend
npm run dev:frontend
npm run start
```

Backend:

```powershell
npm --prefix .\backend run prisma:migrate
npm --prefix .\backend run prisma:migrate:dev
npm --prefix .\backend run prisma:generate
```

## Start unter Windows

1. Verzeichnisse vorbereiten:

   ```powershell
   powershell -ExecutionPolicy Bypass -File .\scripts\Prepare-Environment.ps1
   ```

2. Frontend und Backend bauen:

   ```powershell
   npm run build
   ```

3. Prisma-Migrationen anwenden:

   ```powershell
   npm --prefix .\backend run prisma:migrate
   ```

4. Service installieren:

   ```powershell
   powershell -ExecutionPolicy Bypass -File .\scripts\Install-WindowsService.ps1
   ```

## API-Startpunkte

- `GET /api/system/health` – prüft App-, SQLite- und Frontend-Status
- `GET /api/system/config` – liefert bereinigte Windows-/Speicher-Konfiguration

## Prisma-Datenmodell

Das SQLite-Schema enthält die Kernobjekte:

- `User`
- `Customer`
- `Project`
- `ProjectType`
- `WorkflowTemplate`
- `WorkflowTaskTemplate`
- `Briefing`
- `Task`
- `FileAsset`
- `FileVersion`
- `Comment`
- `Approval`
- `ProductionJob`
- `AuditLog`

Sicherheitsrelevante Modellierung:

- Kundenbenutzer können per `customerId` an eigene Mandanten gebunden werden
- interne Kommentare sind über `Comment.isInternal` markiert
- Freigaben referenzieren immer `fileVersionId`
- Datei-Versionen bleiben über `FileAsset` + `FileVersion.versionNumber` nachvollziehbar
- Audit-Ereignisse werden in `AuditLog` abgebildet

## Frontend-/Backend-Kopplung

- Das Backend liefert `frontend/dist` statisch aus, sobald ein Frontend-Build vorhanden ist.
- Im Vite-Dev-Server werden `/api`-Aufrufe nach `http://127.0.0.1:3000` weitergeleitet.

## Hinweise

- Keine Docker-Dateien
- Keine PostgreSQL- oder Redis-Abhängigkeiten
- Uploads gehören ins lokale Dateisystem; in der Datenbank werden nur Metadaten gespeichert
