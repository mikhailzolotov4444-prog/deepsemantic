import { err, NotFoundError, ok, type Clock, type Result } from "@/shared/kernel";
import type { DocumentReader, DocumentWriter } from "../domain/document-ports";
import {
  publishDocument,
  unpublishDocument,
  type DocumentValidationError,
  type TeachingDocument,
} from "../domain/teaching-document";

export class SetDocumentStatus {
  constructor(
    private readonly reader: DocumentReader,
    private readonly writer: DocumentWriter,
    private readonly clock: Clock,
  ) {}

  async execute(input: {
    readonly id: string;
    readonly status: "published" | "draft";
  }): Promise<Result<TeachingDocument, NotFoundError | DocumentValidationError>> {
    const document = await this.reader.findById(input.id);
    if (!document) return err(new NotFoundError("Document", input.id));

    const now = this.clock.now();
    const changed =
      input.status === "published"
        ? publishDocument(document, now)
        : ok(unpublishDocument(document, now));
    if (!changed.ok) return changed;

    await this.writer.save(changed.value);
    return changed;
  }
}
