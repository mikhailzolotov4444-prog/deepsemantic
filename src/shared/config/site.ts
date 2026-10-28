/** Names and links shared by the header, footer, metadata and sitemap. Texts live in i18n. */
export const siteConfig = {
  name: "Deep Semantic",
} as const;

/** Every public page (without the language prefix); the sitemap is built from this list. */
export const publicPaths = ["/", "/about", "/contact", "/privacy", "/terms"] as const;
