"use client";

import { useActionState } from "react";
import { Button } from "@/shared/ui/button";
import { requestLoginAction, type LoginState } from "./actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(requestLoginAction, {
    status: "idle",
  });

  if (state.status === "sent") {
    return (
      <div role="status" className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-xl font-semibold">Проверьте почту</h2>
        <p className="mt-2 text-muted-foreground">
          Если этот адрес есть в настройках, мы отправили на него ссылку для входа. Она действует 15
          минут.
        </p>
        {state.devLinkPath ? (
          <p className="mt-4 text-sm">
            {/* A plain link on purpose: Link would prefetch it, and this address signs you in. */}
            Режим разработки: {}
            <a className="underline" href={state.devLinkPath}>
              войти по ссылке
            </a>
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="login-email" className="mb-1 block text-sm font-medium">
          Email администратора
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-md border border-muted-foreground/60 bg-background px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        />
      </div>
      <div role="status" aria-live="polite">
        {state.status === "error" ? (
          <p className="rounded-md border border-destructive/40 p-3 text-sm text-destructive">
            Не удалось отправить ссылку. Попробуйте ещё раз через несколько минут.
          </p>
        ) : null}
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Отправляю…" : "Получить ссылку для входа"}
      </Button>
    </form>
  );
}
