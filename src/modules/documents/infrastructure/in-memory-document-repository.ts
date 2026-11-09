import type { Page } from "@/shared/kernel";
import type { DocumentReader, DocumentWriter, LeadRepository } from "../domain/document-ports";
import type { LibraryQuery } from "../domain/library-query";
import { isVisible, type Lead, type TeachingDocument } from "../domain/teaching-document";

function newestFirst(a: TeachingDocument, b: TeachingDocument): number {
  const left = (a.publishedAt ?? a.createdAt).getTime();
  const right = (b.publishedAt ?? b.createdAt).getTime();
  return right - left || a.title.localeCompare(b.title);
}

/** Keeps documents in memory: for tests and for working locally without a database. */
export class InMemoryDocumentRepository implements DocumentReader, DocumentWriter {
  private readonly documents = new Map<string, TeachingDocument>();

  async findById(id: string): Promise<TeachingDocument | null> {
    return this.documents.get(id) ?? null;
  }

  async findBySlug(slug: string): Promise<TeachingDocument | null> {
    return [...this.documents.values()].find((document) => document.slug === slug) ?? null;
  }

  async listAll(): Promise<readonly TeachingDocument[]> {
    return [...this.documents.values()].sort(newestFirst);
  }

  async search(query: LibraryQuery): Promise<Page<TeachingDocument>> {
    const text = query.text?.toLowerCase();
    const matches = [...this.documents.values()]
      .filter(isVisible)
      .filter((document) => !query.level || document.level === query.level)
      .filter((document) => !query.type || document.type === query.type)
      .filter((document) => !query.topic || document.topics.includes(query.topic))
      .filter(
        (document) =>
          !text ||
          document.title.toLowerCase().includes(text) ||
          document.description.toLowerCase().includes(text) ||
          document.topics.some((topic) => topic.includes(text)),
      )
      .sort(newestFirst);

    const start = (query.page - 1) * query.pageSize;
    return {
      items: matches.slice(start, start + query.pageSize),
      total: matches.length,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async listVisibleTopics(): Promise<readonly string[]> {
    const topics = new Set<string>();
    for (const document of this.documents.values()) {
      if (isVisible(document)) document.topics.forEach((topic) => topics.add(topic));
    }
    return [...topics].sort((a, b) => a.localeCompare(b));
  }

  async save(document: TeachingDocument): Promise<void> {
    this.documents.set(document.id, document);
  }

  async delete(id: string): Promise<void> {
    this.documents.delete(id);
  }

  async incrementDownloads(id: string): Promise<void> {
    const document = this.documents.get(id);
    if (document)
      this.documents.set(id, { ...document, downloadCount: document.downloadCount + 1 });
  }
}

export class InMemoryLeadRepository implements LeadRepository {
  readonly leads: Lead[] = [];

  async save(lead: Lead): Promise<void> {
    this.leads.push(lead);
  }
}
