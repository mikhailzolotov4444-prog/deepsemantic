"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { getContainer } from "@/composition-root/container";
import { DeliveryFailedError, SpamRejectedError } from "@/modules/contact/domain/contact-errors";
import { ContactValidationError } from "@/modules/contact/domain/contact-message";
import type { ContactFormState } from "@/modules/contact/ui/contact-form-state";

// Describes the raw form data. Anything unexpected (a file instead of text, a missing field)
// becomes an empty string, which the business rules then reject with a friendly message.
const formSchema = z.object({
  name: z.string().catch(""),
  email: z.string().catch(""),
  topic: z.string().catch(""),
  message: z.string().catch(""),
  website: z.string().catch(""),
  "cf-turnstile-response": z.string().catch(""),
});

export async function submitContactAction(
  _previous: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const raw = formSchema.parse(Object.fromEntries(formData));
  const values = { name: raw.name, email: raw.email, topic: raw.topic, message: raw.message };
  const { contactChannel, submitContactMessage } = getContainer();

  if (!contactChannel.available) {
    return {
      status: "error",
      notice: "unavailable",
      fieldErrors: {},
      values,
    };
  }

  const forwardedFor = (await headers()).get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || undefined;

  try {
    const result = await submitContactMessage.execute({
      ...values,
      website: raw.website,
      turnstileToken: raw["cf-turnstile-response"] || undefined,
      ip,
    });

    if (result.ok) {
      return {
        status: "success",
        fieldErrors: {},
        values: { name: "", email: "", topic: values.topic, message: "" },
      };
    }

    if (result.error instanceof ContactValidationError) {
      return {
        status: "error",
        notice: "validation",
        fieldErrors: result.error.fields,
        values,
      };
    }
    if (result.error instanceof SpamRejectedError) {
      return {
        status: "error",
        notice: "spam",
        fieldErrors: {},
        values,
      };
    }
    if (result.error instanceof DeliveryFailedError) {
      return {
        status: "error",
        notice: "delivery",
        fieldErrors: {},
        values,
      };
    }
  } catch (error) {
    // Unexpected fault (for example the database): log it for the owner, show a calm message.
    console.error("Contact form failed", error);
  }

  return {
    status: "error",
    notice: "unknown",
    fieldErrors: {},
    values,
  };
}
