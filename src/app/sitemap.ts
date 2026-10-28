import type { MetadataRoute } from "next";
import { getEnv } from "@/shared/config/env";
import { publicPaths } from "@/shared/config/site";
import { localizedPath, locales } from "@/shared/i18n/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getEnv().NEXT_PUBLIC_SITE_URL;

  // One entry per language version, each pointing at its translations.
  return publicPaths.flatMap((path) =>
    locales.map((locale) => ({
      url: `${siteUrl}${localizedPath(locale, path)}`,
      alternates: {
        languages: Object.fromEntries(
          locales.map((code) => [code, `${siteUrl}${localizedPath(code, path)}`]),
        ),
      },
    })),
  );
}
