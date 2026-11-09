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
import {
  RequestAdminLogin,
  ResolveAdminSession,
  VerifyAdminLogin,
} from "@/modules/auth/application/admin-auth";
import type { AdminAuthConfig } from "@/modules/auth/domain/auth-ports";
import { DeleteDocument } from "@/modules/documents/application/delete-document";
import {
  GetDocumentForAdmin,
  GetPublishedDocument,
  ListAllDocuments,
  SearchLibrary,
} from "@/modules/documents/application/document-queries";
import { IssueDownloadLink, OpenDownload } from "@/modules/documents/application/download-document";
import { SaveDocument } from "@/modules/documents/application/save-document";
import { SetDocumentStatus } from "@/modules/documents/application/set-document-status";
import type {
  DocumentReader,
  DocumentWriter,
  FileStorage,
  LeadRepository,
} from "@/modules/documents/domain/document-ports";
import {
  DrizzleDocumentRepository,
  DrizzleLeadRepository,
} from "@/modules/documents/infrastructure/drizzle-document-repository";
import {
  InMemoryDocumentRepository,
  InMemoryLeadRepository,
} from "@/modules/documents/infrastructure/in-memory-document-repository";
import { InMemoryFileStorage } from "@/modules/documents/infrastructure/in-memory-file-storage";
import { VercelBlobStorage } from "@/modules/documents/infrastructure/vercel-blob-storage";
import { GetProfile } from "@/modules/profile/application/get-profile";
import { StaticProfileReader } from "@/modules/profile/infrastructure/static-profile-reader";
import { ListTestimonials } from "@/modules/testimonials/application/list-testimonials";
import { StaticTestimonialReader } from "@/modules/testimonials/infrastructure/static-testimonial-reader";
import { getEnv, type Env } from "@/shared/config/env";
import { siteConfig } from "@/shared/config/site";
import { createDb } from "@/shared/db/client";
import { SystemClock, UuidGenerator, type Clock, type IdGenerator } from "@/shared/kernel";
import { DisabledTokenSigner } from "@/shared/security/disabled-token-signer";
import { HmacTokenSigner, type TokenSigner } from "@/shared/security/token-signer";

/** What the Contact page needs to know before it draws the form. */
export interface ContactChannel {
  /** False means the form must not be shown (the site is live but email is not set up). */
  readonly available: boolean;
  /** Present only when the Turnstile widget should be shown. */
  readonly turnstileSiteKey?: string;
}

/** What the admin area needs to know before it shows its screens. */
export interface AdminChannel {
  /** False means the admin area is not set up yet (missing settings): show an explanation. */
  readonly available: boolean;
  /** Local development only: show the login link on screen instead of emailing it. */
  readonly revealLoginLink: boolean;
}

export interface DocumentServices {
  readonly save: SaveDocument;
  readonly setStatus: SetDocumentStatus;
  readonly remove: DeleteDocument;
  readonly listAll: ListAllDocuments;
  readonly getForAdmin: GetDocumentForAdmin;
  readonly searchLibrary: SearchLibrary;
  readonly getPublished: GetPublishedDocument;
  readonly issueDownload: IssueDownloadLink;
  readonly openDownload: OpenDownload;
}

export interface AdminAuthServices {
  readonly requestLogin: RequestAdminLogin;
  readonly verifyLogin: VerifyAdminLogin;
  readonly resolveSession: ResolveAdminSession;
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
  readonly documents: DocumentServices;
  readonly adminAuth: AdminAuthServices;
  readonly adminChannel: AdminChannel;
}

