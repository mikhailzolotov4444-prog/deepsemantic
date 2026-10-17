/** Branded strings stop us from passing a DocumentId where an OrderId is expected. */
export type Brand<T, B extends string> = T & { readonly __brand: B };
export type Id<B extends string> = Brand<string, B>;

export interface IdGenerator {
  next(): string;
}

export class UuidGenerator implements IdGenerator {
  next(): string {
    return globalThis.crypto.randomUUID();
  }
}

/** Test helper: predictable ids ("id-1", "id-2", ...). */
export class SequentialIdGenerator implements IdGenerator {
  private counter = 0;

  constructor(private readonly prefix = "id") {}

  next(): string {
    this.counter += 1;
    return `${this.prefix}-${this.counter}`;
  }
}
