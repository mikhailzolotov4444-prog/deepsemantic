import { AppError } from "@/shared/kernel";

/** The anti-spam check did not pass (missing or invalid token). */
export class SpamRejectedError extends AppError {
  readonly code = "spam_rejected";

  constructor() {
    super("The anti-spam check failed");
  }
}

/** The owner could not be notified, so the visitor should try again later. */
export class DeliveryFailedError extends AppError {
  readonly code = "delivery_failed";

  constructor(options?: { cause?: unknown }) {
    super("The message could not be delivered", options);
  }
}
