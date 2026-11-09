import { describe, expect, it } from "vitest";
import { FixedClock } from "@/shared/kernel";
import { HmacTokenSigner } from "./token-signer";

const SECRET = "0123456789abcdef0123456789abcdef";

function setup() {
  const clock = new FixedClock("2026-01-01T00:00:00Z");
  return { clock, signer: new HmacTokenSigner(SECRET, clock) };
}

describe("HmacTokenSigner", () => {
  it("returns the payload for a fresh token, including non-Latin text", async () => {
    const { signer } = setup();
    const token = await signer.sign({ p: "download", d: "документ-1" }, 60);
    expect(await signer.verify(token)).toEqual({ p: "download", d: "документ-1" });
  });

  it("rejects an expired token", async () => {
    const { signer, clock } = setup();
    const token = await signer.sign({ p: "x" }, 60);
    clock.advanceMs(61_000);
    expect(await signer.verify(token)).toBeNull();
  });

  it("rejects a token whose content was changed", async () => {
    const { signer } = setup();
    const token = await signer.sign({ p: "user", who: "anna" }, 60);
    const [, signature] = token.split(".");
    const forgedBody = btoa(JSON.stringify({ d: { p: "admin" }, e: 9_999_999_999 }))
      .replace(/=+$/, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
    expect(await signer.verify(`${forgedBody}.${signature}`)).toBeNull();
  });

  it("rejects a token signed with another secret", async () => {
    const { signer, clock } = setup();
    const other = new HmacTokenSigner("fedcba9876543210fedcba9876543210", clock);
    expect(await signer.verify(await other.sign({ p: "x" }, 60))).toBeNull();
  });

  it.each(["", "abc", "a.b.c", ".", "a.", ".b", "!!.??"])("rejects garbage %j", async (value) => {
    const { signer } = setup();
    expect(await signer.verify(value)).toBeNull();
  });

  it("refuses a secret that is too short", () => {
    expect(() => new HmacTokenSigner("short", new FixedClock(0))).toThrow(/at least 32/);
  });
});
