import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { getEnv } from "@/shared/config/env";
import { ThemeProvider } from "@/shared/ui/theme-provider";
import "./globals.css";

const env = getEnv();

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: {
    default: "Deep Semantic | English teacher",
    template: "%s | Deep Semantic",
  },
  description: "English lessons, teaching materials and resources. The new website is coming soon.",
  openGraph: {
    type: "website",
    siteName: "Deep Semantic",
    locale: "en_GB",
  },
  // Stay out of search results until the real content is ready (NEXT_PUBLIC_ALLOW_INDEXING=true).
  robots: env.NEXT_PUBLIC_ALLOW_INDEXING
    ? { index: true, follow: true }
    : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfcfb" },
    { media: "(prefers-color-scheme: dark)", color: "#14161c" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning: next-themes sets the theme class on <html> before React hydrates.
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to main content
        </a>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
