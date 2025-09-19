import { test, expect } from "@playwright/test";

test.describe("Navigation Analysis - Clarity Done GTD App", () => {
  // Test navigation structure on landing page
  test("Landing page navigation structure", async ({ page }) => {
    await page.goto("/");

    await page.screenshot({
      path: "test-results/landing-page-navigation.png",
      fullPage: true,
    });

    // Check if sign in link is present
    const signInLink = page.locator('a[href="/auth/login"]');
    await expect(signInLink).toBeVisible();

    // Check brand/logo link
    const brandLink = page.locator("a").filter({ hasText: "Clarity Done" });
    await expect(brandLink).toBeVisible();

    console.log("✅ Landing page navigation structure analyzed");
  });

  // Test auth flow navigation
  test("Auth flow navigation", async ({ page }) => {
    // Start at login page
    await page.goto("/auth/login");

    await page.screenshot({
      path: "test-results/auth-login-navigation.png",
      fullPage: true,
    });

    // Check navigation back to home
    const backLink = page.locator('a[href="/"]');
    if ((await backLink.count()) > 0) {
      await expect(backLink).toBeVisible();
    }

    // Try email submission to reach verify page
    await page.fill('input[type="email"]', "test.navigation@clarity-done.com");
    await page.click('button[type="submit"]');

    // Wait for verify page
    await page.waitForURL("**/verify", { timeout: 10000 });

    await page.screenshot({
      path: "test-results/auth-verify-navigation.png",
      fullPage: true,
    });

    console.log("✅ Auth flow navigation tested");
  });

  // Test authenticated navigation structure (desktop)
  test("Desktop navigation - authenticated user", async ({ page }) => {
    // Mock auth state by going to dashboard directly
    // In real app, we'd properly authenticate first
    await page.goto("/dashboard");

    await page.screenshot({
      path: "test-results/desktop-authenticated-navigation.png",
      fullPage: true,
    });

    // Check if we're redirected to auth or stay on dashboard
    const currentUrl = page.url();
    console.log("Current URL after dashboard navigation:", currentUrl);

    // Check header navigation items
    const navItems = [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/capture", label: "Capture" },
      { href: "/organize", label: "Organize" },
      { href: "/dashboard/reviews", label: "Reviews" },
      { href: "/engage", label: "Engage" },
    ];

    for (const item of navItems) {
      const navLink = page.locator(`a[href="${item.href}"]`).first();
      const isVisible = await navLink.isVisible();
      console.log(
        `Navigation link ${item.label} (${item.href}): ${isVisible ? "visible" : "not visible"}`
      );
    }

    console.log("✅ Desktop navigation structure analyzed");
  });

  // Test mobile navigation
  test("Mobile navigation analysis", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/dashboard");

    await page.screenshot({
      path: "test-results/mobile-navigation-initial.png",
      fullPage: true,
    });

    // Check for mobile hamburger menu
    const mobileMenuButton = page
      .locator("button")
      .filter({ hasText: /menu/i })
      .or(page.locator("button").locator("svg").first());

    if ((await mobileMenuButton.count()) > 0) {
      await mobileMenuButton.click();

      await page.screenshot({
        path: "test-results/mobile-navigation-menu-open.png",
        fullPage: true,
      });

      console.log("✅ Mobile hamburger menu found and opened");
    }

    // Check for bottom navigation
    const bottomNav = page
      .locator('nav[role="navigation"]')
      .or(page.locator(".fixed.bottom-0"));

    if ((await bottomNav.count()) > 0) {
      await expect(bottomNav).toBeVisible();

      await page.screenshot({
        path: "test-results/mobile-bottom-navigation.png",
        fullPage: true,
      });

      console.log("✅ Mobile bottom navigation found");
    }

    console.log("✅ Mobile navigation analysis completed");
  });

  // Test navigation link functionality
  test("Navigation link functionality test", async ({ page }) => {
    await page.goto("/dashboard");

    const testRoutes = [
      "/dashboard",
      "/capture",
      "/organize",
      "/dashboard/reviews",
      "/engage",
    ];

    for (const route of testRoutes) {
      console.log(`Testing navigation to: ${route}`);

      try {
        await page.goto(route);
        await page.waitForLoadState("networkidle");

        const finalUrl = page.url();
        console.log(`Navigation to ${route} resulted in: ${finalUrl}`);

        await page.screenshot({
          path: `test-results/navigation-${route.replace(/\//g, "-").replace(/^-/, "")}.png`,
          fullPage: true,
        });

        // Check if page loaded successfully (no 404)
        const notFoundText = page
          .locator("text=404")
          .or(page.locator("text=Not Found"));
        const hasNotFound = (await notFoundText.count()) > 0;

        if (hasNotFound) {
          console.log(`❌ 404 error found on route: ${route}`);
        } else {
          console.log(`✅ Route ${route} loaded successfully`);
        }
      } catch (error) {
        console.log(`❌ Error navigating to ${route}:`, error);
      }
    }

    console.log("✅ Navigation link functionality test completed");
  });

  // Test navigation accessibility
  test("Navigation accessibility analysis", async ({ page }) => {
    await page.goto("/dashboard");

    await page.screenshot({
      path: "test-results/navigation-accessibility-test.png",
      fullPage: true,
    });

    // Test keyboard navigation
    console.log("Testing keyboard navigation...");

    // Tab through navigation elements
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    await page.screenshot({
      path: "test-results/navigation-keyboard-focus.png",
      fullPage: true,
    });

    // Check for aria labels and roles
    const navElements = page.locator("nav");
    const navCount = await navElements.count();

    for (let i = 0; i < navCount; i++) {
      const nav = navElements.nth(i);
      const ariaLabel = await nav.getAttribute("aria-label");
      const role = await nav.getAttribute("role");

      console.log(
        `Navigation element ${i + 1}: aria-label="${ariaLabel}", role="${role}"`
      );
    }

    // Check for focus indicators
    const focusableElements = page
      .locator("a, button")
      .filter({ hasText: /.+/ });
    const focusableCount = await focusableElements.count();
    console.log(`Found ${focusableCount} focusable navigation elements`);

    console.log("✅ Navigation accessibility analysis completed");
  });

  // Test navigation performance
  test("Navigation performance analysis", async ({ page }) => {
    console.log("Testing navigation performance...");

    const performanceMetrics = [];

    const routes = ["/dashboard", "/capture", "/organize", "/engage"];

    for (const route of routes) {
      const startTime = Date.now();

      await page.goto(route);
      await page.waitForLoadState("networkidle");

      const endTime = Date.now();
      const loadTime = endTime - startTime;

      performanceMetrics.push({
        route,
        loadTime: `${loadTime}ms`,
      });

      console.log(`Route ${route} loaded in ${loadTime}ms`);
    }

    console.log("Navigation Performance Summary:", performanceMetrics);
    console.log("✅ Navigation performance analysis completed");
  });

  // Test navigation consistency
  test("Navigation consistency analysis", async ({ page }) => {
    console.log("Testing navigation consistency across pages...");

    const routes = ["/dashboard", "/capture", "/organize", "/engage"];
    const navigationStates = [];

    for (const route of routes) {
      await page.goto(route);

      // Check if navigation is present and consistent
      const header = page.locator("header");
      const headerVisible = await header.isVisible();

      const mobileNav = page
        .locator('nav[role="navigation"]')
        .or(page.locator(".fixed.bottom-0"));
      const mobileNavVisible = await mobileNav.isVisible();

      navigationStates.push({
        route,
        hasHeader: headerVisible,
        hasMobileNav: mobileNavVisible,
      });

      await page.screenshot({
        path: `test-results/navigation-consistency-${route.replace(/\//g, "-").replace(/^-/, "")}.png`,
        fullPage: true,
      });
    }

    console.log("Navigation Consistency Results:", navigationStates);

    // Check if navigation is consistent across all pages
    const headerConsistency = navigationStates.every(
      (state) => state.hasHeader
    );
    const mobileNavConsistency = navigationStates.every(
      (state) => state.hasMobileNav
    );

    console.log(
      `Header consistency: ${headerConsistency ? "✅ Consistent" : "❌ Inconsistent"}`
    );
    console.log(
      `Mobile nav consistency: ${mobileNavConsistency ? "✅ Consistent" : "❌ Inconsistent"}`
    );

    console.log("✅ Navigation consistency analysis completed");
  });
});
