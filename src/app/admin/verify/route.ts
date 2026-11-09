import { NextResponse, type NextRequest } from "next/server";
import { getContainer } from "@/composition-root/container";
import { ADMIN_SESSION_COOKIE } from "@/modules/auth/domain/auth-ports";

/** The emailed link points here: it is checked, and a session cookie is set. */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const { adminAuth, adminChannel } = getContainer();

  const result = adminChannel.available ? await adminAuth.verifyLogin.execute(token) : null;
  if (!result?.ok) {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url));
  }

  const response = NextResponse.redirect(new URL("/admin", request.url));
  response.cookies.set(ADMIN_SESSION_COOKIE, result.value.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: result.value.maxAgeSeconds,
  });
  return response;
}
