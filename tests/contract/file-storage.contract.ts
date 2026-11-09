import { describe, expect, it } from "vitest";
import type { FileStorage } from "@/modules/documents/domain/document-ports";

async function readAll(stream: ReadableStream<Uint8Array>): Promise<Uint8Array> {
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** Every FileStorage implementation (in memory, Vercel Blob, Yandex, ...) must pass these tests. */
export function runFileStorageContract(name: string, createStorage: () => FileStorage): void {
  describe(`FileStorage contract: ${name}`, () => {
    const data = new TextEncoder().encode("%PDF-1.7 hello");

    it("returns the same bytes that were stored", async () => {
      const storage = createStorage();
      const ref = await storage.put({ data, name: "a.pdf", contentType: "application/pdf" });
      const opened = await storage.open(ref);
      expect(opened?.contentType).toBe("application/pdf");
      expect(await readAll(opened!.body)).toEqual(data);
    });

    it("gives different references to different files", async () => {
      const storage = createStorage();
      const first = await storage.put({ data, name: "a.pdf", contentType: "application/pdf" });
      const second = await storage.put({ data, name: "a.pdf", contentType: "application/pdf" });
      expect(first).not.toBe(second);
    });

    it("returns null for an unknown reference", async () => {
      expect(await createStorage().open("unknown")).toBeNull();
    });

    it("removes files, and removing twice is harmless", async () => {
      const storage = createStorage();
      const ref = await storage.put({ data, name: "a.pdf", contentType: "application/pdf" });
      await storage.remove(ref);
      await storage.remove(ref);
      expect(await storage.open(ref)).toBeNull();
    });
  });
}
