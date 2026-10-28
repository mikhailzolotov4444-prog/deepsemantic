import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const contactMessages = pgTable("contact_messages", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  topic: text("topic").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  // Set by the admin inbox (Phase 2) when the owner has dealt with the message.
  handledAt: timestamp("handled_at", { withTimezone: true }),
});
