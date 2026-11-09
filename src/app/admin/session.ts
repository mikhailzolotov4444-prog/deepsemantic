import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getContainer } from "@/composition-root/container";
import { ADMIN_SESSION_COOKIE } from "@/modules/auth/domain/auth-ports";

export async function isAdminSignedIn(): Promise<boolean> {
  const { adminAuth, adminChannel } = getContainer();
  if (!adminChannel.available) return false;
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  return adminAuth.resolveSession.execute(token);
}

/** Call at the top of every admin page and action: the proxy alone is not trusted. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdminSignedIn())) redirect("/admin/login");
}
