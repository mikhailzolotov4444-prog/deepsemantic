import { InMemoryDocumentRepository } from "@/modules/documents/infrastructure/in-memory-document-repository";
import { runDocumentRepositoryContract } from "./document-repository.contract";

// The Drizzle implementation needs a real database, so it joins this contract later.
runDocumentRepositoryContract("in memory", () => {
  const repository = new InMemoryDocumentRepository();
  return { reader: repository, writer: repository };
});
