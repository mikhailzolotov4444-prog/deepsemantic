import { describe, expect, it } from "vitest";
import type { ContactMessage } from "@/modules/contact/domain/contact-message";
import type { ContactRepository } from "@/modules/contact/domain/contact-ports";

/** Test-only window into an implementation: the port itself is write-only. */
export interface ContactRepositoryHarness {
  readonly repository: ContactRepository;
  load(id: string): Promise<ContactMessage | undefined>;
  count(): Promise<number>;
}

const message: ContactMessage = {
  id: "contract-1",
  name: "Anna Petrova",
  email: "anna@example.com",
  topic: "lessons",
  message: "Hello, I would like to book a trial lesson.",
  createdAt: new Date("2026-10-27T10:00:00Z"),
};

/**
 * Every ContactRepository implementation (in memory, Drizzle, ...) must pass these tests.
 * That is what makes implementations interchangeable (the "L" in SOLID).
 */
export function runContactRepositoryContract(
  name: string,
  createHarness: () => Promise<ContactRepositoryHarness> | ContactRepositoryHarness,
): void {
  describe(`ContactRepository contract: ${name}`, () => {
    it("stores a message so that it can be read back unchanged", async () => {
      const harness = await createHarness();

      await harness.repository.save(message);

      expect(await harness.load("contract-1")).toEqual(message);
    });

    it("keeps different messages apart", async () => {
      const harness = await createHarness();

      await harness.repository.save(message);
      await harness.repository.save({ ...message, id: "contract-2" });

      expect(await harness.count()).toBe(2);
    });

    it("does not create a duplicate when the same id is saved twice", async () => {
      const harness = await createHarness();

      await harness.repository.save(message);
      await harness.repository.save(message);

      expect(await harness.count()).toBe(1);
    });
  });
}
