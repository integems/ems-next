import { z } from "zod";

// Define the schema for your environment variables
const envSchema = z.object({
  // Database
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
  POSTGRES_HOST: z.string(),
  POSTGRES_PORT: z.string().transform(Number),

  // Email (SMTP)
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string().transform(Number),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  SMTP_FROM: z.email(),

  // JWT
  JWT_SECRET: z.string(),
  SIGNIN_REDIRECT_URL: z.url(),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CALLBACK_URL: z.string(),
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string(),
});

// Parse and validate environment
const env = envSchema.parse(process.env);

// dotenv.config();

type EnvKey = keyof typeof env;

export const config = {
  getEnv(key: EnvKey): string | number {
    return env[key];
  },
};
