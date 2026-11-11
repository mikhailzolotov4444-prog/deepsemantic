import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getContainer } from "@/composition-root/container";
import { parseLibraryQuery } from "@/modules/documents/domain/library-query";
import { CEFR_LEVELS } from "@/modules/documents/domain/teaching-document";
import { localizedPath } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/dictionaries";
import { localizedAlternates } from "@/shared/i18n/metadata";
import { resolveLocale, type LocaleParams } from "@/shared/i18n/params";
import { Button } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";
import { RotatingLabel } from "@/shared/ui/rotating-label";
import { SectionDivider } from "@/shared/ui/section-divider";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return { alternates: localizedAlternates(locale, "/") };
}

const labelClass =
  "metal-thin font-mono text-sm font-medium uppercase tracking-[0.3em] text-primary sm:text-[17px]";

const tagClass =
  "badge-glass rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground";

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

/** Home page laid out like the approved "Noir Deco" mock-up: hero, library, about. */
export default async function HomePage({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const { getProfile, listTestimonials, documents } = getContainer();
  const [profile, testimonials, library] = await Promise.all([
    getProfile.execute(locale),
    listTestimonials.execute(),
    documents.searchLibrary.execute(parseLibraryQuery({})),
  ]);
  const latest = library.documents.items.slice(0, 3);
  const libraryHref = localizedPath(locale, "/library");
  const contactHref = localizedPath(locale, "/contact");

  return (
    <>
      {/* Hero */}
      <section className="noir-hero relative flex min-h-[520px] items-center justify-center overflow-hidden px-4 py-16 text-center sm:min-h-[620px] sm:py-24">
        <div className="sunburst" aria-hidden="true" />
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center">
          <h1 className="metal font-display text-[clamp(2rem,7vw,4.75rem)] font-bold uppercase leading-[1.08] tracking-[0.04em] text-balance [overflow-wrap:break-word]">
            {dict.home.h1}
          </h1>
          <p className="mt-4 max-w-xl font-accent text-xl tracking-[0.12em] text-muted-foreground text-pretty sm:text-[27px] sm:leading-snug dark:text-[#e8d48b]">
            {profile.headline}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4 sm:gap-6">
            <Button asChild>
              <Link href={libraryHref}>
                <RotatingLabel>{dict.home.libraryOpen}</RotatingLabel>
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`${contactHref}?topic=lessons`}>
                <RotatingLabel>{dict.home.ctaLesson}</RotatingLabel>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Library */}
      <section aria-labelledby="home-library" className="py-16 sm:py-24">
        <Container className="max-w-6xl">
          <div className="text-center">
            <p className={labelClass}>{dict.home.libraryLabel}</p>
            <h2
              id="home-library"
              className="mt-3 font-display text-3xl font-bold uppercase leading-tight tracking-[0.06em] text-balance sm:text-[42px] dark:text-[#f5e6c8]"
            >
              {dict.home.libraryHeading}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{dict.home.libraryText}</p>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
            <nav aria-label={dict.home.levelsLabel}>
              <ul className="flex flex-wrap justify-center gap-2">
                {CEFR_LEVELS.map((level) => (
                  <li key={level}>
                    <Link
                      href={`${libraryHref}?level=${level}`}
                      className="chip inline-flex min-h-11 min-w-[52px] items-center justify-center rounded-xl border border-border px-4 font-mono text-[13px] uppercase tracking-[0.15em] hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      <RotatingLabel>{level}</RotatingLabel>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <form
              method="get"
              action={libraryHref}
              role="search"
              aria-label={dict.home.searchLabel}
              className="flex w-full max-w-sm gap-2"
            >
              <label htmlFor="home-search" className="sr-only">
                {dict.home.searchLabel}
              </label>
              <input
                id="home-search"
                name="q"
                type="search"
                placeholder={dict.home.searchLabel}
                className="field min-h-11 w-full rounded-xl border border-muted-foreground/60 bg-background px-4 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              />
              <Button type="submit" variant="outline" size="sm" className="min-h-11">
                <RotatingLabel>{dict.home.searchButton}</RotatingLabel>
              </Button>
            </form>
          </div>

          <ul className="mt-12 grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
            {latest.length > 0
              ? latest.map((document) => (
                  <li key={document.id}>
                    <Link
                      href={localizedPath(locale, `/library/${document.slug}`)}
                      className="slate-card slate-card--link flex h-full flex-col items-center rounded-lg border border-border bg-card p-7 text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      <h3 className="text-lg font-semibold">{document.title}</h3>
                      {document.description ? (
                        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                          {document.description}
                        </p>
                      ) : null}
                      <p className="mt-auto flex flex-wrap justify-center gap-2 pt-4">
                        <span className={tagClass}>{document.level}</span>
                        <span className={tagClass}>{dict.library.types[document.type]}</span>
                        <span className={tagClass}>{dict.library.access[document.access]}</span>
                      </p>
                    </Link>
                  </li>
                ))
              : dict.home.offers.map((offer) => (
                  <li
                    key={offer.title}
                    className="slate-card rounded-lg border border-border bg-card p-7 text-center"
                  >
                    <h3 className="text-lg font-semibold">{offer.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {offer.text}
                    </p>
                  </li>
                ))}
          </ul>
        </Container>
      </section>

      <SectionDivider />

      {/* About */}
      <section aria-labelledby="home-about" className="py-16 sm:py-24">
        <Container className="grid max-w-6xl items-center gap-10 md:grid-cols-[minmax(0,340px)_1fr] md:gap-16">
          <div className="photo-frame mx-auto aspect-[4/5] w-full max-w-[340px] rounded-xl bg-muted">
            {profile.photo ? (
              <div className="niche">
                <Image
                  src={profile.photo.src}
                  alt={profile.photo.alt}
                  width={profile.photo.width}
                  height={profile.photo.height}
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
          <div className="flex flex-col items-start gap-5">
            <p className={labelClass}>{dict.home.aboutLabel}</p>
            <div className="plaque w-fit max-w-full rounded-lg bg-accent px-6 py-4 text-accent-foreground">
              <h2
                id="home-about"
                className="redgold font-display text-lg font-bold uppercase leading-tight tracking-[0.05em] text-balance sm:text-[21px]"
              >
                {profile.displayName}, {dict.about.jobTitle}
              </h2>
            </div>
            <Button asChild variant="outline">
              <Link href={contactHref}>
                <RotatingLabel>{dict.about.togetherButton}</RotatingLabel>
              </Link>
            </Button>
          </div>
        </Container>
      </section>

      {testimonials.length > 0 ? (
        <>
          <SectionDivider />
          <section aria-labelledby="home-testimonials" className="py-16 sm:py-24">
            <Container className="max-w-6xl">
              <h2
                id="home-testimonials"
                className="text-center font-display text-3xl font-bold uppercase tracking-[0.06em] dark:text-[#f5e6c8]"
              >
                {dict.home.testimonialsHeading}
              </h2>
              <ul className="mt-10 grid gap-6 sm:grid-cols-2 sm:gap-8">
                {testimonials.map((testimonial) => (
                  <li
                    key={testimonial.id}
                    className="slate-card rounded-lg border border-border bg-card p-7"
                  >
                    <blockquote>
                      <p>&ldquo;{testimonial.quote}&rdquo;</p>
                      <footer className="mt-3 text-sm text-muted-foreground">
                        {testimonial.authorName}
                        {testimonial.role ? `, ${testimonial.role}` : null}
                      </footer>
                    </blockquote>
                  </li>
                ))}
              </ul>
            </Container>
          </section>
        </>
      ) : null}
    </>
  );
}
