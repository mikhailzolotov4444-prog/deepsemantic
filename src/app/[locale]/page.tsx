import type { Metadata } from "next";
import Link from "next/link";
import { getContainer } from "@/composition-root/container";
import { localizedPath } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/dictionaries";
import { localizedAlternates } from "@/shared/i18n/metadata";
import { resolveLocale, type LocaleParams } from "@/shared/i18n/params";
import { Button } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return { alternates: localizedAlternates(locale, "/") };
}

export default async function HomePage({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const { getProfile, listTestimonials } = getContainer();
  const [profile, testimonials] = await Promise.all([
    getProfile.execute(locale),
    listTestimonials.execute(),
  ]);

  return (
    <>
      <Container className="py-16 sm:py-24">
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          {dict.home.h1}
        </h1>
        <p className="mt-4 max-w-prose text-lg text-muted-foreground">{profile.headline}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link href={`${localizedPath(locale, "/contact")}?topic=lessons`}>
              {dict.home.ctaLesson}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={localizedPath(locale, "/about")}>{dict.home.ctaAbout}</Link>
          </Button>
        </div>
      </Container>

      <Container className="py-8">
        <h2 className="text-2xl font-semibold tracking-tight">{dict.home.offersHeading}</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {dict.home.offers.map((offer) => (
            <li key={offer.title} className="rounded-lg border border-border bg-card p-5">
              <h3 className="font-semibold">{offer.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{offer.text}</p>
            </li>
          ))}
        </ul>
      </Container>

      {testimonials.length > 0 ? (
        <Container className="py-8">
          <h2 className="text-2xl font-semibold tracking-tight">{dict.home.testimonialsHeading}</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {testimonials.map((testimonial) => (
              <li key={testimonial.id} className="rounded-lg border border-border bg-card p-5">
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
      ) : null}

      <Container className="py-8">
        <div className="rounded-lg bg-accent p-6 text-accent-foreground sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight">{dict.home.readyHeading}</h2>
          <p className="mt-2 max-w-prose">{dict.home.readyText}</p>
          <Button asChild className="mt-5">
            <Link href={localizedPath(locale, "/contact")}>{dict.home.readyButton}</Link>
          </Button>
        </div>
      </Container>
    </>
  );
}
