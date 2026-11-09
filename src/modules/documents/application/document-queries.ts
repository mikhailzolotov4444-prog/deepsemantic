import { err, NotFoundError, ok, type Page, type Result } from "@/shared/kernel";
import type { DocumentReader } from "../domain/document-ports";
import type { LibraryQuery } from "../domain/library-query";
import { isVisible, type TeachingDocument } from "../domain/teaching-document";

/** Admin: everything, drafts included. */
export class ListAllDocuments {
  constructor(private readonly reader: DocumentReader) {}

  execute(): Promise<readonly TeachingDocument[]> {
    return this.reader.listAll();
  }
}

export class GetDocumentForAdmin {
  constructor(private readonly reader: DocumentReader) {}

  async execute(id: string): Promise<Result<TeachingDocument, NotFoundError>> {
    const document = await this.reader.findById(id);
    return document ? ok(document) : err(new NotFoundError("Document", id));
  }
}

export interface LibraryResult {
  readonly documents: Page<TeachingDocument>;
  readonly topics: readonly string[];
}

/** Public library: search and filters over visible documents. */
export class SearchLibrary {
  constructor(private readonly reader: DocumentReader) {}

  async execute(query: LibraryQuery): Promise<LibraryResult> {
    const [documents, topics] = await Promise.all([
      this.reader.search(query),
      this.reader.listVisibleTopics(),
    ]);
    return { documents, topics };
  }
}

/** A draft or file-less document behaves as if it did not exist. */
export class GetPublishedDocument {
  constructor(private readonly reader: DocumentReader) {}

  async execute(slug: string): Promise<Result<TeachingDocument, NotFoundError>> {
    const document = await this.reader.findBySlug(slug);
    return document && isVisible(document)
      ? ok(document)
      : err(new NotFoundError("Document", slug));
  }
}
