import { describe, expect, it } from "vitest";
import { parseEnv, requireDatabaseUrl } from "./env";

describe("parseEnv", () => {
  it("applies safe defaults when nothing is set", () => {
    const env = parseEnv({});
    expect(env.NODE_ENV).toBe("development");
    expect(env.NEXT_PUBLIC_SITE_URL).toBe("https://www.deepsemantic.ru");
    expect(env.NEXT_PUBLIC_ALLOW_INDEXING).toBe(false);
    expect(env.DATABASE_URL).toBeUndefined();
  });

  it("removes trailing slashes from the site URL", () => {
    const env = parseEnv({ NEXT_PUBLIC_SITE_URL: "https://example.com//" });
    expect(env.NEXT_PUBLIC_SITE_URL).toBe("https://example.com");
  });

  it("turns the indexing flag into a real boolean", () => {
    expect(parseEnv({ NEXT_PUBLIC_ALLOW_INDEXING: "true" }).NEXT_PUBLIC_ALLOW_INDEXING).toBe(true);
    expect(parseEnv({ NEXT_PUBLIC_ALLOW_INDEXING: "false" }).NEXT_PUBLIC_ALLOW_INDEXING).toBe(
      false,
    );
  });

  it("accepts postgres connection strings", () => {
    const env = parseEnv({ DATABASE_URL: "postgresql://user:pass@host:5432/db" });
    expect(env.DATABASE_URL).toBe("postgresql://user:pass@host:5432/db");
  });

  it("rejects anything that is not a postgres URL", () => {
    expect(() => parseEnv({ DATABASE_URL: "mysql://nope" })).toThrow(/DATABASE_URL/);
  });

  it("rejects a malformed site URL and names the variable", () => {
    expect(() => parseEnv({ NEXT_PUBLIC_SITE_URL: "not a url" })).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });

  it("rejects an unknown NODE_ENV", () => {
    expect(() => parseEnv({ NODE_ENV: "staging" })).toThrow(/NODE_ENV/);
  });
});

describe("requireDatabaseUrl", () => {
  it("returns the URL when it is configured", () => {
    const env = parseEnv({ DATABASE_URL: "postgres://u:p@localhost:5432/db" });
    expect(requireDatabaseUrl(env)).toBe("postgres://u:p@localhost:5432/db");
  });

  it("explains what to do when it is missing", () => {
    expect(() => requireDatabaseUrl(parseEnv({}))).toThrow(/\.env\.example/);
  });
});
