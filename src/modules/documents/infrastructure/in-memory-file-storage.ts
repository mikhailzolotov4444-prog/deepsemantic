import type { FileStorage, OpenedFile } from "../domain/document-ports";

interface StoredEntry {
  readonly data: Uint8Array;
  readonly contentType: string;
}

/** Keeps files in memory: for tests and for working locally without Vercel Blob. */
export class InMemoryFileStorage implements FileStorage {
  private readonly files = new Map<string, StoredEntry>();
  private counter = 0;

  async put(file: {
    readonly data: Uint8Array;
    readonly name: string;
    readonly contentType: string;
  }): Promise<string> {
    this.counter += 1;
    const ref = `memory://${this.counter}/${file.name}`;
    this.files.set(ref, { data: file.data, contentType: file.contentType });
    return ref;
  }

  async open(ref: string): Promise<OpenedFile | null> {
    const entry = this.files.get(ref);
    if (!entry) return null;
    const bytes = new Uint8Array(entry.data);
    return {
      body: new Blob([bytes]).stream(),
      contentType: entry.contentType,
      size: bytes.byteLength,
    };
  }

  async remove(ref: string): Promise<void> {
    this.files.delete(ref);
  }

  has(ref: string): boolean {
    return this.files.has(ref);
  }

  get count(): number {
    return this.files.size;
  }
}