export function createContainer(
  overrides: Partial<Container> = {},
  env: Env = getEnv(),
): Container {
  const clock = overrides.clock ?? new SystemClock();
  const ids = overrides.ids ?? new UuidGenerator();
  const contact = wireContact(env, clock, ids);
  const signer = wireSigner(env, clock);
  const documents = wireDocuments(env, clock, ids, signer);
  const admin = wireAdmin(env, signer);

  return {
    clock,
    ids,
    getProfile: new GetProfile(new StaticProfileReader()),
    listTestimonials: new ListTestimonials(new StaticTestimonialReader()),
    ...contact,
    documents,
    ...admin,
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

/** Used only for local work without secrets. Never active in a production build. */
const DEV_SECRET = "dev-only-secret-never-use-in-production-0123456789";

/** Local development switch: works only outside production builds, see ADR-0004. */
function isAdminDevMode(env: Env): boolean {
  return env.CONTACT_DEV_MODE && env.NODE_ENV !== "production";
}

function wireSigner(env: Env, clock: Clock): TokenSigner {
  const secret = env.AUTH_SECRET ?? (isAdminDevMode(env) ? DEV_SECRET : undefined);
  return secret ? new HmacTokenSigner(secret, clock) : new DisabledTokenSigner();
}

interface MemoryStore {
  readonly documents: InMemoryDocumentRepository;
  readonly leads: InMemoryLeadRepository;
  readonly files: InMemoryFileStorage;
}

// Kept on `globalThis` so that local data survives hot reloads while developing.
const globalForMemory = globalThis as typeof globalThis & { __deepsemanticMemory?: MemoryStore };

function memoryStore(): MemoryStore {
  globalForMemory.__deepsemanticMemory ??= {
    documents: new InMemoryDocumentRepository(),
    leads: new InMemoryLeadRepository(),
    files: new InMemoryFileStorage(),
  };
  return globalForMemory.__deepsemanticMemory;
}

/** Real database and Blob storage when configured; otherwise in-memory stand-ins. */
function wireDocuments(
  env: Env,
  clock: Clock,
  ids: IdGenerator,
  signer: TokenSigner,
): DocumentServices {
  const memory = memoryStore();
  let reader: DocumentReader = memory.documents;
  let writer: DocumentWriter = memory.documents;
  let leads: LeadRepository = memory.leads;
  if (env.DATABASE_URL) {
    const { db } = createDb(env.DATABASE_URL);
    const repository = new DrizzleDocumentRepository(db);
    reader = repository;
    writer = repository;
    leads = new DrizzleLeadRepository(db);
  }
  const storage: FileStorage = env.BLOB_READ_WRITE_TOKEN
    ? new VercelBlobStorage(env.BLOB_READ_WRITE_TOKEN)
    : memory.files;

  return {
    save: new SaveDocument(reader, writer, storage, clock, ids),
    setStatus: new SetDocumentStatus(reader, writer, clock),
    remove: new DeleteDocument(reader, writer, storage),
    listAll: new ListAllDocuments(reader),
    getForAdmin: new GetDocumentForAdmin(reader),
    searchLibrary: new SearchLibrary(reader),
    getPublished: new GetPublishedDocument(reader),
    issueDownload: new IssueDownloadLink(reader, leads, signer, clock, ids),
    openDownload: new OpenDownload(reader, writer, storage, signer),
  };
}

/**
 * The admin area is switched on when everything it needs exists: a secret, an admin address,
 * working email, and permanent storage (database + Blob). In development mode shortcuts apply.
 */
function wireAdmin(env: Env, signer: TokenSigner): Pick<Container, "adminAuth" | "adminChannel"> {
  const devMode = isAdminDevMode(env);
  const adminEmail =
    env.ADMIN_EMAIL ?? env.CONTACT_TO_EMAIL ?? (devMode ? "admin@example.test" : undefined);
  const fromEmail = env.CONTACT_FROM_EMAIL ?? "site@example.invalid";
  const emailConfigured = Boolean(env.RESEND_API_KEY && env.CONTACT_FROM_EMAIL);
  const mailer: EmailSender =
    emailConfigured && env.RESEND_API_KEY
      ? new ResendEmailSender(env.RESEND_API_KEY)
      : new ConsoleEmailSender();

  const config: AdminAuthConfig = {
    adminEmail: adminEmail ?? "admin@example.invalid",
    fromEmail,
    siteUrl: env.NEXT_PUBLIC_SITE_URL,
    siteName: siteConfig.name,
  };

  const production = Boolean(
    env.AUTH_SECRET &&
    adminEmail &&
    emailConfigured &&
    env.DATABASE_URL &&
    env.BLOB_READ_WRITE_TOKEN,
  );

  return {
    adminAuth: {
      requestLogin: new RequestAdminLogin(mailer, signer, config),
      verifyLogin: new VerifyAdminLogin(signer, config),
      resolveSession: new ResolveAdminSession(signer, config),
    },
    adminChannel: {
      available: production || devMode,
      revealLoginLink: devMode && !emailConfigured,
    },
  };
}

let instance: Container | undefined;

/** Lazily created singleton for the running app. */
export function getContainer(): Container {
  instance ??= createContainer();
  return instance;
}
