import { describe, expect, it } from "vitest";
import { err, map, mapError, ok, unwrap } from "./result";

describe("Result", () => {
  it("ok() wraps a value", () => {
    expect(ok(42)).toEqual({ ok: true, value: 42 });
  });

  it("err() wraps an error", () => {
    expect(err("boom")).toEqual({ ok: false, error: "boom" });
  });

  it("map() transforms the value of an Ok", () => {
    expect(map(ok(2), (n) => n * 3)).toEqual(ok(6));
  });

  it("map() leaves an Err untouched", () => {
    const failure = err("nope");
    expect(map(failure, (n: number) => n * 3)).toBe(failure);
  });

  it("mapError() transforms the error of an Err", () => {
    expect(mapError(err("a"), (e) => `${e}!`)).toEqual(err("a!"));
  });

  it("mapError() leaves an Ok untouched", () => {
    const success = ok(1);
    expect(mapError(success, (e: string) => e.length)).toBe(success);
  });

  it("unwrap() returns the value of an Ok", () => {
    expect(unwrap(ok("fine"))).toBe("fine");
  });

  it("unwrap() throws the original Error of an Err", () => {
    const problem = new Error("bad");
    expect(() => unwrap(err(problem))).toThrow(problem);
  });

  it("unwrap() wraps a non-Error failure in an Error", () => {
    expect(() => unwrap(err("plain string"))).toThrow("unwrap() called on an Err: plain string");
  });
});
