import { SubmitContactMessage } from "@/modules/contact/application/submit-contact-message";
import type {
  ContactRepository,
  EmailSender,
  SpamVerifier,
} from "@/modules/contact/domain/contact-ports";
import { AcceptingSpamVerifier } from "@/modules/contact/infrastructure/accepting-spam-verifier";
import { ConsoleEmailSender } from "@/modules/contact/infrastructure/console-email-sender";
import { DrizzleContactRepository } from "@/modules/contact/infrastructure/drizzle-contact-repository";
import { NullContactRepository } from "@/modules/contact/infrastructure/null-contact-repository";
import { ResendEmailSender } from "@/modules/contact/infrastructure/resend-email-sender";
import { TurnstileVerifier } from "@/modules/contact/infrastructure/turnstile-verifier";
import { GetProfile } from "@/modules/profile/application/get-profile";
import { StaticProfileReader } from "@/modules/profile/infrastructure/static-profile-reader";
import { ListTestimonials } from "@/modules/testimonials/application/list-testimonials";
import { StaticTestimonialReader } from "@/modules/testimonials/infrastructure/static-testimonial-reader";
import { getEnv, type Env } from "@/shared/config/env";
import { siteConfig } from "@/shared/config/site";
import { createDb } from "@/shared/db/client";
import { SystemClock, UuidGenerator, type Clock, type IdGenerator } from "@/shared/kernel";

/** What the Contact page needs to know before it draws the form. */
export interface ContactChannel {
  /** False means the form must not be shown (the site is live but email is not set up). */
  readonly available: boolean;
  /** Present only when the Turnstile widget should be shown. */
  readonly turnstileSiteKey?: string;
}

/**
 * The ONLY place where interfaces (ports) are connected to concrete classes (adapters).
 * Each phase adds its adapters here, e.g. documents: DrizzleDocumentRepository, R2FileStorage.
 * Routes ask the container for ready-made use cases; tests pass fakes via `overrides`.
 */
export interface Container {
  readonly clock: Clock;
  readonly ids: IdGenerator;
  readonly getProfile: GetProfile;
  readonly listTestimonials: ListTestimonials;
  readonly submitContactMessage: SubmitContactMessage;
  readonly contactChannel: ContactChannel;
}

export function createContainer(
  overrides: Partial<Container> = {},
  env: Env = getEnv(),
): Container {
  const clock = overrides.clock ?? new SystemClock();
  const ids = overrides.ids ?? new UuidGenerator();
  const contact = wireContact(env, clock, ids);

  return {
    clock,
    ids,
    getProfile: new GetProfile(new StaticProfileReader()),
    listTestimonials: new ListTestimonials(new StaticTestimonialReader()),
    ...contact,
    ...overrides,
  };
}

/**
 * Live mode needs email (Resend) AND spam protection (Turnstile). Without them the form is
 * unavailable, unless CONTACT_DEV_MODE is on, which swaps in harmless stand-ins.
 */
function wireContact(
  env: Env,
  clock: Clock,
  ids: IdGenerator,
): Pick<Container, "submitContactMessage" | "contactChannel"> {
  const apiKey = env.RESEND_API_KEY;
  const ownerEmail = env.CONTACT_TO_EMAIL;
  const fromEmail = env.CONTACT_FROM_EMAIL;
  const turnstileSecret = env.TURNSTILE_SECRET_KEY;
  const turnstileSiteKey = env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const isLive = Boolean(apiKey && ownerEmail && fromEmail && turnstileSecret && turnstileSiteKey);

  const emailSender: EmailSender =
    isLive && apiKey ? new ResendEmailSender(apiKey) : new ConsoleEmailSender();
  const spamVerifier: SpamVerifier =
    isLive && turnstileSecret
      ? new TurnstileVerifier(turnstileSecret)
      : new AcceptingSpamVerifier();
  // With a database the owner keeps a copy; without one the form is "email only".
  const repository: ContactRepository = env.DATABASE_URL
    ? new DrizzleContactRepository(createDb(env.DATABASE_URL).db)
    : new NullContactRepository();

  return {
    submitContactMessage: new SubmitContactMessage(
      repository,
      emailSender,
      spamVerifier,
      clock,
      ids,
      {
        ownerEmail: ownerEmail ?? "owner@example.invalid",
        fromEmail: fromEmail ?? "site@example.invalid",
        siteName: siteConfig.name,
      },
    ),
    contactChannel: {
      available: isLive || env.CONTACT_DEV_MODE,
      ...(isLive && turnstileSiteKey ? { turnstileSiteKey } : {}),
    },
  };
}

let instance: Container | undefined;

/** Lazily created singleton for the running app. */
export function getContainer(): Container {
  instance ??= createContainer();
  return instance;
}
