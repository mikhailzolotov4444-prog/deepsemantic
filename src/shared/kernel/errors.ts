/** Base class for expected, named failures. `code` is stable and safe to show to API clients. */
export abstract class AppError extends Error {
  abstract readonly code: string;

  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = new.target.name;
  }
}

export class NotFoundError extends AppError {
  readonly code = "not_found";

  constructor(what: string, id?: string) {
    super(id === undefined ? `${what} not found` : `${what} "${id}" not found`);
  }
}

export class ValidationError extends AppError {
  readonly code = "validation_failed";

  constructor(
    message: string,
    readonly issues: readonly string[] = [],
  ) {
    super(message);
  }
}

export class ConflictError extends AppError {
  readonly code = "conflict";
}

export class UnauthorizedError extends AppError {
  readonly code = "unauthorized";

  constructor(message = "Authentication required") {
    super(message);
  }
}

export class ForbiddenError extends AppError {
  readonly code = "forbidden";

  constructor(message = "You are not allowed to do this") {
    super(message);
  }
}
