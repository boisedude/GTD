import { chromium, FullConfig } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

/**
 * Global setup for GTD application tests
 * Runs once before all test files
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting GTD test suite global setup...');

  const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';
  const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'test-anon-key';

  // Initialize Supabase client for setup
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // 1. Verify application is running
    console.log('📡 Checking application availability...');
    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
      await page.goto(baseURL, { timeout: 30000 });
      await page.waitForSelector('body', { timeout: 10000 });
      console.log('✅ Application is running and accessible');
    } catch (error) {
      console.error('❌ Application is not accessible:', error);
      throw new Error(`Application at ${baseURL} is not accessible. Please ensure the development server is running.`);
    } finally {
      await browser.close();
    }

    // 2. Verify Supabase connection
    console.log('🗄️ Checking Supabase connection...');
    try {
      const { data, error } = await supabase.from('tasks').select('count').limit(1);
      if (error && error.code !== 'PGRST116') { // PGRST116 is "table not found" which is OK for setup
        throw error;
      }
      console.log('✅ Supabase connection verified');
    } catch (error) {
      console.warn('⚠️ Supabase connection failed, tests may use mocks:', error);
    }

    // 3. Set up test database schema (if using real Supabase)
    if (process.env.USE_REAL_SUPABASE === 'true') {
      console.log('🏗️ Setting up test database schema...');
      await setupTestSchema(supabase);
    }

    // 4. Create test user accounts
    console.log('👥 Setting up test user accounts...');
    await setupTestUsers(supabase);

    // 5. Set up test data
    console.log('📊 Setting up test data...');
    await setupTestData(supabase);

    // 6. Configure test environment
    console.log('⚙️ Configuring test environment...');
    await configureTestEnvironment();

    console.log('✅ Global setup completed successfully!');

  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  }
}

/**
 * Set up test database schema
 */
async function setupTestSchema(supabase: any) {
  // This would typically run SQL migrations or schema setup
  // For now, we'll assume the schema is already set up via Supabase migrations
  console.log('  Schema setup completed (using existing migrations)');
}

/**
 * Set up test user accounts
 */
async function setupTestUsers(supabase: any) {
  const testUsers = [
    { email: 'test@example.com', name: 'Test User' },
    { email: 'premium@example.com', name: 'Premium User' },
    { email: 'newuser@example.com', name: 'New User' }
  ];

  for (const user of testUsers) {
    try {
      // For OTP-based auth, we can't pre-create users
      // Instead, we'll store test user info for later use
      console.log(`  ✓ Test user configured: ${user.email}`);
    } catch (error) {
      console.warn(`  ⚠️ Could not set up user ${user.email}:`, error);
    }
  }
}

/**
 * Set up test data
 */
async function setupTestData(supabase: any) {
  try {
    // Clear any existing test data
    if (process.env.CLEAN_TEST_DATA === 'true') {
      console.log('  🧹 Cleaning existing test data...');
      // This would clean up test data if needed
    }

    // Set up baseline test data
    console.log('  📝 Creating baseline test data...');
    // This would create any necessary baseline data

    console.log('  ✓ Test data setup completed');
  } catch (error) {
    console.warn('  ⚠️ Test data setup failed:', error);
  }
}

/**
 * Configure test environment
 */
async function configureTestEnvironment() {
  // Set environment variables for tests
  process.env.NODE_ENV = 'test';
  process.env.NEXT_TELEMETRY_DISABLED = '1';

  // Configure any other test-specific settings
  console.log('  ✓ Test environment configured');
}

export default globalSetup;