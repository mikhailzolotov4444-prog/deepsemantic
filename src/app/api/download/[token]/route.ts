import type { NextRequest } from "next/server";
import { getContainer } from "@/composition-root/container";

const noStore = { "Cache-Control": "private, no-store" } as const;

/** Streams the file for a valid, unexpired download link. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const result = await getContainer().documents.openDownload.execute(token);

  if (!result.ok) {
    const expired = result.error.code === "unauthorized";
    return new Response(
      expired
        ? "Ссылка недействительна или устарела. Запросите её заново на странице материала.\nThe link is invalid or has expired. Please request it again on the material's page."
        : "Not found",
      {
        status: expired ? 403 : 404,
        headers: { ...noStore, "Content-Type": "text/plain; charset=utf-8" },
      },
    );
  }

  const { body, contentType, fileName, size } = result.value;
  return new Response(body, {
    headers: {
      ...noStore,
      "Content-Type": contentType,
      // The name was made safe when the file was stored (letters, digits, dashes only).
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "X-Content-Type-Options": "nosniff",
      ...(size ? { "Content-Length": String(size) } : {}),
    },
  });
}
