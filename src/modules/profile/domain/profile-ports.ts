import type { Locale } from "@/shared/i18n/config";
import type { Profile } from "./profile";

export interface ProfileReader {
  get(locale: Locale): Promise<Profile>;
}
