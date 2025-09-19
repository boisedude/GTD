import { defineConfig, devices } from "@playwright/test";

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./test-results",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html"],
    ["junit", { outputFile: "test-results/junit-results.xml" }],
    ["json", { outputFile: "test-results/test-results.json" }],
  ],
  timeout: 30 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10 * 1000,
    navigationTimeout: 15 * 1000,
  },

  projects: [
    // Setup project to seed test data
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },

    // Desktop browsers
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      dependencies: ["setup"],
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      dependencies: ["setup"],
    },

    // Mobile browsers
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
      dependencies: ["setup"],
    },

    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
      dependencies: ["setup"],
    },

    // Tablet testing
    {
      name: "iPad",
      use: { ...devices["iPad Pro"] },
      dependencies: ["setup"],
    },

    // Accessibility testing
    {
      name: "accessibility",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /.*\.a11y\.spec\.ts/,
      dependencies: ["setup"],
    },

    // Performance testing
    {
      name: "performance",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /.*\.perf\.spec\.ts/,
      dependencies: ["setup"],
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
