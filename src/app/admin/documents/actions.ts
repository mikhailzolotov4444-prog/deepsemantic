"use server";

import { redirect } from "next/navigation";
import { getContainer } from "@/composition-root/container";
import { DocumentValidationError } from "@/modules/documents/domain/teaching-document";
import type { DocumentFormState } from "@/modules/documents/ui/document-form-state";
import { requireAdmin } from "../session";

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function saveDocumentAction(
  _previous: DocumentFormState,
  formData: FormData,
): Promise<DocumentFormState> {
  await requireAdmin();

  const values = {
    title: text(formData, "title"),
    description: text(formData, "description"),
    level: text(formData, "level"),
    topics: text(formData, "topics"),
    type: text(formData, "type"),
    access: text(formData, "access"),
  };
  const id = text(formData, "id") || undefined;
  const publish = text(formData, "intent") === "publish";
  const file = formData.get("file");
  const upload =
    file instanceof File && file.size > 0
      ? { name: file.name, bytes: new Uint8Array(await file.arrayBuffer()) }
      : undefined;

  const { documents } = getContainer();
  let savedId = "";
  let published = false;
  try {
    const saved = await documents.save.execute({
      ...(id ? { id } : {}),
      draft: values,
      ...(upload ? { upload } : {}),
    });
    if (!saved.ok) {
      return {
        status: "error",
        notice: saved.error instanceof DocumentValidationError ? "validation" : "not_found",
        fieldErrors: saved.error instanceof DocumentValidationError ? saved.error.fields : {},
        values,
      };
    }
    savedId = saved.value.id;
    if (publish) {
      published = (await documents.setStatus.execute({ id: savedId, status: "published" })).ok;
    }
  } catch (error) {
    console.error("Saving a document failed", error);
    return { status: "error", notice: "unknown", fieldErrors: {}, values };
  }

  // redirect() works by throwing, so it stays outside the try block.
  if (publish && !published) redirect(`/admin/documents/${savedId}?notice=no_file`);
  redirect(`/admin?notice=${publish ? "published" : "saved"}`);
}

export async function setDocumentStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = text(formData, "id");
  const status = text(formData, "status") === "published" ? "published" : "draft";

  const result = await getContainer().documents.setStatus.execute({ id, status });
  if (!result.ok) {
    redirect(
      `/admin?notice=${result.error instanceof DocumentValidationError ? "no_file" : "not_found"}`,
    );
  }
  redirect(`/admin?notice=${status === "published" ? "published" : "hidden"}`);
}

export async function deleteDocumentAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const result = await getContainer().documents.remove.execute(text(formData, "id"));
  redirect(`/admin?notice=${result.ok ? "deleted" : "not_found"}`);
}
