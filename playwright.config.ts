import { defineConfig, devices } from "@playwright/test";

// Next refuses to start a second dev server for the same directory, so the
// tests reuse whatever is already running on 3000 and only start their own
// when nothing is there. Point E2E_BASE_URL elsewhere to test a deployment.
const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "npx next dev",
        url: BASE_URL,
        reuseExistingServer: true,
        timeout: 180_000,
      },
});
