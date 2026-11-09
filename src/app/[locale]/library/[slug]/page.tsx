import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getContainer } from "@/composition-root/container";
import { localizedPath } from "@/shared/i18n/config";
import { getDictionary, type Dictionary } from "@/shared/i18n/dictionaries";
import { localizedAlternates } from "@/shared/i18n/metadata";
import { resolveLocale } from "@/shared/i18n/params";
import { Button, buttonVariants } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";

interface DocumentPageProps {
  readonly params: Promise<{ locale: string; slug: string }>;
  readonly searchParams: Promise<{ error?: string }>;
}

export async function generateMetadata({ params }: DocumentPageProps): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const result = await getContainer().documents.getPublished.execute(slug);
  if (!result.ok) return {};
  return {
    title: result.value.title,
    ...(result.value.description ? { description: result.value.description } : {}),
    alternates: localizedAlternates(locale, `/library/${slug}`),
  };
}

const badgeClass = "rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground";

type ErrorKey = keyof Dictionary["library"]["detail"]["errors"];
const isErrorKey = (value: string | undefined, errors: Record<string, string>): value is ErrorKey =>
  value !== undefined && value in errors;

function formatSize(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function DocumentPage({ params, searchParams }: DocumentPageProps) {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const { error } = await searchParams;
  const { library: dict } = getDictionary(locale);

  const result = await getContainer().documents.getPublished.execute(slug);
  if (!result.ok) notFound();
  const document = result.value;
  const errorText = isErrorKey(error, dict.detail.errors) ? dict.detail.errors[error] : undefined;

  return (
    <Container className="max-w-3xl py-12 sm:py-16">
      <Link
        href={localizedPath(locale, "/library")}
        className="text-sm text-muted-foreground underline underline-offset-2"
      >
        ← {dict.detail.back}
      </Link>

      <h1 className="mt-4 text-4xl font-semibold tracking-tight">{document.title}</h1>
      <p className="mt-3 flex flex-wrap gap-2">
        <span className={badgeClass}>{document.level}</span>
        <span className={badgeClass}>{dict.types[document.type]}</span>
        <span className={badgeClass}>{dict.access[document.access]}</span>
      </p>

      {document.description ? (
        <p className="mt-6 whitespace-pre-line">{document.description}</p>
      ) : null}

      <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
        {document.topics.length > 0 ? (
          <>
            <dt className="text-muted-foreground">{dict.detail.topics}</dt>
            <dd>{document.topics.join(", ")}</dd>
          </>
        ) : null}
        {document.file ? (
          <>
            <dt className="text-muted-foreground">{dict.detail.file}</dt>
            <dd>
              {document.file.mime === "application/pdf" ? "PDF" : "DOCX"},{" "}
              {formatSize(document.file.size)}
            </dd>
          </>
        ) : null}
      </dl>

      <section
        aria-labelledby="download-heading"
        className="mt-10 rounded-lg border border-border bg-card p-6"
      >
        <h2 id="download-heading" className="text-xl font-semibold">
          {document.access === "paid" ? dict.detail.paidTitle : dict.detail.download}
        </h2>

        {errorText ? (
          <p
            role="alert"
            className="mt-3 rounded-md border border-destructive/40 p-3 text-sm text-destructive"
          >
            {errorText}
          </p>
        ) : null}

        {document.access === "paid" ? (
          <>
            <p className="mt-2 text-muted-foreground">{dict.detail.paidText}</p>
            <Link
              href={localizedPath(locale, "/contact?topic=materials")}
              className={`${buttonVariants()} mt-4`}
            >
              {dict.detail.paidCta}
            </Link>
          </>
        ) : (
          <form
            method="post"
            action={`/api/documents/${encodeURIComponent(document.slug)}/download`}
            className="mt-4 space-y-4"
          >
            <input type="hidden" name="locale" value={locale} />
            {document.access === "email" ? (
              <div>
                <label htmlFor="download-email" className="mb-1 block text-sm font-medium">
                  {dict.detail.emailLabel}
                </label>
                <input
                  id="download-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  aria-describedby="download-email-hint"
                  className="w-full rounded-md border border-muted-foreground/60 bg-background px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                />
                <p id="download-email-hint" className="mt-1 text-sm text-muted-foreground">
                  {dict.detail.emailHint}
                </p>
              </div>
            ) : null}
            <Button type="submit">
              {document.access === "email" ? dict.detail.emailButton : dict.detail.download}
            </Button>
            {document.access === "email" ? (
              <p className="text-sm text-muted-foreground">
                {dict.detail.privacyBefore}{" "}
                <Link
                  href={localizedPath(locale, "/privacy")}
                  className="underline underline-offset-2"
                >
                  {dict.detail.privacyLink}
                </Link>
                {dict.detail.privacyAfter}
              </p>
            ) : null}
          </form>
        )}
      </section>
    </Container>
  );
}
