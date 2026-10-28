# ADR-0003: Two languages (RU + EN) without an i18n library

Status: accepted (Phase 1)

## Context

The site must be Russian and English. The pages are few and the texts are static.

## Decision

- Addresses carry the language: `/ru/...`, `/en/...`. `src/proxy.ts` sends an address without a
  language to the browser's preferred one (Russian by default).
- Texts live in typed dictionaries (`src/shared/i18n/dictionaries`). `en.ts` defines the shape,
  `ru.ts` must match it, so a missing translation is a compile error.
- Domain code never contains user-facing text; it returns error codes that the UI translates.
- `hreflang` links and a bilingual sitemap tell search engines about both versions.

## Consequences

- No new dependency. Adding a third language = one new dictionary file + one entry in `locales`.
- If texts later move into the admin area (Phase 4), the dictionaries can be replaced by a
  database-backed reader behind the same `Dictionary` shape.
