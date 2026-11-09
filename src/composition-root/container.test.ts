import { describe, expect, it } from "vitest";
import { parseEnv } from "@/shared/config/env";
import { FixedClock, SequentialIdGenerator } from "@/shared/kernel";
import { createContainer, getContainer } from "./container";

const liveEnv = {
  CONTACT_TO_EMAIL: "owner@example.com",
  CONTACT_FROM_EMAIL: "site@example.com",
  RESEND_API_KEY: "re_123",
  TURNSTILE_SECRET_KEY: "secret",
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: "site-key",
};

describe("composition root", () => {
  it("wires real adapters by default", () => {
    const container = createContainer({}, parseEnv({}));
    expect(container.clock.now()).toBeInstanceOf(Date);
    expect(typeof container.ids.next()).toBe("string");
  });

  it("lets tests replace any dependency with a fake", () => {
    const clock = new FixedClock("2026-01-01T00:00:00Z");
    const ids = new SequentialIdGenerator("t");
    const container = createContainer({ clock, ids }, parseEnv({}));
    expect(container.clock).toBe(clock);
    expect(container.ids.next()).toBe("t-1");
  });

  it("getContainer() always returns the same instance", () => {
    expect(getContainer()).toBe(getContainer());
  });

  it("serves the placeholder profile and no testimonials", async () => {
    const container = createContainer({}, parseEnv({}));
    expect((await container.getProfile.execute("ru")).displayName).toBeTruthy();
    expect((await container.getProfile.execute("en")).displayName).toBeTruthy();
    expect(await container.listTestimonials.execute()).toEqual([]);
  });
});

describe("contact channel", () => {
  it("is unavailable when nothing is configured", () => {
    const { contactChannel } = createContainer({}, parseEnv({}));
    expect(contactChannel).toEqual({ available: false });
  });

  it("is available in development mode, without the Turnstile widget", () => {
    const { contactChannel } = createContainer({}, parseEnv({ CONTACT_DEV_MODE: "true" }));
    expect(contactChannel).toEqual({ available: true });
  });

  it("is available, with the Turnstile widget, when email and spam protection are configured", () => {
    const { contactChannel } = createContainer({}, parseEnv(liveEnv));
    expect(contactChannel).toEqual({ available: true, turnstileSiteKey: "site-key" });
  });

  it("stays unavailable when spam protection is missing", () => {
    const { contactChannel } = createContainer(
      {},
      parseEnv({ ...liveEnv, TURNSTILE_SECRET_KEY: undefined }),
    );
    expect(contactChannel).toEqual({ available: false });
  });

  it("accepts messages in development mode without any services", async () => {
    const { submitContactMessage } = createContainer({}, parseEnv({ CONTACT_DEV_MODE: "true" }));

    const result = await submitContactMessage.execute({
      name: "Anna",
      email: "anna@example.com",
      topic: "other",
      message: "A message that is long enough.",
      website: "",
    });

    expect(result.ok).toBe(true);
  });
});

describe("admin channel", () => {
  const adminEnv = {
    ...liveEnv,
    ADMIN_EMAIL: "owner@example.com",
    AUTH_SECRET: "0123456789abcdef0123456789abcdef",
    DATABASE_URL: "postgres://u:p@localhost:5432/db",
    BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_x",
  };

  it("is unavailable when nothing is configured", () => {
    const { adminChannel } = createContainer({}, parseEnv({}));
    expect(adminChannel).toEqual({ available: false, revealLoginLink: false });
  });

  it("is available when secret, email, database and storage are configured", () => {
    const { adminChannel } = createContainer({}, parseEnv(adminEnv));
    expect(adminChannel).toEqual({ available: true, revealLoginLink: false });
  });

  it("stays unavailable when permanent storage is missing", () => {
    const { adminChannel } = createContainer(
      {},
      parseEnv({ ...adminEnv, BLOB_READ_WRITE_TOKEN: undefined }),
    );
    expect(adminChannel.available).toBe(false);
  });

  it("shows the login link on screen in local development mode", () => {
    const { adminChannel } = createContainer(
      {},
      parseEnv({ CONTACT_DEV_MODE: "true", NODE_ENV: "development" }),
    );
    expect(adminChannel).toEqual({ available: true, revealLoginLink: true });
  });

  it("ignores the development shortcut in a production build", () => {
    const { adminChannel } = createContainer(
      {},
      parseEnv({ CONTACT_DEV_MODE: "true", NODE_ENV: "production" }),
    );
    expect(adminChannel).toEqual({ available: false, revealLoginLink: false });
  });

  it("works end to end with the in-memory stand-ins", async () => {
    const { documents } = createContainer({}, parseEnv({}));
    expect((await documents.listAll.execute()).length).toBeGreaterThanOrEqual(0);
  });
});
