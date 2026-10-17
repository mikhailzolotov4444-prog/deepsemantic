import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Phase 0 baseline: a tiny key/value table so the first migration has something real in it
 * and the pipeline (schema -> migration -> database) can be proven end to end.
 *
 * Feature tables (contact_messages, documents, products, orders, ...) are added by the module
 * that owns them, phase by phase. Re-export them from here so drizzle-kit sees one schema.
 */
export const appMeta = pgTable("app_meta", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
