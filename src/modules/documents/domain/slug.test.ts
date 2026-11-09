import { describe, expect, it } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("lower-cases and joins words with dashes", () => {
    expect(slugify("Past Simple: Worksheet #1")).toBe("past-simple-worksheet-1");
  });

  it("transliterates Russian", () => {
    expect(slugify("Времена глаголов, тест")).toBe("vremena-glagolov-test");
  });

  it("falls back when nothing usable remains", () => {
    expect(slugify("!!!")).toBe("document");
  });

  it("is limited in length without a trailing dash", () => {
    const slug = slugify(`${"a".repeat(59)} bbb`);
    expect(slug.length).toBeLessThanOrEqual(60);
    expect(slug.endsWith("-")).toBe(false);
  });
});
