import { describe, expect, it } from "vitest";
import { DeliveryFailedError, SpamRejectedError } from "@/modules/contact/domain/contact-errors";
import { ContactValidationError } from "@/modules/contact/domain/contact-message";
import type { SpamCheckInput, SpamVerifier } from "@/modules/contact/domain/contact-ports";
import { InMemoryContactRepository } from "@/modules/contact/infrastructure/in-memory-contact-repository";
import { InMemoryEmailSender } from "@/modules/contact/infrastructure/in-memory-email-sender";
import { FixedClock, SequentialIdGenerator } from "@/shared/kernel";
import {
  SubmitContactMessage,
  type SubmitContactInput,
} from "@/modules/contact/application/submit-contact-message";

class StubSpamVerifier implements SpamVerifier {
  readonly calls: SpamCheckInput[] = [];

  constructor(private readonly answer: boolean) {}

  async verify(input: SpamCheckInput): Promise<boolean> {
    this.calls.push(input);
    return this.answer;
  }
}

const input: SubmitContactInput = {
  name: "Anna Petrova",
  email: "anna@example.com",
  topic: "lessons",
  message: "Hello, I would like to book a trial lesson.",
  website: "",
  turnstileToken: "token-1",
  ip: "203.0.113.7",
};

function setup(options: { isHuman?: boolean; emailError?: Error } = {}) {
  const repository = new InMemoryContactRepository();
  const emailSender = new InMemoryEmailSender(options.emailError);
  const spam = new StubSpamVerifier(options.isHuman ?? true);
  const useCase = new SubmitContactMessage(
    repository,
    emailSender,
    spam,
    new FixedClock("2026-10-27T10:00:00Z"),
    new SequentialIdGenerator("msg"),
    { ownerEmail: "owner@example.com", fromEmail: "site@example.com", siteName: "Deep Semantic" },
  );
  return { repository, emailSender, spam, useCase };
}

describe("SubmitContactMessage", () => {
  it("saves the message and notifies the owner", async () => {
    const { repository, emailSender, useCase } = setup();

    const result = await useCase.execute(input);

    expect(result.ok).toBe(true);
    expect(repository.get("msg-1")).toEqual({
      id: "msg-1",
      name: "Anna Petrova",
      email: "anna@example.com",
      topic: "lessons",
      message: "Hello, I would like to book a trial lesson.",
      createdAt: new Date("2026-10-27T10:00:00Z"),
    });
    expect(emailSender.sent).toHaveLength(1);
    expect(emailSender.sent[0]).toEqual({
      from: "site@example.com",
      to: "owner@example.com",
      replyTo: "anna@example.com",
      subject: "[Deep Semantic] New message from Anna Petrova",
      text: "Name: Anna Petrova\nEmail: anna@example.com\nTopic: lessons\n\nHello, I would like to book a trial lesson.",
    });
  });

  it("passes the token and visitor address to the anti-spam check", async () => {
    const { spam, useCase } = setup();
    await useCase.execute(input);
    expect(spam.calls).toEqual([{ token: "token-1", ip: "203.0.113.7" }]);
  });

  it("rejects invalid input without touching the anti-spam check, storage or email", async () => {
    const { repository, emailSender, spam, useCase } = setup();

    const result = await useCase.execute({ ...input, name: "" });

    if (result.ok) throw new Error("expected an error");
    expect(result.error).toBeInstanceOf(ContactValidationError);
    expect(spam.calls).toHaveLength(0);
    expect(repository.count()).toBe(0);
    expect(emailSender.sent).toHaveLength(0);
  });

  it("rejects visitors who fail the anti-spam check", async () => {
    const { repository, emailSender, useCase } = setup({ isHuman: false });

    const result = await useCase.execute(input);

    if (result.ok) throw new Error("expected an error");
    expect(result.error).toBeInstanceOf(SpamRejectedError);
    expect(repository.count()).toBe(0);
    expect(emailSender.sent).toHaveLength(0);
  });

  it("silently ignores submissions that fill in the honeypot field", async () => {
    const { repository, emailSender, spam, useCase } = setup();

    const result = await useCase.execute({ ...input, website: "http://spam.example" });

    expect(result.ok).toBe(true);
    expect(spam.calls).toHaveLength(0);
    expect(repository.count()).toBe(0);
    expect(emailSender.sent).toHaveLength(0);
  });

  it("reports a delivery failure but keeps the stored message", async () => {
    const { repository, useCase } = setup({ emailError: new Error("mail server down") });

    const result = await useCase.execute(input);

    if (result.ok) throw new Error("expected an error");
    expect(result.error).toBeInstanceOf(DeliveryFailedError);
    expect(result.error.cause).toBeInstanceOf(Error);
    expect(repository.count()).toBe(1);
  });
});
