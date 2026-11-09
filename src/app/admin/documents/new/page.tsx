import type { Metadata } from "next";
import { DocumentForm } from "@/modules/documents/ui/document-form";
import { emptyDocumentValues } from "@/modules/documents/ui/document-form-state";
import { AdminShell } from "../../admin-shell";
import { requireAdmin } from "../../session";
import { saveDocumentAction } from "../actions";

export const metadata: Metadata = { title: "Новый материал" };

export default async function NewDocumentPage() {
  await requireAdmin();
  return (
    <AdminShell title="Новый материал">
      <div className="max-w-2xl">
        <DocumentForm action={saveDocumentAction} initial={emptyDocumentValues} />
      </div>
    </AdminShell>
  );
}
