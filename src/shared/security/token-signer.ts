import type { Clock } from "@/shared/kernel";

export type TokenPayload = Readonly<Record<string, string>>;

/** Makes short-lived, tamper-proof tokens (login links, download links, session cookies). */
export interface TokenSigner {
  sign(payload: TokenPayload, ttlSeconds: number): Promise<string>;
  /** Returns the payload, or null when the token is malformed, forged or expired. */
  verify(token: string): Promise<TokenPayload | null>;
}

const MIN_SECRET_LENGTH = 32;

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(text: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[A-Za-z0-9_-]*$/.test(text)) return null;
  const padded = text
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(text.length / 4) * 4, "=");
  try {
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  } catch {
    return null;
  }
}

/**
 * HMAC-SHA256 tokens built on the Web Crypto API (available in Node and in the browser), so no
 * library is needed. Format: base64url(json).base64url(signature).
 */
export class HmacTokenSigner implements TokenSigner {
  private keyPromise: Promise<CryptoKey> | undefined;

  constructor(
    private readonly secret: string,
    private readonly clock: Clock,
  ) {
    if (secret.length < MIN_SECRET_LENGTH) {
      throw new Error(`The signing secret must be at least ${MIN_SECRET_LENGTH} characters long`);
    }
  }

  private key(): Promise<CryptoKey> {
    this.keyPromise ??= globalThis.crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(this.secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"],
    );
    return this.keyPromise;
  }

  async sign(payload: TokenPayload, ttlSeconds: number): Promise<string> {
    const expires = Math.floor(this.clock.now().getTime() / 1000) + ttlSeconds;
    const body = toBase64Url(new TextEncoder().encode(JSON.stringify({ d: payload, e: expires })));
    const signature = await globalThis.crypto.subtle.sign(
      "HMAC",
      await this.key(),
      new TextEncoder().encode(body),
    );
    return `${body}.${toBase64Url(new Uint8Array(signature))}`;
  }

  async verify(token: string): Promise<TokenPayload | null> {
    const [body, signature, ...rest] = token.split(".");
    if (!body || !signature || rest.length > 0) return null;

    const signatureBytes = fromBase64Url(signature);
    if (!signatureBytes) return null;

    // subtle.verify compares in constant time, so timing reveals nothing about the signature.
    const genuine = await globalThis.crypto.subtle.verify(
      "HMAC",
      await this.key(),
      signatureBytes,
      new TextEncoder().encode(body),
    );
    if (!genuine) return null;

    const bodyBytes = fromBase64Url(body);
    if (!bodyBytes) return null;
    try {
      const parsed: unknown = JSON.parse(new TextDecoder().decode(bodyBytes));
      if (typeof parsed !== "object" || parsed === null) return null;
      const { d, e } = parsed as { d?: unknown; e?: unknown };
      if (typeof e !== "number" || e * 1000 < this.clock.now().getTime()) return null;
      if (typeof d !== "object" || d === null) return null;
      const payload: Record<string, string> = {};
      for (const [name, value] of Object.entries(d)) {
        if (typeof value !== "string") return null;
        payload[name] = value;
      }
      return payload;
    } catch {
      return null;
    }
  }
}
