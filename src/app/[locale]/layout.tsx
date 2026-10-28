import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { getEnv } from "@/shared/config/env";
import { siteConfig } from "@/shared/config/site";
import { isLocale, locales } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/dictionaries";
import { resolveLocale, type LocaleParams } from "@/shared/i18n/params";
import { SiteFooter } from "@/shared/ui/site-footer";
import { SiteHeader } from "@/shared/ui/site-header";
import { ThemeProvider } from "@/shared/ui/theme-provider";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const env = getEnv();
  const dict = getDictionary(locale);

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
    title: {
      default: `${siteConfig.name} | ${dict.site.defaultTitle}`,
      template: `%s | ${siteConfig.name}`,
    },
    description: dict.site.description,
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      locale: locale === "ru" ? "ru_RU" : "en_GB",
    },
    twitter: { card: "summary_large_image" },
    // Stay out of search results until the real content is ready (NEXT_PUBLIC_ALLOW_INDEXING=true).
    robots: env.NEXT_PUBLIC_ALLOW_INDEXING
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfcfb" },
    { media: "(prefers-color-scheme: dark)", color: "#14161c" },
  ],
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleParams & { children: ReactNode }) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);

  return (
    // suppressHydrationWarning: next-themes sets the theme class on <html> before React hydrates.
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          {dict.a11y.skipLink}
        </a>
        <ThemeProvider>
          <div className="flex min-h-dvh flex-col">
            <SiteHeader locale={locale} dict={dict} />
            <main id="main" className="flex-1">
              {children}
            </main>
            <SiteFooter locale={locale} dict={dict} />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
