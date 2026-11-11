"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { switchLocaleInPath, type Locale } from "@/shared/i18n/config";
import { cn } from "@/shared/lib/utils";
import { menuLinkClass } from "./nav-links";
import { RotatingLabel } from "./rotating-label";

const names: Record<Locale, string> = { ru: "Русский", en: "English" };

interface LanguageSwitcherProps {
  readonly current: Locale;
  readonly label: string;
}

/** Links to the same page in the other language. Plain links keep it working without scripts. */
export function LanguageSwitcher({ current, label }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const target: Locale = current === "ru" ? "en" : "ru";

  return (
    <Link
      href={switchLocaleInPath(pathname, target)}
      hrefLang={target}
      lang={target}
      title={label}
      className={cn(menuLinkClass, "text-muted-foreground hover:text-foreground")}
    >
      <RotatingLabel>{names[target]}</RotatingLabel>
    </Link>
  );
}
