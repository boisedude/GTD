import { defineConfig, devices } from "@playwright/test";

/**
 * Simplified Playwright configuration for GTD application
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests",

  /* Test organization */
  fullyParallel: true,
  forbidOnly: !!process.env.CI,

  /* Retry configuration */
  retries: process.env.CI ? 2 : 0,

  /* Worker configuration for CI/local */
  workers: process.env.CI ? 2 : "50%",

  /* Timeouts */
  timeout: 15000, // 15 seconds per test
  expect: { timeout: 5000 }, // 5 seconds for assertions

  /* Reporters */
  reporter: [
    ["html", { outputFolder: "test-results/html-report" }],
    ["list"],
  ],

  /* Output directory */
  outputDir: "test-results/artifacts",

  /* Shared settings for all projects */
  use: {
    /* Base URL */
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000",

    /* Tracing */
    trace: "on-first-retry",
    video: "retain-on-failure",
    screenshot: "only-on-failure",

    /* Browser settings */
    actionTimeout: 10000,
    navigationTimeout: 15000,

    /* Ignore HTTPS errors for local development */
    ignoreHTTPSErrors: true,

    /* Locale and timezone */
    locale: "en-US",
    timezoneId: "America/New_York",
  },

  /* Development server configuration - commented out since server is already running */
  // webServer: {
  //   command: "pnpm run dev",
  //   url: "http://localhost:3000",
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 15000,
  // },
});
