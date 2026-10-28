import Link from "next/link";
import { siteConfig } from "@/shared/config/site";
import { localizedPath, type Locale } from "@/shared/i18n/config";
import type { Dictionary } from "@/shared/i18n/dictionaries";

export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const items = [
    { href: localizedPath(locale, "/privacy"), label: dict.nav.privacy },
    { href: localizedPath(locale, "/terms"), label: dict.nav.terms },
  ];

  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-6 text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
        <nav aria-label={dict.nav.legal}>
          <ul className="flex items-center gap-1">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-9 items-center rounded-md px-3 hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
