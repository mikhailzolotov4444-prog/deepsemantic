import { NextResponse, type NextRequest } from "next/server";
import { getContainer } from "@/composition-root/container";
import { ADMIN_SESSION_COOKIE } from "@/modules/auth/domain/auth-ports";
import { isLocale, negotiateLocale } from "@/shared/i18n/config";

/** Pages of the admin area that must be reachable without being signed in. */
const OPEN_ADMIN_PATHS = new Set(["/admin/login", "/admin/verify"]);

/**
 * 1. /admin: first line of defence (every admin page and action checks the session again).
 * 2. Everything else: visitors who open an address without a language ("/", "/about") are sent
 *    to the language that their browser prefers: "/" -> "/en" for English browsers, "/ru" otherwise.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return guardAdmin(request, pathname);
  }

  const firstSegment = pathname.split("/")[1] ?? "";
  if (isLocale(firstSegment)) return NextResponse.next();

  const locale = negotiateLocale(request.headers.get("accept-language"));
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

async function guardAdmin(request: NextRequest, pathname: string) {
  if (OPEN_ADMIN_PATHS.has(pathname)) return NextResponse.next();

  const { adminAuth, adminChannel } = getContainer();
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (adminChannel.available && (await adminAuth.resolveSession.execute(token))) {
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = {
  // Everything except API routes, Next.js internals, the generated share image and real files
  // (robots.txt, sitemap.xml, icons: anything with a dot in its name).
  matcher: ["/((?!api|_next|opengraph-image|.*\\..*).*)"],
};
