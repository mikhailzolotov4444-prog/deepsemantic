import { InMemoryFileStorage } from "@/modules/documents/infrastructure/in-memory-file-storage";
import { runFileStorageContract } from "./file-storage.contract";

// The Vercel Blob adapter is checked by hand on the live site (it needs a real Blob store).
runFileStorageContract("in memory", () => new InMemoryFileStorage());
