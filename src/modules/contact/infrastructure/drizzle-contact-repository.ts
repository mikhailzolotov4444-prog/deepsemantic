import type { ContactMessage } from "@/modules/contact/domain/contact-message";
import type { ContactRepository } from "@/modules/contact/domain/contact-ports";
import type { Database } from "@/shared/db/client";
import { contactMessages } from "./schema";

export class DrizzleContactRepository implements ContactRepository {
  constructor(private readonly db: Database) {}

  async save(message: ContactMessage): Promise<void> {
    await this.db
      .insert(contactMessages)
      .values({
        id: message.id,
        name: message.name,
        email: message.email,
        topic: message.topic,
        message: message.message,
        createdAt: message.createdAt,
      })
      .onConflictDoNothing();
  }
}
