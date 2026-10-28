import { notFound } from "next/navigation";
import { isLocale, type Locale } from "./config";

export interface LocaleParams {
  readonly params: Promise<{ locale: string }>;
}

/** Reads the language from the URL; an unknown language shows the 404 page. */
export async function resolveLocale(params: LocaleParams["params"]): Promise<Locale> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale;
}
