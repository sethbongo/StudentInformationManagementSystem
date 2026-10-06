import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters long"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_BASE_URL: z.string().default("http://localhost:3000"),
});

export type EnvConfig = z.infer<typeof envSchema>;

let parsedEnv: EnvConfig;

try {
  parsedEnv = envSchema.parse(process.env);
} catch (error) {
  if (process.env.NODE_ENV !== "test") {
    console.error("❌ Invalid environment variables:", error);
  }
  // Fallback defaults for test environments
  parsedEnv = {
    DATABASE_URL: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/sims_db?schema=public",
    JWT_SECRET: process.env.JWT_SECRET || "sims-super-secret-jwt-signing-key-32-chars-minimum-key",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
    PORT: 3000,
    NODE_ENV: (process.env.NODE_ENV as "development" | "test" | "production") || "test",
    API_BASE_URL: process.env.API_BASE_URL || "http://localhost:3000",
  };
}

export const env = parsedEnv;
