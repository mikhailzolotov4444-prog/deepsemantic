import { describe, expect, it } from "vitest";
import { safeFileName, sniffFileKind, validateUpload } from "./file-upload";
import { DOCUMENT_LIMITS } from "./teaching-document";

const text = (value: string) => new TextEncoder().encode(value);
const pdf = text("%PDF-1.7\nbody");
const docx = text("PK\u0003\u0004....word/document.xml....");
const otherZip = text("PK\u0003\u0004....xl/workbook.xml....");

describe("sniffFileKind", () => {
  it("recognises PDF and DOCX by content", () => {
    expect(sniffFileKind(pdf)).toBe("pdf");
    expect(sniffFileKind(docx)).toBe("docx");
  });

  it("rejects other zip files, scripts and empty input", () => {
    expect(sniffFileKind(otherZip)).toBeNull();
    expect(sniffFileKind(text("<script>alert(1)</script>"))).toBeNull();
    expect(sniffFileKind(new Uint8Array())).toBeNull();
  });
});

describe("safeFileName", () => {
  it("keeps only safe characters and sets the extension from the real type", () => {
    expect(safeFileName("../My Worksheet (final).EXE", "pdf")).toBe("my-worksheet-final.pdf");
  });

  it("falls back to a default name", () => {
    expect(safeFileName("тест.pdf", "pdf")).toBe("document.pdf");
  });
});

describe("validateUpload", () => {
  it("accepts a real PDF and reports its true type", () => {
    const result = validateUpload({ name: "Lesson 1.docx", bytes: pdf });
    expect(result.ok && result.value).toEqual({
      kind: "pdf",
      mime: "application/pdf",
      size: pdf.byteLength,
      name: "lesson-1.pdf",
    });
  });

  it("accepts a DOCX", () => {
    const result = validateUpload({ name: "a.docx", bytes: docx });
    expect(result.ok && result.value.mime).toContain("wordprocessingml");
  });

  it("rejects an empty file", () => {
    const result = validateUpload({ name: "a.pdf", bytes: new Uint8Array() });
    expect(!result.ok && result.error.fields.file).toBe("file_empty");
  });

  it("rejects a file that is too large", () => {
    const big = new Uint8Array(DOCUMENT_LIMITS.fileMaxBytes + 1);
    big.set(pdf);
    const result = validateUpload({ name: "a.pdf", bytes: big });
    expect(!result.ok && result.error.fields.file).toBe("file_too_large");
  });

  it("rejects an unsupported type even if the name says pdf", () => {
    const result = validateUpload({ name: "a.pdf", bytes: text("MZ not a pdf") });
    expect(!result.ok && result.error.fields.file).toBe("file_type_not_allowed");
  });
});
