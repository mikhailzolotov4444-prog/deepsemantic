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
      {/*
        Phone: two rows. Row 1 = name + language + theme, row 2 = menu spread over the full width.
        From 1024 px: one row (name, menu, language, theme). `order` swaps the blocks per screen size.
      */}
      <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center gap-x-8 gap-y-1 px-4 pb-1 pt-2 md:px-8 lg:min-h-[92px] lg:flex-nowrap lg:py-2 lg:px-12">
        <Link
          href={localizedPath(locale, "/")}
          className="metal-thin order-1 whitespace-nowrap rounded-md font-display text-[17px] font-bold sm:text-xl uppercase tracking-[0.12em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:text-[26px] xl:text-[32px]"
        >
          {siteConfig.name}
        </Link>
        <div className="order-2 ml-auto flex items-center gap-1 lg:order-3 lg:ml-0 lg:gap-6">
          <LanguageSwitcher current={locale} label={dict.nav.language} />
          <ThemeToggle label={dict.nav.themeToggle} />
        </div>
        <NavLinks
          items={items}
          label={dict.nav.main}
          homeHref={localizedPath(locale, "/")}
          className="order-3 w-full border-t border-border/60 lg:order-2 lg:ml-auto lg:w-auto lg:border-t-0"
        />
      </div>
    </header>
  );
}
