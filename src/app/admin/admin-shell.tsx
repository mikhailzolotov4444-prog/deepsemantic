import Link from "next/link";
import type { ReactNode } from "react";
import { siteConfig } from "@/shared/config/site";
import { Button } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";
import { ThemeToggle } from "@/shared/ui/theme-toggle";
import { logoutAction } from "./actions";

/** Frame of every signed-in admin page. */
export function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
          <Link
            href="/admin"
            className="rounded-md text-lg font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Админка {siteConfig.name}
          </Link>
          <div className="flex flex-wrap items-center gap-1">
            <Link
              href="/ru/library"
              className="inline-flex min-h-9 items-center rounded-md px-2 text-sm text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Открыть сайт
            </Link>
            <ThemeToggle label="Переключить тёмную тему" />
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="sm">
                Выйти
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main id="main" className="flex-1">
        <Container className="py-10">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <div className="mt-6">{children}</div>
        </Container>
      </main>
    </div>
  );
}
