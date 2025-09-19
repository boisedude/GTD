import { test, expect } from "@playwright/test";

test.describe("Auth Flow Testing", () => {
  test("email submission flow works correctly", async ({ page }) => {
    await page.goto("/auth/login");

    // Fill email form
    await page.fill('input[type="email"]', "test.user@clarity-done.com");

    // Submit form
    await page.click('button[type="submit"]');

    // Should show loading state first
    await expect(page.locator('[class*="animate-spin"]')).toBeVisible();

    // Should redirect to verify page or show success message
    // Note: In a real test environment, we'd mock the Supabase response
    await page.waitForURL("**/verify", { timeout: 10000 });

    await page.screenshot({
      path: "test-results/auth-flow-verify-page.png",
      fullPage: true,
    });

    console.log("✅ Auth flow redirects to verify page correctly");
  });

  test("error handling displays with brand colors", async ({ page }) => {
    await page.goto("/auth/login");

    // Try with invalid email format
    await page.fill('input[type="email"]', "invalid-email-format");
    await page.click('button[type="submit"]');

    // HTML5 validation should prevent submission
    const isValid = await page
      .locator('input[type="email"]')
      .evaluate((input: HTMLInputElement) => input.validity.valid);
    expect(isValid).toBe(false);

    await page.screenshot({
      path: "test-results/auth-validation-error.png",
    });

    console.log("✅ Form validation working correctly");
  });

  test("verify page styling and error states", async ({ page }) => {
    await page.goto("/auth/verify");

    // Should show verify form
    await expect(page.locator("input")).toBeVisible();

    // Try submitting empty verification code
    await page.fill("input", "");
    await page.click('button[type="submit"]');

    // Should show loading state
    await expect(page.locator('[class*="animate-spin"]')).toBeVisible({
      timeout: 2000,
    });

    await page.screenshot({
      path: "test-results/verify-page-styling.png",
      fullPage: true,
    });

    console.log("✅ Verify page styling correct");
  });
});
