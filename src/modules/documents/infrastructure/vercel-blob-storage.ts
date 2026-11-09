import { del, put } from "@vercel/blob";
import type { FileStorage, OpenedFile } from "../domain/document-ports";

const BLOB_HOST_SUFFIX = ".blob.vercel-storage.com";

/**
 * Stores files in Vercel Blob. Blob addresses are public but unguessable (random suffix), and
 * this app never shows them: visitors download through a signed link, the server fetches the file.
 */
export class VercelBlobStorage implements FileStorage {
  constructor(
    private readonly token: string,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async put(file: {
    readonly data: Uint8Array;
    readonly name: string;
    readonly contentType: string;
  }): Promise<string> {
    const blob = await put(
      `documents/${file.name}`,
      new Blob([new Uint8Array(file.data)], { type: file.contentType }),
      { access: "public", addRandomSuffix: true, contentType: file.contentType, token: this.token },
    );
    return blob.url;
  }

  async open(ref: string): Promise<OpenedFile | null> {
    if (!this.isBlobAddress(ref)) return null;
    const doFetch = this.fetchImpl;
    const response = await doFetch(ref);
    if (!response.ok || !response.body) return null;
    const length = Number(response.headers.get("content-length"));
    return {
      body: response.body,
      contentType: response.headers.get("content-type") ?? "application/octet-stream",
      size: Number.isFinite(length) && length > 0 ? length : null,
    };
  }

  async remove(ref: string): Promise<void> {
    if (this.isBlobAddress(ref)) await del(ref, { token: this.token });
  }

  /** Defence in depth: the server only ever fetches addresses that point at Vercel Blob. */
  private isBlobAddress(ref: string): boolean {
    try {
      const url = new URL(ref);
      return url.protocol === "https:" && url.hostname.endsWith(BLOB_HOST_SUFFIX);
    } catch {
      return false;
    }
  }
}
