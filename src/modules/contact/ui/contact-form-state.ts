import type {
  ContactField,
  ContactFieldError,
  ContactTopic,
} from "@/modules/contact/domain/contact-message";

export interface ContactFormValues {
  readonly name: string;
  readonly email: string;
  readonly topic: string;
  readonly message: string;
}

/** Which general message to show above the button. The text itself comes from the dictionary. */
export type ContactNotice = "validation" | "unavailable" | "spam" | "delivery" | "unknown";

export interface ContactFormState {
  readonly status: "idle" | "error" | "success";
  readonly notice?: ContactNotice;
  readonly fieldErrors: Partial<Record<ContactField, ContactFieldError>>;
  /** Echoed back so the visitor does not have to retype everything after a mistake. */
  readonly values: ContactFormValues;
}

export function initialContactFormState(topic: ContactTopic): ContactFormState {
  return {
    status: "idle",
    fieldErrors: {},
    values: { name: "", email: "", topic, message: "" },
  };
}
