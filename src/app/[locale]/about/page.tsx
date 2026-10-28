import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getContainer } from "@/composition-root/container";
import { getEnv } from "@/shared/config/env";
import { Button } from "@/shared/ui/button";
import { localizedPath } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/dictionaries";
import { localizedAlternates } from "@/shared/i18n/metadata";
import { resolveLocale, type LocaleParams } from "@/shared/i18n/params";
import { Container } from "@/shared/ui/container";
import { JsonLd } from "@/shared/ui/json-ld";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  return {
    title: dict.about.h1,
    description: dict.about.metaDescription,
    alternates: localizedAlternates(locale, "/about"),
  };
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default async function AboutPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const profile = await getContainer().getProfile.execute(locale);
  const siteUrl = getEnv().NEXT_PUBLIC_SITE_URL;

  return (
    <Container className="py-12 sm:py-16">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: profile.displayName,
          jobTitle: dict.about.jobTitle,
          url: `${siteUrl}${localizedPath(locale, "/about")}`,
          ...(profile.socialLinks.length > 0
            ? { sameAs: profile.socialLinks.map((link) => link.url) }
            : {}),
        }}
      />

      <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
        {profile.photo ? (
          <Image
            src={profile.photo.src}
            alt={profile.photo.alt}
            width={profile.photo.width}
            height={profile.photo.height}
            priority
            className="size-40 rounded-full object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex size-40 shrink-0 items-center justify-center rounded-full bg-accent text-4xl font-semibold text-accent-foreground"
          >
            {initialsOf(profile.displayName)}
          </div>
        )}
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">{dict.about.h1}</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {profile.displayName}: {profile.headline}
          </p>
          <div className="mt-6 max-w-prose space-y-4">
            {profile.bio.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>

      {profile.certifications.length > 0 ? (
        <section className="mt-12" aria-labelledby="certifications-heading">
          <h2 id="certifications-heading" className="text-2xl font-semibold tracking-tight">
            {dict.about.qualifications}
          </h2>
          <ul className="mt-4 space-y-3">
            {profile.certifications.map((certification) => (
              <li
                key={`${certification.name}-${certification.issuer}`}
                className="rounded-lg border border-border bg-card p-4"
              >
                <p className="font-medium">{certification.name}</p>
                <p className="text-sm text-muted-foreground">
                  {certification.issuer}
                  {certification.year ? `, ${certification.year}` : null}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {profile.experience.length > 0 ? (
        <section className="mt-12" aria-labelledby="experience-heading">
          <h2 id="experience-heading" className="text-2xl font-semibold tracking-tight">
            {dict.about.experience}
          </h2>
          <ul className="mt-4 space-y-3">
            {profile.experience.map((item) => (
              <li
                key={`${item.role}-${item.place}`}
                className="rounded-lg border border-border bg-card p-4"
              >
                <p className="font-medium">
                  {item.role}, {item.place}
                </p>
                <p className="text-sm text-muted-foreground">{item.period}</p>
                <p className="mt-2 text-sm">{item.summary}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {profile.socialLinks.length > 0 ? (
        <section className="mt-12" aria-labelledby="links-heading">
          <h2 id="links-heading" className="text-2xl font-semibold tracking-tight">
            {dict.about.links}
          </h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {profile.socialLinks.map((link) => (
              <li key={link.url}>
                <Button asChild variant="outline" size="sm">
                  <a href={link.url} rel="noopener noreferrer">
                    {link.label}
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-12 rounded-lg bg-accent p-6 text-accent-foreground sm:p-8">
        <h2 className="text-2xl font-semibold tracking-tight">{dict.about.togetherHeading}</h2>
        <p className="mt-2 max-w-prose">{dict.about.togetherText}</p>
        <Button asChild className="mt-5">
          <Link href={localizedPath(locale, "/contact")}>{dict.about.togetherButton}</Link>
        </Button>
      </div>
    </Container>
  );
}
