import {
  err,
  isValidEmail,
  normalizeEmail,
  ok,
  ValidationError,
  type Result,
} from "@/shared/kernel";

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];

export const DOCUMENT_TYPES = ["worksheet", "lesson_plan", "guide", "other"] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

/** public = anyone; email = after leaving an address (a lead); paid = after a purchase (Phase 3). */
export const DOCUMENT_ACCESS = ["public", "email", "paid"] as const;
export type DocumentAccess = (typeof DOCUMENT_ACCESS)[number];

export type DocumentStatus = "draft" | "published";

export const DOCUMENT_LIMITS = {
  titleMax: 150,
  descriptionMax: 2000,
  topicsMax: 8,
  topicMax: 40,
  // Vercel accepts request bodies up to 4.5 MB; see ADR-0004.
  fileMaxBytes: 4 * 1024 * 1024,
} as const;

export type DocumentField =
  "title" | "description" | "level" | "topics" | "type" | "access" | "file" | "email";

/** Stable codes; the admin screen turns them into Russian sentences. */
export type DocumentFieldError =
  | "title_required"
  | "title_too_long"
  | "description_too_long"
  | "level_invalid"
  | "type_invalid"
  | "access_invalid"
  | "topics_too_many"
  | "topic_too_long"
  | "file_required_to_publish"
  | "file_empty"
  | "file_too_large"
  | "file_type_not_allowed"
  | "email_invalid";

export class DocumentValidationError extends ValidationError {
  constructor(readonly fields: Partial<Record<DocumentField, DocumentFieldError>>) {
    super(
      "Some fields are invalid",
      Object.entries(fields).map(([field, problem]) => `${field}: ${problem}`),
    );
  }
}

/** A file that lives in storage. `ref` is the storage's own address and is never shown to visitors. */
export interface DocumentFile {
  readonly ref: string;
  readonly name: string;
  readonly mime: string;
  readonly size: number;
}

export interface TeachingDocument {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly level: CefrLevel;
  readonly topics: readonly string[];
  readonly type: DocumentType;
  readonly access: DocumentAccess;
  readonly status: DocumentStatus;
  readonly file: DocumentFile | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly publishedAt: Date | null;
  readonly downloadCount: number;
}

/** What the owner typed in the admin form: untrusted text. `topics` is a comma-separated list. */
export interface DocumentDraft {
  readonly title: string;
  readonly description: string;
  readonly level: string;
  readonly topics: string;
  readonly type: string;
  readonly access: string;
}

interface DocumentDetails {
  readonly title: string;
  readonly description: string;
  readonly level: CefrLevel;
  readonly topics: readonly string[];
  readonly type: DocumentType;
  readonly access: DocumentAccess;
}

export function parseTopics(raw: string): string[] {
  const topics = raw
    .split(/[,;\n]/)
    .map((topic) => topic.replace(/\s+/g, " ").trim().toLowerCase())
    .filter((topic) => topic.length > 0);
  return [...new Set(topics)];
}

const pick = <T extends string>(options: readonly T[], value: string): T | undefined =>
  options.find((option) => option === value.trim());

/** Checks every field and reports all problems at once. */
export function validateDocumentDetails(
  draft: DocumentDraft,
): Result<DocumentDetails, DocumentValidationError> {
  const fields: Partial<Record<DocumentField, DocumentFieldError>> = {};

  const title = draft.title.replace(/\s+/g, " ").trim();
  const description = draft.description.trim();
  const topics = parseTopics(draft.topics);
  const level = pick(CEFR_LEVELS, draft.level);
  const type = pick(DOCUMENT_TYPES, draft.type);
  const access = pick(DOCUMENT_ACCESS, draft.access);

  if (title.length === 0) fields.title = "title_required";
  else if (title.length > DOCUMENT_LIMITS.titleMax) fields.title = "title_too_long";

  if (description.length > DOCUMENT_LIMITS.descriptionMax) {
    fields.description = "description_too_long";
  }
  if (!level) fields.level = "level_invalid";
  if (!type) fields.type = "type_invalid";
  if (!access) fields.access = "access_invalid";

  if (topics.length > DOCUMENT_LIMITS.topicsMax) fields.topics = "topics_too_many";
  else if (topics.some((topic) => topic.length > DOCUMENT_LIMITS.topicMax)) {
    fields.topics = "topic_too_long";
  }

  if (Object.keys(fields).length > 0 || !level || !type || !access) {
    return err(new DocumentValidationError(fields));
  }
  return ok({ title, description, level, topics, type, access });
}

/** A new document always starts as a draft without a file. */
export function createDocument(
  draft: DocumentDraft,
  meta: { readonly id: string; readonly slug: string; readonly now: Date },
): Result<TeachingDocument, DocumentValidationError> {
  const details = validateDocumentDetails(draft);
  if (!details.ok) return details;
  return ok({
    ...details.value,
    id: meta.id,
    slug: meta.slug,
    status: "draft",
    file: null,
    createdAt: meta.now,
    updatedAt: meta.now,
    publishedAt: null,
    downloadCount: 0,
  });
}

export function updateDocument(
  document: TeachingDocument,
  draft: DocumentDraft,
  now: Date,
): Result<TeachingDocument, DocumentValidationError> {
  const details = validateDocumentDetails(draft);
  if (!details.ok) return details;
  return ok({ ...document, ...details.value, updatedAt: now });
}

export function attachFile(
  document: TeachingDocument,
  file: DocumentFile,
  now: Date,
): TeachingDocument {
  return { ...document, file, updatedAt: now };
}

/** A document without a file cannot be shown to visitors. */
export function publishDocument(
  document: TeachingDocument,
  now: Date,
): Result<TeachingDocument, DocumentValidationError> {
  if (!document.file) return err(new DocumentValidationError({ file: "file_required_to_publish" }));
  if (document.status === "published") return ok(document);
  return ok({ ...document, status: "published", publishedAt: now, updatedAt: now });
}

export function unpublishDocument(document: TeachingDocument, now: Date): TeachingDocument {
  if (document.status === "draft") return document;
  return { ...document, status: "draft", updatedAt: now };
}

/** Visitors can see (and try to download) only published documents that have a file. */
export function isVisible(document: TeachingDocument): boolean {
  return document.status === "published" && document.file !== null;
}

export interface Lead {
  readonly id: string;
  readonly email: string;
  readonly documentId: string;
  readonly createdAt: Date;
}

/** Someone who left an address to get a document: a potential student. */
export function createLead(
  rawEmail: string,
  meta: { readonly id: string; readonly documentId: string; readonly now: Date },
): Result<Lead, DocumentValidationError> {
  if (!isValidEmail(rawEmail)) return err(new DocumentValidationError({ email: "email_invalid" }));
  return ok({
    id: meta.id,
    email: normalizeEmail(rawEmail),
    documentId: meta.documentId,
    createdAt: meta.now,
  });
}
