# Changelog

## 0.2.0 - 2026-06-19

- Monorepo-Struktur eingeführt: `frontend/` und `backend/` nach `apps/frontend/` und `apps/backend/` verschoben
- `packages/shared/` mit gemeinsamen TypeScript-Typen angelegt
- Verzeichnisse `docs/`, `data/`, `storage/`, `logs/` ergänzt
- Root `.env.example` mit Windows-Produktionspfaden erstellt
- Root `package.json` um `dev`-Skript erweitert (startet Frontend und Backend parallel)
- `README.md` mit vollständiger Windows-Startanleitung und Projektstruktur-Übersicht aktualisiert
- `.gitignore` auf neue `apps/`-Pfade angepasst

## 0.1.0 - 2026-06-19

- Grundlagenmodul mit React/Vite-Frontend und Fastify-Backend angelegt
- SQLite-/Prisma-Setup für die zentralen Fachobjekte ergänzt
- Windows-Pfade, lokale Upload-/Log-Verzeichnisse und PowerShell-Service-Skripte dokumentiert
- Backend so vorbereitet, dass es das gebaute Frontend statisch ausliefern kann
