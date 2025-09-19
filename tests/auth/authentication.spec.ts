import { test, expect } from "@playwright/test";
import { GTDTestHelpers } from "../helpers/test-utils";
import { TEST_USERS, TEST_CONFIG } from "../fixtures/test-data";

test.describe("Authentication Flow", () => {
  let helpers: GTDTestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new GTDTestHelpers(page);
  });

  test.describe("Email OTP Login", () => {
    test("should display login form on landing page", async ({ page }) => {
      await page.goto("/");

      // Should show login option for unauthenticated users
      await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
      await expect(
        page.locator('[data-testid="get-started-cta"]')
      ).toBeVisible();
    });

    test("should navigate to login page", async ({ page }) => {
      await page.goto("/");
      await page.click('[data-testid="login-button"]');

      await expect(page).toHaveURL("/auth/login");
      await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
      await expect(
        page.locator('[data-testid="send-otp-button"]')
      ).toBeVisible();
    });

    test("should validate email format", async ({ page }) => {
      await page.goto("/auth/login");

      // Test invalid email
      await page.fill('[data-testid="email-input"]', "invalid-email");
      await page.click('[data-testid="send-otp-button"]');

      await expect(page.locator('[data-testid="email-error"]')).toContainText(
        "Please enter a valid email"
      );

      // Test valid email
      await page.fill(
        '[data-testid="email-input"]',
        TEST_USERS.standard.email!
      );
      await expect(
        page.locator('[data-testid="email-error"]')
      ).not.toBeVisible();
    });

    test("should send OTP and navigate to verification", async ({ page }) => {
      await page.goto("/auth/login");

      await page.fill(
        '[data-testid="email-input"]',
        TEST_USERS.standard.email!
      );
      await page.click('[data-testid="send-otp-button"]');

      // Should navigate to verification page
      await expect(page).toHaveURL("/auth/verify");
      await expect(page.locator('[data-testid="otp-input"]')).toBeVisible();
      await expect(
        page.locator('[data-testid="verify-otp-button"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="resend-otp-button"]')
      ).toBeVisible();

      // Should display email hint
      await expect(page.locator('[data-testid="email-hint"]')).toContainText(
        TEST_USERS.standard.email!
      );
    });

    test("should handle OTP verification", async ({ page }) => {
      await page.goto("/auth/login");
      await page.fill(
        '[data-testid="email-input"]',
        TEST_USERS.standard.email!
      );
      await page.click('[data-testid="send-otp-button"]');

      await expect(page).toHaveURL("/auth/verify");

      // Test invalid OTP
      await page.fill('[data-testid="otp-input"]', "000000");
      await page.click('[data-testid="verify-otp-button"]');

      await expect(page.locator('[data-testid="otp-error"]')).toContainText(
        "Invalid verification code"
      );

      // Test valid OTP (mocked)
      await page.fill('[data-testid="otp-input"]', "123456");
      await page.click('[data-testid="verify-otp-button"]');

      // Should redirect to appropriate page based on user state
      await expect(page).toHaveURL(/\/(dashboard|onboarding)/);
    });

    test("should allow OTP resend", async ({ page }) => {
      await page.goto("/auth/login");
      await page.fill(
        '[data-testid="email-input"]',
        TEST_USERS.standard.email!
      );
      await page.click('[data-testid="send-otp-button"]');

      await expect(page).toHaveURL("/auth/verify");

      // Resend button should be disabled initially
      await expect(
        page.locator('[data-testid="resend-otp-button"]')
      ).toBeDisabled();

      // Wait for resend timeout (or mock it)
      await page.waitForTimeout(1000);

      // Should be able to resend
      await expect(
        page.locator('[data-testid="resend-otp-button"]')
      ).toBeEnabled();
      await page.click('[data-testid="resend-otp-button"]');

      await expect(
        page.locator('[data-testid="otp-resent-message"]')
      ).toContainText("Code sent successfully");
    });

    test("should handle authentication errors", async ({ page }) => {
      await page.goto("/auth/auth-code-error");

      await expect(
        page.locator('[data-testid="auth-error-message"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="try-again-button"]')
      ).toBeVisible();

      // Try again should redirect to login
      await page.click('[data-testid="try-again-button"]');
      await expect(page).toHaveURL("/auth/login");
    });
  });

  test.describe("User Session Management", () => {
    test("should maintain session across page reloads", async ({ page }) => {
      await helpers.loginWithOTP(TEST_USERS.standard.email!);

      // Reload page
      await page.reload();

      // Should still be authenticated
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test("should handle session expiry gracefully", async ({ page }) => {
      await helpers.loginWithOTP(TEST_USERS.standard.email!);

      // Mock session expiry by clearing storage
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      // Navigate to protected route
      await page.goto("/dashboard");

      // Should redirect to login
      await expect(page).toHaveURL("/auth/login");
      await expect(
        page.locator('[data-testid="session-expired-message"]')
      ).toBeVisible();
    });

    test("should refresh tokens automatically", async ({ page }) => {
      await helpers.loginWithOTP(TEST_USERS.standard.email!);

      // Mock token refresh scenario
      await page.route("**/auth/v1/token*", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            access_token: "new-access-token",
            refresh_token: "new-refresh-token",
          }),
        });
      });

      // Trigger API call that would require token refresh
      await page.goto("/dashboard");
      await page.click('[data-testid="refresh-data"]');

      // Should maintain authentication
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });

    test("should handle network issues during authentication", async ({
      page,
    }) => {
      await page.goto("/auth/login");

      // Simulate network error
      await page.route("**/auth/v1/otp", (route) => {
        route.abort("failed");
      });

      await page.fill(
        '[data-testid="email-input"]',
        TEST_USERS.standard.email!
      );
      await page.click('[data-testid="send-otp-button"]');

      await expect(page.locator('[data-testid="network-error"]')).toContainText(
        "Network error"
      );
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
    });
  });

  test.describe("Protected Route Access", () => {
    test("should redirect unauthenticated users to login", async ({ page }) => {
      const protectedRoutes = ["/dashboard", "/dashboard/reviews", "/engage"];

      for (const route of protectedRoutes) {
        await page.goto(route);
        await expect(page).toHaveURL("/auth/login");
        await expect(
          page.locator('[data-testid="auth-required-message"]')
        ).toBeVisible();
      }
    });

    test("should allow authenticated users to access protected routes", async ({
      page,
    }) => {
      await helpers.loginWithOTP(TEST_USERS.standard.email!);

      const protectedRoutes = [
        { path: "/dashboard", testId: "dashboard-page" },
        { path: "/dashboard/reviews", testId: "reviews-page" },
        { path: "/engage", testId: "engagement-page" },
      ];

      for (const route of protectedRoutes) {
        await page.goto(route.path);
        await expect(page).toHaveURL(route.path);
        await expect(
          page.locator(`[data-testid="${route.testId}"]`)
        ).toBeVisible();
      }
    });

    test("should preserve intended destination after login", async ({
      page,
    }) => {
      // Try to access protected route
      await page.goto("/dashboard/reviews");

      // Should redirect to login
      await expect(page).toHaveURL("/auth/login");

      // Complete login
      await helpers.loginWithOTP(TEST_USERS.standard.email!);

      // Should redirect to originally intended page
      await expect(page).toHaveURL("/dashboard/reviews");
    });
  });

  test.describe("Logout Functionality", () => {
    test("should logout user and clear session", async ({ page }) => {
      await helpers.loginWithOTP(TEST_USERS.standard.email!);

      await helpers.logout();

      // Should be redirected to landing page
      await expect(page).toHaveURL("/");
      await expect(page.locator('[data-testid="login-button"]')).toBeVisible();

      // Session storage should be cleared
      const localStorage = await page.evaluate(
        () => window.localStorage.length
      );
      const sessionStorage = await page.evaluate(
        () => window.sessionStorage.length
      );
      expect(localStorage).toBe(0);
      expect(sessionStorage).toBe(0);
    });

    test("should prevent access to protected routes after logout", async ({
      page,
    }) => {
      await helpers.loginWithOTP(TEST_USERS.standard.email!);
      await helpers.logout();

      // Try to access protected route
      await page.goto("/dashboard");

      // Should redirect to login
      await expect(page).toHaveURL("/auth/login");
    });
  });

  test.describe("New User Onboarding Flow", () => {
    test("should redirect new users to onboarding", async ({ page }) => {
      // Mock new user login
      await page.route("**/auth/v1/verify", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            user: { ...TEST_USERS.newUser, is_new_user: true },
            session: { access_token: "mock-token" },
          }),
        });
      });

      await page.goto("/auth/login");
      await page.fill('[data-testid="email-input"]', TEST_USERS.newUser.email!);
      await page.click('[data-testid="send-otp-button"]');

      await page.fill('[data-testid="otp-input"]', "123456");
      await page.click('[data-testid="verify-otp-button"]');

      // Should redirect to onboarding
      await expect(page).toHaveURL("/onboarding");
      await expect(
        page.locator('[data-testid="onboarding-welcome"]')
      ).toBeVisible();
    });

    test("should complete onboarding flow", async ({ page }) => {
      await page.goto("/onboarding");

      // Welcome step
      await expect(
        page.locator('[data-testid="onboarding-welcome"]')
      ).toBeVisible();
      await page.click('[data-testid="start-onboarding"]');

      // GTD Introduction
      await expect(
        page.locator('[data-testid="gtd-introduction"]')
      ).toBeVisible();
      await page.click('[data-testid="next-step"]');

      // Quick tour
      await expect(page.locator('[data-testid="app-tour"]')).toBeVisible();
      await page.click('[data-testid="next-step"]');

      // Complete onboarding
      await page.click('[data-testid="complete-onboarding"]');

      // Should redirect to dashboard
      await expect(page).toHaveURL("/dashboard");
      await expect(
        page.locator('[data-testid="onboarding-complete-message"]')
      ).toBeVisible();
    });

    test("should skip onboarding for returning users", async ({ page }) => {
      await helpers.loginWithOTP(TEST_USERS.standard.email!);

      // Should go directly to dashboard
      await expect(page).toHaveURL("/dashboard");
      await expect(
        page.locator('[data-testid="dashboard-page"]')
      ).toBeVisible();
    });
  });

  test.describe("Security and Privacy", () => {
    test("should implement proper CSRF protection", async ({ page }) => {
      await page.goto("/auth/login");

      // Check for CSRF token or other security headers
      const response = await page.request.post("/auth/v1/otp", {
        data: { email: TEST_USERS.standard.email },
      });

      // Should require proper authentication/CSRF token
      expect(response.status()).toBe(400);
    });

    test("should implement rate limiting for OTP requests", async ({
      page,
    }) => {
      await page.goto("/auth/login");

      // Simulate multiple rapid OTP requests
      for (let i = 0; i < 5; i++) {
        await page.fill(
          '[data-testid="email-input"]',
          TEST_USERS.standard.email!
        );
        await page.click('[data-testid="send-otp-button"]');
        await page.waitForTimeout(100);
      }

      // Should show rate limit error
      await expect(
        page.locator('[data-testid="rate-limit-error"]')
      ).toBeVisible();
    });

    test("should not expose sensitive information in client", async ({
      page,
    }) => {
      await helpers.loginWithOTP(TEST_USERS.standard.email!);

      // Check that sensitive data is not exposed in client-side code
      const pageContent = await page.content();
      expect(pageContent).not.toContain("supabase_key");
      expect(pageContent).not.toContain("secret");
      expect(pageContent).not.toContain("password");

      // Check local storage doesn't contain sensitive data
      const localStorageKeys = await page.evaluate(() =>
        Object.keys(localStorage)
      );
      const sensitiveKeys = localStorageKeys.filter(
        (key) =>
          key.includes("secret") ||
          key.includes("private") ||
          key.includes("key")
      );
      expect(sensitiveKeys).toHaveLength(0);
    });
  });

  test.describe("Accessibility", () => {
    test("should be keyboard navigable", async ({ page }) => {
      await page.goto("/auth/login");

      // Test tab navigation
      await page.keyboard.press("Tab");
      await expect(page.locator('[data-testid="email-input"]')).toBeFocused();

      await page.keyboard.press("Tab");
      await expect(
        page.locator('[data-testid="send-otp-button"]')
      ).toBeFocused();

      // Test Enter key activation
      await page.fill(
        '[data-testid="email-input"]',
        TEST_USERS.standard.email!
      );
      await page.locator('[data-testid="send-otp-button"]').focus();
      await page.keyboard.press("Enter");

      await expect(page).toHaveURL("/auth/verify");
    });

    test("should have proper ARIA labels and roles", async ({ page }) => {
      await page.goto("/auth/login");

      // Check form accessibility
      await expect(page.locator('[data-testid="email-input"]')).toHaveAttribute(
        "aria-label"
      );
      await expect(
        page.locator('[data-testid="send-otp-button"]')
      ).toHaveAttribute("aria-describedby");

      // Check error messages are properly associated
      await page.fill('[data-testid="email-input"]', "invalid");
      await page.click('[data-testid="send-otp-button"]');

      const errorId = await page
        .locator('[data-testid="email-error"]')
        .getAttribute("id");
      const inputAriaDescribedBy = await page
        .locator('[data-testid="email-input"]')
        .getAttribute("aria-describedby");
      expect(inputAriaDescribedBy).toContain(errorId);
    });

    test("should support screen readers", async ({ page }) => {
      await page.goto("/auth/login");

      // Check page has proper heading structure
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("h1")).toContainText(/login|sign in/i);

      // Check form has proper labels
      const emailInput = page.locator('[data-testid="email-input"]');
      const labelText = await emailInput.evaluate((el) => {
        const label = document.querySelector(`label[for="${el.id}"]`);
        return label?.textContent || el.getAttribute("aria-label");
      });
      expect(labelText).toBeTruthy();
    });
  });

  test.describe("Mobile Authentication", () => {
    test("should work on mobile devices", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/auth/login");

      // Check mobile-friendly form
      const emailInput = page.locator('[data-testid="email-input"]');
      const inputBounds = await emailInput.boundingBox();
      expect(inputBounds?.height).toBeGreaterThanOrEqual(44); // Minimum touch target

      // Test mobile interaction
      await emailInput.fill(TEST_USERS.standard.email!);
      await page.click('[data-testid="send-otp-button"]');

      await expect(page).toHaveURL("/auth/verify");

      // OTP input should be optimized for mobile
      const otpInput = page.locator('[data-testid="otp-input"]');
      await expect(otpInput).toHaveAttribute("inputmode", "numeric");
      await expect(otpInput).toHaveAttribute("autocomplete", "one-time-code");
    });

    test("should handle mobile keyboard interactions", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/auth/login");

      const emailInput = page.locator('[data-testid="email-input"]');

      // Check email keyboard type
      await expect(emailInput).toHaveAttribute("type", "email");
      await expect(emailInput).toHaveAttribute("inputmode", "email");

      await emailInput.fill(TEST_USERS.standard.email!);
      await page.keyboard.press("Enter"); // Should submit form

      await expect(page).toHaveURL("/auth/verify");
    });
  });
});
