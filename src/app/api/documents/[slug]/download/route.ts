import { NextResponse, type NextRequest } from "next/server";
import { getContainer } from "@/composition-root/container";
import { DocumentValidationError } from "@/modules/documents/domain/teaching-document";
import { defaultLocale, isLocale, localizedPath } from "@/shared/i18n/config";
import { ForbiddenError, NotFoundError } from "@/shared/kernel";

/**
 * The "Download" form posts here. If the visitor may download, they are sent on to the one-time
 * link (which streams the file); otherwise back to the material's page with a reason.
 * A plain HTML form is used on purpose: it needs no scripts and works everywhere.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const form = await request.formData();
  const rawLocale = form.get("locale");
  const locale = typeof rawLocale === "string" && isLocale(rawLocale) ? rawLocale : defaultLocale;
  const rawEmail = form.get("email");
  const email = typeof rawEmail === "string" ? rawEmail : undefined;

  const back = (error: string) =>
    NextResponse.redirect(
      new URL(
        `${localizedPath(locale, `/library/${encodeURIComponent(slug)}`)}?error=${error}`,
        request.url,
      ),
      303,
    );

  try {
    const result = await getContainer().documents.issueDownload.execute({
      slug,
      ...(email !== undefined ? { email } : {}),
    });
    if (result.ok) {
      return NextResponse.redirect(new URL(`/api/download/${result.value}`, request.url), 303);
    }
    if (result.error instanceof DocumentValidationError) return back("email_invalid");
    if (result.error instanceof ForbiddenError) return back("forbidden");
    if (result.error instanceof NotFoundError) return back("not_found");
    return back("unknown");
  } catch (error) {
    console.error("Issuing a download link failed", error);
    return back("unknown");
  }
}
