import { NextResponse, type NextRequest } from "next/server";
import { isLocale, negotiateLocale } from "@/shared/i18n/config";

/**
 * Sends visitors who open an address without a language ("/", "/about") to the language that
 * their browser prefers: "/" -> "/en" for English browsers, "/ru" otherwise.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const firstSegment = pathname.split("/")[1] ?? "";
  if (isLocale(firstSegment)) return NextResponse.next();

  const locale = negotiateLocale(request.headers.get("accept-language"));
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Everything except API routes, Next.js internals, the generated share image and real files
  // (robots.txt, sitemap.xml, icons: anything with a dot in its name).
  matcher: ["/((?!api|_next|opengraph-image|.*\\..*).*)"],
};
