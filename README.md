# Media Project Manager

Windows-kompatibles Monorepo für eine modulare Projektmanagement-Software im Medienbereich.

## Enthaltenes Grundlagenmodul

- React + TypeScript + Vite + Tailwind CSS im Frontend
- Fastify + TypeScript im Backend
- Prisma mit SQLite
- Statische Auslieferung des gebauten Frontends durch das Backend
- Windows-orientierte Verzeichnis- und Service-Konfiguration

## Projektstruktur

```
media-project-manager/
├─ apps/
│  ├─ backend/        – Fastify-API, Prisma-Schema und statische Auslieferung
│  └─ frontend/       – React-Oberfläche für Systemstatus und Betriebsparameter
├─ packages/
│  └─ shared/         – Gemeinsame Typen und Hilfsfunktionen
├─ docs/              – Projektdokumentation
├─ scripts/           – PowerShell-Skripte für Windows-Deployment
├─ data/              – SQLite-Datenbankdateien (lokal)
├─ storage/           – Upload-Verzeichnis (lokal)
├─ logs/              – Protokolldateien (lokal)
├─ .env.example       – Vorlage für Umgebungsvariablen
├─ README.md
└─ CHANGELOG.md
```

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

## Windows-Startanleitung

### 1. Verzeichnisse vorbereiten

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\Prepare-Environment.ps1
```

### 2. Abhängigkeiten installieren

```powershell
npm install
npm --prefix .\apps\backend install
npm --prefix .\apps\frontend install
```

### 3. Umgebungsvariablen einrichten

```powershell
copy .env.example .env
copy .\apps\backend\.env.example .\apps\backend\.env
```

Für lokale Entwicklung kann `apps/backend/.env` bei `DATABASE_URL="file:./dev.db"` bleiben.
Für Windows-Deployment `DATABASE_URL` auf `file:/D:/MediaPM/data/app.sqlite` setzen.

### 4. Frontend und Backend bauen

```powershell
npm run build
```

### 5. Prisma-Migrationen anwenden

```powershell
npm --prefix .\apps\backend run prisma:migrate
```

### 6. Service installieren

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\Install-WindowsService.ps1
```

## Lokale Entwicklung

Frontend und Backend gleichzeitig starten:

```powershell
npm run dev
```

Oder einzeln:

```powershell
npm run dev:backend
npm run dev:frontend
```

## Wichtige npm-Skripte (Root)

| Skript | Beschreibung |
|--------|-------------|
| `npm run dev` | Startet Frontend und Backend parallel |
| `npm run dev:backend` | Startet nur das Backend |
| `npm run dev:frontend` | Startet nur das Frontend |
| `npm run build` | Baut Frontend und Backend |
| `npm run start` | Startet das gebaute Backend (Produktion) |
| `npm run lint` | Lint des Frontends |

## Backend-spezifische Skripte

```powershell
npm --prefix .\apps\backend run prisma:migrate
npm --prefix .\apps\backend run prisma:migrate:dev
npm --prefix .\apps\backend run prisma:generate
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
- Interne Kommentare sind über `Comment.isInternal` markiert
- Freigaben referenzieren immer `fileVersionId`
- Datei-Versionen bleiben über `FileAsset` + `FileVersion.versionNumber` nachvollziehbar
- Audit-Ereignisse werden in `AuditLog` abgebildet

## Frontend-/Backend-Kopplung

- Das Backend liefert `apps/frontend/dist` statisch aus, sobald ein Frontend-Build vorhanden ist.
- Im Vite-Dev-Server werden `/api`-Aufrufe nach `http://127.0.0.1:3000` weitergeleitet.

## Hinweise

- Keine Docker-Dateien
- Keine PostgreSQL- oder Redis-Abhängigkeiten
- Uploads gehören ins lokale Dateisystem; in der Datenbank werden nur Metadaten gespeichert

