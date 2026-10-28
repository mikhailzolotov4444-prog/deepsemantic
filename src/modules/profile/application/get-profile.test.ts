import { describe, expect, it } from "vitest";
import type { Profile } from "@/modules/profile/domain/profile";
import { GetProfile } from "./get-profile";

const profile: Profile = {
  displayName: "Test Teacher",
  headline: "English teacher",
  bio: ["First paragraph.", "Second paragraph."],
  certifications: [],
  experience: [],
  socialLinks: [],
};

describe("GetProfile", () => {
  it("returns whatever the profile reader provides", async () => {
    const useCase = new GetProfile({ get: async () => profile });
    expect(await useCase.execute("en")).toEqual(profile);
  });

  it("asks the reader for the requested language", async () => {
    const asked: string[] = [];
    const useCase = new GetProfile({
      get: async (locale) => {
        asked.push(locale);
        return profile;
      },
    });
    await useCase.execute("ru");
    expect(asked).toEqual(["ru"]);
  });
});
