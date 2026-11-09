import { describe, expect, it } from "vitest";
import {
  attachFile,
  createDocument,
  createLead,
  isVisible,
  parseTopics,
  publishDocument,
  unpublishDocument,
  updateDocument,
  validateDocumentDetails,
  DOCUMENT_LIMITS,
  type DocumentDraft,
  type TeachingDocument,
} from "./teaching-document";

const NOW = new Date("2026-02-01T10:00:00Z");
const LATER = new Date("2026-02-02T10:00:00Z");

const draft: DocumentDraft = {
  title: "  Past   Simple worksheet ",
  description: " Practice of regular verbs. ",
  level: "B1",
  topics: "Grammar, Verbs ; grammar",
  type: "worksheet",
  access: "public",
};

function newDocument(): TeachingDocument {
  const result = createDocument(draft, { id: "d1", slug: "past-simple", now: NOW });
  if (!result.ok) throw result.error;
  return result.value;
}

const file = { ref: "ref-1", name: "past-simple.pdf", mime: "application/pdf", size: 10 };

describe("parseTopics", () => {
  it("splits, trims, lower-cases and removes duplicates", () => {
    expect(parseTopics("Grammar, Verbs ; grammar\n  Past   tense ")).toEqual([
      "grammar",
      "verbs",
      "past tense",
    ]);
  });

  it("returns an empty list for blank text", () => {
    expect(parseTopics(" , ;")).toEqual([]);
  });
});

describe("validateDocumentDetails", () => {
  it("cleans the text and accepts a valid draft", () => {
    const result = validateDocumentDetails(draft);
    expect(result.ok && result.value).toMatchObject({
      title: "Past Simple worksheet",
      description: "Practice of regular verbs.",
      topics: ["grammar", "verbs"],
    });
  });

  it("reports every problem at once", () => {
    const result = validateDocumentDetails({
      title: " ",
      description: "x".repeat(DOCUMENT_LIMITS.descriptionMax + 1),
      level: "D9",
      topics: "",
      type: "poem",
      access: "secret",
    });
    expect(!result.ok && result.error.fields).toEqual({
      title: "title_required",
      description: "description_too_long",
      level: "level_invalid",
      type: "type_invalid",
      access: "access_invalid",
    });
  });

  it("rejects a title that is too long", () => {
    const result = validateDocumentDetails({
      ...draft,
      title: "x".repeat(DOCUMENT_LIMITS.titleMax + 1),
    });
    expect(!result.ok && result.error.fields.title).toBe("title_too_long");
  });

  it("limits the number and the length of topics", () => {
    const many = validateDocumentDetails({
      ...draft,
      topics: Array.from({ length: DOCUMENT_LIMITS.topicsMax + 1 }, (_, i) => `t${i}`).join(","),
    });
    const long = validateDocumentDetails({ ...draft, topics: "x".repeat(41) });
    expect(!many.ok && many.error.fields.topics).toBe("topics_too_many");
    expect(!long.ok && long.error.fields.topics).toBe("topic_too_long");
  });
});

describe("document life cycle", () => {
  it("starts as an unpublished draft without a file", () => {
    expect(newDocument()).toMatchObject({
      status: "draft",
      file: null,
      publishedAt: null,
      downloadCount: 0,
    });
  });

  it("fails to create from an invalid draft", () => {
    const result = createDocument({ ...draft, title: "" }, { id: "d", slug: "s", now: NOW });
    expect(result.ok).toBe(false);
  });

  it("updates details but keeps identity, slug and status", () => {
    const result = updateDocument(newDocument(), { ...draft, title: "New title" }, LATER);
    expect(result.ok && result.value).toMatchObject({
      id: "d1",
      slug: "past-simple",
      title: "New title",
      updatedAt: LATER,
    });
  });

  it("rejects an invalid update", () => {
    expect(updateDocument(newDocument(), { ...draft, level: "?" }, LATER).ok).toBe(false);
  });

  it("cannot be published without a file", () => {
    const result = publishDocument(newDocument(), LATER);
    expect(!result.ok && result.error.fields.file).toBe("file_required_to_publish");
  });

  it("is published with a file, and the first publication date is kept", () => {
    const withFile = attachFile(newDocument(), file, NOW);
    const published = publishDocument(withFile, LATER);
    expect(published.ok && published.value).toMatchObject({
      status: "published",
      publishedAt: LATER,
    });
    if (!published.ok) throw published.error;

    const again = publishDocument(published.value, new Date("2027-01-01T00:00:00Z"));
    expect(again.ok && again.value.publishedAt).toEqual(LATER);
  });

  it("can be hidden again", () => {
    const withFile = attachFile(newDocument(), file, NOW);
    const published = publishDocument(withFile, LATER);
    if (!published.ok) throw published.error;
    expect(unpublishDocument(published.value, LATER).status).toBe("draft");
    expect(unpublishDocument(withFile, LATER)).toBe(withFile);
  });

  it("is visible only when published and equipped with a file", () => {
    const withFile = attachFile(newDocument(), file, NOW);
    const published = publishDocument(withFile, LATER);
    if (!published.ok) throw published.error;
    expect(isVisible(newDocument())).toBe(false);
    expect(isVisible(withFile)).toBe(false);
    expect(isVisible(published.value)).toBe(true);
    expect(isVisible({ ...published.value, file: null })).toBe(false);
  });
});

describe("createLead", () => {
  it("normalises the address", () => {
    const result = createLead(" Anna@Example.com ", { id: "l1", documentId: "d1", now: NOW });
    expect(result.ok && result.value).toEqual({
      id: "l1",
      email: "anna@example.com",
      documentId: "d1",
      createdAt: NOW,
    });
  });

  it("rejects a broken address", () => {
    const result = createLead("nope", { id: "l1", documentId: "d1", now: NOW });
    expect(!result.ok && result.error.fields.email).toBe("email_invalid");
  });
});
