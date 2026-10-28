import { Container } from "./container";

export interface LegalSection {
  readonly id: string;
  readonly title: string;
  readonly paragraphs: readonly string[];
  readonly items: readonly string[];
}

interface LegalPageProps {
  readonly title: string;
  readonly draftLabel: string;
  readonly draftText: string;
  readonly sections: readonly LegalSection[];
}

/** Shared layout of the Privacy and Terms pages. */
export function LegalPage({ title, draftLabel, draftText, sections }: LegalPageProps) {
  return (
    <Container className="max-w-3xl py-12 sm:py-16">
      <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>

      <p role="note" className="mt-6 rounded-md bg-accent p-4 text-sm text-accent-foreground">
        <strong>{draftLabel}</strong> {draftText}
      </p>

      <div className="mt-8 space-y-8">
        {sections.map((section) => (
          <section key={section.id} aria-labelledby={`legal-${section.id}`}>
            <h2 id={`legal-${section.id}`} className="text-2xl font-semibold tracking-tight">
              {section.title}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-2">
                {paragraph}
              </p>
            ))}
            {section.items.length > 0 ? (
              <ul className="mt-2 list-disc space-y-2 pl-6">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    </Container>
  );
}
