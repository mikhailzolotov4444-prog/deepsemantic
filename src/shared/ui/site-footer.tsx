import Link from "next/link";
import { siteConfig } from "@/shared/config/site";
import { localizedPath, type Locale } from "@/shared/i18n/config";
import type { Dictionary } from "@/shared/i18n/dictionaries";
import { cn } from "@/shared/lib/utils";
import { RotatingLabel } from "./rotating-label";
import { SectionDivider } from "./section-divider";

export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const items = [
    { href: localizedPath(locale, "/privacy"), label: dict.nav.privacy },
    { href: localizedPath(locale, "/terms"), label: dict.nav.terms },
  ];

  return (
    <footer className="site-footer mt-16 border-t border-border">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-5 px-4 pb-8 pt-12 text-center text-sm text-muted-foreground">
        <p className="metal-thin font-display text-lg font-bold uppercase tracking-[0.15em]">
          {siteConfig.name}
        </p>
        <SectionDivider />
        <nav aria-label={dict.nav.legal}>
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-1">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "metal-link inline-flex min-h-9 items-center rounded-md px-1 font-mono text-[13px] uppercase tracking-[0.15em]",
                    "hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  )}
                >
                  <RotatingLabel>{item.label}</RotatingLabel>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="font-mono text-[11px] tracking-[0.1em]">
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
      </div>
    </footer>
  );
}
