import type { Metadata } from "next";
import { getDictionary } from "@/shared/i18n/dictionaries";
import { localizedAlternates } from "@/shared/i18n/metadata";
import { resolveLocale, type LocaleParams } from "@/shared/i18n/params";
import { LegalPage } from "@/shared/ui/legal-page";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { privacy } = getDictionary(locale);
  return {
    title: privacy.metaTitle,
    description: privacy.metaDescription,
    alternates: localizedAlternates(locale, "/privacy"),
  };
}

export default async function PrivacyPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  const { privacy } = getDictionary(locale);

  return (
    <LegalPage
      title={privacy.h1}
      draftLabel={privacy.draftLabel}
      draftText={privacy.draftText}
      sections={privacy.sections}
    />
  );
}
