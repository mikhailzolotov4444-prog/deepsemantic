import { err, ok, type Result } from "@/shared/kernel";
import { DOCUMENT_LIMITS, DocumentValidationError } from "./teaching-document";

export type AllowedFileKind = "pdf" | "docx";

const MIME_BY_KIND: Record<AllowedFileKind, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

/** A file as it arrives from a form: a name chosen by the user and raw bytes. */
export interface UploadedFile {
  readonly name: string;
  readonly bytes: Uint8Array;
}

export interface ValidatedUpload {
  readonly kind: AllowedFileKind;
  readonly mime: string;
  readonly size: number;
  /** Safe to use in a storage path and in a download header. */
  readonly name: string;
}

/**
 * Recognises the file by its CONTENT, because the name and the declared type can be faked.
 * PDF starts with "%PDF-"; DOCX is a zip archive that contains "word/document.xml".
 */
export function sniffFileKind(bytes: Uint8Array): AllowedFileKind | null {
  const startsWith = (...values: number[]) =>
    values.every((value, index) => bytes[index] === value);

  if (startsWith(0x25, 0x50, 0x44, 0x46, 0x2d)) return "pdf";
  if (startsWith(0x50, 0x4b, 0x03, 0x04)) {
    return new TextDecoder("latin1").decode(bytes).includes("word/document.xml") ? "docx" : null;
  }
  return null;
}

export function safeFileName(original: string, kind: AllowedFileKind): string {
  const base = original
    .replace(/\.[^.]*$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${base || "document"}.${kind}`;
}

export function validateUpload(
  upload: UploadedFile,
): Result<ValidatedUpload, DocumentValidationError> {
  if (upload.bytes.byteLength === 0)
    return err(new DocumentValidationError({ file: "file_empty" }));
  if (upload.bytes.byteLength > DOCUMENT_LIMITS.fileMaxBytes) {
    return err(new DocumentValidationError({ file: "file_too_large" }));
  }
  const kind = sniffFileKind(upload.bytes);
  if (!kind) return err(new DocumentValidationError({ file: "file_type_not_allowed" }));

  return ok({
    kind,
    mime: MIME_BY_KIND[kind],
    size: upload.bytes.byteLength,
    name: safeFileName(upload.name, kind),
  });
}
