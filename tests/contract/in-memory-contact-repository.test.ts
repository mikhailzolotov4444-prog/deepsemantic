import { InMemoryContactRepository } from "@/modules/contact/infrastructure/in-memory-contact-repository";
import { runContactRepositoryContract } from "./contact-repository.contract";

// The Drizzle implementation needs a real database, so it joins this contract later
// (a good job for a test database in CI).
runContactRepositoryContract("in memory", () => {
  const repository = new InMemoryContactRepository();
  return {
    repository,
    load: async (id) => repository.get(id),
    count: async () => repository.count(),
  };
});
