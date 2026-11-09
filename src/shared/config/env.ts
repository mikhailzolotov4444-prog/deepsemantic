import { z } from "zod";

/** Treats an empty value (`NAME=` in a .env file) the same as a missing one. */
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema.optional());

const flag = z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true");

/**
 * All environment variables the app understands, validated once.
 * Add new variables here AND in .env.example. Secrets are never exposed to the browser:
 * only names starting with NEXT_PUBLIC_ are.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  NEXT_PUBLIC_SITE_URL: z
    .url()
    .default("https://www.deepsemantic.ru")
    .transform((value) => value.replace(/\/+$/, "")),

  // Strings because env vars always are; converted to a real boolean here.
  NEXT_PUBLIC_ALLOW_INDEXING: flag,

  // Optional so the site can be built and deployed before a database exists (Phase 0).
  DATABASE_URL: z
    .string()
    .regex(/^postgres(ql)?:\/\//, "must start with postgres:// or postgresql://")
    .optional(),

  // Contact form (Phase 1). It goes live only when ALL of these are set:
  // Resend (email) + Turnstile (spam protection).
  CONTACT_TO_EMAIL: optional(z.email()),
  CONTACT_FROM_EMAIL: optional(z.string().min(3)),
  RESEND_API_KEY: optional(z.string().min(1)),
  TURNSTILE_SECRET_KEY: optional(z.string().min(1)),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: optional(z.string().min(1)),

  // "true" makes the form work without those services: emails are printed to the server
  // console and there is no spam check. For local work and automated tests only.
  CONTACT_DEV_MODE: flag,

  // Admin area and documents (Phase 2).
  // The one person allowed into /admin; falls back to CONTACT_TO_EMAIL.
  ADMIN_EMAIL: optional(z.email()),
  // Signs login links, admin sessions and download links. At least 32 random characters.
  AUTH_SECRET: optional(z.string().min(32, "must be at least 32 characters")),
  // Created by Vercel when a Blob store is connected to the project.
  BLOB_READ_WRITE_TOKEN: optional(z.string().min(1)),
});

export type Env = z.infer<typeof envSchema>;

/** Pure and testable: validates any key/value source. */
export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${problems}`);
  }
  return result.data;
}

let cached: Env | undefined;

export function getEnv(): Env {
  cached ??= parseEnv(process.env);
  return cached;
}

/** For code paths that cannot work without a database (migrations, repositories). */
export function requireDatabaseUrl(env: Env = getEnv()): string {
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
  }
  return env.DATABASE_URL;
}
