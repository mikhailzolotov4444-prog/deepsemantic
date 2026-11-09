import { describe, expect, it } from "vitest";
import {
  RequestAdminLogin,
  ResolveAdminSession,
  VerifyAdminLogin,
} from "@/modules/auth/application/admin-auth";
import type { AdminAuthConfig, AuthMail, AuthMailer } from "@/modules/auth/domain/auth-ports";
import { FixedClock } from "@/shared/kernel";
import { DisabledTokenSigner } from "@/shared/security/disabled-token-signer";
import { HmacTokenSigner } from "@/shared/security/token-signer";

class RecordingMailer implements AuthMailer {
  readonly sent: AuthMail[] = [];

  async send(mail: AuthMail): Promise<void> {
    this.sent.push(mail);
  }
}

const config: AdminAuthConfig = {
  adminEmail: "Owner@Example.com",
  fromEmail: "site@example.com",
  siteUrl: "https://www.example.com",
  siteName: "Deep Semantic",
};

function setup() {
  const clock = new FixedClock("2026-03-01T10:00:00Z");
  const signer = new HmacTokenSigner("0123456789abcdef0123456789abcdef", clock);
  const mailer = new RecordingMailer();
  return {
    clock,
    mailer,
    request: new RequestAdminLogin(mailer, signer, config),
    verify: new VerifyAdminLogin(signer, config),
    resolve: new ResolveAdminSession(signer, config),
  };
}

function tokenFrom(path: string | null): string {
  if (!path) throw new Error("no link");
  return decodeURIComponent(new URL(path, "https://x.test").searchParams.get("token") ?? "");
}

describe("admin login", () => {
  it("emails a link to the admin, whatever the letter case of the typed address", async () => {
    const app = setup();
    const { path } = await app.request.execute("  owner@example.COM ");
    expect(path).toMatch(/^\/admin\/verify\?token=/);
    expect(app.mailer.sent).toHaveLength(1);
    expect(app.mailer.sent[0]).toMatchObject({ to: "Owner@Example.com", from: "site@example.com" });
    expect(app.mailer.sent[0]?.text).toContain(`https://www.example.com${path}`);
  });

  it("sends nothing to anybody else", async () => {
    const app = setup();
    expect(await app.request.execute("stranger@example.com")).toEqual({ path: null });
    expect(app.mailer.sent).toHaveLength(0);
  });

  it("turns a fresh link into a session that is recognised afterwards", async () => {
    const app = setup();
    const { path } = await app.request.execute("owner@example.com");
    const session = await app.verify.execute(tokenFrom(path));
    expect(session.ok).toBe(true);
    if (!session.ok) return;
    expect(session.value.maxAgeSeconds).toBe(7 * 24 * 60 * 60);
    expect(await app.resolve.execute(session.value.token)).toBe(true);
  });

  it("rejects an expired link", async () => {
    const app = setup();
    const { path } = await app.request.execute("owner@example.com");
    app.clock.advanceMs(16 * 60 * 1000);
    const result = await app.verify.execute(tokenFrom(path));
    expect(!result.ok && result.error.code).toBe("unauthorized");
  });

  it("rejects garbage instead of a link", async () => {
    expect((await setup().verify.execute("garbage")).ok).toBe(false);
  });

  it("does not accept a login link as a session cookie", async () => {
    const app = setup();
    const { path } = await app.request.execute("owner@example.com");
    expect(await app.resolve.execute(tokenFrom(path))).toBe(false);
  });

  it("does not accept a missing, forged or expired session", async () => {
    const app = setup();
    expect(await app.resolve.execute(undefined)).toBe(false);
    expect(await app.resolve.execute("forged")).toBe(false);

    const { path } = await app.request.execute("owner@example.com");
    const session = await app.verify.execute(tokenFrom(path));
    if (!session.ok) throw session.error;
    app.clock.advanceMs(8 * 24 * 60 * 60 * 1000);
    expect(await app.resolve.execute(session.value.token)).toBe(false);
  });
});

describe("DisabledTokenSigner", () => {
  it("refuses everything", async () => {
    const signer = new DisabledTokenSigner();
    await expect(signer.sign({ p: "x" }, 60)).rejects.toThrow(/AUTH_SECRET/);
    expect(await signer.verify("anything")).toBeNull();
  });
});
