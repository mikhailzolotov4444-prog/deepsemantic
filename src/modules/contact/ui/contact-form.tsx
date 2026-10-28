"use client";

import Link from "next/link";
import Script from "next/script";
import { useActionState, useEffect } from "react";
import {
  CONTACT_LIMITS,
  CONTACT_TOPICS,
  type ContactTopic,
} from "@/modules/contact/domain/contact-message";
import type { Dictionary } from "@/shared/i18n/dictionaries";
import { localizedPath, type Locale } from "@/shared/i18n/config";
import { Button } from "@/shared/ui/button";
import { initialContactFormState, type ContactFormState } from "./contact-form-state";

type ContactAction = (state: ContactFormState, formData: FormData) => Promise<ContactFormState>;

interface ContactFormProps {
  readonly locale: Locale;
  readonly dict: Dictionary["contact"];
  readonly action: ContactAction;
  readonly initialTopic: ContactTopic;
  readonly turnstileSiteKey?: string;
}

interface TurnstileWindow {
  turnstile?: { reset: () => void };
}

const controlClass =
  "w-full rounded-md border border-muted-foreground/60 bg-background px-3 py-2 text-sm " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring " +
  "aria-[invalid=true]:border-destructive";

function FieldError({ id, message }: { id: string; message: string | undefined }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-sm text-destructive">
      {message}
    </p>
  );
}

export function ContactForm({
  locale,
  dict,
  action,
  initialTopic,
  turnstileSiteKey,
}: ContactFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialContactFormState(initialTopic),
  );

  // A Turnstile token works once, so a new one is needed after every failed attempt.
  useEffect(() => {
    if (state.status === "error") {
      (window as unknown as TurnstileWindow).turnstile?.reset();
    }
  }, [state]);

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-xl font-semibold">{dict.form.thanksTitle}</h2>
        <p className="mt-2 text-muted-foreground">{dict.form.thanksText}</p>
      </div>
    );
  }

  const { fieldErrors, values } = state;

  return (
    <form action={formAction} noValidate className="space-y-5">
      <div>
        <label htmlFor="contact-name" className="mb-1 block text-sm font-medium">
          {dict.form.name}
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          maxLength={CONTACT_LIMITS.nameMax}
          defaultValue={values.name}
          aria-invalid={fieldErrors.name ? true : undefined}
          aria-describedby={fieldErrors.name ? "contact-name-error" : undefined}
          className={controlClass}
        />
        <FieldError
          id="contact-name-error"
          message={fieldErrors.name ? dict.fieldErrors[fieldErrors.name] : undefined}
        />
      </div>

      <div>
        <label htmlFor="contact-email" className="mb-1 block text-sm font-medium">
          {dict.form.email}
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={CONTACT_LIMITS.emailMax}
          defaultValue={values.email}
          aria-invalid={fieldErrors.email ? true : undefined}
          aria-describedby={fieldErrors.email ? "contact-email-error" : undefined}
          className={controlClass}
        />
        <FieldError
          id="contact-email-error"
          message={fieldErrors.email ? dict.fieldErrors[fieldErrors.email] : undefined}
        />
      </div>

      <div>
        <label htmlFor="contact-topic" className="mb-1 block text-sm font-medium">
          {dict.form.topic}
        </label>
        <select
          id="contact-topic"
          name="topic"
          required
          defaultValue={values.topic}
          aria-invalid={fieldErrors.topic ? true : undefined}
          aria-describedby={fieldErrors.topic ? "contact-topic-error" : undefined}
          className={controlClass}
        >
          {CONTACT_TOPICS.map((topic) => (
            <option key={topic} value={topic}>
              {dict.topics[topic]}
            </option>
          ))}
        </select>
        <FieldError
          id="contact-topic-error"
          message={fieldErrors.topic ? dict.fieldErrors[fieldErrors.topic] : undefined}
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-1 block text-sm font-medium">
          {dict.form.message}
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          required
          maxLength={CONTACT_LIMITS.messageMax}
          defaultValue={values.message}
          aria-invalid={fieldErrors.message ? true : undefined}
          aria-describedby={fieldErrors.message ? "contact-message-error" : undefined}
          className={controlClass}
        />
        <FieldError
          id="contact-message-error"
          message={fieldErrors.message ? dict.fieldErrors[fieldErrors.message] : undefined}
        />
      </div>

      {/* Honeypot: invisible to people, tempting to bots. Real visitors leave it empty. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-10000px" }}>
        <label htmlFor="contact-website">{dict.form.honeypot}</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {turnstileSiteKey ? (
        <>
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            strategy="afterInteractive"
          />
          <div className="cf-turnstile" data-sitekey={turnstileSiteKey} />
        </>
      ) : null}

      <div role="status" aria-live="polite">
        {state.status === "error" && state.notice ? (
          <p className="rounded-md border border-destructive/40 p-3 text-sm text-destructive">
            {dict.notices[state.notice]}
          </p>
        ) : null}
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? dict.form.sending : dict.form.send}
      </Button>

      <p className="text-sm text-muted-foreground">
        {dict.form.privacyBefore}{" "}
        <Link href={localizedPath(locale, "/privacy")} className="underline underline-offset-2">
          {dict.form.privacyLink}
        </Link>
        {dict.form.privacyAfter}
      </p>
    </form>
  );
}
