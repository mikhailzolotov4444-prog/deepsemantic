"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { switchLocaleInPath, type Locale } from "@/shared/i18n/config";

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
      className="inline-flex min-h-9 items-center rounded-md px-2 text-sm text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {names[target]}
    </Link>
  );
}
