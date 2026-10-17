import { defineConfig } from "drizzle-kit";

// drizzle-kit does not read .env files on its own. Node 22 can load them natively.
for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // File does not exist: fine, the variable may come from the real environment.
  }
}

export default defineConfig({
  schema: "./src/shared/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
