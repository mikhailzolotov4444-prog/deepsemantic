import type { MetadataRoute } from "next";
import { getEnv } from "@/shared/config/env";

export default function robots(): MetadataRoute.Robots {
  const env = getEnv();

  // Until the content is ready the whole site asks search engines to stay away.
  if (!env.NEXT_PUBLIC_ALLOW_INDEXING) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
  };
}
