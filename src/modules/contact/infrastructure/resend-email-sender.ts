import type { EmailSender, OutgoingEmail } from "@/modules/contact/domain/contact-ports";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/** Talks to Resend's HTTP API directly: one fewer dependency than their SDK. */
export class ResendEmailSender implements EmailSender {
  constructor(
    private readonly apiKey: string,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async send(email: OutgoingEmail): Promise<void> {
    const doFetch = this.fetchImpl;
    const response = await doFetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: email.from,
        to: [email.to],
        subject: email.subject,
        text: email.text,
        ...(email.replyTo ? { reply_to: email.replyTo } : {}),
      }),
    });

    if (!response.ok) {
      throw new Error(`Resend responded with HTTP ${response.status}`);
    }
  }
}
