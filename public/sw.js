/*
 * Service worker of Deep Semantic. Hand-written on purpose, no library: see
 * docs/adr/0005-pwa-without-a-library.md.
 *
 * - Built files (/_next/static, /icons) never change under the same name: cache first.
 * - Pages: always try the network first, keep a copy, and fall back to that copy (or to
 *   /offline.html) when there is no connection.
 * - Never touched: the admin area, API routes (downloads, forms) and anything not GET.
 *
 * Change VERSION to throw away every old cache on the next visit.
 */
const VERSION = "v1";
const STATIC_CACHE = `ds-static-${VERSION}`;
const PAGE_CACHE = `ds-pages-${VERSION}`;
const OFFLINE_URL = "/offline.html";
const PRECACHE = [OFFLINE_URL, "/icons/icon-192.png"];
const MAX_PAGES = 40;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name.startsWith("ds-") && ![STATIC_CACHE, PAGE_CACHE].includes(name))
            .map((name) => caches.delete(name)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isPrivate(url.pathname)) return;

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request));
  }
});

function isPrivate(pathname) {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/api/") ||
    pathname === "/sw.js"
  );
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(STATIC_CACHE);
    await cache.put(request, response.clone());
  }
  return response;
}

async function networkFirstPage(request) {
  try {
    const response = await fetch(request);
    // Keep only normal pages: not redirects (language choice) and not error pages.
    if (response.ok && !response.redirected && response.type === "basic") {
      const cache = await caches.open(PAGE_CACHE);
      await cache.put(request, response.clone());
      await trim(cache);
    }
    return response;
  } catch {
    const cached = await caches.match(request, { ignoreVary: true });
    return cached ?? (await caches.match(OFFLINE_URL)) ?? Response.error();
  }
}

/** Keeps the page cache small: the oldest saved pages go first. */
async function trim(cache) {
  const keys = await cache.keys();
  const extra = keys.length - MAX_PAGES;
  for (let index = 0; index < extra; index += 1) {
    await cache.delete(keys[index]);
  }
}
