export interface AuthMail {
  readonly from: string;
  readonly to: string;
  readonly subject: string;
  readonly text: string;
}

/** Sends the login link. Rejects (throws) when the mail could not be handed over. */
export interface AuthMailer {
  send(mail: AuthMail): Promise<void>;
}

export const ADMIN_SESSION_COOKIE = "ds_admin";
export const LOGIN_LINK_TTL_SECONDS = 15 * 60;
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

export const LOGIN_TOKEN_PURPOSE = "admin-login";
export const SESSION_TOKEN_PURPOSE = "admin-session";

export interface AdminAuthConfig {
  /** The one person allowed in. */
  readonly adminEmail: string;
  readonly fromEmail: string;
  /** Public address of the site, used for the link inside the email. */
  readonly siteUrl: string;
  readonly siteName: string;
}
