import { describe, expect, it } from "vitest";
import { TurnstileVerifier } from "./turnstile-verifier";

function fakeFetch(respond: () => Response | Promise<Response>) {
  const calls: { url: string; body: URLSearchParams }[] = [];
  const impl = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), body: init?.body as URLSearchParams });
    return respond();
  }) as typeof fetch;
  return { calls, impl };
}

const ok = () => Response.json({ success: true });

describe("TurnstileVerifier", () => {
  it("accepts a token that Cloudflare confirms", async () => {
    const { calls, impl } = fakeFetch(ok);

    const result = await new TurnstileVerifier("secret", impl).verify({
      token: "tok",
      ip: "203.0.113.7",
    });

    expect(result).toBe(true);
    expect(calls[0]?.url).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify");
    expect(calls[0]?.body.get("secret")).toBe("secret");
    expect(calls[0]?.body.get("response")).toBe("tok");
    expect(calls[0]?.body.get("remoteip")).toBe("203.0.113.7");
  });

  it("does not send the visitor address when it is unknown", async () => {
    const { calls, impl } = fakeFetch(ok);
    await new TurnstileVerifier("secret", impl).verify({ token: "tok", ip: undefined });
    expect(calls[0]?.body.has("remoteip")).toBe(false);
  });

  it("rejects a missing token without calling Cloudflare", async () => {
    const { calls, impl } = fakeFetch(ok);
    const result = await new TurnstileVerifier("secret", impl).verify({
      token: undefined,
      ip: undefined,
    });
    expect(result).toBe(false);
    expect(calls).toHaveLength(0);
  });

  it("rejects a token that Cloudflare does not confirm", async () => {
    const { impl } = fakeFetch(() => Response.json({ success: false }));
    expect(await new TurnstileVerifier("s", impl).verify({ token: "t", ip: undefined })).toBe(
      false,
    );
  });

  it("fails closed when Cloudflare answers with an HTTP error", async () => {
    const { impl } = fakeFetch(() => new Response("oops", { status: 500 }));
    expect(await new TurnstileVerifier("s", impl).verify({ token: "t", ip: undefined })).toBe(
      false,
    );
  });

  it("fails closed when the network request throws", async () => {
    const { impl } = fakeFetch(() => {
      throw new Error("offline");
    });
    expect(await new TurnstileVerifier("s", impl).verify({ token: "t", ip: undefined })).toBe(
      false,
    );
  });
});
