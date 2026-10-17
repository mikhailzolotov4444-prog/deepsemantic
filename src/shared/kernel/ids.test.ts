import { describe, expect, it } from "vitest";
import { SequentialIdGenerator, UuidGenerator } from "./ids";

describe("UuidGenerator", () => {
  it("produces valid, unique UUIDs", () => {
    const generator = new UuidGenerator();
    const first = generator.next();
    const second = generator.next();
    expect(first).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    expect(first).not.toBe(second);
  });
});

describe("SequentialIdGenerator", () => {
  it("counts upwards with the default prefix", () => {
    const generator = new SequentialIdGenerator();
    expect([generator.next(), generator.next()]).toEqual(["id-1", "id-2"]);
  });

  it("accepts a custom prefix", () => {
    expect(new SequentialIdGenerator("doc").next()).toBe("doc-1");
  });
});
