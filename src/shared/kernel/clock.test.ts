import { describe, expect, it } from "vitest";
import { FixedClock, SystemClock } from "./clock";

describe("SystemClock", () => {
  it("returns the current time", () => {
    const before = Date.now();
    const now = new SystemClock().now().getTime();
    expect(now).toBeGreaterThanOrEqual(before);
    expect(now).toBeLessThanOrEqual(Date.now());
  });
});

describe("FixedClock", () => {
  it("stays at the given moment", () => {
    const clock = new FixedClock("2026-10-17T12:00:00Z");
    expect(clock.now().toISOString()).toBe("2026-10-17T12:00:00.000Z");
    expect(clock.now().toISOString()).toBe("2026-10-17T12:00:00.000Z");
  });

  it("can be moved forward", () => {
    const clock = new FixedClock("2026-10-17T12:00:00Z");
    clock.advanceMs(60_000);
    expect(clock.now().toISOString()).toBe("2026-10-17T12:01:00.000Z");
  });

  it("can be set to a new moment", () => {
    const clock = new FixedClock(0);
    clock.set("2030-01-01T00:00:00Z");
    expect(clock.now().getUTCFullYear()).toBe(2030);
  });

  it("returns copies, so callers cannot change the clock by mutating the date", () => {
    const clock = new FixedClock("2026-10-17T12:00:00Z");
    clock.now().setUTCFullYear(1999);
    expect(clock.now().getUTCFullYear()).toBe(2026);
  });
});
