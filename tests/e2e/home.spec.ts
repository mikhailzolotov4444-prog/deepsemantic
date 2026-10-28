import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const wcagTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

test.describe("home page", () => {
  test("shows the headline and a descriptive title", async ({ page }) => {
    await page.goto("/ru");
    await expect(page).toHaveTitle(/Deep Semantic/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  for (const path of ["/ru", "/en", "/ru/about", "/en/about", "/ru/contact", "/en/privacy"]) {
    test(`${path} has no WCAG 2.2 AA violations that axe can detect`, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze();
      expect(results.violations).toEqual([]);
    });
  }

  test("does not scroll sideways on a 360 px wide phone", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    for (const path of ["/ru", "/en/contact"]) {
      await page.goto(path);
      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflows).toBe(false);
    }
  });

  test("is not indexable until indexing is switched on", async ({ page }) => {
    await page.goto("/ru");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("can switch to dark mode and back", async ({ page }) => {
    await page.goto("/en");
    const toggle = page.getByRole("button", { name: "Toggle dark mode" });
    const html = page.locator("html");

    await toggle.click();
    const first = await html.getAttribute("class");
    await toggle.click();
    const second = await html.getAttribute("class");

    expect(first).not.toEqual(second);
  });
});

test.describe("languages", () => {
  test("an address without a language goes to the browser's language", async ({ browser }) => {
    const context = await browser.newContext({ locale: "en-US" });
    const page = await context.newPage();
    await page.goto("/about");
    await expect(page).toHaveURL(/\/en\/about$/);
    await context.close();
  });

  test("the switcher opens the same page in the other language", async ({ page }) => {
    await page.goto("/ru/about");
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
    await page.getByRole("link", { name: "English" }).click();
    await expect(page).toHaveURL(/\/en\/about$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("each page points to its translation for search engines", async ({ page }) => {
    await page.goto("/ru");
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
  });
});

test.describe("seo files", () => {
  test("sitemap lists both languages", async ({ request }) => {
    const body = await (await request.get("/sitemap.xml")).text();
    expect(body).toContain("/ru/about");
    expect(body).toContain("/en/about");
  });

  test("robots.txt is served", async ({ request }) => {
    expect((await request.get("/robots.txt")).status()).toBe(200);
  });
});

test.describe("health endpoint", () => {
  test("reports ok and is never cached", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);
    expect(response.headers()["cache-control"]).toContain("no-store");
    expect(await response.json()).toMatchObject({ status: "ok", service: "deepsemantic" });
  });
});
