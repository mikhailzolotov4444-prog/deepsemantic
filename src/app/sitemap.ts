import type { MetadataRoute } from "next";
import { getContainer } from "@/composition-root/container";
import { isVisible } from "@/modules/documents/domain/teaching-document";
import { getEnv } from "@/shared/config/env";
import { publicPaths } from "@/shared/config/site";
import { localizedPath, locales } from "@/shared/i18n/config";

// Read from the database on each request, so new materials appear without a rebuild.
export const dynamic = "force-dynamic";

async function documentPaths(): Promise<string[]> {
  try {
    const documents = await getContainer().documents.listAll.execute();
    return documents.filter(isVisible).map((document) => `/library/${document.slug}`);
  } catch (error) {
    // A sitemap without materials is better than no sitemap at all.
    console.error("Sitemap: could not read documents", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getEnv().NEXT_PUBLIC_SITE_URL;
  const paths = [...publicPaths, ...(await documentPaths())];

  // One entry per language version, each pointing at its translations.
  return paths.flatMap((path) =>
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
