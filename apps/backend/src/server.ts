import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";

import { buildApp } from "./app.js";

loadEnv({
  path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env"),
});

const { app, config } = await buildApp();

try {
  await app.listen({
    host: config.host,
    port: config.port,
  });
} catch (error) {
  app.log.error(error);
  process.exitCode = 1;
}
