import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getContainer } from "@/composition-root/container";
import { Container } from "@/shared/ui/container";
import { isAdminSignedIn } from "../session";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Вход" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAdminSignedIn()) redirect("/admin");

  const { adminChannel } = getContainer();
  const { error } = await searchParams;

  return (
    <main id="main">
      <Container className="max-w-md py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Вход в админку</h1>
        {error ? (
          <p
            role="alert"
            className="mt-4 rounded-md border border-destructive/40 p-3 text-sm text-destructive"
          >
            Ссылка недействительна или устарела. Запросите новую.
          </p>
        ) : null}
        <div className="mt-6">
          {adminChannel.available ? (
            <LoginForm />
          ) : (
            <p role="status" className="rounded-lg border border-border bg-card p-5">
              Админка ещё не настроена. Нужны настройки ADMIN_EMAIL, AUTH_SECRET, DATABASE_URL,
              BLOB_READ_WRITE_TOKEN и почта (RESEND_API_KEY, CONTACT_FROM_EMAIL). Подробности в
              README.
            </p>
          )}
        </div>
      </Container>
    </main>
  );
}
