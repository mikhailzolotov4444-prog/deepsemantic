"use client";

import { useEffect } from "react";

/**
 * Registers public/sw.js (offline support, faster repeat visits). Only in production builds:
 * in `pnpm dev` a service worker would keep serving old files and hide your edits.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    // A failure here only means "no offline mode"; the site itself keeps working.
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  return null;
}
