import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getContainer } from "@/composition-root/container";
import { DocumentForm } from "@/modules/documents/ui/document-form";
import { Button, buttonVariants } from "@/shared/ui/button";
import { AdminShell } from "../../admin-shell";
import { adminNotices } from "../../notices";
import { requireAdmin } from "../../session";
import { deleteDocumentAction, saveDocumentAction } from "../actions";

export const metadata: Metadata = { title: "Изменить материал" };
export const dynamic = "force-dynamic";

export default async function EditDocumentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string; delete?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { notice, delete: confirmDelete } = await searchParams;

  const result = await getContainer().documents.getForAdmin.execute(id);
  if (!result.ok) notFound();
  const document = result.value;

  return (
    <AdminShell title="Изменить материал">
      <div className="max-w-2xl">
        {notice && adminNotices[notice] ? (
          <p role="status" className="mb-6 rounded-md bg-accent p-3 text-sm text-accent-foreground">
            {adminNotices[notice]}
          </p>
        ) : null}

        <DocumentForm
          action={saveDocumentAction}
          id={document.id}
          initial={{
            title: document.title,
            description: document.description,
            level: document.level,
            topics: document.topics.join(", "),
            type: document.type,
            access: document.access,
          }}
          {...(document.file ? { currentFile: document.file } : {})}
        />

        <section aria-labelledby="delete-heading" className="mt-12 border-t border-border pt-6">
          <h2 id="delete-heading" className="text-lg font-semibold">
            Удаление
          </h2>
          {confirmDelete ? (
            <form action={deleteDocumentAction} className="mt-3 space-y-3">
              <input type="hidden" name="id" value={document.id} />
              <p className="text-sm">
                Удалить «{document.title}» вместе с файлом? Это нельзя отменить.
              </p>
              <div className="flex gap-3">
                <Button type="submit" variant="outline">
                  Да, удалить
                </Button>
                <Link
                  href={`/admin/documents/${document.id}`}
                  className={buttonVariants({ variant: "ghost" })}
                >
                  Отмена
                </Link>
              </div>
            </form>
          ) : (
            <Link
              href={`/admin/documents/${document.id}?delete=1`}
              className={`${buttonVariants({ variant: "outline" })} mt-3`}
            >
              Удалить материал
            </Link>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
