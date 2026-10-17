import { describe, expect, it } from "vitest";
import { FixedClock, SequentialIdGenerator } from "@/shared/kernel";
import { createContainer, getContainer } from "./container";

describe("composition root", () => {
  it("wires real adapters by default", () => {
    const container = createContainer();
    expect(container.clock.now()).toBeInstanceOf(Date);
    expect(typeof container.ids.next()).toBe("string");
  });

  it("lets tests replace any dependency with a fake", () => {
    const clock = new FixedClock("2026-01-01T00:00:00Z");
    const ids = new SequentialIdGenerator("t");
    const container = createContainer({ clock, ids });
    expect(container.clock).toBe(clock);
    expect(container.ids.next()).toBe("t-1");
  });

  it("getContainer() always returns the same instance", () => {
    expect(getContainer()).toBe(getContainer());
  });
});
