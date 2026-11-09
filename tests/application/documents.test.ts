import { describe, expect, it } from "vitest";
import { DeleteDocument } from "@/modules/documents/application/delete-document";
import {
  GetPublishedDocument,
  SearchLibrary,
} from "@/modules/documents/application/document-queries";
import { IssueDownloadLink, OpenDownload } from "@/modules/documents/application/download-document";
import { SaveDocument } from "@/modules/documents/application/save-document";
import { SetDocumentStatus } from "@/modules/documents/application/set-document-status";
import { parseLibraryQuery } from "@/modules/documents/domain/library-query";
import type { DocumentDraft } from "@/modules/documents/domain/teaching-document";
import {
  InMemoryDocumentRepository,
  InMemoryLeadRepository,
} from "@/modules/documents/infrastructure/in-memory-document-repository";
import { InMemoryFileStorage } from "@/modules/documents/infrastructure/in-memory-file-storage";
import { FixedClock, SequentialIdGenerator } from "@/shared/kernel";
import { HmacTokenSigner } from "@/shared/security/token-signer";

const draft: DocumentDraft = {
  title: "Past Simple",
  description: "Verbs in the past",
  level: "B1",
  topics: "grammar",
  type: "worksheet",
  access: "public",
};
const pdf = new TextEncoder().encode("%PDF-1.7 content");
const upload = { name: "Past Simple.pdf", bytes: pdf };

function setup() {
  const repository = new InMemoryDocumentRepository();
  const leads = new InMemoryLeadRepository();
  const storage = new InMemoryFileStorage();
  const clock = new FixedClock("2026-03-01T10:00:00Z");
  const ids = new SequentialIdGenerator("id");
  const signer = new HmacTokenSigner("0123456789abcdef0123456789abcdef", clock);
  return {
    repository,
    leads,
    storage,
    clock,
    save: new SaveDocument(repository, repository, storage, clock, ids),
    setStatus: new SetDocumentStatus(repository, repository, clock),
    remove: new DeleteDocument(repository, repository, storage),
    search: new SearchLibrary(repository),
    getPublished: new GetPublishedDocument(repository),
    issue: new IssueDownloadLink(repository, leads, signer, clock, ids),
    open: new OpenDownload(repository, repository, storage, signer),
  };
}

async function publishedDocument(
  app: ReturnType<typeof setup>,
  overrides: Partial<DocumentDraft> = {},
) {
  const saved = await app.save.execute({ draft: { ...draft, ...overrides }, upload });
  if (!saved.ok) throw saved.error;
  const published = await app.setStatus.execute({ id: saved.value.id, status: "published" });
  if (!published.ok) throw published.error;
  return published.value;
}

describe("SaveDocument", () => {
  it("creates a draft with a stored file and a readable address", async () => {
    const app = setup();
    const result = await app.save.execute({ draft, upload });
    expect(result.ok && result.value).toMatchObject({
      slug: "past-simple",
      status: "draft",
      file: { name: "past-simple.pdf", mime: "application/pdf", size: pdf.byteLength },
    });
    expect(app.storage.count).toBe(1);
  });

  it("gives equal titles different addresses", async () => {
    const app = setup();
    await app.save.execute({ draft });
    const second = await app.save.execute({ draft });
    expect(second.ok && second.value.slug).toBe("past-simple-2");
  });

  it("reports document and file problems together and stores nothing", async () => {
    const app = setup();
    const result = await app.save.execute({
      draft: { ...draft, title: "" },
      upload: { name: "x.exe", bytes: new TextEncoder().encode("MZ") },
    });
    expect(!result.ok && result.error).toMatchObject({
      fields: { title: "title_required", file: "file_type_not_allowed" },
    });
    expect(app.storage.count).toBe(0);
    expect(await app.repository.listAll()).toHaveLength(0);
  });

  it("edits details and keeps the file when no new one is chosen", async () => {
    const app = setup();
    const created = await app.save.execute({ draft, upload });
    if (!created.ok) throw created.error;
    const edited = await app.save.execute({
      id: created.value.id,
      draft: { ...draft, title: "Renamed" },
    });
    expect(edited.ok && edited.value).toMatchObject({
      title: "Renamed",
      slug: "past-simple",
      file: created.value.file,
    });
  });

  it("replaces the file and removes the old one from storage", async () => {
    const app = setup();
    const created = await app.save.execute({ draft, upload });
    if (!created.ok || !created.value.file) throw new Error("setup failed");
    const oldRef = created.value.file.ref;

    const edited = await app.save.execute({ id: created.value.id, draft, upload });
    expect(edited.ok && edited.value.file?.ref).not.toBe(oldRef);
    expect(app.storage.has(oldRef)).toBe(false);
    expect(app.storage.count).toBe(1);
  });

  it("refuses to edit a document that does not exist", async () => {
    const result = await setup().save.execute({ id: "ghost", draft });
    expect(!result.ok && result.error.code).toBe("not_found");
  });

  it("removes the new file again when the record cannot be saved", async () => {
    const app = setup();
    const failing = new SaveDocument(
      app.repository,
      {
        save: async () => {
          throw new Error("database down");
        },
        delete: async () => undefined,
        incrementDownloads: async () => undefined,
      },
      app.storage,
      app.clock,
      new SequentialIdGenerator("x"),
    );
    await expect(failing.execute({ draft, upload })).rejects.toThrow("database down");
    expect(app.storage.count).toBe(0);
  });
});

