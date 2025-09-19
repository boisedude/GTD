import { test, expect } from "@playwright/test";

test.describe("Color Contrast Validation", () => {
  test("login page disclaimer has proper contrast", async ({ page }) => {
    await page.goto("/auth/login");

    // Check that disclaimer box is visible
    const disclaimer = page.locator('[class*="bg-warning-light"]').first();
    await expect(disclaimer).toBeVisible();

    // Verify disclaimer text uses proper color
    const disclaimerText = disclaimer.locator("p");
    await expect(disclaimerText).toHaveClass(/text-warning-dark/);

    // Take screenshot for visual verification
    await page.screenshot({
      path: "test-results/login-disclaimer-contrast.png",
      fullPage: true,
    });
  });

  test("auth form error states use brand colors", async ({ page }) => {
    await page.goto("/auth/login");

    // Submit empty form to trigger error
    await page.click('button[type="submit"]');
    await page.waitForSelector('[class*="bg-error-light"]', { timeout: 5000 });

    const errorBox = page.locator('[class*="bg-error-light"]').first();
    await expect(errorBox).toBeVisible();

    const errorText = errorBox.locator("p");
    await expect(errorText).toHaveClass(/text-error-dark/);

    await page.screenshot({
      path: "test-results/auth-error-contrast.png",
    });
  });

  test("verify page uses brand error colors", async ({ page }) => {
    await page.goto("/auth/verify");

    // Try to submit empty verification form
    await page.click('button[type="submit"]');
    await page.waitForSelector('[class*="bg-error-light"]', { timeout: 5000 });

    const errorBox = page.locator('[class*="bg-error-light"]').first();
    await expect(errorBox).toBeVisible();

    await page.screenshot({
      path: "test-results/verify-error-contrast.png",
    });
  });

  test("onboarding page disclaimer uses brand colors", async ({ page }) => {
    await page.goto("/onboarding");

    const disclaimer = page.locator('[class*="bg-warning-light"]').first();
    await expect(disclaimer).toBeVisible();

    const disclaimerText = disclaimer.locator("p");
    await expect(disclaimerText).toHaveClass(/text-warning-dark/);

    await page.screenshot({
      path: "test-results/onboarding-disclaimer-contrast.png",
    });
  });
});
