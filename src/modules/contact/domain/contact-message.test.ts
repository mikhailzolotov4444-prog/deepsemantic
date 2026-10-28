import { describe, expect, it } from "vitest";
import {
  ContactValidationError,
  createContactMessage,
  isContactTopic,
  type ContactDraft,
} from "./contact-message";

const meta = { id: "m-1", now: new Date("2026-10-27T10:00:00Z") };

const valid: ContactDraft = {
  name: "Anna Petrova",
  email: "anna@example.com",
  topic: "lessons",
  message: "Hello, I would like to book a trial lesson.",
};

function fieldsOf(draft: ContactDraft) {
  const result = createContactMessage(draft, meta);
  if (result.ok) throw new Error("expected a validation error");
  return result.error.fields;
}

describe("createContactMessage", () => {
  it("creates a message from valid input", () => {
    const result = createContactMessage(valid, meta);
    expect(result).toEqual({
      ok: true,
      value: { ...valid, id: "m-1", createdAt: meta.now },
    });
  });

  it("trims whitespace around every field", () => {
    const result = createContactMessage(
      {
        name: "  Anna  ",
        email: " anna@example.com ",
        topic: " other ",
        message: "  A long enough message.  ",
      },
      meta,
    );
    if (!result.ok) throw new Error("expected success");
    expect(result.value.name).toBe("Anna");
    expect(result.value.email).toBe("anna@example.com");
    expect(result.value.topic).toBe("other");
    expect(result.value.message).toBe("A long enough message.");
  });

  it("removes line breaks from the name so it is safe in an email subject", () => {
    const result = createContactMessage({ ...valid, name: "Anna\r\nBcc: spy@example.com" }, meta);
    if (!result.ok) throw new Error("expected success");
    expect(result.value.name).toBe("Anna Bcc: spy@example.com");
  });

  it("keeps line breaks inside the message", () => {
    const result = createContactMessage({ ...valid, message: "First line.\n\nSecond line." }, meta);
    if (!result.ok) throw new Error("expected success");
    expect(result.value.message).toBe("First line.\n\nSecond line.");
  });

  it("requires a name", () => {
    expect(fieldsOf({ ...valid, name: "   " }).name).toBe("name_required");
  });

  it("limits the length of the name", () => {
    expect(fieldsOf({ ...valid, name: "a".repeat(101) }).name).toBe("name_too_long");
  });

  it("rejects malformed email addresses", () => {
    for (const email of ["", "anna", "anna@", "@example.com", "anna@example", "a b@example.com"]) {
      expect(fieldsOf({ ...valid, email }).email).toBe("email_invalid");
    }
  });

  it("rejects email addresses that are too long", () => {
    const email = `${"a".repeat(250)}@example.com`;
    expect(fieldsOf({ ...valid, email }).email).toBe("email_invalid");
  });

  it("rejects an unknown topic", () => {
    expect(fieldsOf({ ...valid, topic: "spam" }).topic).toBe("topic_invalid");
  });

  it("rejects a message that is too short", () => {
    expect(fieldsOf({ ...valid, message: "Hi" }).message).toBe("message_too_short");
  });

  it("rejects a message that is too long", () => {
    expect(fieldsOf({ ...valid, message: "a".repeat(5001) }).message).toBe("message_too_long");
  });

  it("reports every problem at once", () => {
    const fields = fieldsOf({ name: "", email: "x", topic: "", message: "" });
    expect(Object.keys(fields).sort()).toEqual(["email", "message", "name", "topic"]);
  });

  it("explains the problems in the error", () => {
    const result = createContactMessage({ ...valid, name: "" }, meta);
    if (result.ok) throw new Error("expected a validation error");
    expect(result.error).toBeInstanceOf(ContactValidationError);
    expect(result.error.code).toBe("validation_failed");
    expect(result.error.issues).toEqual(["name: name_required"]);
  });
});

describe("isContactTopic", () => {
  it("accepts the known topics only", () => {
    expect(isContactTopic("lessons")).toBe(true);
    expect(isContactTopic("materials")).toBe(true);
    expect(isContactTopic("other")).toBe(true);
    expect(isContactTopic("nope")).toBe(false);
  });
});
