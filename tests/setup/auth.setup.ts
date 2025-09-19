import { test as setup, expect } from '@playwright/test';
import { GTDTestHelpers } from '../helpers/test-utils';
import { TEST_USERS } from '../fixtures/test-data';

const authFile = 'test-results/.auth/user.json';

/**
 * Authentication setup for GTD tests
 * This runs before other tests to establish authenticated state
 */
setup('authenticate user', async ({ page }) => {
  console.log('🔐 Setting up authentication for tests...');

  const helpers = new GTDTestHelpers(page);

  try {
    // Perform login
    await helpers.loginWithOTP(TEST_USERS.standard.email!);

    // Verify successful authentication
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard/);

    // Save authentication state
    await page.context().storageState({ path: authFile });

    console.log('✅ Authentication setup completed');

  } catch (error) {
    console.error('❌ Authentication setup failed:', error);

    // Try to capture debugging information
    await page.screenshot({ path: 'test-results/auth-setup-failure.png' });

    // Check if we're on an error page
    const errorMessage = page.locator('[data-testid="auth-error-message"]');
    if (await errorMessage.isVisible()) {
      const errorText = await errorMessage.textContent();
      console.error('Auth error message:', errorText);
    }

    throw error;
  }
});

/**
 * Setup test data for authenticated user
 */
setup('setup user data', async ({ page }) => {
  console.log('📊 Setting up user test data...');

  const helpers = new GTDTestHelpers(page);

  // Use the authenticated state
  await page.goto('/dashboard');

  try {
    // Clean up any existing test data
    await helpers.cleanupTestData();

    // Create baseline test data
    await helpers.captureTask('Sample inbox task', {
      status: 'captured',
      description: 'This is a sample task for testing'
    });

    await helpers.captureTask('Sample next action', {
      status: 'next_action',
      context: 'office',
      energy_level: 'medium',
      estimated_duration: '30min'
    });

    console.log('✅ User test data setup completed');

  } catch (error) {
    console.error('❌ User test data setup failed:', error);
    // Don't throw error here as authentication is more important
  }
});

/**
 * Verify application state
 */
setup('verify app state', async ({ page }) => {
  console.log('🔍 Verifying application state...');

  await page.goto('/dashboard');

  try {
    // Verify core elements are present
    await expect(page.locator('[data-testid="quick-capture-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="main-navigation"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

    // Verify navigation works
    await page.click('[data-testid="nav-inbox"]');
    await expect(page).toHaveURL(/inbox/);

    await page.click('[data-testid="nav-next-actions"]');
    await expect(page).toHaveURL(/next-actions/);

    // Return to dashboard
    await page.goto('/dashboard');

    console.log('✅ Application state verification completed');

  } catch (error) {
    console.error('❌ Application state verification failed:', error);

    // Capture debugging information
    await page.screenshot({ path: 'test-results/app-state-verification-failure.png' });

    throw error;
  }
});

/**
 * Setup for mobile testing
 */
setup('mobile setup', async ({ page, isMobile }) => {
  if (!isMobile) {
    setup.skip();
    return;
  }

  console.log('📱 Setting up mobile-specific test environment...');

  const helpers = new GTDTestHelpers(page);

  try {
    // Test mobile-specific authentication flow
    await helpers.loginWithOTP(TEST_USERS.standard.email!);

    // Verify mobile interface elements
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();

    // Test mobile capture functionality
    await helpers.testMobileCapture();

    console.log('✅ Mobile setup completed');

  } catch (error) {
    console.error('❌ Mobile setup failed:', error);
    throw error;
  }
});

/**
 * Performance testing setup
 */
setup('performance setup', async ({ page }, testInfo) => {
  if (!testInfo.project.use.performanceMode) {
    setup.skip();
    return;
  }

  console.log('⚡ Setting up performance testing environment...');

  try {
    // Enable performance monitoring
    await page.addInitScript(() => {
      // Mark performance monitoring as enabled
      (window as any).__GTD_PERFORMANCE_MODE__ = true;

      // Set up performance observers
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.entryType === 'measure') {
              console.log(`Performance: ${entry.name} took ${entry.duration}ms`);
            }
          });
        });

        observer.observe({ entryTypes: ['measure', 'navigation'] });
      }
    });

    // Authenticate with performance tracking
    const helpers = new GTDTestHelpers(page);
    const authStart = Date.now();
    await helpers.loginWithOTP(TEST_USERS.standard.email!);
    const authTime = Date.now() - authStart;

    console.log(`Authentication took ${authTime}ms`);

    console.log('✅ Performance setup completed');

  } catch (error) {
    console.error('❌ Performance setup failed:', error);
    throw error;
  }
});

/**
 * Accessibility testing setup
 */
setup('accessibility setup', async ({ page }, testInfo) => {
  if (!testInfo.project.use.accessibilityChecks) {
    setup.skip();
    return;
  }

  console.log('♿ Setting up accessibility testing environment...');

  try {
    // Inject accessibility testing utilities
    await page.addInitScript(() => {
      // Mark accessibility checking as enabled
      (window as any).__GTD_ACCESSIBILITY_MODE__ = true;

      // Add aria-live region observer
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element;
                const ariaLive = element.getAttribute('aria-live');
                if (ariaLive) {
                  console.log(`Accessibility: aria-live region updated (${ariaLive}):`, element.textContent);
                }
              }
            });
          }
        });
      });

      observer.observe(document.body, { childList: true, subtree: true });
    });

    // Authenticate and verify accessibility
    const helpers = new GTDTestHelpers(page);
    await helpers.loginWithOTP(TEST_USERS.standard.email!);

    // Run basic accessibility check
    await helpers.checkAccessibility();

    console.log('✅ Accessibility setup completed');

  } catch (error) {
    console.error('❌ Accessibility setup failed:', error);
    throw error;
  }
});