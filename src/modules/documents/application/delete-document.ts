import { err, NotFoundError, ok, type Result } from "@/shared/kernel";
import type { DocumentReader, DocumentWriter, FileStorage } from "../domain/document-ports";

export class DeleteDocument {
  constructor(
    private readonly reader: DocumentReader,
    private readonly writer: DocumentWriter,
    private readonly storage: FileStorage,
  ) {}

  async execute(id: string): Promise<Result<void, NotFoundError>> {
    const document = await this.reader.findById(id);
    if (!document) return err(new NotFoundError("Document", id));

    await this.writer.delete(id);
    if (document.file) {
      // The record is already gone; a leftover file is harmless, so a failure is not fatal.
      await this.storage.remove(document.file.ref).catch(() => undefined);
    }
    return ok(undefined);
  }
}
