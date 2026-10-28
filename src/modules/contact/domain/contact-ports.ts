import type { ContactMessage } from "./contact-message";

/** Write side: stores messages so the owner can read them later (the admin inbox, Phase 2). */
export interface ContactRepository {
  /** Saving a message with an id that already exists must not create a duplicate. */
  save(message: ContactMessage): Promise<void>;
}

export interface OutgoingEmail {
  readonly from: string;
  readonly to: string;
  readonly replyTo?: string;
  readonly subject: string;
  readonly text: string;
}

/** Rejects (throws) when the email could not be handed over for delivery. */
export interface EmailSender {
  send(email: OutgoingEmail): Promise<void>;
}

export interface SpamCheckInput {
  readonly token: string | undefined;
  readonly ip: string | undefined;
}

/** Answers "is this a real person?". Must fail closed: any doubt means false. */
export interface SpamVerifier {
  verify(input: SpamCheckInput): Promise<boolean>;
}
