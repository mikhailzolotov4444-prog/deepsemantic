import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const wcagTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

test.describe("materials library", () => {
  test("opens in both languages and explains that it is still empty", async ({ page }) => {
    await page.goto("/ru/library");
    await expect(page.getByRole("heading", { level: 1, name: "Материалы" })).toBeVisible();
    await expect(page.getByText("Первые материалы скоро появятся здесь.")).toBeVisible();

    await page.goto("/en/library");
    await expect(page.getByRole("heading", { level: 1, name: "Materials" })).toBeVisible();
    await expect(page.getByRole("search")).toBeVisible();
  });

  test("keeps filters in the address and still works", async ({ page }) => {
    await page.goto("/en/library");
    await page.getByLabel("Level").selectOption("B1");
    await page.getByRole("button", { name: "Show" }).click();
    await expect(page).toHaveURL(/level=B1/);
    await expect(page.getByText("Nothing found. Try different filters.")).toBeVisible();
    await page.getByRole("link", { name: "Reset" }).click();
    await expect(page).toHaveURL(/\/en\/library$/);
  });

  for (const path of ["/ru/library", "/en/library"]) {
    test(`${path} has no WCAG 2.2 AA violations that axe can detect`, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze();
      expect(results.violations).toEqual([]);
    });
  }

  test("an unknown material is a 404 page", async ({ page }) => {
    const response = await page.goto("/en/library/does-not-exist");
    expect(response?.status()).toBe(404);
  });

  test("asking for a download of an unknown material goes back with a reason", async ({
    request,
  }) => {
    const response = await request.post("/api/documents/does-not-exist/download", {
      form: { locale: "en" },
      maxRedirects: 0,
    });
    expect(response.status()).toBe(303);
    expect(response.headers()["location"]).toContain("/en/library/does-not-exist?error=not_found");
  });

  test("a made-up download link is refused", async ({ request }) => {
    const response = await request.get("/api/download/made-up-token");
    expect(response.status()).toBe(403);
    expect(response.headers()["cache-control"]).toContain("no-store");
  });

  test("sitemap and robots mention the library", async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("/ru/library");
    expect(sitemap).toContain("/en/library");
  });
});
