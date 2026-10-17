import { describe, expect, it } from "vitest";
import {
  AppError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "./errors";

describe("errors", () => {
  it("NotFoundError mentions the entity and id", () => {
    const error = new NotFoundError("Document", "abc");
    expect(error.message).toBe('Document "abc" not found');
    expect(error.code).toBe("not_found");
    expect(error.name).toBe("NotFoundError");
  });

  it("NotFoundError works without an id", () => {
    expect(new NotFoundError("Profile").message).toBe("Profile not found");
  });

  it("ValidationError carries the list of issues", () => {
    const error = new ValidationError("Invalid form", ["email: required"]);
    expect(error.code).toBe("validation_failed");
    expect(error.issues).toEqual(["email: required"]);
  });

  it("ValidationError defaults to no issues", () => {
    expect(new ValidationError("Invalid").issues).toEqual([]);
  });

  it("ConflictError keeps its message and code", () => {
    const error = new ConflictError("Slug already used");
    expect(error.code).toBe("conflict");
    expect(error.message).toBe("Slug already used");
  });

  it("UnauthorizedError and ForbiddenError have sensible defaults", () => {
    expect(new UnauthorizedError().code).toBe("unauthorized");
    expect(new UnauthorizedError().message).toMatch(/authentication/i);
    expect(new ForbiddenError().code).toBe("forbidden");
    expect(new ForbiddenError("Admins only").message).toBe("Admins only");
  });

  it("all of them are AppError and Error instances", () => {
    const error = new ConflictError("x");
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);
  });

  it("preserves the cause", () => {
    const cause = new Error("root cause");
    const error = new ConflictError("wrapped", { cause });
    expect(error.cause).toBe(cause);
  });
});
