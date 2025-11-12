import { expect, test } from "@playwright/test";

const RANKING_TABS = [
  { label: /warunki/i, description: /Ocena warunkow handlowych/i },
  { label: /wyplaty/i, description: /Analiza satysfakcji wyplat/i },
  { label: /spolecznosc/i, description: /Skupia sie na aktywnosci/i },
  { label: /cashback/i, description: /Ocena atrakcyjnosci/i },
  { label: /momentum/i, description: /Dynamika wzrostu/i },
];

test.describe("/rankingi explorer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/rankingi");
    await expect(
      page.getByRole("heading", {
        name: /Kompletny ranking prop firm FundedRank/i,
      }),
    ).toBeVisible();
  });

  test("filters by search and allows resetting filters", async ({ page }) => {
    const searchInput = page.getByPlaceholder(
      /Szukaj firmy po nazwie lub slugu/i,
    );
    await searchInput.fill("___brak-dopasowan___");

    await page.waitForResponse((response) => {
      return (
        response.url().includes("/api/rankings") &&
        response.request().method() === "GET"
      );
    });

    const emptyState = page.getByText(/Brak firm spelniajacych wybrane kryteria/i);
    await expect(emptyState).toBeVisible();

    const resetButton = page.getByRole("button", { name: /Wyczysc filtry/i });
    await resetButton.click();

    await page.waitForResponse((response) => {
      return (
        response.url().includes("/api/rankings") &&
        response.request().method() === "GET"
      );
    });

    await expect(emptyState).toHaveCount(0);
  });

  test("switches between ranking tabs and shows descriptions", async ({ page }) => {
    for (const tab of RANKING_TABS) {
      const trigger = page.getByRole("tab", { name: tab.label });
      await trigger.click();
      await expect(trigger).toHaveAttribute("data-state", "active");
      await expect(page.getByText(tab.description)).toBeVisible();
    }
  });

  test("renders methodology and FAQ sections", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /Metodologia rankingu/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /^faq$/i }),
    ).toBeVisible();

    await expect(
      page.getByText(/Ogolny wynik: warunki 25%, wyplaty 20%, spolecznosc 20%/i),
    ).toBeVisible();
  });
});
