import type { TokenPayload, TokenSigner } from "./token-signer";

/** Used when no signing secret is configured: nothing can be signed and every token is refused. */
export class DisabledTokenSigner implements TokenSigner {
  async sign(): Promise<string> {
    throw new Error("AUTH_SECRET is not set, so tokens cannot be created");
  }

  async verify(): Promise<TokenPayload | null> {
    return null;
  }
}
