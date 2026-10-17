# ADR-0002: Hosting, personal-data location and payments (.ru domain)

- Status: **proposed. Needs the owner's decision before Phase 1 goes live and before Phase 3.**
- Date: 2026-10-17

## Context

The site lives on a `.ru` domain (www.deepsemantic.ru) and the owner appears to be based in
Russia (timezone Europe/Moscow). The plan's defaults (Vercel, Neon/Supabase, Stripe, Resend,
Cloudflare) assume a country-neutral setup. Three things depend on the real answer:

1. **Personal data.** Contact messages (name, email) and later orders are personal data.
   Russian law (Federal Law 152-FZ) generally expects databases with personal data of Russian
   citizens to be located in Russia. Whether this applies to this site, and how strictly, should
   be confirmed with a lawyer; it is not something this repository can settle.
2. **Payments.** Stripe does not onboard Russian businesses. Phase 3 therefore needs a different
   provider (for example YooKassa, CloudPayments or Robokassa), or a different business
   registration. The `PaymentGateway` port in the plan exists exactly for this: only a new
   adapter is needed.
3. **Reachability.** Some foreign services can be slow or blocked from inside Russia. Visitors
   in Russia and abroad should both be tested before launch.

## Options

- A. Keep the plan's stack (Vercel + Neon). Simplest; may not satisfy item 1.
- B. Frontend on Vercel/Cloudflare, database and file storage in a Russian data centre.
  The ports/adapters design allows this: only the Drizzle connection string (or adapter) changes.
- C. Everything on a Russian VPS / PaaS (more maintenance for a non-developer).

## Decision

Not taken yet. Until then only the Phase 0 placeholder may be deployed: it stores no personal
data. **Owner action:** confirm where the business is registered, which payment providers are
available there, and ask a lawyer about item 1.

## Consequences

Phase 1 (contact form stores messages) must not go live with real visitor data until this ADR is
accepted. Phase 3 will start with a short comparison of payment providers that work for the
owner's country, as the plan requires.
