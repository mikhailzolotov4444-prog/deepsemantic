# ADR-0001: Technology stack and architecture

- Status: accepted
- Date: 2026-10-17
- Source: docs/PLAN.docx, sections 4 and 5

## Context

A single English teacher needs a personal website that looks like a normal site and behaves
like an app: public profile, documents library, products, a private admin area. The owner is not
a developer, the budget is about 0-20 EUR/month, and most code is written with an AI assistant,
so the stack must be popular, well documented and hard to misuse.

## Decision

| Concern           | Choice                                                                 |
| ----------------- | ---------------------------------------------------------------------- |
| Framework         | Next.js (App Router), React, TypeScript `strict`                       |
| UI                | Tailwind CSS v4 + shadcn/ui (Radix), design tokens                     |
| Database / ORM    | PostgreSQL (Neon or Supabase) + Drizzle ORM and drizzle-kit            |
| Validation        | Zod at every boundary, including environment variables                 |
| Tests             | Vitest (unit, contract, architecture), Playwright + axe (e2e)          |
| Tooling           | pnpm, ESLint, Prettier, Husky, lint-staged, commitlint, GitHub Actions |
| Hosting (planned) | Vercel with preview deployments (see ADR-0002)                         |

Later phases add Better Auth or Auth.js, Cloudflare R2, a payment provider, Resend, Cloudflare
Turnstile, Serwist (PWA) and Sentry. Each gets its own ADR when it is introduced.

Architecture: a **modular monolith** with four layers per feature module
(domain / application / infrastructure / ui). Dependencies point inward only. Use cases depend
on small interfaces (ports); concrete adapters are wired in `src/composition-root/` only.

The rule is enforced by ESLint (`no-restricted-imports`) and by an architecture test
(`tests/architecture/`), so it holds even when nobody is reading every line of generated code.

## Consequences

- Every external service can be replaced by writing a new adapter; use cases do not change.
- Slightly more files than a plain Next.js app. We accept this at module boundaries only and
  skip the ceremony for trivial features (KISS, YAGNI).
- System font stack instead of web fonts: no third-party font requests, faster first paint.
- Placeholder brand "Deep Semantic" and a neutral blue palette until the owner supplies a real
  brand (tokens live in `src/app/globals.css`, so re-branding is a one-file change).
- The site is `noindex` until `NEXT_PUBLIC_ALLOW_INDEXING=true`, so the empty placeholder does
  not end up in search results.
