import type { SpamVerifier } from "@/modules/contact/domain/contact-ports";

/** Lets everyone through. Only wired in development mode, never on a live site. */
export class AcceptingSpamVerifier implements SpamVerifier {
  async verify(): Promise<boolean> {
    return true;
  }
}