describe("SetDocumentStatus", () => {
  it("refuses to publish a document without a file", async () => {
    const app = setup();
    const created = await app.save.execute({ draft });
    if (!created.ok) throw created.error;
    const result = await app.setStatus.execute({ id: created.value.id, status: "published" });
    expect(!result.ok && result.error.code).toBe("validation_failed");
  });

  it("publishes and hides again", async () => {
    const app = setup();
    const published = await publishedDocument(app);
    expect(published.status).toBe("published");
    const hidden = await app.setStatus.execute({ id: published.id, status: "draft" });
    expect(hidden.ok && hidden.value.status).toBe("draft");
  });

  it("reports an unknown document", async () => {
    const result = await setup().setStatus.execute({ id: "ghost", status: "published" });
    expect(!result.ok && result.error.code).toBe("not_found");
  });
});

describe("DeleteDocument", () => {
  it("removes the record and its file", async () => {
    const app = setup();
    const document = await publishedDocument(app);
    expect((await app.remove.execute(document.id)).ok).toBe(true);
    expect(await app.repository.findById(document.id)).toBeNull();
    expect(app.storage.count).toBe(0);
  });

  it("deletes a document that never had a file", async () => {
    const app = setup();
    const created = await app.save.execute({ draft });
    if (!created.ok) throw created.error;
    expect((await app.remove.execute(created.value.id)).ok).toBe(true);
  });

  it("reports an unknown document", async () => {
    const result = await setup().remove.execute("ghost");
    expect(!result.ok && result.error.code).toBe("not_found");
  });
});

describe("library", () => {
  it("shows published documents and their topics, hides drafts", async () => {
    const app = setup();
    await publishedDocument(app);
    await app.save.execute({ draft: { ...draft, title: "Hidden", topics: "secret" }, upload });

    const result = await app.search.execute(parseLibraryQuery({}));
    expect(result.documents.items.map((item) => item.title)).toEqual(["Past Simple"]);
    expect(result.topics).toEqual(["grammar"]);
  });

  it("finds a published document by address, but not a draft", async () => {
    const app = setup();
    await publishedDocument(app);
    const draftOnly = await app.save.execute({ draft: { ...draft, title: "Other" }, upload });
    if (!draftOnly.ok) throw draftOnly.error;

    expect((await app.getPublished.execute("past-simple")).ok).toBe(true);
    expect((await app.getPublished.execute("other")).ok).toBe(false);
    expect((await app.getPublished.execute("ghost")).ok).toBe(false);
  });
});

describe("downloads", () => {
  it("lets anyone download a public document and counts it", async () => {
    const app = setup();
    const document = await publishedDocument(app);

    const token = await app.issue.execute({ slug: document.slug });
    if (!token.ok) throw token.error;
    const opened = await app.open.execute(token.value);

    expect(opened.ok && opened.value).toMatchObject({
      fileName: "past-simple.pdf",
      contentType: "application/pdf",
    });
    expect((await app.repository.findById(document.id))?.downloadCount).toBe(1);
  });

  it("asks for an email before an email-gated download and stores the lead", async () => {
    const app = setup();
    const document = await publishedDocument(app, { access: "email" });

    const without = await app.issue.execute({ slug: document.slug });
    expect(!without.ok && without.error.code).toBe("validation_failed");
    expect(app.leads.leads).toHaveLength(0);

    const withEmail = await app.issue.execute({ slug: document.slug, email: " Anna@Example.com" });
    expect(withEmail.ok).toBe(true);
    expect(app.leads.leads).toMatchObject([{ email: "anna@example.com", documentId: document.id }]);
  });

  it("does not hand out paid documents yet", async () => {
    const app = setup();
    const document = await publishedDocument(app, { access: "paid" });
    const result = await app.issue.execute({ slug: document.slug });
    expect(!result.ok && result.error.code).toBe("forbidden");
  });

  it("does not hand out drafts or unknown documents", async () => {
    const app = setup();
    const created = await app.save.execute({ draft, upload });
    if (!created.ok) throw created.error;
    expect((await app.issue.execute({ slug: created.value.slug })).ok).toBe(false);
    expect((await app.issue.execute({ slug: "ghost" })).ok).toBe(false);
  });

  it("rejects forged and expired tokens", async () => {
    const app = setup();
    const document = await publishedDocument(app);
    const token = await app.issue.execute({ slug: document.slug });
    if (!token.ok) throw token.error;

    expect((await app.open.execute("garbage")).ok).toBe(false);
    app.clock.advanceMs(11 * 60 * 1000);
    const late = await app.open.execute(token.value);
    expect(!late.ok && late.error.code).toBe("unauthorized");
  });

  it("stops serving a document that was hidden after the link was issued", async () => {
    const app = setup();
    const document = await publishedDocument(app);
    const token = await app.issue.execute({ slug: document.slug });
    if (!token.ok) throw token.error;
    await app.setStatus.execute({ id: document.id, status: "draft" });

    const result = await app.open.execute(token.value);
    expect(!result.ok && result.error.code).toBe("not_found");
  });

  it("reports a missing file in storage", async () => {
    const app = setup();
    const document = await publishedDocument(app);
    const token = await app.issue.execute({ slug: document.slug });
    if (!token.ok || !document.file) throw new Error("setup failed");
    await app.storage.remove(document.file.ref);

    const result = await app.open.execute(token.value);
    expect(!result.ok && result.error.code).toBe("not_found");
  });
});
