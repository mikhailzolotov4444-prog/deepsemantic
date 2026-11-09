import type { Metadata } from "next";
import Link from "next/link";
import { getContainer } from "@/composition-root/container";
import { documentAccessLabelsRu, documentTypeLabelsRu } from "@/modules/documents/ui/labels-ru";
import { Button, buttonVariants } from "@/shared/ui/button";
import { AdminShell } from "./admin-shell";
import { setDocumentStatusAction } from "./documents/actions";
import { adminNotices } from "./notices";
import { requireAdmin } from "./session";

export const metadata: Metadata = { title: "Материалы" };
// Always fresh: the list changes whenever the owner edits something.
export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium",
  timeZone: "Europe/Moscow",
});

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  await requireAdmin();
  const { notice } = await searchParams;
  const documents = await getContainer().documents.listAll.execute();

  return (
    <AdminShell title="Материалы">
      {notice && adminNotices[notice] ? (
        <p role="status" className="mb-6 rounded-md bg-accent p-3 text-sm text-accent-foreground">
          {adminNotices[notice]}
        </p>
      ) : null}

      <Link href="/admin/documents/new" className={buttonVariants()}>
        Добавить материал
      </Link>

      {documents.length === 0 ? (
        <p className="mt-8 text-muted-foreground">
          Пока нет ни одного материала. Нажмите «Добавить материал».
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <caption className="sr-only">Список материалов</caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="py-2 pr-4 font-medium">
                  Название
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  Уровень
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  Тип
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  Доступ
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  Статус
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  Скачано
                </th>
                <th scope="col" className="py-2 font-medium">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody>
              {documents.map((document) => {
                const published = document.status === "published";
                return (
                  <tr key={document.id} className="border-b border-border align-top">
                    <th scope="row" className="py-3 pr-4 font-medium">
                      <Link
                        href={`/admin/documents/${document.id}`}
                        className="underline underline-offset-2"
                      >
                        {document.title}
                      </Link>
                    </th>
                    <td className="py-3 pr-4">{document.level}</td>
                    <td className="py-3 pr-4">{documentTypeLabelsRu[document.type]}</td>
                    <td className="py-3 pr-4">{documentAccessLabelsRu[document.access]}</td>
                    <td className="py-3 pr-4">
                      {published
                        ? `Опубликован${document.publishedAt ? ` ${dateFormat.format(document.publishedAt)}` : ""}`
                        : "Черновик"}
                    </td>
                    <td className="py-3 pr-4">{document.downloadCount}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <form action={setDocumentStatusAction}>
                          <input type="hidden" name="id" value={document.id} />
                          <input
                            type="hidden"
                            name="status"
                            value={published ? "draft" : "published"}
                          />
                          <Button type="submit" variant="outline" size="sm">
                            {published ? "Скрыть" : "Опубликовать"}
                          </Button>
                        </form>
                        {published ? (
                          <Link
                            href={`/ru/library/${document.slug}`}
                            className={buttonVariants({ variant: "ghost", size: "sm" })}
                          >
                            На сайте
                          </Link>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
