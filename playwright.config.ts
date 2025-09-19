import { defineConfig, devices } from '@playwright/test';

/**
 * Custom test options for GTD application testing
 */
interface GTDTestOptions {
  // Custom options for GTD-specific testing
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  testUserEmail?: string;
  performanceMode?: boolean;
  accessibilityChecks?: boolean;
}

/**
 * Comprehensive Playwright configuration for GTD application
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig<GTDTestOptions>({
  testDir: './tests',

  /* Test organization */
  fullyParallel: true,
  forbidOnly: !!process.env.CI,

  /* Retry configuration */
  retries: process.env.CI ? 2 : 0,

  /* Worker configuration for CI/local */
  workers: process.env.CI ? 2 : '50%',

  /* Timeouts */
  timeout: 60000, // 60 seconds per test
  expect: { timeout: 10000 }, // 10 seconds for assertions

  /* Reporters */
  reporter: [
    ['html', { outputFolder: 'test-results/html-report' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ...(process.env.CI ? [['github'] as const] : []),
    ...(process.env.CI ? [['dot'] as const] : [['list'] as const])
  ],

  /* Output directory */
  outputDir: 'test-results/artifacts',

  /* Global setup */
  globalSetup: './tests/setup/global-setup.ts',
  globalTeardown: './tests/setup/global-teardown.ts',

  /* Shared settings for all projects */
  use: {
    /* Base URL */
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',

    /* Tracing */
    trace: process.env.CI ? 'retain-on-failure' : 'on-first-retry',
    video: process.env.CI ? 'retain-on-failure' : 'off',
    screenshot: 'only-on-failure',

    /* Custom GTD test options */
    supabaseUrl: process.env.SUPABASE_URL || 'http://localhost:54321',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || 'test-anon-key',
    testUserEmail: process.env.TEST_USER_EMAIL || 'test@example.com',

    /* Performance and accessibility */
    performanceMode: process.env.PERFORMANCE_TESTS === 'true',
    accessibilityChecks: process.env.ACCESSIBILITY_TESTS !== 'false',

    /* Browser settings */
    actionTimeout: 15000,
    navigationTimeout: 30000,

    /* Ignore HTTPS errors for local development */
    ignoreHTTPSErrors: true,

    /* Permissions for notifications, etc. */
    permissions: ['notifications'],

    /* Locale and timezone */
    locale: 'en-US',
    timezoneId: 'America/New_York',
  },

  /* Test projects for different scenarios */
  projects: [
    /* Setup project for authentication */
    {
      name: 'setup',
      testMatch: 'tests/setup/auth.setup.ts',
      teardown: 'cleanup',
    },

    /* Cleanup project */
    {
      name: 'cleanup',
      testMatch: 'tests/setup/cleanup.setup.ts',
    },

    /* Authentication tests (run first) */
    {
      name: 'auth',
      testMatch: 'tests/auth/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        // Fresh context for auth tests
      },
    },

    /* Core functionality tests */
    {
      name: 'core',
      testMatch: [
        'tests/tasks/**/*.spec.ts',
        'tests/gtd/**/*.spec.ts',
        'tests/engagement/**/*.spec.ts'
      ],
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },

    /* Cross-browser testing */
    {
      name: 'firefox',
      testMatch: 'tests/{tasks,gtd,engagement}/**/*.spec.ts',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
    },

    {
      name: 'webkit',
      testMatch: 'tests/{tasks,gtd,engagement}/**/*.spec.ts',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
    },

    /* Mobile testing */
    {
      name: 'mobile-chrome',
      testMatch: [
        'tests/tasks/task-capture.spec.ts',
        'tests/gtd/organization.spec.ts',
        'tests/engagement/engagement.spec.ts'
      ],
      use: { ...devices['Pixel 5'] },
      dependencies: ['setup'],
    },

    {
      name: 'mobile-safari',
      testMatch: [
        'tests/tasks/task-capture.spec.ts',
        'tests/gtd/organization.spec.ts',
        'tests/engagement/engagement.spec.ts'
      ],
      use: { ...devices['iPhone 12'] },
      dependencies: ['setup'],
    },

    /* Tablet testing */
    {
      name: 'tablet',
      testMatch: 'tests/{tasks,gtd}/**/*.spec.ts',
      use: { ...devices['iPad Pro'] },
      dependencies: ['setup'],
    },

    /* Performance testing */
    {
      name: 'performance',
      testMatch: 'tests/performance/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        performanceMode: true,
      },
      dependencies: ['setup'],
      retries: 0, // No retries for performance tests
      timeout: 120000, // 2 minutes for performance tests
    },

    /* Accessibility testing */
    {
      name: 'accessibility',
      testMatch: 'tests/accessibility/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        accessibilityChecks: true,
      },
      dependencies: ['setup'],
    },

    /* Visual regression testing */
    {
      name: 'visual',
      testMatch: 'tests/visual/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        // Consistent viewport for visual tests
        viewport: { width: 1280, height: 720 },
      },
      dependencies: ['setup'],
    },

    /* API/Integration testing */
    {
      name: 'api',
      testMatch: 'tests/api/**/*.spec.ts',
      use: {
        // No browser context needed for API tests
        baseURL: process.env.API_BASE_URL || 'http://localhost:3000/api',
      },
    },

    /* E2E user journey tests */
    {
      name: 'e2e',
      testMatch: 'tests/e2e/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        // Longer timeouts for full user journeys
        actionTimeout: 30000,
        navigationTimeout: 60000,
      },
      dependencies: ['setup'],
      timeout: 180000, // 3 minutes for E2E tests
    },

    /* Load testing (single browser) */
    {
      name: 'load',
      testMatch: 'tests/load/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
      workers: 1, // Single worker for load tests
      timeout: 300000, // 5 minutes for load tests
    },

    /* Offline/PWA testing */
    {
      name: 'offline',
      testMatch: 'tests/offline/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        // Enable service worker
        permissions: ['notifications', 'background-sync'],
      },
      dependencies: ['setup'],
    },
  ],

  /* Development server configuration */
  webServer: [
    {
      command: 'pnpm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      env: {
        NODE_ENV: 'test',
        NEXT_TELEMETRY_DISABLED: '1',
      },
    },
    // Optionally start Supabase local instance
    ...(process.env.START_SUPABASE === 'true' ? [{
      command: 'npx supabase start',
      url: 'http://localhost:54321',
      reuseExistingServer: true,
      timeout: 180000,
    }] : []),
  ],

  /* Test metadata */
  metadata: {
    'test-type': 'e2e',
    'app-name': 'GTD App',
    'app-version': process.env.npm_package_version || '0.1.0',
  },

  /* Environment-specific configuration */
  ...(process.env.CI && {
    // CI-specific overrides
    fullyParallel: false,
    workers: 2,
    retries: 3,
    reporter: [
      ['html', { outputFolder: 'test-results/html-report', open: 'never' }],
      ['junit', { outputFile: 'test-results/junit.xml' }],
      ['github'],
      ['blob'],
    ],
  }),
});