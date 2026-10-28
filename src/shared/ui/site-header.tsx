import Link from "next/link";
import { siteConfig } from "@/shared/config/site";
import { localizedPath, type Locale } from "@/shared/i18n/config";
import type { Dictionary } from "@/shared/i18n/dictionaries";
import { LanguageSwitcher } from "./language-switcher";
import { NavLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const items = [
    { href: localizedPath(locale, "/"), label: dict.nav.home },
    { href: localizedPath(locale, "/about"), label: dict.nav.about },
    { href: localizedPath(locale, "/contact"), label: dict.nav.contact },
  ];

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
        <Link
          href={localizedPath(locale, "/")}
          className="rounded-md text-lg font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {siteConfig.name}
        </Link>
        <div className="flex flex-wrap items-center gap-1">
          <NavLinks items={items} label={dict.nav.main} homeHref={localizedPath(locale, "/")} />
          <LanguageSwitcher current={locale} label={dict.nav.language} />
          <ThemeToggle label={dict.nav.themeToggle} />
        </div>
      </div>
    </header>
  );
}
