import { and, count, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import type { Database } from "@/shared/db/client";
import type { Page } from "@/shared/kernel";
import type { DocumentReader, DocumentWriter, LeadRepository } from "../domain/document-ports";
import type { LibraryQuery } from "../domain/library-query";
import {
  CEFR_LEVELS,
  DOCUMENT_ACCESS,
  DOCUMENT_TYPES,
  type Lead,
  type TeachingDocument,
} from "../domain/teaching-document";
import { documentLeads, documents } from "./schema";

type Row = typeof documents.$inferSelect;

/** Values come from our own writes, but the database column is plain text: narrow it safely. */
function oneOf<T extends string>(options: readonly T[], value: string, fallback: T): T {
  return options.find((option) => option === value) ?? fallback;
}

function toDocument(row: Row): TeachingDocument {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    level: oneOf(CEFR_LEVELS, row.level, "A1"),
    topics: row.topics,
    type: oneOf(DOCUMENT_TYPES, row.type, "other"),
    access: oneOf(DOCUMENT_ACCESS, row.access, "public"),
    status: row.status === "published" ? "published" : "draft",
    file:
      row.fileRef && row.fileName && row.fileMime && row.fileSize !== null
        ? { ref: row.fileRef, name: row.fileName, mime: row.fileMime, size: row.fileSize }
        : null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    publishedAt: row.publishedAt,
    downloadCount: row.downloadCount,
  };
}

function toRow(document: TeachingDocument): Row {
  return {
    id: document.id,
    slug: document.slug,
    title: document.title,
    description: document.description,
    level: document.level,
    topics: [...document.topics],
    type: document.type,
    access: document.access,
    status: document.status,
    fileRef: document.file?.ref ?? null,
    fileName: document.file?.name ?? null,
    fileMime: document.file?.mime ?? null,
    fileSize: document.file?.size ?? null,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
    publishedAt: document.publishedAt,
    downloadCount: document.downloadCount,
  };
}

/** Makes the characters % and _ in what a visitor typed mean themselves in a LIKE search. */
function escapeLike(text: string): string {
  return text.replace(/[\\%_]/g, (char) => `\\${char}`);
}

const visible = and(eq(documents.status, "published"), sql`${documents.fileRef} is not null`);

export class DrizzleDocumentRepository implements DocumentReader, DocumentWriter {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<TeachingDocument | null> {
    const [row] = await this.db.select().from(documents).where(eq(documents.id, id)).limit(1);
    return row ? toDocument(row) : null;
  }

  async findBySlug(slug: string): Promise<TeachingDocument | null> {
    const [row] = await this.db.select().from(documents).where(eq(documents.slug, slug)).limit(1);
    return row ? toDocument(row) : null;
  }

  async listAll(): Promise<readonly TeachingDocument[]> {
    const rows = await this.db.select().from(documents).orderBy(desc(documents.createdAt));
    return rows.map(toDocument);
  }

  async search(query: LibraryQuery): Promise<Page<TeachingDocument>> {
    const conditions: (SQL | undefined)[] = [visible];
    if (query.level) conditions.push(eq(documents.level, query.level));
    if (query.type) conditions.push(eq(documents.type, query.type));
    if (query.topic) conditions.push(sql`${query.topic} = any(${documents.topics})`);
    if (query.text) {
      const pattern = `%${escapeLike(query.text)}%`;
      conditions.push(
        or(
          ilike(documents.title, pattern),
          ilike(documents.description, pattern),
          sql`array_to_string(${documents.topics}, ' ') ilike ${pattern}`,
        ),
      );
    }
    const where = and(...conditions);

    const [rows, totals] = await Promise.all([
      this.db
        .select()
        .from(documents)
        .where(where)
        .orderBy(desc(documents.publishedAt), documents.title)
        .limit(query.pageSize)
        .offset((query.page - 1) * query.pageSize),
      this.db.select({ value: count() }).from(documents).where(where),
    ]);

    return {
      items: rows.map(toDocument),
      total: totals[0]?.value ?? 0,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async listVisibleTopics(): Promise<readonly string[]> {
    const rows = await this.db.select({ topics: documents.topics }).from(documents).where(visible);
    return [...new Set(rows.flatMap((row) => row.topics))].sort((a, b) => a.localeCompare(b));
  }

  async save(document: TeachingDocument): Promise<void> {
    const row = toRow(document);
    await this.db
      .insert(documents)
      .values(row)
      .onConflictDoUpdate({ target: documents.id, set: { ...row, id: undefined } });
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(documents).where(eq(documents.id, id));
  }

  async incrementDownloads(id: string): Promise<void> {
    await this.db
      .update(documents)
      .set({ downloadCount: sql`${documents.downloadCount} + 1` })
      .where(eq(documents.id, id));
  }
}

export class DrizzleLeadRepository implements LeadRepository {
  constructor(private readonly db: Database) {}

  async save(lead: Lead): Promise<void> {
    await this.db
      .insert(documentLeads)
      .values({
        id: lead.id,
        email: lead.email,
        documentId: lead.documentId,
        createdAt: lead.createdAt,
      })
      .onConflictDoNothing();
  }
}
