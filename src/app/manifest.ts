import type { MetadataRoute } from "next";
import { siteConfig } from "@/shared/config/site";
import { getDictionary } from "@/shared/i18n/dictionaries";

/**
 * Web app manifest (served at /manifest.webmanifest): lets phones install the site with its own
 * icon and open it full-screen like an app. Russian texts, because the domain is .ru.
 */
export default function manifest(): MetadataRoute.Manifest {
  const dict = getDictionary("ru");
  return {
    name: `${siteConfig.name}: ${dict.site.tagline}`,
    short_name: siteConfig.name,
    description: dict.site.description,
    lang: "ru",
    // "/" picks the visitor's language (see proxy.ts).
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0b0b0e",
    theme_color: "#0b0b0e",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
