import { test, expect } from "@playwright/test";

test.describe("Global currency switcher", () => {
  test("updates plan pricing and persists selection", async ({ page }) => {
    await page.goto("/firmy/apex-funding");

    const planPrice = page.getByTestId(/^plan-price-/).first();

    await expect(planPrice).toContainText("USD");

    await page.getByLabel("Waluta").selectOption("GBP");

    await expect(planPrice).toContainText("GBP");

    await page.reload();

    await expect(planPrice).toContainText("GBP");
  });
});
