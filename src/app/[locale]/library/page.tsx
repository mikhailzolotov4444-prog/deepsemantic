import type { Metadata } from "next";
import Link from "next/link";
import { getContainer } from "@/composition-root/container";
import { parseLibraryQuery, type LibraryQuery } from "@/modules/documents/domain/library-query";
import { CEFR_LEVELS, DOCUMENT_TYPES } from "@/modules/documents/domain/teaching-document";
import { localizedPath } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/dictionaries";
import { localizedAlternates } from "@/shared/i18n/metadata";
import { resolveLocale, type LocaleParams } from "@/shared/i18n/params";
import { totalPages } from "@/shared/kernel";
import { Button, buttonVariants } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";
import { RotatingLabel } from "@/shared/ui/rotating-label";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { library } = getDictionary(locale);
  return {
    title: library.h1,
    description: library.metaDescription,
    alternates: localizedAlternates(locale, "/library"),
  };
}

const controlClass =
  "field w-full rounded-md border border-muted-foreground/60 bg-background px-3 py-2 text-sm " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const badgeClass =
  "badge-glass rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground";

function pageHref(base: string, query: LibraryQuery, page: number): string {
  const params = new URLSearchParams();
  if (query.text) params.set("q", query.text);
  if (query.level) params.set("level", query.level);
  if (query.type) params.set("type", query.type);
  if (query.topic) params.set("topic", query.topic);
  if (page > 1) params.set("page", String(page));
  const search = params.toString();
  return search ? `${base}?${search}` : base;
}

export default async function LibraryPage({
  params,
  searchParams,
}: LocaleParams & {
  searchParams: Promise<{
    q?: string;
    level?: string;
    type?: string;
    topic?: string;
    page?: string;
  }>;
}) {
  const locale = await resolveLocale(params);
  const { library: dict } = getDictionary(locale);
  const query = parseLibraryQuery(await searchParams);
  const { documents, topics } = await getContainer().documents.searchLibrary.execute(query);

  const base = localizedPath(locale, "/library");
  const pages = totalPages(documents);
  const filtered = Boolean(query.text ?? query.level ?? query.type ?? query.topic);

  return (
    <Container className="py-12 sm:py-16">
      <h1 className="metal font-display text-4xl font-bold uppercase tracking-[0.05em] text-balance sm:text-5xl">
        {dict.h1}
      </h1>
      <p className="mt-3 text-muted-foreground">{dict.intro}</p>

      <form
        method="get"
        action={base}
        role="search"
        aria-label={dict.filters.label}
        className="slate-card mt-8 grid gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-4"
      >
        <div className="sm:col-span-2 lg:col-span-4">
          <label htmlFor="library-q" className="mb-1 block text-sm font-medium">
            {dict.filters.search}
          </label>
          <input
            id="library-q"
            name="q"
            type="search"
            defaultValue={query.text ?? ""}
            placeholder={dict.filters.searchPlaceholder}
            className={controlClass}
          />
        </div>
        <div>
          <label htmlFor="library-level" className="mb-1 block text-sm font-medium">
            {dict.filters.level}
          </label>
          <select
            id="library-level"
            name="level"
            defaultValue={query.level ?? ""}
            className={controlClass}
          >
            <option value="">{dict.filters.any}</option>
            {CEFR_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="library-type" className="mb-1 block text-sm font-medium">
            {dict.filters.type}
          </label>
          <select
            id="library-type"
            name="type"
            defaultValue={query.type ?? ""}
            className={controlClass}
          >
            <option value="">{dict.filters.any}</option>
            {DOCUMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {dict.types[type]}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="library-topic" className="mb-1 block text-sm font-medium">
            {dict.filters.topic}
          </label>
          <select
            id="library-topic"
            name="topic"
            defaultValue={query.topic ?? ""}
            className={controlClass}
          >
            <option value="">{dict.filters.any}</option>
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 sm:col-span-2 lg:col-span-4">
          <Button type="submit">
            <RotatingLabel>{dict.filters.apply}</RotatingLabel>
          </Button>
          {filtered ? (
            <Link href={base} className={buttonVariants({ variant: "ghost" })}>
              {dict.filters.reset}
            </Link>
          ) : null}
        </div>
      </form>

      {documents.total === 0 ? (
        <p role="status" className="mt-8 text-muted-foreground">
          {filtered ? dict.empty : dict.emptyLibrary}
        </p>
      ) : (
        <>
          <p className="mt-8 text-sm text-muted-foreground">
            {dict.resultsLabel} {documents.total}
          </p>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {documents.items.map((document) => (
              <li key={document.id}>
                <article className="slate-card slate-card--link flex h-full flex-col rounded-lg border border-border bg-card p-6">
                  <h2 className="text-xl font-semibold tracking-tight">
                    <Link
                      href={localizedPath(locale, `/library/${document.slug}`)}
                      className="underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      {document.title}
                    </Link>
                  </h2>
                  <p className="mt-2 flex flex-wrap gap-2">
                    <span className={badgeClass}>{document.level}</span>
                    <span className={badgeClass}>{dict.types[document.type]}</span>
                    <span className={badgeClass}>{dict.access[document.access]}</span>
                  </p>
                  {document.description ? (
                    <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                      {document.description}
                    </p>
                  ) : null}
                </article>
              </li>
            ))}
          </ul>

          {pages > 1 ? (
            <nav aria-label={dict.pagination.label} className="mt-8 flex items-center gap-4">
              {query.page > 1 ? (
                <Link
                  href={pageHref(base, query, query.page - 1)}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  {dict.pagination.previous}
                </Link>
              ) : null}
              <span className="text-sm text-muted-foreground">
                {dict.pagination.page} {documents.page} {dict.pagination.of} {pages}
              </span>
              {query.page < pages ? (
                <Link
                  href={pageHref(base, query, query.page + 1)}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  {dict.pagination.next}
                </Link>
              ) : null}
            </nav>
          ) : null}
        </>
      )}
    </Container>
  );
}
