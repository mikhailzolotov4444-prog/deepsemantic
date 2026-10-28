import { err, ok, ValidationError, type Result } from "@/shared/kernel";

export const CONTACT_TOPICS = ["lessons", "materials", "other"] as const;
export type ContactTopic = (typeof CONTACT_TOPICS)[number];

export const CONTACT_LIMITS = {
  nameMax: 100,
  emailMax: 254,
  messageMin: 10,
  messageMax: 5000,
} as const;

export type ContactField = "name" | "email" | "topic" | "message";

/** Stable codes instead of sentences: the user interface translates them into the visitor's language. */
export type ContactFieldError =
  | "name_required"
  | "name_too_long"
  | "email_invalid"
  | "topic_invalid"
  | "message_too_short"
  | "message_too_long";

/** What a visitor typed: untrusted text, not yet validated. */
export interface ContactDraft {
  readonly name: string;
  readonly email: string;
  readonly topic: string;
  readonly message: string;
}

export interface ContactMessage {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly topic: ContactTopic;
  readonly message: string;
  readonly createdAt: Date;
}

/** Carries one error code per invalid field. */
export class ContactValidationError extends ValidationError {
  constructor(readonly fields: Partial<Record<ContactField, ContactFieldError>>) {
    super(
      "Some fields are invalid",
      Object.entries(fields).map(([field, problem]) => `${field}: ${problem}`),
    );
  }
}

export function isContactTopic(value: string): value is ContactTopic {
  return CONTACT_TOPICS.some((topic) => topic === value);
}

// Deliberately simple: the real proof that an address works is that the reply arrives.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Business rules for a contact message. Pure: id and time are passed in. */
export function createContactMessage(
  draft: ContactDraft,
  meta: { readonly id: string; readonly now: Date },
): Result<ContactMessage, ContactValidationError> {
  const fields: Partial<Record<ContactField, ContactFieldError>> = {};

  // Control characters (including line breaks) are removed so the name is safe in an email subject.
  const name = draft.name
    .replace(/\p{Cc}/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  const email = draft.email.trim();
  const message = draft.message.trim();
  const topic = CONTACT_TOPICS.find((candidate) => candidate === draft.topic.trim());

  if (name.length === 0) {
    fields.name = "name_required";
  } else if (name.length > CONTACT_LIMITS.nameMax) {
    fields.name = "name_too_long";
  }

  if (!EMAIL_PATTERN.test(email) || email.length > CONTACT_LIMITS.emailMax) {
    fields.email = "email_invalid";
  }

  if (topic === undefined) {
    fields.topic = "topic_invalid";
  }

  if (message.length < CONTACT_LIMITS.messageMin) {
    fields.message = "message_too_short";
  } else if (message.length > CONTACT_LIMITS.messageMax) {
    fields.message = "message_too_long";
  }

  if (topic === undefined || Object.keys(fields).length > 0) {
    return err(new ContactValidationError(fields));
  }

  return ok({ id: meta.id, name, email, topic, message, createdAt: meta.now });
}
