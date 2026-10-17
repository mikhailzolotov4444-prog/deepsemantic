import { SystemClock, UuidGenerator, type Clock, type IdGenerator } from "@/shared/kernel";

/**
 * The ONLY place where interfaces (ports) are connected to concrete classes (adapters).
 * Each phase adds its adapters here, e.g. documents: DrizzleDocumentRepository, R2FileStorage.
 * Routes ask the container for ready-made use cases; tests pass fakes via `overrides`.
 */
export interface Container {
  readonly clock: Clock;
  readonly ids: IdGenerator;
}

export function createContainer(overrides: Partial<Container> = {}): Container {
  return {
    clock: new SystemClock(),
    ids: new UuidGenerator(),
    ...overrides,
  };
}

let instance: Container | undefined;

/** Lazily created singleton for the running app. */
export function getContainer(): Container {
  instance ??= createContainer();
  return instance;
}
