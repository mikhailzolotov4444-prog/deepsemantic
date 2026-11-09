import { describe, expect, it } from "vitest";
import { LIBRARY_PAGE_SIZE, parseLibraryQuery } from "./library-query";

describe("parseLibraryQuery", () => {
  it("returns defaults for an empty address", () => {
    expect(parseLibraryQuery({})).toEqual({ page: 1, pageSize: LIBRARY_PAGE_SIZE });
  });

  it("keeps valid filters and normalises text", () => {
    expect(
      parseLibraryQuery({ q: " past ", level: "B2", topic: " Grammar ", type: "guide", page: "3" }),
    ).toEqual({
      text: "past",
      level: "B2",
      topic: "grammar",
      type: "guide",
      page: 3,
      pageSize: LIBRARY_PAGE_SIZE,
    });
  });

  it("ignores unknown levels and types and broken page numbers", () => {
    expect(parseLibraryQuery({ level: "Z9", type: "poem", page: "-4" })).toEqual({
      page: 1,
      pageSize: LIBRARY_PAGE_SIZE,
    });
    expect(parseLibraryQuery({ page: "abc" }).page).toBe(1);
  });
});
