import type { ContactRepository } from "@/modules/contact/domain/contact-ports";

/**
 * Stores nothing. Used when no database is configured, so the contact form can run in
 * "email only" mode: the owner gets the email and the site keeps no copy of visitors' data.
 */
export class NullContactRepository implements ContactRepository {
  async save(): Promise<void> {}
}
