import { test, expect } from "@playwright/test";

test("basic test example", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/GTD App/);

  // Check that the app loads without errors
  const body = await page.locator("body");
  await expect(body).toBeVisible();
});
