import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./drizzle/schema";
import { config } from "@/config/config";

const pool = new Pool({
  host: config.getEnv("POSTGRES_HOST") as string,
  port: config.getEnv("POSTGRES_PORT") as number,
  database: config.getEnv("POSTGRES_DB") as string,
  user: config.getEnv("POSTGRES_USER") as string,
  password: config.getEnv("POSTGRES_PASSWORD") as string,
});

export const db = drizzle(pool, { schema });
