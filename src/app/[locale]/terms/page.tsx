import type { Metadata } from "next";
import { getDictionary } from "@/shared/i18n/dictionaries";
import { localizedAlternates } from "@/shared/i18n/metadata";
import { resolveLocale, type LocaleParams } from "@/shared/i18n/params";
import { LegalPage } from "@/shared/ui/legal-page";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { terms } = getDictionary(locale);
  return {
    title: terms.metaTitle,
    description: terms.metaDescription,
    alternates: localizedAlternates(locale, "/terms"),
  };
}

export default async function TermsPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  const { terms } = getDictionary(locale);

  return (
    <LegalPage
      title={terms.h1}
      draftLabel={terms.draftLabel}
      draftText={terms.draftText}
      sections={terms.sections}
    />
  );
}
