import { expect, test } from "@playwright/test";

test.describe("installable app (PWA)", () => {
  test("the manifest describes an installable app with icons", async ({ request }) => {
    const response = await request.get("/manifest.webmanifest");
    expect(response.status()).toBe(200);
    const manifest = await response.json();
    expect(manifest).toMatchObject({ short_name: "Deep Semantic", display: "standalone" });
    const sizes = manifest.icons.map((icon: { sizes: string }) => icon.sizes);
    expect(sizes).toEqual(expect.arrayContaining(["192x192", "512x512"]));
    for (const icon of manifest.icons as { src: string }[]) {
      expect((await request.get(icon.src)).status()).toBe(200);
    }
  });

  test("pages point to the manifest", async ({ page }) => {
    await page.goto("/ru");
    await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
  });

  test("the service worker is served fresh, never from a cache", async ({ request }) => {
    const response = await request.get("/sw.js");
    expect(response.status()).toBe(200);
    expect(response.headers()["cache-control"]).toContain("no-cache");
  });

  test("the offline page exists in both languages", async ({ request }) => {
    const response = await request.get("/offline.html");
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("Нет соединения");
    expect(body).toContain("You are offline");
  });
});
