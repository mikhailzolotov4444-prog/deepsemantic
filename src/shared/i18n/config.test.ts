import { describe, expect, it } from "vitest";
import {
  defaultLocale,
  isLocale,
  localizedPath,
  negotiateLocale,
  switchLocaleInPath,
} from "./config";

describe("isLocale", () => {
  it("accepts supported languages only", () => {
    expect(isLocale("ru")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("de")).toBe(false);
    expect(isLocale("")).toBe(false);
  });
});

describe("negotiateLocale", () => {
  it("falls back to the default without a header", () => {
    expect(negotiateLocale(null)).toBe(defaultLocale);
    expect(negotiateLocale(undefined)).toBe(defaultLocale);
    expect(negotiateLocale("")).toBe(defaultLocale);
  });

  it("picks the most preferred supported language", () => {
    expect(negotiateLocale("en-US,en;q=0.9,ru;q=0.8")).toBe("en");
    expect(negotiateLocale("ru-RU,ru;q=0.9,en;q=0.8")).toBe("ru");
    expect(negotiateLocale("de;q=0.9,en;q=0.8")).toBe("en");
  });

  it("respects quality values over order", () => {
    expect(negotiateLocale("ru;q=0.5,en;q=0.9")).toBe("en");
  });

  it("ignores languages the visitor excluded with q=0", () => {
    expect(negotiateLocale("en;q=0,ru;q=0.4")).toBe("ru");
  });

  it("falls back to the default when nothing matches", () => {
    expect(negotiateLocale("de-DE,fr;q=0.8")).toBe(defaultLocale);
    expect(negotiateLocale("*")).toBe(defaultLocale);
  });

  it("treats a broken quality value as unacceptable", () => {
    expect(negotiateLocale("en;q=abc,ru;q=0.1")).toBe("ru");
  });
});

describe("localizedPath", () => {
  it("prefixes the language", () => {
    expect(localizedPath("ru", "/")).toBe("/ru");
    expect(localizedPath("en", "/about")).toBe("/en/about");
  });
});

describe("switchLocaleInPath", () => {
  it("replaces the language prefix", () => {
    expect(switchLocaleInPath("/ru/about", "en")).toBe("/en/about");
    expect(switchLocaleInPath("/en", "ru")).toBe("/ru");
  });

  it("adds a prefix when there is none", () => {
    expect(switchLocaleInPath("/about", "ru")).toBe("/ru/about");
    expect(switchLocaleInPath("/", "en")).toBe("/en");
  });
});
