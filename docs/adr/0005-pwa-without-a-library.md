# ADR-0005: Installable app (PWA) with a hand-written service worker

Date: 2026-11-12. Status: accepted.

## Context

Phase 4 asks for an installable site with an offline fallback. The plan suggested Serwist
(a service-worker library). Our needs are small: cache built files, keep a copy of visited
pages, show an offline page. Serwist also needs a build plugin and is one more dependency to
update, and package downloads from some CDNs are unreliable from Russia.

## Decision

- `public/sw.js`: about 100 lines of plain JavaScript, no library. Built files (`/_next/static`,
  `/icons`): cache first. Pages: network first, a copy is kept (max 40), fallback to the copy or
  to `/offline.html`. Admin, `/api` and non-GET requests are never touched.
- Registered only in production builds (`ServiceWorkerRegistration`), so `pnpm dev` never shows
  stale files.
- `src/app/manifest.ts` (Next.js metadata route) produces `/manifest.webmanifest`. Icons live in
  `public/icons` (192, 512, maskable 512, Apple 180).
- `public/offline.html` is static HTML with both languages on one page. This is a deliberate
  exception to ADR-0003 (texts in dictionaries): the page must work with no network and no
  framework code at all.
- `/sw.js` is served with `Cache-Control: no-cache` (next.config.ts) so updates reach visitors.

## Consequences

- To force every visitor to drop old caches, change `VERSION` in `public/sw.js`.
- If needs grow (background sync, push notifications, precaching all pages), revisit Serwist.
