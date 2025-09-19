import { test, expect } from "@playwright/test";

test("homepage loads and displays correctly", async ({ page }) => {
  await page.goto("/");

  // Check that the page title is correct
  await expect(page).toHaveTitle(/GTD/);

  // Check that the page has loaded content
  await expect(page.locator("body")).toBeVisible();
});

test("homepage is responsive", async ({ page }) => {
  // Test mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");
  await expect(page.locator("body")).toBeVisible();

  // Test desktop viewport
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto("/");
  await expect(page.locator("body")).toBeVisible();
});
