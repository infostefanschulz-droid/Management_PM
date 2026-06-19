import { access, mkdir } from "node:fs/promises";
import fastifyJwt from "@fastify/jwt";
import fastifyStatic from "@fastify/static";
import Fastify from "fastify";

import { loadConfig } from "./config.js";
import { prisma } from "./prisma.js";

export async function buildApp() {
  const config = loadConfig();
  const app = Fastify({
    logger: true,
  });

  await Promise.all([
    mkdir(config.dataDir, { recursive: true }),
    mkdir(config.uploadsDir, { recursive: true }),
    mkdir(config.logsDir, { recursive: true }),
    mkdir(config.backupDir, { recursive: true }),
  ]);

  await app.register(fastifyJwt, {
    secret: config.jwtSecret,
  });

  let frontendAvailable = true;

  try {
    await access(config.frontendDistDir);
  } catch {
    frontendAvailable = false;
  }

  if (frontendAvailable) {
    await app.register(fastifyStatic, {
      root: config.frontendDistDir,
      prefix: "/",
      wildcard: false,
    });
  }

  app.get("/api/system/health", async () => {
    let database: "ok" | "error" = "ok";

    try {
      await prisma.$queryRawUnsafe("SELECT 1");
    } catch {
      database = "error";
    }

    const frontend: "available" | "missing" = frontendAvailable ? "available" : "missing";

    return {
      status: database === "ok" ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      database,
      frontend,
      storageDirectories: [
        config.dataDir,
        config.uploadsDir,
        config.logsDir,
        config.backupDir,
      ],
    };
  });

  app.get("/api/system/config", async () => ({
    appRoot: config.appRoot,
    dataDir: config.dataDir,
    uploadsDir: config.uploadsDir,
    logsDir: config.logsDir,
    backupDir: config.backupDir,
    databaseFilePath: config.databaseFilePath,
    frontendDistDir: config.frontendDistDir,
    servesFrontend: true,
    targetPlatform: "windows-server-2019",
    databaseEngine: "sqlite",
  }));

  app.setNotFoundHandler(async (request, reply) => {
    if (!request.url.startsWith("/api") && frontendAvailable) {
      return reply.sendFile("index.html");
    }

    return reply.code(404).send({ message: "Route not found" });
  });

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });

  return { app, config };
}
