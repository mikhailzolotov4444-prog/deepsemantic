import type { DocumentField, DocumentFieldError } from "../domain/teaching-document";

export interface DocumentFormValues {
  readonly title: string;
  readonly description: string;
  readonly level: string;
  readonly topics: string;
  readonly type: string;
  readonly access: string;
}

export interface DocumentFormState {
  readonly status: "idle" | "error";
  readonly notice?: "validation" | "not_found" | "unknown";
  readonly fieldErrors: Partial<Record<DocumentField, DocumentFieldError>>;
  /** Echoed back so the owner does not have to retype everything after a mistake. */
  readonly values: DocumentFormValues;
}

export const emptyDocumentValues: DocumentFormValues = {
  title: "",
  description: "",
  level: "A1",
  topics: "",
  type: "worksheet",
  access: "public",
};

export function initialDocumentFormState(
  values: DocumentFormValues = emptyDocumentValues,
): DocumentFormState {
  return { status: "idle", fieldErrors: {}, values };
}
