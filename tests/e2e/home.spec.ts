import { expect, test } from "@playwright/test";

test.describe("FundedRank pages", () => {
  test("homepage renders ranking section", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /ranking firm prop/i }),
    ).toBeVisible();
  });

  test("companies page lists entries", async ({ page }) => {
    await page.goto("/firmy");
    await expect(page.getByText(/firm w bazie/i)).toBeVisible();
  });
});
