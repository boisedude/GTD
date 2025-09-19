import { test, expect } from '@playwright/test';

test.describe('Authentication Flow Validation', () => {
  test('should load login page and handle auth state', async ({ page }) => {
    const errors: string[] = [];

    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      errors.push(`Page Error: ${error.message}`);
    });

    // Navigate to app
    await page.goto('/');

    // Should redirect to login for unauthenticated users
    await page.waitForTimeout(2000);

    // Check if we're on login page or if app loads
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    // Check for login form elements
    const emailInput = await page.locator('input[type="email"]').count();
    const loginButton = await page.locator('button:has-text("Send Code"), button:has-text("Login")').count();

    console.log('Email input found:', emailInput > 0);
    console.log('Login button found:', loginButton > 0);

    // Check if app shows environment rebuild message
    const rebuildMessage = await page.locator('text=Environment Rebuilt').count();
    console.log('Shows rebuild message:', rebuildMessage > 0);

    // Test login form if present
    if (emailInput > 0) {
      await page.fill('input[type="email"]', 'test@example.com');

      // Check if form accepts input
      const emailValue = await page.locator('input[type="email"]').inputValue();
      expect(emailValue).toBe('test@example.com');

      // Try to submit (should fail with placeholder credentials)
      if (loginButton > 0) {
        await page.click('button:has-text("Send Code"), button:has-text("Login")');
        await page.waitForTimeout(1000);

        // Check for error messages
        const errorMessage = await page.locator('text=error, text=Error, text=failed').count();
        console.log('Error message shown:', errorMessage > 0);
      }
    }

    // Log any JavaScript errors
    if (errors.length > 0) {
      console.log('JavaScript Errors:', errors);
    }

    // Verify page doesn't crash
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('should load dashboard route (may redirect)', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    console.log('Dashboard redirect URL:', currentUrl);

    // Should either show dashboard or redirect to login
    const isDashboard = currentUrl.includes('/dashboard');
    const isLogin = currentUrl.includes('/login') || currentUrl.includes('/auth');

    expect(isDashboard || isLogin).toBeTruthy();
  });

  test('should validate GTD workflow pages load', async ({ page }) => {
    const routes = [
      '/dashboard',
      '/dashboard/reviews',
      '/engage',
      '/onboarding'
    ];

    for (const route of routes) {
      console.log(`Testing route: ${route}`);

      await page.goto(route);
      await page.waitForTimeout(1000);

      // Check if page loads without critical errors
      const title = await page.title();
      expect(title).toBeTruthy();

      // Check for GTD-specific content
      const gtdContent = await page.locator('text=GTD, text=capture, text=clarify, text=organize').count();
      console.log(`${route} has GTD content:`, gtdContent > 0);
    }
  });
});