import Link from "next/link";
import { siteConfig } from "@/shared/config/site";
import { localizedPath, type Locale } from "@/shared/i18n/config";
import type { Dictionary } from "@/shared/i18n/dictionaries";
import { LanguageSwitcher } from "./language-switcher";
import { NavLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const items = [
    { href: localizedPath(locale, "/about"), label: dict.nav.about },
    { href: localizedPath(locale, "/library"), label: dict.nav.library },
    { href: localizedPath(locale, "/contact"), label: dict.nav.contact },
  ];

  return (
    <header className="site-header sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex min-h-[72px] w-full max-w-[1440px] flex-wrap items-center justify-between gap-x-8 gap-y-2 px-4 py-2 md:px-8 lg:min-h-[92px] lg:flex-nowrap lg:px-12">
        <Link
          href={localizedPath(locale, "/")}
          className="metal-thin whitespace-nowrap rounded-md font-display text-xl font-bold uppercase tracking-[0.12em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:text-[26px] xl:text-[32px]"
        >
          {siteConfig.name}
        </Link>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 lg:flex-nowrap lg:gap-x-8">
          <NavLinks items={items} label={dict.nav.main} homeHref={localizedPath(locale, "/")} />
          <LanguageSwitcher current={locale} label={dict.nav.language} />
          <ThemeToggle label={dict.nav.themeToggle} />
        </div>
      </div>
    </header>
  );
}
