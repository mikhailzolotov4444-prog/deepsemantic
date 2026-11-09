"use server";

import { getContainer } from "@/composition-root/container";

export interface LoginState {
  readonly status: "idle" | "sent" | "error";
  /** Local development only: the link, shown on screen instead of being emailed. */
  readonly devLinkPath?: string;
}

export async function requestLoginAction(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const { adminAuth, adminChannel } = getContainer();
  if (!adminChannel.available) return { status: "error" };

  const raw = formData.get("email");
  const email = typeof raw === "string" ? raw : "";

  try {
    const { path } = await adminAuth.requestLogin.execute(email);
    // Everybody gets the same answer, so nobody can tell which address is the admin's.
    return path && adminChannel.revealLoginLink
      ? { status: "sent", devLinkPath: path }
      : { status: "sent" };
  } catch (error) {
    console.error("Admin login email failed", error);
    return { status: "error" };
  }
}
