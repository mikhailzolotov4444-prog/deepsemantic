import type { SpamCheckInput, SpamVerifier } from "@/modules/contact/domain/contact-ports";

const SITEVERIFY_ENDPOINT = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** Cloudflare Turnstile: a privacy-friendly CAPTCHA alternative. Fails closed on any problem. */
export class TurnstileVerifier implements SpamVerifier {
  constructor(
    private readonly secretKey: string,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async verify({ token, ip }: SpamCheckInput): Promise<boolean> {
    if (!token) return false;

    const body = new URLSearchParams({ secret: this.secretKey, response: token });
    if (ip) body.set("remoteip", ip);

    try {
      const doFetch = this.fetchImpl;
      const response = await doFetch(SITEVERIFY_ENDPOINT, { method: "POST", body });
      if (!response.ok) return false;
      const result = (await response.json()) as { success?: boolean };
      return result.success === true;
    } catch {
      return false;
    }
  }
}
