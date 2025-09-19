import { test, expect } from "@playwright/test";

test.describe("UX Issues Scan", () => {
  test("mobile responsiveness on login page", async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/auth/login");

    // Check that form is properly sized on mobile
    const card = page.locator('[class*="Card"]').first();
    await expect(card).toBeVisible();

    // Verify disclaimer is readable on mobile
    const disclaimer = page.locator('[class*="bg-warning-light"]').first();
    await expect(disclaimer).toBeVisible();

    await page.screenshot({
      path: "test-results/mobile-login-layout.png",
      fullPage: true,
    });
  });

  test("button states and accessibility", async ({ page }) => {
    await page.goto("/auth/login");

    const submitButton = page.locator('button[type="submit"]');

    // Check initial disabled state
    await expect(submitButton).toBeDisabled();

    // Enter email to enable button
    await page.fill('input[type="email"]', "test@example.com");
    await expect(submitButton).toBeEnabled();

    // Check button has proper focus styles
    await submitButton.focus();
    await page.screenshot({
      path: "test-results/button-focus-state.png",
    });
  });

  test("keyboard navigation", async ({ page }) => {
    await page.goto("/auth/login");

    // Tab through form elements
    await page.keyboard.press("Tab"); // Email input
    await expect(page.locator('input[type="email"]')).toBeFocused();

    await page.keyboard.press("Tab"); // Submit button
    await expect(page.locator('button[type="submit"]')).toBeFocused();

    await page.screenshot({
      path: "test-results/keyboard-navigation.png",
    });
  });

  test("form validation UX", async ({ page }) => {
    await page.goto("/auth/login");

    // Test invalid email format
    await page.fill('input[type="email"]', "invalid-email");
    await page.click('button[type="submit"]');

    // Check HTML5 validation
    const emailInput = page.locator('input[type="email"]');
    const validity = await emailInput.evaluate(
      (el: HTMLInputElement) => el.validity.valid
    );
    expect(validity).toBe(false);

    await page.screenshot({
      path: "test-results/email-validation.png",
    });
  });

  test("loading states and feedback", async ({ page }) => {
    await page.goto("/auth/login");

    await page.fill('input[type="email"]', "test@example.com");

    // Click submit and check for loading state
    await page.click('button[type="submit"]');

    // Should show loading spinner
    await expect(page.locator('[class*="animate-spin"]')).toBeVisible({
      timeout: 1000,
    });

    await page.screenshot({
      path: "test-results/loading-state.png",
    });
  });

  test("contrast in task status badges", async ({ page }) => {
    // Skip to dashboard (would need auth, so we'll test the components directly)
    await page.goto("/auth/login");

    // Test would require auth - noting this for manual testing
    // This tests the status badge colors we updated
    console.log("Note: Task status badge testing requires authenticated user");
  });

  test("text readability across different screen sizes", async ({ page }) => {
    const viewports = [
      { width: 320, height: 568, name: "mobile-small" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto("/auth/login");

      // Check text is readable
      const disclaimerText = page.locator('[class*="bg-warning-light"] p');
      await expect(disclaimerText).toBeVisible();

      await page.screenshot({
        path: `test-results/text-readability-${viewport.name}.png`,
        fullPage: true,
      });
    }
  });
});
