import { describe, expect, it } from "vitest";
import { getDictionary } from "./index";

/** Lists every text key ("home.offers.0.title"), so the two languages can be compared. */
function keysOf(value: unknown, prefix = ""): string[] {
  if (typeof value === "string") return [prefix];
  if (Array.isArray(value))
    return value.flatMap((item, index) => keysOf(item, `${prefix}.${index}`));
  return Object.entries(value as Record<string, unknown>).flatMap(([key, item]) =>
    keysOf(item, prefix ? `${prefix}.${key}` : key),
  );
}

function textsOf(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(textsOf);
  return Object.values(value as Record<string, unknown>).flatMap(textsOf);
}

describe("dictionaries", () => {
  it("have exactly the same keys in Russian and English", () => {
    expect(keysOf(getDictionary("ru")).sort()).toEqual(keysOf(getDictionary("en")).sort());
  });

  it("have no empty texts", () => {
    for (const locale of ["ru", "en"] as const) {
      const empty = textsOf(getDictionary(locale)).filter((text) => text.trim() === "");
      expect(empty).toEqual([]);
    }
  });

  it("really are translated: the Russian texts contain Cyrillic letters", () => {
    expect(getDictionary("ru").home.h1).toMatch(/[а-яё]/i);
    expect(getDictionary("en").home.h1).not.toMatch(/[а-яё]/i);
  });
});
