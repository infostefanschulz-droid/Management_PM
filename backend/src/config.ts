import { dirname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const defaultAppRoot = "D:\\MediaPM";
const defaultBackupDir = "D:\\MediaPM_Backup";
const currentDir = dirname(fileURLToPath(import.meta.url));
const backendRoot = resolve(currentDir, "..");

export type AppConfig = {
  appRoot: string;
  backupDir: string;
  dataDir: string;
  uploadsDir: string;
  logsDir: string;
  databaseUrl: string;
  databaseFilePath: string;
  frontendDistDir: string;
  frontendIndexPath: string;
  host: string;
  port: number;
  jwtSecret: string;
};

function isUncPath(pathValue: string): boolean {
  return pathValue.startsWith("\\\\") || pathValue.startsWith("//");
}

function resolveDatabaseFilePath(databaseUrl: string): string {
  if (!databaseUrl.startsWith("file:")) {
    throw new Error("DATABASE_URL muss mit file: beginnen, da nur SQLite unterstützt wird.");
  }

  const rawPath = decodeURIComponent(databaseUrl.slice("file:".length));

  if (rawPath.startsWith("//") || isUncPath(rawPath)) {
    throw new Error("SQLite-Dateien auf UNC-/Netzwerkpfaden werden nicht unterstützt.");
  }

  if (rawPath.startsWith("/") && /^[A-Za-z]:[\\/]/.test(rawPath.slice(1))) {
    return rawPath.slice(1).replace(/\//g, "\\");
  }

  return isAbsolute(rawPath) ? rawPath : resolve(backendRoot, "prisma", rawPath);
}

function resolveLocalPath(pathValue: string, label: string): string {
  if (!pathValue.trim()) {
    throw new Error(`${label} darf nicht leer sein.`);
  }

  if (isUncPath(pathValue)) {
    throw new Error(`${label} darf kein UNC-/Netzwerkpfad sein.`);
  }

  return pathValue;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const appRoot = resolveLocalPath(env.APP_ROOT ?? defaultAppRoot, "APP_ROOT");
  const dataDir = resolveLocalPath(env.DATA_DIR ?? `${appRoot}\\data`, "DATA_DIR");
  const uploadsDir = resolveLocalPath(env.UPLOADS_DIR ?? `${appRoot}\\storage`, "UPLOADS_DIR");
  const logsDir = resolveLocalPath(env.LOGS_DIR ?? `${appRoot}\\logs`, "LOGS_DIR");
  const backupDir = resolveLocalPath(env.BACKUP_DIR ?? defaultBackupDir, "BACKUP_DIR");
  const databaseUrl = env.DATABASE_URL ?? "file:./dev.db";
  const databaseFilePath = resolveDatabaseFilePath(databaseUrl);
  const frontendDistDir = resolve(backendRoot, "../frontend/dist");
  const frontendIndexPath = resolve(frontendDistDir, "index.html");
  const port = Number(env.PORT ?? "3000");

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT muss eine gültige TCP-Portnummer sein.");
  }

  return {
    appRoot,
    backupDir,
    dataDir,
    uploadsDir,
    logsDir,
    databaseUrl,
    databaseFilePath,
    frontendDistDir,
    frontendIndexPath,
    host: env.HOST ?? "0.0.0.0",
    port,
    jwtSecret:
      env.JWT_SECRET && env.JWT_SECRET.trim().length > 0
        ? env.JWT_SECRET
        : "development-only-secret",
  };
}
