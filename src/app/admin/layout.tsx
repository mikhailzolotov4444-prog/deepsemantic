import type { Metadata } from "next";
import type { ReactNode } from "react";
import { siteConfig } from "@/shared/config/site";
import { ThemeProvider } from "@/shared/ui/theme-provider";
import "../globals.css";

export const metadata: Metadata = {
  title: { default: `Админка | ${siteConfig.name}`, template: `%s | Админка` },
  // The admin area must never appear in search results.
  robots: { index: false, follow: false },
};

// The admin area is outside the language folders, so it has its own <html>.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="min-h-dvh">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
