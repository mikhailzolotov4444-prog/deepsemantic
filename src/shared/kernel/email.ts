/** Deliberately simple: the real proof that an address works is that mail arrives. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const EMAIL_MAX_LENGTH = 254;

export function isValidEmail(raw: string): boolean {
  const email = raw.trim();
  return email.length <= EMAIL_MAX_LENGTH && EMAIL_PATTERN.test(email);
}

/** The form in which addresses are stored and compared. */
export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}
