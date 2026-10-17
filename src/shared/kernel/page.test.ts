import { describe, expect, it } from "vitest";
import { emptyPage, totalPages } from "./page";

describe("page helpers", () => {
  it("emptyPage keeps the requested page and size", () => {
    expect(emptyPage({ page: 3, pageSize: 20 })).toEqual({
      items: [],
      total: 0,
      page: 3,
      pageSize: 20,
    });
  });

  it("totalPages rounds up", () => {
    expect(totalPages({ total: 41, pageSize: 20 })).toBe(3);
    expect(totalPages({ total: 40, pageSize: 20 })).toBe(2);
  });

  it("totalPages is at least 1, even with no results", () => {
    expect(totalPages({ total: 0, pageSize: 20 })).toBe(1);
  });
});
