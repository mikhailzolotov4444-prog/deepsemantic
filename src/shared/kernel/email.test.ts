import { describe, expect, it } from "vitest";
import { isValidEmail, normalizeEmail } from "./email";

describe("isValidEmail", () => {
  it("accepts ordinary addresses, ignoring surrounding spaces", () => {
    expect(isValidEmail(" anna@example.com ")).toBe(true);
  });

  it.each(["", "anna", "anna@", "@example.com", "anna@example", "an na@example.com"])(
    "rejects %j",
    (value) => {
      expect(isValidEmail(value)).toBe(false);
    },
  );

  it("rejects addresses longer than 254 characters", () => {
    expect(isValidEmail(`${"a".repeat(250)}@example.com`)).toBe(false);
  });
});

describe("normalizeEmail", () => {
  it("trims and lower-cases", () => {
    expect(normalizeEmail("  Anna@Example.COM ")).toBe("anna@example.com");
  });
});
