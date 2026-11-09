import { describe, expect, it } from "vitest";
import type { DocumentReader, DocumentWriter } from "@/modules/documents/domain/document-ports";
import type { TeachingDocument } from "@/modules/documents/domain/teaching-document";

export interface DocumentRepositoryHarness {
  readonly reader: DocumentReader;
  readonly writer: DocumentWriter;
}

const base: TeachingDocument = {
  id: "d1",
  slug: "past-simple",
  title: "Past Simple worksheet",
  description: "Regular and irregular verbs",
  level: "B1",
  topics: ["grammar", "verbs"],
  type: "worksheet",
  access: "public",
  status: "published",
  file: { ref: "ref-1", name: "past-simple.pdf", mime: "application/pdf", size: 100 },
  createdAt: new Date("2026-03-01T10:00:00Z"),
  updatedAt: new Date("2026-03-01T10:00:00Z"),
  publishedAt: new Date("2026-03-01T10:00:00Z"),
  downloadCount: 0,
};

const make = (overrides: Partial<TeachingDocument>): TeachingDocument => ({
  ...base,
  ...overrides,
});

const query = { page: 1, pageSize: 10 } as const;

/** Every DocumentReader + DocumentWriter pair (in memory, Drizzle, ...) must pass these tests. */
export function runDocumentRepositoryContract(
  name: string,
  createHarness: () => Promise<DocumentRepositoryHarness> | DocumentRepositoryHarness,
): void {
  describe(`Document repository contract: ${name}`, () => {
    it("reads a saved document back unchanged, by id and by slug", async () => {
      const { reader, writer } = await createHarness();
      await writer.save(base);
      expect(await reader.findById("d1")).toEqual(base);
      expect(await reader.findBySlug("past-simple")).toEqual(base);
      expect(await reader.findById("nope")).toBeNull();
    });

    it("replaces a document that is saved again, and can forget a missing file", async () => {
      const { reader, writer } = await createHarness();
      await writer.save(base);
      await writer.save({ ...base, title: "Changed", file: null, status: "draft" });
      expect(await reader.findById("d1")).toMatchObject({ title: "Changed", file: null });
      expect(await reader.listAll()).toHaveLength(1);
    });

    it("deletes documents", async () => {
      const { reader, writer } = await createHarness();
      await writer.save(base);
      await writer.delete("d1");
      expect(await reader.findById("d1")).toBeNull();
    });

    it("counts downloads", async () => {
      const { reader, writer } = await createHarness();
      await writer.save(base);
      await writer.incrementDownloads("d1");
      await writer.incrementDownloads("d1");
      expect((await reader.findById("d1"))?.downloadCount).toBe(2);
    });

    it("lists everything for the admin, drafts included", async () => {
      const { reader, writer } = await createHarness();
      await writer.save(base);
      await writer.save(make({ id: "d2", slug: "draft", status: "draft", publishedAt: null }));
      expect(await reader.listAll()).toHaveLength(2);
    });

    it("shows visitors only published documents that have a file", async () => {
      const { reader, writer } = await createHarness();
      await writer.save(base);
      await writer.save(make({ id: "d2", slug: "draft", status: "draft", publishedAt: null }));
      await writer.save(make({ id: "d3", slug: "no-file", file: null }));
      const result = await reader.search(query);
      expect(result.items.map((item) => item.id)).toEqual(["d1"]);
      expect(result.total).toBe(1);
    });

    it("filters by level, type, topic and text", async () => {
      const { reader, writer } = await createHarness();
      await writer.save(base);
      await writer.save(
        make({
          id: "d2",
          slug: "conditionals",
          title: "Conditionals guide",
          description: "If clauses",
          level: "B2",
          type: "guide",
          topics: ["grammar"],
        }),
      );
      const ids = async (filter: object) =>
        (await reader.search({ ...query, ...filter })).items.map((item) => item.id);

      expect(await ids({ level: "B2" })).toEqual(["d2"]);
      expect(await ids({ type: "worksheet" })).toEqual(["d1"]);
      expect(await ids({ topic: "verbs" })).toEqual(["d1"]);
      expect((await ids({ topic: "grammar" })).sort()).toEqual(["d1", "d2"]);
      expect(await ids({ text: "CONDITION" })).toEqual(["d2"]);
      expect(await ids({ text: "irregular" })).toEqual(["d1"]);
      expect(await ids({ text: "100%" })).toEqual([]);
    });

    it("puts the newest published document first and paginates", async () => {
      const { reader, writer } = await createHarness();
      await writer.save(make({ id: "old", slug: "old", publishedAt: new Date("2026-01-01") }));
      await writer.save(make({ id: "mid", slug: "mid", publishedAt: new Date("2026-02-01") }));
      await writer.save(make({ id: "new", slug: "new", publishedAt: new Date("2026-03-01") }));

      const first = await reader.search({ page: 1, pageSize: 2 });
      const second = await reader.search({ page: 2, pageSize: 2 });
      expect(first.items.map((item) => item.id)).toEqual(["new", "mid"]);
      expect(second.items.map((item) => item.id)).toEqual(["old"]);
      expect(first.total).toBe(3);
    });

    it("lists the topics of visible documents once, sorted", async () => {
      const { reader, writer } = await createHarness();
      await writer.save(base);
      await writer.save(make({ id: "d2", slug: "b", topics: ["grammar", "a-topic"] }));
      await writer.save(
        make({ id: "d3", slug: "c", topics: ["secret"], status: "draft", publishedAt: null }),
      );
      expect(await reader.listVisibleTopics()).toEqual(["a-topic", "grammar", "verbs"]);
    });
  });
}
