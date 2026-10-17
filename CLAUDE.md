# Project: Personal Teacher Website & Portfolio App

## Context

Website that behaves like an app for an English teacher: profile, documents library,
products, admin area. Source of truth: docs/PLAN.docx. Owner is not a developer:
explain decisions in plain English and keep the setup simple.

Production domain: https://www.deepsemantic.ru (placeholder brand: "Deep Semantic").
Current phase: see "Status" at the bottom of this file.

## Stack

Next.js (App Router), React, TypeScript strict, Tailwind, shadcn/ui, Drizzle + PostgreSQL,
Zod, Vitest, Playwright, pnpm.

## Architecture rules

- Modules in src/modules/<name> with domain / application / infrastructure / ui.
- Dependencies point inward. Domain and application NEVER import Next.js, Drizzle,
  Stripe, Resend or any other framework or SDK.
- Use cases depend on small interfaces (ports). Wire adapters only in composition-root/.
- Routes in src/app stay thin: parse input, call a use case, render the result.
- Follow SOLID at module boundaries; do not over-engineer (KISS, YAGNI).

These rules are enforced twice: by ESLint (`no-restricted-imports` in eslint.config.mjs) and by
tests/architecture/dependency-rules.test.ts. Never weaken either to make code pass; fix the code.

## Code rules

- No `any`. Validate all external input with Zod. Return Result types for expected errors.
- Small functions and files; clear names; comments explain WHY, not WHAT.
- No new dependency without a one-line justification (add an ADR for big ones).
- Never commit secrets. Keep .env.example up to date.
- Read environment variables only through src/shared/config/env.ts.

## Workflow

- Work on ONE phase of the plan at a time. Plan first, then code in small vertical slices.
- Write tests for use cases first (or together). Add contract tests for new adapters.
- Before saying a task is done, run: pnpm lint && pnpm typecheck && pnpm test
  (shortcut: `pnpm check`). For UI changes also run `pnpm test:e2e`.
- Conventional Commits (feat:, fix:, chore:, docs:, test:, refactor:).
- If a requirement is unclear or conflicts with the plan, ask instead of guessing.

## UI rules

- WCAG 2.2 AA, keyboard accessible, responsive, dark mode via design tokens.
- Use shared components from src/shared/ui before creating new ones.
- Colours come from the tokens in src/app/globals.css (bg-background, text-muted-foreground, ...),
  never raw hex values in components.

## Useful commands

| Command            | What it does                                     |
| ------------------ | ------------------------------------------------ |
| `pnpm dev`         | Run the site locally at http://localhost:3000    |
| `pnpm check`       | Lint + typecheck + unit tests                    |
| `pnpm test:e2e`    | Playwright end-to-end tests (incl. axe a11y)     |
| `pnpm format`      | Format all files with Prettier                   |
| `pnpm db:generate` | Create a migration after changing the schema     |
| `pnpm db:migrate`  | Apply migrations to the database in DATABASE_URL |

## Status

- Phase 0 (Foundation): files written; first `pnpm install` + `pnpm check` + first
  `pnpm db:generate` still to be run by the owner. See README "First-time setup".
- Phases 1-5: not started. Do not start a phase until the owner says so.
