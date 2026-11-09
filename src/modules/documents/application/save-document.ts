import { err, NotFoundError, type Clock, type IdGenerator, type Result } from "@/shared/kernel";
import type { DocumentReader, DocumentWriter, FileStorage } from "../domain/document-ports";
import { validateUpload, type UploadedFile } from "../domain/file-upload";
import { slugify } from "../domain/slug";
import {
  attachFile,
  createDocument,
  DocumentValidationError,
  updateDocument,
  validateDocumentDetails,
  type DocumentDraft,
  type TeachingDocument,
} from "../domain/teaching-document";

export interface SaveDocumentInput {
  /** Present when editing an existing document. */
  readonly id?: string;
  readonly draft: DocumentDraft;
  /** A new file; when editing, omitting it keeps the current one. */
  readonly upload?: UploadedFile;
}

/** Creates or edits a document, and stores a new file if one was chosen. */
export class SaveDocument {
  constructor(
    private readonly reader: DocumentReader,
    private readonly writer: DocumentWriter,
    private readonly storage: FileStorage,
    private readonly clock: Clock,
    private readonly ids: IdGenerator,
  ) {}

  async execute(
    input: SaveDocumentInput,
  ): Promise<Result<TeachingDocument, DocumentValidationError | NotFoundError>> {
    const existing = input.id ? await this.reader.findById(input.id) : null;
    if (input.id && !existing) return err(new NotFoundError("Document", input.id));

    // Check everything BEFORE touching storage, and report all problems at once.
    const details = validateDocumentDetails(input.draft);
    const upload = input.upload ? validateUpload(input.upload) : undefined;
    const fields = {
      ...(!details.ok ? details.error.fields : {}),
      ...(upload && !upload.ok ? upload.error.fields : {}),
    };
    if (Object.keys(fields).length > 0) return err(new DocumentValidationError(fields));

    const now = this.clock.now();
    const built = existing
      ? updateDocument(existing, input.draft, now)
      : createDocument(input.draft, {
          id: this.ids.next(),
          slug: await this.uniqueSlug(input.draft.title),
          now,
        });
    if (!built.ok) return built;

    let document = built.value;
    let newRef: string | undefined;
    if (input.upload && upload?.ok) {
      newRef = await this.storage.put({
        data: input.upload.bytes,
        name: upload.value.name,
        contentType: upload.value.mime,
      });
      document = attachFile(
        document,
        { ref: newRef, name: upload.value.name, mime: upload.value.mime, size: upload.value.size },
        now,
      );
    }

    try {
      await this.writer.save(document);
    } catch (error) {
      // Do not leave an orphaned file behind when the record could not be saved.
      if (newRef) await this.storage.remove(newRef).catch(() => undefined);
      throw error;
    }

    const replaced = existing?.file;
    if (newRef && replaced && replaced.ref !== newRef) {
      // A failure here only wastes a little storage; the document itself is already saved.
      await this.storage.remove(replaced.ref).catch(() => undefined);
    }
    return { ok: true, value: document };
  }

  private async uniqueSlug(title: string): Promise<string> {
    const base = slugify(title);
    let candidate = base;
    for (let attempt = 2; await this.reader.findBySlug(candidate); attempt += 1) {
      candidate = `${base}-${attempt}`;
    }
    return candidate;
  }
}
