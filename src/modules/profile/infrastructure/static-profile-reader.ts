import type { Profile } from "@/modules/profile/domain/profile";
import type { ProfileReader } from "@/modules/profile/domain/profile-ports";
import type { Locale } from "@/shared/i18n/config";

/**
 * PLACEHOLDER CONTENT. Edit the values below to describe yourself, in both languages; the site
 * updates on the next deploy. In Phase 2 the admin area replaces this file with a
 * database-backed reader, and nothing else in the app has to change.
 *
 * Only add certificates and experience that are true and that you can document.
 */
export const placeholderProfiles: Record<Locale, Profile> = {
  ru: {
    displayName: "Ваше имя",
    headline: "Преподаватель английского для учеников любого уровня",
    bio: [
      "Это текст-заглушка. Замените его несколькими предложениями о вашем опыте, подходе к преподаванию и о том, с какими учениками вам нравится работать.",
      "Расскажите, чем ваши уроки отличаются: какие уровни вы преподаёте, с какими целями помогаете (экзамены, работа, путешествия, разговорная практика) и как проходит первое занятие.",
    ],
    certifications: [
      {
        name: "Добавьте ваш сертификат",
        issuer: "Организация, выдавшая документ",
      },
    ],
    experience: [
      {
        role: "Добавьте должность",
        place: "Школа, компания или онлайн-платформа",
        period: "Годы работы",
        summary: "Одно-два предложения о том, чем вы занимались и чего добились.",
      },
    ],
    socialLinks: [],
  },
  en: {
    displayName: "Your Name",
    headline: "English teacher for learners of all levels",
    bio: [
      "This is a placeholder biography. Replace it with a few sentences about your background, your teaching approach and the learners you enjoy working with.",
      "Mention what makes your lessons different: the levels you teach, the goals you help with (exams, work, travel, conversation) and how a first lesson works.",
    ],
    certifications: [
      {
        name: "Add your teaching certificate",
        issuer: "Issuing organisation",
      },
    ],
    experience: [
      {
        role: "Add your role",
        place: "School, company or online platform",
        period: "Years",
        summary: "One or two sentences about what you did and achieved there.",
      },
    ],
    socialLinks: [],
  },
};

export class StaticProfileReader implements ProfileReader {
  constructor(private readonly profiles: Record<Locale, Profile> = placeholderProfiles) {}

  async get(locale: Locale): Promise<Profile> {
    return this.profiles[locale];
  }
}
