export const locales = ["ru", "en"] as const;
export type Locale = (typeof locales)[number];

/** The site is a .ru domain, so Russian is what a visitor gets when we cannot tell. */
export const defaultLocale: Locale = "ru";

export function isLocale(value: string): value is Locale {
  return locales.some((locale) => locale === value);
}

/**
 * Picks a locale from an Accept-Language header such as "en-US,en;q=0.9,ru;q=0.8".
 * The visitor's most preferred supported language wins; otherwise the default is used.
 */
export function negotiateLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return defaultLocale;

  const ranked = acceptLanguage
    .split(",")
    .map((part, index) => {
      const [tag = "", ...params] = part.trim().split(";");
      const qParam = params.find((param) => param.trim().startsWith("q="));
      const q = qParam ? Number.parseFloat(qParam.trim().slice(2)) : 1;
      return {
        language: tag.trim().toLowerCase().split("-")[0] ?? "",
        q: Number.isNaN(q) ? 0 : q,
        index,
      };
    })
    .filter((entry) => entry.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index);

  for (const { language } of ranked) {
    if (isLocale(language)) return language;
  }
  return defaultLocale;
}

/** "/about" -> "/ru/about", "/" -> "/ru". */
export function localizedPath(locale: Locale, path: string): string {
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/** Replaces the language at the start of a URL path: "/ru/about" + "en" -> "/en/about". */
export function switchLocaleInPath(pathname: string, target: Locale): string {
  const [, first = "", ...rest] = pathname.split("/");
  const tail = isLocale(first) ? rest : [first, ...rest].filter(Boolean);
  return `/${[target, ...tail].join("/")}`;
}
