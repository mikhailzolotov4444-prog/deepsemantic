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
import { RotatingLabel } from "@/shared/ui/rotating-label";
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

      <div className="grid items-center gap-10 md:grid-cols-[minmax(0,340px)_1fr] md:gap-16">
        <div className="photo-frame mx-auto aspect-[4/5] w-full max-w-[340px] rounded-xl bg-muted">
          {profile.photo ? (
            <div className="niche">
              <Image
                src={profile.photo.src}
                alt={profile.photo.alt}
                width={profile.photo.width}
                height={profile.photo.height}
                priority
                className="size-full object-cover"
              />
            </div>
          ) : (
            <div aria-hidden="true" className="niche">
              <span className="m-auto text-5xl font-semibold text-accent-foreground">
                {initialsOf(profile.displayName)}
              </span>
            </div>
          )}
        </div>
        <div>
          <h1 className="metal font-display text-4xl font-bold uppercase tracking-[0.05em] text-balance sm:text-5xl">
            {dict.about.h1}
          </h1>
          <div className="plaque mt-6 w-fit max-w-full rounded-lg bg-accent px-6 py-4 text-accent-foreground">
            <p className="redgold font-display text-base font-bold uppercase leading-snug tracking-[0.05em] text-balance sm:text-xl">
              {profile.displayName}: {profile.headline}
            </p>
          </div>
          <div className="mt-6 max-w-prose space-y-4">
            {profile.bio.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>

      {profile.certifications.length > 0 ? (
        <section className="mt-12" aria-labelledby="certifications-heading">
          <h2
            id="certifications-heading"
            className="font-display text-2xl font-bold uppercase tracking-[0.06em] dark:text-[#f5e6c8]"
          >
            {dict.about.qualifications}
          </h2>
          <ul className="mt-4 space-y-3">
            {profile.certifications.map((certification) => (
              <li
                key={`${certification.name}-${certification.issuer}`}
                className="slate-card rounded-lg border border-border bg-card p-5"
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
          <h2
            id="experience-heading"
            className="font-display text-2xl font-bold uppercase tracking-[0.06em] dark:text-[#f5e6c8]"
          >
            {dict.about.experience}
          </h2>
          <ul className="mt-4 space-y-3">
            {profile.experience.map((item) => (
              <li
                key={`${item.role}-${item.place}`}
                className="slate-card rounded-lg border border-border bg-card p-5"
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
          <h2
            id="links-heading"
            className="font-display text-2xl font-bold uppercase tracking-[0.06em] dark:text-[#f5e6c8]"
          >
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

      <div className="slate-card mt-12 rounded-lg border border-border bg-accent p-8 text-center text-accent-foreground sm:p-10">
        <h2 className="font-display text-2xl font-bold uppercase tracking-[0.06em]">
          {dict.about.togetherHeading}
        </h2>
        <p className="mx-auto mt-2 max-w-prose">{dict.about.togetherText}</p>
        <Button asChild className="mt-5">
          <Link href={localizedPath(locale, "/contact")}>
            <RotatingLabel>{dict.about.togetherButton}</RotatingLabel>
          </Link>
        </Button>
      </div>
    </Container>
  );
}
