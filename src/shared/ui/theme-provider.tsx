"use client";

import type { ReactNode } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * The site is designed dark (see noir.css), so it opens dark for everyone; the toggle stores an
 * explicit choice. The light theme is a plain fallback until it gets its own design.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
