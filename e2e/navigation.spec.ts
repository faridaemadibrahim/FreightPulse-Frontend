import { test, expect } from "@playwright/test";

// The demo flow from the implementation plan: every page reachable from the
// sidebar renders its own heading without an error boundary taking over.
const PAGES = [
  { nav: "Dashboard", path: "/", heading: "Dashboard" },
  { nav: "Rates", path: "/rates", heading: "Rates" },
  { nav: "Ports", path: "/ports", heading: "Port Congestion" },
  { nav: "Carriers", path: "/carriers", heading: "Carrier Advisories" },
  { nav: "Route Brief", path: "/route-brief", heading: "Route Brief" },
  { nav: "Alerts", path: "/alerts", heading: "Alerts" },
];

test.describe("navigation", () => {
  for (const page_ of PAGES) {
    test(`${page_.nav} renders`, async ({ page }) => {
      await page.goto(page_.path);

      await expect(
        page.getByRole("heading", { name: page_.heading, level: 1 }),
      ).toBeVisible();
      await expect(page.getByText("Something went wrong")).toHaveCount(0);
    });
  }

  test("walks the whole demo flow through the sidebar", async ({ page }) => {
    await page.goto("/");

    for (const target of PAGES.slice(1)) {
      await page.getByRole("link", { name: target.nav, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${target.path}$`));
      await expect(
        page.getByRole("heading", { name: target.heading, level: 1 }),
      ).toBeVisible();
    }
  });
});

test("the alerts bell exposes an accessible name and toggles the panel", async ({
  page,
}) => {
  await page.goto("/");

  const bell = page.getByRole("button", { name: /^Alerts, / });
  await expect(bell).toHaveAttribute("aria-expanded", "false");

  await bell.click();
  await expect(bell).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("Alerts", { exact: true }).last()).toBeVisible();
});
