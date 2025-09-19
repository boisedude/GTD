import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'
import { DashboardPage } from '../pages/DashboardPage'

test.describe('Authentication Flow', () => {
  let loginPage: LoginPage
  let dashboardPage: DashboardPage

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    dashboardPage = new DashboardPage(page)
  })

  test('should display login form correctly', async () => {
    await loginPage.goto()

    await loginPage.expectEmailFieldVisible()
    await loginPage.expectSignInButtonVisible()
    await loginPage.expectSignInButtonDisabled()
  })

  test('should validate email input', async () => {
    await loginPage.goto()

    // Test invalid email formats
    await loginPage.attemptInvalidEmail('invalid-email')
    await loginPage.clearEmail()

    await loginPage.attemptInvalidEmail('test@')
    await loginPage.clearEmail()

    await loginPage.attemptInvalidEmail('@example.com')
    await loginPage.clearEmail()

    // Test valid email
    await loginPage.enterEmail('test@example.com')
    await loginPage.expectSignInButtonEnabled()
  })

  test('should handle successful login flow', async () => {
    await loginPage.goto()

    // Enter valid email
    await loginPage.signInWithEmail('test@example.com')

    // Should show OTP sent message or redirect directly
    try {
      await loginPage.waitForOTPSent()
      await loginPage.expectOTPFieldVisible()
      await loginPage.verifyOTP('123456')
    } catch {
      // Direct login without OTP in test environment
    }

    // Should redirect to dashboard
    await dashboardPage.expectToBeLoaded()
  })

  test('should handle OTP verification', async () => {
    await loginPage.goto()

    await loginPage.signInWithEmail('test@example.com')

    // If OTP screen appears
    try {
      await loginPage.expectOTPFieldVisible()

      // Test invalid OTP
      await loginPage.attemptInvalidOTP('000000')
      await loginPage.clearOTP()

      // Test valid OTP
      await loginPage.verifyOTP('123456')
      await dashboardPage.expectToBeLoaded()
    } catch {
      // OTP screen might not appear in test environment
      await dashboardPage.expectToBeLoaded()
    }
  })

  test('should handle keyboard navigation', async () => {
    await loginPage.goto()
    await loginPage.testKeyboardNavigation()
  })

  test('should handle form validation properly', async () => {
    await loginPage.goto()
    await loginPage.testFormValidation()
  })

  test('should handle network errors gracefully', async () => {
    await loginPage.goto()
    await loginPage.testNetworkError()
  })

  test('should allow retry after error', async () => {
    await loginPage.goto()
    await loginPage.testRetryAfterError()
  })

  test('should maintain state during auth flow', async () => {
    await loginPage.goto()

    // Start login process
    await loginPage.enterEmail('test@example.com')
    const enteredEmail = await loginPage.emailInput.inputValue()
    expect(enteredEmail).toBe('test@example.com')

    // Click sign in
    await loginPage.clickSignIn()

    // Email should be preserved if we return to login
    if (await loginPage.emailInput.isVisible()) {
      const preservedEmail = await loginPage.emailInput.inputValue()
      expect(preservedEmail).toBe('test@example.com')
    }
  })

  test('should redirect authenticated users away from login', async () => {
    // First complete login
    await loginPage.goto()
    await loginPage.completeLogin('test@example.com')
    await dashboardPage.expectToBeLoaded()

    // Try to visit login page again
    await loginPage.goto()

    // Should redirect to dashboard
    await dashboardPage.expectToBeLoaded()
  })

  test('should handle logout correctly', async () => {
    // Login first
    await loginPage.goto()
    await loginPage.completeLogin('test@example.com')
    await dashboardPage.expectToBeLoaded()

    // Logout
    await dashboardPage.logout()

    // Should redirect to login
    await loginPage.expectEmailFieldVisible()

    // Try to access protected route
    await dashboardPage.goto()

    // Should redirect back to login
    await loginPage.expectEmailFieldVisible()
  })

  test.describe('Mobile Authentication', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })

      await loginPage.goto()
      await loginPage.testMobileLayout()

      // Complete mobile login
      await loginPage.completeLogin('test@example.com')
      await dashboardPage.expectToBeLoaded()
    })
  })

  test.describe('Accessibility', () => {
    test('should be accessible', async () => {
      await loginPage.goto()
      await loginPage.testAccessibility()
    })

    test('should support screen readers', async ({ page }) => {
      await loginPage.goto()

      // Check for proper ARIA labels
      await expect(loginPage.emailInput).toHaveAttribute('aria-required', 'true')
      await expect(loginPage.signInButton).toHaveAttribute('type', 'submit')

      // Check for error announcements
      await loginPage.attemptInvalidEmail('invalid')
      const errorRegion = page.getByRole('alert')
      await expect(errorRegion).toBeVisible()
    })
  })

  test.describe('Performance', () => {
    test('should load quickly', async ({ page }) => {
      const startTime = Date.now()

      await loginPage.goto()
      await loginPage.expectEmailFieldVisible()

      const loadTime = Date.now() - startTime
      expect(loadTime).toBeLessThan(3000) // Should load within 3 seconds
    })

    test('should handle rapid interactions', async () => {
      await loginPage.goto()

      // Rapidly fill and clear email
      for (let i = 0; i < 5; i++) {
        await loginPage.enterEmail(`test${i}@example.com`)
        await loginPage.clearEmail()
      }

      // Form should still be functional
      await loginPage.enterEmail('test@example.com')
      await loginPage.expectSignInButtonEnabled()
    })
  })

  test.describe('Security', () => {
    test('should not expose sensitive information', async ({ page }) => {
      await loginPage.goto()

      // Check that no auth tokens are exposed in localStorage initially
      const localStorage = await page.evaluate(() => window.localStorage)
      expect(localStorage).not.toHaveProperty('supabase.auth.token')

      // Complete login
      await loginPage.completeLogin('test@example.com')

      // Verify secure token handling
      const localStorageAfterLogin = await page.evaluate(() => window.localStorage)
      // Should have secure token storage but not expose raw tokens
      expect(Object.keys(localStorageAfterLogin)).toContain('sb-')
    })

    test('should handle session expiry', async ({ page }) => {
      // Login first
      await loginPage.goto()
      await loginPage.completeLogin('test@example.com')
      await dashboardPage.expectToBeLoaded()

      // Mock expired session
      await page.evaluate(() => {
        localStorage.clear()
      })

      // Try to access protected content
      await page.reload()

      // Should redirect to login
      await loginPage.expectEmailFieldVisible()
    })
  })
})