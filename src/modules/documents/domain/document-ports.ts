import type { Page } from "@/shared/kernel";
import type { LibraryQuery } from "./library-query";
import type { Lead, TeachingDocument } from "./teaching-document";

/** Read side. */
export interface DocumentReader {
  findById(id: string): Promise<TeachingDocument | null>;
  findBySlug(slug: string): Promise<TeachingDocument | null>;
  /** Every document, drafts included, newest first: for the admin area. */
  listAll(): Promise<readonly TeachingDocument[]>;
  /** Only visible (published, with a file) documents, newest first. */
  search(query: LibraryQuery): Promise<Page<TeachingDocument>>;
  /** Topics used by visible documents, sorted: they fill the library's filter. */
  listVisibleTopics(): Promise<readonly string[]>;
}

/** Write side. */
export interface DocumentWriter {
  /** Inserts or replaces the document with this id. */
  save(document: TeachingDocument): Promise<void>;
  delete(id: string): Promise<void>;
  incrementDownloads(id: string): Promise<void>;
}

export interface LeadRepository {
  save(lead: Lead): Promise<void>;
}

export interface OpenedFile {
  readonly body: ReadableStream<Uint8Array>;
  readonly contentType: string;
  readonly size: number | null;
}

/** Where the files themselves live. Today Vercel Blob; later a Russian provider (ADR-0002). */
export interface FileStorage {
  /** Stores the bytes and returns the storage's own reference for them. */
  put(file: {
    readonly data: Uint8Array;
    readonly name: string;
    readonly contentType: string;
  }): Promise<string>;
  /** Null when the reference is unknown. */
  open(ref: string): Promise<OpenedFile | null>;
  /** Removing something that is already gone is not an error. */
  remove(ref: string): Promise<void>;
}
