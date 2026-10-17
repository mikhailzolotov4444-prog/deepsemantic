import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type Database = ReturnType<typeof createDb>["db"];

/**
 * Creates a database connection. Infrastructure code only: use cases never see this,
 * they talk to ports (interfaces) that Drizzle repositories implement.
 */
export function createDb(databaseUrl: string) {
  // prepare: false keeps this compatible with pooled connections (Neon, Supabase pooler).
  const client = postgres(databaseUrl, { prepare: false });
  const db = drizzle(client, { schema });
  return { db, close: () => client.end() };
}
