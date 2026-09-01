import { test, expect } from "@playwright/test";

test.describe("route brief", () => {
  test("shows the generator form with its controls", async ({ page }) => {
    await page.goto("/route-brief");

    await expect(
      page.getByRole("heading", { name: "Route Brief", level: 1 }),
    ).toBeVisible();
    // The heading must appear exactly once — it used to be rendered by both
    // the page and the result component.
    await expect(
      page.getByRole("heading", { name: "Route Brief", level: 1 }),
    ).toHaveCount(1);
  });

  test("does not offer a PDF download before a brief exists", async ({
    page,
  }) => {
    await page.goto("/route-brief");

    await expect(
      page.getByRole("button", { name: /download pdf/i }),
    ).toHaveCount(0);
  });
});
