import { test, expect } from "@playwright/test";

const CASES = [
  { path: "/", active: "Dashboard" },
  { path: "/rates", active: "Rates" },
  { path: "/ports", active: "Ports" },
  { path: "/carriers", active: "Carriers" },
  { path: "/route-brief", active: "Route Brief" },
  { path: "/alerts", active: "Alerts" },
  // A lane detail page must keep its parent section marked, not fall back
  // to Dashboard.
  { path: "/rates/Shanghai-Europe", active: "Rates" },
];

test.describe("sidebar current page", () => {
  for (const { path, active } of CASES) {
    test(`marks ${active} on ${path}`, async ({ page }) => {
      await page.goto(path);

      const current = page.locator('[data-slot="sidebar"] a[aria-current="page"]');
      await expect(current).toHaveCount(1);
      await expect(current).toContainText(active);
    });
  }

  test("moves the marker as you navigate", async ({ page }) => {
    await page.goto("/");
    const current = page.locator('[data-slot="sidebar"] a[aria-current="page"]');
    await expect(current).toContainText("Dashboard");

    await page.getByRole("link", { name: "Ports", exact: true }).click();
    await expect(current).toContainText("Ports");
    await expect(current).toHaveCount(1);
  });
});
