import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const documents = pgTable(
  "documents",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    level: text("level").notNull(),
    topics: text("topics").array().notNull().default([]),
    type: text("type").notNull(),
    access: text("access").notNull(),
    status: text("status").notNull(),
    fileRef: text("file_ref"),
    fileName: text("file_name"),
    fileMime: text("file_mime"),
    fileSize: integer("file_size"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    downloadCount: integer("download_count").notNull().default(0),
  },
  (table) => [index("documents_status_idx").on(table.status)],
);

/** People who left an address to get an email-gated document. */
export const documentLeads = pgTable("document_leads", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  documentId: text("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});
