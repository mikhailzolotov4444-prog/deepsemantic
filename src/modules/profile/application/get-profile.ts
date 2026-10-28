import type { Profile } from "@/modules/profile/domain/profile";
import type { ProfileReader } from "@/modules/profile/domain/profile-ports";
import type { Locale } from "@/shared/i18n/config";

export class GetProfile {
  constructor(private readonly reader: ProfileReader) {}

  execute(locale: Locale): Promise<Profile> {
    return this.reader.get(locale);
  }
}
