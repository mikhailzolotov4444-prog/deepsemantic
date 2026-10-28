import type { Metadata } from "next";
import { localizedPath, locales, type Locale } from "./config";

/** Canonical address plus "this page also exists in language X" hints for search engines. */
export function localizedAlternates(locale: Locale, path: string): Metadata["alternates"] {
  return {
    canonical: localizedPath(locale, path),
    languages: {
      ...Object.fromEntries(locales.map((code) => [code, localizedPath(code, path)])),
      "x-default": localizedPath("ru", path),
    },
  };
}
