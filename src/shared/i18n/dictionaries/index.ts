import type { Locale } from "../config";
import type { Dictionary } from "./en";
import { en } from "./en";
import { ru } from "./ru";

export type { Dictionary };

const dictionaries: Record<Locale, Dictionary> = { ru, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
