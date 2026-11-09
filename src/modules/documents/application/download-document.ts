import {
  err,
  ForbiddenError,
  NotFoundError,
  ok,
  UnauthorizedError,
  type Clock,
  type IdGenerator,
  type Result,
} from "@/shared/kernel";
import type { TokenSigner } from "@/shared/security/token-signer";
import type {
  DocumentReader,
  DocumentWriter,
  FileStorage,
  LeadRepository,
} from "../domain/document-ports";
import { createLead, isVisible, type DocumentValidationError } from "../domain/teaching-document";

export const DOWNLOAD_TOKEN_TTL_SECONDS = 10 * 60;
const TOKEN_PURPOSE = "download";

/**
 * Step 1: decides whether this visitor may download and, if so, hands out a short-lived token.
 * Public: always. Email: after leaving a valid address (stored as a lead). Paid: not yet.
 */
export class IssueDownloadLink {
  constructor(
    private readonly reader: DocumentReader,
    private readonly leads: LeadRepository,
    private readonly signer: TokenSigner,
    private readonly clock: Clock,
    private readonly ids: IdGenerator,
  ) {}

  async execute(input: {
    readonly slug: string;
    readonly email?: string;
  }): Promise<Result<string, NotFoundError | ForbiddenError | DocumentValidationError>> {
    const document = await this.reader.findBySlug(input.slug);
    if (!document || !isVisible(document)) return err(new NotFoundError("Document", input.slug));

    if (document.access === "paid") {
      return err(new ForbiddenError("This material has to be purchased"));
    }
    if (document.access === "email") {
      const lead = createLead(input.email ?? "", {
        id: this.ids.next(),
        documentId: document.id,
        now: this.clock.now(),
      });
      if (!lead.ok) return lead;
      await this.leads.save(lead.value);
    }

    return ok(
      await this.signer.sign({ p: TOKEN_PURPOSE, d: document.id }, DOWNLOAD_TOKEN_TTL_SECONDS),
    );
  }
}

export interface DownloadStream {
  readonly fileName: string;
  readonly contentType: string;
  readonly size: number | null;
  readonly body: ReadableStream<Uint8Array>;
}

/** Step 2: checks the token and streams the file; counts the download. */
export class OpenDownload {
  constructor(
    private readonly reader: DocumentReader,
    private readonly writer: DocumentWriter,
    private readonly storage: FileStorage,
    private readonly signer: TokenSigner,
  ) {}

  async execute(token: string): Promise<Result<DownloadStream, UnauthorizedError | NotFoundError>> {
    const payload = await this.signer.verify(token);
    if (!payload || payload.p !== TOKEN_PURPOSE || !payload.d) {
      return err(new UnauthorizedError("The download link is invalid or has expired"));
    }

    const document = await this.reader.findById(payload.d);
    if (!document || !isVisible(document) || !document.file) {
      return err(new NotFoundError("Document", payload.d));
    }

    const opened = await this.storage.open(document.file.ref);
    if (!opened) return err(new NotFoundError("File", document.file.name));

    await this.writer.incrementDownloads(document.id);
    return ok({
      fileName: document.file.name,
      contentType: document.file.mime,
      size: opened.size ?? document.file.size,
      body: opened.body,
    });
  }
}
