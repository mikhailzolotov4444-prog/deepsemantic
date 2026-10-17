import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("home page", () => {
  test("shows the headline and a descriptive title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Deep Semantic/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("has no WCAG 2.2 AA violations that axe can detect", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("does not scroll sideways on a 360 px wide phone", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/");
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflows).toBe(false);
  });

  test("is not indexable until indexing is switched on", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("can switch to dark mode and back", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Toggle dark mode" });
    const html = page.locator("html");

    await toggle.click();
    const first = await html.getAttribute("class");
    await toggle.click();
    const second = await html.getAttribute("class");

    expect(first).not.toEqual(second);
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
