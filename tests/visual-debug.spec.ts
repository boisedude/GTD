import { test, expect } from '@playwright/test';

test.describe('Visual Debug', () => {
  test('should capture what is actually showing on pages', async ({ page }) => {
    console.log('📸 Capturing visual state of the application...');

    // Test home page
    await page.goto('/');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'debug-home.png', fullPage: true });

    const homeContent = await page.content();
    console.log('Home page title:', await page.title());
    console.log('Home page URL:', page.url());
    console.log('Home page has rebuild message:', homeContent.includes('Environment Rebuilt'));
    console.log('Home page has login elements:', homeContent.includes('email') || homeContent.includes('login'));

    // Test auth/login page directly
    await page.goto('/auth/login');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'debug-login.png', fullPage: true });

    const loginContent = await page.content();
    console.log('Login page title:', await page.title());
    console.log('Login page has email input:', loginContent.includes('type="email"'));
    console.log('Login page has login button:', loginContent.includes('Sign in') || loginContent.includes('Login'));

    // Test dashboard (should redirect)
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'debug-dashboard.png', fullPage: true });

    console.log('Dashboard redirect URL:', page.url());

    // Check if AuthProvider is working
    const authElement = await page.locator('[data-auth-provider]').count();
    console.log('AuthProvider element found:', authElement > 0);
  });
});