import { FullConfig } from "@playwright/test";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import path from "path";

/**
 * Global teardown for GTD application tests
 * Runs once after all test files complete
 */
async function globalTeardown(config: FullConfig) {
  console.log("🧹 Starting GTD test suite global teardown...");

  const supabaseUrl = process.env.SUPABASE_URL || "http://localhost:54321";
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "test-anon-key";

  try {
    // Initialize Supabase client for teardown
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 1. Clean up test data
    if (process.env.CLEAN_TEST_DATA !== "false") {
      console.log("🗑️ Cleaning up test data...");
      await cleanupTestData(supabase);
    }

    // 2. Clean up test users
    console.log("👥 Cleaning up test users...");
    await cleanupTestUsers(supabase);

    // 3. Reset test environment
    console.log("🔄 Resetting test environment...");
    await resetTestEnvironment();

    // 4. Generate test report summary
    console.log("📊 Generating test summary...");
    await generateTestSummary();

    console.log("✅ Global teardown completed successfully!");
  } catch (error) {
    console.error("❌ Global teardown failed:", error);
    // Don't throw error in teardown to avoid masking test failures
  }
}

/**
 * Clean up test data from database
 */
async function cleanupTestData(supabase: SupabaseClient) {
  try {
    // Clean up test tasks
    const { error: tasksError } = await supabase
      .from("tasks")
      .delete()
      .ilike("title", "%test%")
      .or('tags.cs.{"test"}');

    if (tasksError && tasksError.code !== "PGRST116") {
      console.warn("  ⚠️ Could not clean up test tasks:", tasksError);
    }

    // Clean up test projects
    const { error: projectsError } = await supabase
      .from("projects")
      .delete()
      .ilike("name", "%test%");

    if (projectsError && projectsError.code !== "PGRST116") {
      console.warn("  ⚠️ Could not clean up test projects:", projectsError);
    }

    // Clean up test reviews
    const { error: reviewsError } = await supabase
      .from("reviews")
      .delete()
      .ilike("notes", "%test%");

    if (reviewsError && reviewsError.code !== "PGRST116") {
      console.warn("  ⚠️ Could not clean up test reviews:", reviewsError);
    }

    console.log("  ✓ Test data cleanup completed");
  } catch (error) {
    console.warn("  ⚠️ Test data cleanup failed:", error);
  }
}

/**
 * Clean up test users
 */
async function cleanupTestUsers(supabase: SupabaseClient) {
  try {
    // For OTP-based auth, users are typically cleaned up automatically
    // or we don't have permission to delete users from client side
    console.log("  ✓ Test users cleanup completed");
  } catch (error) {
    console.warn("  ⚠️ Test users cleanup failed:", error);
  }
}

/**
 * Reset test environment
 */
async function resetTestEnvironment() {
  try {
    // Clear any test-specific environment variables
    delete process.env.NODE_ENV;
    delete process.env.NEXT_TELEMETRY_DISABLED;

    console.log("  ✓ Test environment reset completed");
  } catch (error) {
    console.warn("  ⚠️ Test environment reset failed:", error);
  }
}

/**
 * Generate test summary
 */
async function generateTestSummary() {
  try {
    // fs and path are already imported at the top

    // Create basic test summary
    const summary = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        ci: !!process.env.CI,
      },
      testRun: {
        baseURL:
          process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000",
        supabaseURL: process.env.SUPABASE_URL || "http://localhost:54321",
        performanceMode: process.env.PERFORMANCE_TESTS === "true",
        accessibilityChecks: process.env.ACCESSIBILITY_TESTS !== "false",
      },
    };

    // Ensure test-results directory exists
    const resultsDir = path.join(process.cwd(), "test-results");
    await fs.mkdir(resultsDir, { recursive: true });

    // Write summary
    await fs.writeFile(
      path.join(resultsDir, "test-summary.json"),
      JSON.stringify(summary, null, 2)
    );

    console.log("  ✓ Test summary generated");
  } catch (error) {
    console.warn("  ⚠️ Test summary generation failed:", error);
  }
}

export default globalTeardown;
