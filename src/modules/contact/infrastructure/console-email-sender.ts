import type { EmailSender, OutgoingEmail } from "@/modules/contact/domain/contact-ports";

/** Development stand-in: prints the email to the server console instead of sending it. */
export class ConsoleEmailSender implements EmailSender {
  async send(email: OutgoingEmail): Promise<void> {
    console.info(`[contact:dev] email to ${email.to}\nSubject: ${email.subject}\n\n${email.text}`);
  }
}
