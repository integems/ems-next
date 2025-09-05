import type { Config } from "drizzle-kit";

import { config } from "@/config/config";
export default {
  schema: "./src/database/drizzle/schema.ts",
  out: "./src/database/drizzle",
  casing: "camelCase",
  dialect: "postgresql",
  dbCredentials: {
    port: config.getEnv("POSTGRES_PORT") as number,
    password: config.getEnv("POSTGRES_PASSWORD") as string,
    host: config.getEnv("POSTGRES_HOST") as string,
    database: config.getEnv("POSTGRES_DB") as string,
    user: config.getEnv("POSTGRES_USER") as string,
    ssl: false,
  },
} satisfies Config;
