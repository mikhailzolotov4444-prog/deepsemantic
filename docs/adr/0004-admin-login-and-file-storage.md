# ADR-0004: Admin login by emailed link, files in Vercel Blob

Status: accepted (Phase 2)

## Admin login

- One admin (the owner). The address comes from `ADMIN_EMAIL` (falls back to `CONTACT_TO_EMAIL`).
- The owner types the address; if it matches, a link valid for 15 minutes is emailed. Opening it
  sets a signed, `HttpOnly` cookie valid for 7 days. The page never reveals whether an address is
  the admin's.
- Links and cookies are HMAC-signed tokens (`src/shared/security/token-signer.ts`, Web Crypto,
  no library). Secret: `AUTH_SECRET` (at least 32 characters).
- Protection is layered: `src/proxy.ts` blocks `/admin` without a cookie, and every admin page and
  action checks the session again on the server.
- Known limits, to be addressed in Phase 4: login links are not single-use; no rate limiting.

## Files

- Port `FileStorage` (put, open, remove). Adapter now: Vercel Blob (`@vercel/blob`, one small
  dependency, free tier, no bank card). Later: a Yandex Object Storage adapter (ADR-0002).
- Files are stored under unguessable addresses that are never shown to visitors. Visitors
  download through `/api/download/<token>`; the server checks a short-lived signed token and
  streams the file. Public documents get a fresh token on each click, e-mail-gated ones after the
  visitor leaves an address (stored as a lead).
- Upload limit 4 MB (Vercel's request limit is 4.5 MB). Larger files need browser-to-storage
  uploads: planned together with e-books in Phase 3.
- Accepted file types: PDF and DOCX, recognised by their content, not by the file name.

## Notes

- Document titles and descriptions are written once, in the language of the document. Interface
  texts stay bilingual (ADR-0003). The admin area is Russian only.
