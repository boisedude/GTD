import { test, expect } from "@playwright/test";

test.describe("Navigation Fixes Verification", () => {
  test("capture page now exists and has navigation", async ({ page }) => {
    await page.goto("/auth/login");

    // Navigate to capture page (should not be 404 anymore)
    await page.goto("/capture");

    // Should not see 404 error
    await expect(page.locator("text=404")).not.toBeVisible();

    // Should see capture page content
    await expect(page.locator("h1")).toContainText("Quick Capture");

    // Should have navigation header
    await expect(page.locator('[role="navigation"]')).toBeVisible();

    await page.screenshot({
      path: "test-results/capture-page-fixed.png",
      fullPage: true,
    });

    console.log("✅ Capture page now exists with navigation");
  });

  test("organize page now exists and has navigation", async ({ page }) => {
    await page.goto("/organize");

    // Should not see 404 error
    await expect(page.locator("text=404")).not.toBeVisible();

    // Should see organize page content
    await expect(page.locator("h1")).toContainText("Organize & Clarify");

    // Should have navigation header
    await expect(page.locator('[role="navigation"]')).toBeVisible();

    await page.screenshot({
      path: "test-results/organize-page-fixed.png",
      fullPage: true,
    });

    console.log("✅ Organize page now exists with navigation");
  });

  test("engage page has consistent navigation", async ({ page }) => {
    await page.goto("/engage");

    // Should have navigation header
    await expect(page.locator('[role="navigation"]')).toBeVisible();

    await page.screenshot({
      path: "test-results/engage-page-navigation.png",
      fullPage: true,
    });

    console.log("✅ Engage page has consistent navigation");
  });

  test("landing page duplicate links fixed", async ({ page }) => {
    await page.goto("/");

    // Should be able to find specific login links without strict mode violation
    const getStartedButton = page.locator('a[href="/auth/login"]').first();
    const signUpButton = page
      .locator('a[href="/auth/login?signup=true"]')
      .first();

    await expect(getStartedButton).toBeVisible();
    await expect(signUpButton).toBeVisible();

    // Both should be clickable without errors
    await getStartedButton.click();
    await expect(page).toHaveURL(/.*\/auth\/login/);

    console.log("✅ Landing page duplicate links resolved");
  });

  test("navigation between all main pages works", async ({ page }) => {
    // Start at dashboard
    await page.goto("/dashboard");

    // Navigate to each main section
    const navLinks = ["Dashboard", "Capture", "Organize", "Reviews", "Engage"];

    for (const linkText of navLinks) {
      // Find and click the navigation link
      const navLink = page.locator(`nav a:has-text("${linkText}")`).first();
      if (await navLink.isVisible()) {
        await navLink.click();

        // Wait for navigation to complete
        await page.waitForLoadState("networkidle");

        // Should not see 404
        await expect(page.locator("text=404")).not.toBeVisible();

        console.log(`✅ Navigation to ${linkText} successful`);
      }
    }

    await page.screenshot({
      path: "test-results/full-navigation-test.png",
      fullPage: true,
    });
  });
});
