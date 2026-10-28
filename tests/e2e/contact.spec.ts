import { expect, test } from "@playwright/test";

test.describe("contact form (dev mode)", () => {
  test("shows friendly errors in Russian for an empty form", async ({ page }) => {
    await page.goto("/ru/contact");
    await page.getByRole("button", { name: "Отправить" }).click();
    await expect(page.getByText("Пожалуйста, укажите имя.")).toBeVisible();
    await expect(page.getByText("Проверьте, пожалуйста, выделенные поля.")).toBeVisible();
  });

  test("sends a message and says thank you in English", async ({ page }) => {
    await page.goto("/en/contact");
    await page.getByLabel("Name").fill("Anna");
    await page.getByLabel("Email").fill("anna@example.com");
    await page.getByLabel("Message").fill("Hello, I would like to book a trial lesson.");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByRole("heading", { name: "Thank you!" })).toBeVisible();
  });

  test("preselects the topic from the address", async ({ page }) => {
    await page.goto("/en/contact?topic=materials");
    await expect(page.getByLabel("Topic")).toHaveValue("materials");
  });
});
