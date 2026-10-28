import { describe, expect, it } from "vitest";
import { ResendEmailSender } from "./resend-email-sender";

const email = {
  from: "Deep Semantic <site@example.com>",
  to: "owner@example.com",
  replyTo: "anna@example.com",
  subject: "Hello",
  text: "Body",
};

function fakeFetch(status: number) {
  const calls: { url: string; init: RequestInit }[] = [];
  const impl = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    return new Response("{}", { status });
  }) as typeof fetch;
  return { calls, impl };
}

describe("ResendEmailSender", () => {
  it("posts the email to the Resend API with the API key", async () => {
    const { calls, impl } = fakeFetch(200);

    await new ResendEmailSender("re_key", impl).send(email);

    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe("https://api.resend.com/emails");
    expect(calls[0]?.init.method).toBe("POST");
    expect(calls[0]?.init.headers).toEqual({
      Authorization: "Bearer re_key",
      "Content-Type": "application/json",
    });
    expect(JSON.parse(String(calls[0]?.init.body))).toEqual({
      from: "Deep Semantic <site@example.com>",
      to: ["owner@example.com"],
      subject: "Hello",
      text: "Body",
      reply_to: "anna@example.com",
    });
  });

  it("leaves out reply_to when there is none", async () => {
    const { calls, impl } = fakeFetch(200);

    await new ResendEmailSender("re_key", impl).send({ ...email, replyTo: undefined });

    expect(JSON.parse(String(calls[0]?.init.body))).toEqual({
      from: "Deep Semantic <site@example.com>",
      to: ["owner@example.com"],
      subject: "Hello",
      text: "Body",
    });
  });

  it("throws when Resend answers with an error", async () => {
    const { impl } = fakeFetch(422);

    let thrown: unknown;
    try {
      await new ResendEmailSender("re_key", impl).send(email);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(Error);
    expect(String((thrown as Error).message)).toMatch(/422/);
  });
});
