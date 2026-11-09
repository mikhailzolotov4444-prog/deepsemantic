import { err, normalizeEmail, ok, UnauthorizedError, type Result } from "@/shared/kernel";
import type { TokenSigner } from "@/shared/security/token-signer";
import {
  LOGIN_LINK_TTL_SECONDS,
  LOGIN_TOKEN_PURPOSE,
  SESSION_TOKEN_PURPOSE,
  SESSION_TTL_SECONDS,
  type AdminAuthConfig,
  type AuthMailer,
} from "../domain/auth-ports";

/**
 * Step 1: the owner types an address. Only the admin's address gets a link; the caller must
 * answer every visitor the same way, so that nobody can find out which address is the admin's.
 */
export class RequestAdminLogin {
  constructor(
    private readonly mailer: AuthMailer,
    private readonly signer: TokenSigner,
    private readonly config: AdminAuthConfig,
  ) {}

  /** `path` is the link without the site address; null when the address is not the admin's. */
  async execute(rawEmail: string): Promise<{ readonly path: string | null }> {
    const email = normalizeEmail(rawEmail);
    if (email !== normalizeEmail(this.config.adminEmail)) return { path: null };

    const token = await this.signer.sign(
      { p: LOGIN_TOKEN_PURPOSE, e: email },
      LOGIN_LINK_TTL_SECONDS,
    );
    const path = `/admin/verify?token=${encodeURIComponent(token)}`;
    await this.mailer.send({
      from: this.config.fromEmail,
      to: this.config.adminEmail,
      subject: `Вход в админку ${this.config.siteName}`,
      text: [
        "Откройте ссылку, чтобы войти (она действует 15 минут):",
        "",
        `${this.config.siteUrl}${path}`,
        "",
        "Если вы не запрашивали вход, просто проигнорируйте это письмо.",
      ].join("\n"),
    });
    return { path };
  }
}

export interface AdminSession {
  readonly token: string;
  readonly maxAgeSeconds: number;
}

/** Step 2: the emailed link is opened; a session (to be stored in a cookie) is issued. */
export class VerifyAdminLogin {
  constructor(
    private readonly signer: TokenSigner,
    private readonly config: AdminAuthConfig,
  ) {}

  async execute(loginToken: string): Promise<Result<AdminSession, UnauthorizedError>> {
    const payload = await this.signer.verify(loginToken);
    const email = normalizeEmail(this.config.adminEmail);
    if (!payload || payload.p !== LOGIN_TOKEN_PURPOSE || payload.e !== email) {
      return err(new UnauthorizedError("The login link is invalid or has expired"));
    }
    const token = await this.signer.sign(
      { p: SESSION_TOKEN_PURPOSE, e: email },
      SESSION_TTL_SECONDS,
    );
    return ok({ token, maxAgeSeconds: SESSION_TTL_SECONDS });
  }
}

/** Step 3, on every admin request: is this cookie a genuine, unexpired admin session? */
export class ResolveAdminSession {
  constructor(
    private readonly signer: TokenSigner,
    private readonly config: AdminAuthConfig,
  ) {}

  async execute(sessionToken: string | undefined): Promise<boolean> {
    if (!sessionToken) return false;
    const payload = await this.signer.verify(sessionToken);
    return (
      payload !== null &&
      payload.p === SESSION_TOKEN_PURPOSE &&
      payload.e === normalizeEmail(this.config.adminEmail)
    );
  }
}
