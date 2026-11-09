import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("admin area", () => {
  test("asks to sign in and is hidden from search engines", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(page.getByRole("heading", { level: 1, name: "Вход в админку" })).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("the login page has no WCAG 2.2 AA violations that axe can detect", async ({ page }) => {
    await page.goto("/admin/login");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("inner pages and actions redirect to the login page without a session", async ({ page }) => {
    for (const path of ["/admin/documents/new", "/admin/documents/some-id"]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/admin\/login$/);
    }
  });

  test("a forged login link is refused", async ({ page }) => {
    await page.goto("/admin/verify?token=forged");
    await expect(page).toHaveURL(/\/admin\/login\?error=1$/);
    await expect(page.getByRole("alert")).toContainText("Ссылка недействительна");
  });

  test("a forged session cookie does not open the admin area", async ({ page, context }) => {
    await context.addCookies([
      { name: "ds_admin", value: "forged.value", url: "http://localhost:3100" },
    ]);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });
});
