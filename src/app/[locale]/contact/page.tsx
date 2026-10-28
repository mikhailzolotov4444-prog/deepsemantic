import type { Metadata } from "next";
import { getContainer } from "@/composition-root/container";
import { isContactTopic, type ContactTopic } from "@/modules/contact/domain/contact-message";
import { ContactForm } from "@/modules/contact/ui/contact-form";
import { getDictionary } from "@/shared/i18n/dictionaries";
import { localizedAlternates } from "@/shared/i18n/metadata";
import { resolveLocale, type LocaleParams } from "@/shared/i18n/params";
import { Container } from "@/shared/ui/container";
import { submitContactAction } from "./actions";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  return {
    title: dict.contact.h1,
    description: dict.contact.metaDescription,
    alternates: localizedAlternates(locale, "/contact"),
  };
}

export default async function ContactPage({
  params,
  searchParams,
}: LocaleParams & { searchParams: Promise<{ topic?: string | string[] }> }) {
  const locale = await resolveLocale(params);
  const { contact } = getDictionary(locale);
  const { topic } = await searchParams;
  const initialTopic: ContactTopic =
    typeof topic === "string" && isContactTopic(topic) ? topic : "lessons";
  const { contactChannel } = getContainer();

  return (
    <Container className="max-w-2xl py-12 sm:py-16">
      <h1 className="text-4xl font-semibold tracking-tight">{contact.h1}</h1>
      <p className="mt-3 text-muted-foreground">{contact.intro}</p>

      <div className="mt-8">
        {contactChannel.available ? (
          <ContactForm
            locale={locale}
            dict={contact}
            action={submitContactAction}
            initialTopic={initialTopic}
            turnstileSiteKey={contactChannel.turnstileSiteKey}
          />
        ) : (
          <p role="status" className="rounded-lg border border-border bg-card p-5">
            {contact.unavailable}
          </p>
        )}
      </div>
    </Container>
  );
}
