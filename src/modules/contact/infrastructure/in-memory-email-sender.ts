import type { EmailSender, OutgoingEmail } from "@/modules/contact/domain/contact-ports";

/** Test double: remembers what would have been sent, and can be told to fail. */
export class InMemoryEmailSender implements EmailSender {
  readonly sent: OutgoingEmail[] = [];

  constructor(private readonly failWith?: Error) {}

  async send(email: OutgoingEmail): Promise<void> {
    if (this.failWith) throw this.failWith;
    this.sent.push(email);
  }
}
