import type { ContactMessage } from "@/modules/contact/domain/contact-message";
import type { ContactRepository } from "@/modules/contact/domain/contact-ports";

/** Test double that behaves like the real repository (same contract tests). */
export class InMemoryContactRepository implements ContactRepository {
  private readonly items = new Map<string, ContactMessage>();

  async save(message: ContactMessage): Promise<void> {
    if (!this.items.has(message.id)) this.items.set(message.id, message);
  }

  get(id: string): ContactMessage | undefined {
    return this.items.get(id);
  }

  count(): number {
    return this.items.size;
  }
}
