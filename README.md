# deepsemantic.ru: personal English-teacher website

A website that looks like a normal site and behaves like an app: profile, documents library,
products and a private admin area. Built phase by phase from `docs/PLAN.docx`.

**Status: Phase 1 (public profile).** Russian and English site with Home, About, Contact (form + email), Privacy and Terms. Name, biography, photo, logo and colours are placeholders to be replaced later.

## First-time setup (about 20 minutes)

You need three free programs. Install them once:

1. **Node.js 22 LTS**: https://nodejs.org
2. **Git**: https://git-scm.com
3. **pnpm**: open a terminal and run `corepack enable pnpm`

Then, in a terminal opened inside this folder:

```bash
git init                 # 1. start version control (must come BEFORE pnpm install)
pnpm install             # 2. download all libraries (creates pnpm-lock.yaml)
pnpm format              # 3. tidy the formatting of every file once
pnpm check               # 4. lint + type check + unit tests: everything should be green
pnpm dev                 # 5. open http://localhost:3000 and look at the page
```

If any step prints an error, copy the whole message to your AI assistant. Do not guess.

Optional but recommended: end-to-end tests (they open a real browser, including an accessibility
check and a 360 px phone-width check):

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

### Save your work on GitHub

```bash
git add .
git commit -m "chore: phase 0 foundation"   # the message must look like this (Conventional Commits)
```

Create an empty repository on https://github.com, then run the two commands GitHub shows
(`git remote add origin ...` and `git push -u origin main`). **Commit `pnpm-lock.yaml` too**:
the automatic checks (`.github/workflows/ci.yml`) need it. Once pushed, the **CI** tab on GitHub
should turn green.

### Database (needed from Phase 1; can be done now)

1. Create a free PostgreSQL database at https://neon.tech (or https://supabase.com).
2. Copy `.env.example` to `.env.local` and paste your connection string into `DATABASE_URL`.
3. `pnpm db:generate` creates the first migration in `drizzle/`. Commit that folder.
4. `pnpm db:migrate` applies it to your database.

> Read `docs/adr/0002-hosting-region-and-payments.md` before putting real visitor data into any
> database: where personal data may be stored depends on where you and your visitors are.

### Preview on the internet (Vercel)

1. Sign up at https://vercel.com with your GitHub account and import the repository.
2. Add the variables from `.env.example` under **Settings > Environment Variables**.
3. Every push now gets its own preview address. The site stays `noindex` (invisible to Google)
   until you set `NEXT_PUBLIC_ALLOW_INDEXING=true`.
4. Connecting `www.deepsemantic.ru` is a Phase 1 task.

## Everyday commands

| Command            | What it does                                       |
| ------------------ | -------------------------------------------------- |
| `pnpm dev`         | Run the site locally                               |
| `pnpm check`       | Lint + type check + unit tests (run before commit) |
| `pnpm test:e2e`    | Browser tests                                      |
| `pnpm format`      | Auto-format all files                              |
| `pnpm build`       | Production build (what Vercel runs)                |
| `pnpm db:generate` | Create a migration after changing the DB schema    |
| `pnpm db:migrate`  | Apply migrations                                   |

## How the code is organised

```text
src/
  app/               Next.js pages and routes: thin, presentation only
  modules/<feature>/ domain / application / infrastructure / ui   (documents, products, ...)
  shared/
    kernel/          Result, errors, Clock, ids, pagination (used everywhere)
    config/env.ts    every environment variable, validated with Zod
    db/              Drizzle schema and connection
    ui/              design-system components (Button, theme toggle, ...)
  composition-root/  the ONE place where interfaces are connected to real implementations
tests/
  architecture/      tests that fail if a layer imports something it must not
  e2e/               Playwright browser tests
  contract/          tests shared by every implementation of an interface (from Phase 2)
docs/                the plan and Architecture Decision Records (adr/)
CLAUDE.md            rules your AI assistant reads at the start of every session
```

The golden rule: **dependencies point inward.** Business rules (`domain`, `application`) never
import Next.js, the database, Stripe or any other tool. That is what lets you swap a payment
provider or a database later without rewriting the business logic. ESLint and an automated test
both enforce it.

## Definition of done (every task)

- Lint, types and tests pass (`pnpm check`, and CI is green).
- New use cases have unit tests; new adapters have contract tests.
- No architecture rule violated.
- Works with keyboard only, passes the automated axe check, fits a 360 px wide screen.
- README or ADR updated; no secrets in the repository.
- You looked at it on a preview address.

## What comes next

Phase 1 (public profile: Home, About, Contact, SEO). Start it only after Phase 0 is green on your
machine and you have answered the open questions in `docs/adr/0002-hosting-region-and-payments.md`.
