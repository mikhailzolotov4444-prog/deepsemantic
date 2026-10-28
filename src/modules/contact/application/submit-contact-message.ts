import { DeliveryFailedError, SpamRejectedError } from "@/modules/contact/domain/contact-errors";
import {
  createContactMessage,
  type ContactDraft,
  type ContactMessage,
  type ContactValidationError,
} from "@/modules/contact/domain/contact-message";
import type {
  ContactRepository,
  EmailSender,
  OutgoingEmail,
  SpamVerifier,
} from "@/modules/contact/domain/contact-ports";
import { err, ok, type Clock, type IdGenerator, type Result } from "@/shared/kernel";

export interface SubmitContactInput extends ContactDraft {
  /** Honeypot: a field real visitors never see. Bots fill it in. */
  readonly website: string;
  readonly turnstileToken?: string;
  readonly ip?: string;
}

export interface SubmitContactConfig {
  readonly ownerEmail: string;
  readonly fromEmail: string;
  readonly siteName: string;
}

export type SubmitContactError = ContactValidationError | SpamRejectedError | DeliveryFailedError;

export class SubmitContactMessage {
  constructor(
    private readonly repository: ContactRepository,
    private readonly emailSender: EmailSender,
    private readonly spamVerifier: SpamVerifier,
    private readonly clock: Clock,
    private readonly ids: IdGenerator,
    private readonly config: SubmitContactConfig,
  ) {}

  async execute(input: SubmitContactInput): Promise<Result<void, SubmitContactError>> {
    // Pretend success so bots get no signal that they were caught.
    if (input.website.trim() !== "") return ok(undefined);

    // Validate before the anti-spam check: a mistyped form must not use up the one-time token.
    const created = createContactMessage(input, { id: this.ids.next(), now: this.clock.now() });
    if (!created.ok) return created;

    const isHuman = await this.spamVerifier.verify({ token: input.turnstileToken, ip: input.ip });
    if (!isHuman) return err(new SpamRejectedError());

    await this.repository.save(created.value);

    try {
      await this.emailSender.send(buildNotification(created.value, this.config));
    } catch (cause) {
      return err(new DeliveryFailedError({ cause }));
    }

    return ok(undefined);
  }
}

function buildNotification(message: ContactMessage, config: SubmitContactConfig): OutgoingEmail {
  return {
    from: config.fromEmail,
    to: config.ownerEmail,
    replyTo: message.email,
    subject: `[${config.siteName}] New message from ${message.name}`,
    text: [
      `Name: ${message.name}`,
      `Email: ${message.email}`,
      `Topic: ${message.topic}`,
      "",
      message.message,
    ].join("\n"),
  };
}
