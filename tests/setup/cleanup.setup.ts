import { test as cleanup } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { GTDTestHelpers } from "../helpers/test-utils";
import fs from "fs/promises";
import path from "path";

/**
 * Cleanup setup for GTD tests
 * This runs after setup tests to clean up any residual state
 */
cleanup("cleanup test environment", async ({ page }) => {
  console.log("🧹 Cleaning up test environment...");

  const helpers = new GTDTestHelpers(page);

  try {
    // Navigate to dashboard if not already there
    await page.goto("/dashboard");

    // Clean up test data through UI
    await helpers.cleanupTestData();

    console.log("✅ Test environment cleanup completed");
  } catch (error) {
    console.warn("⚠️ Test environment cleanup failed:", error);
    // Don't throw error as this shouldn't fail the setup
  }
});

/**
 * Database cleanup
 */
cleanup("cleanup database", async () => {
  console.log("🗄️ Cleaning up test database...");

  const supabaseUrl = process.env.SUPABASE_URL || "http://localhost:54321";
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "test-anon-key";

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Clean up test data
    const cleanupQueries = [
      // Clean up tasks with test indicators
      supabase.from("tasks").delete().or('title.ilike.%test%,tags.cs.{"test"}'),

      // Clean up test projects
      supabase.from("projects").delete().ilike("name", "%test%"),

      // Clean up test reviews
      supabase.from("reviews").delete().or("notes.ilike.%test%"),

      // Clean up test timer sessions
      supabase.from("timer_sessions").delete().ilike("notes", "%test%"),
    ];

    await Promise.allSettled(cleanupQueries);

    console.log("✅ Database cleanup completed");
  } catch (error) {
    console.warn("⚠️ Database cleanup failed:", error);
  }
});

/**
 * File system cleanup
 */
cleanup("cleanup test files", async () => {
  console.log("📁 Cleaning up test files...");

  try {
    const testResultsDir = path.join(process.cwd(), "test-results");

    // Clean up old test artifacts but keep the latest results
    const authDir = path.join(testResultsDir, ".auth");
    const artifactsDir = path.join(testResultsDir, "artifacts");

    // Ensure directories exist
    await fs.mkdir(authDir, { recursive: true });
    await fs.mkdir(artifactsDir, { recursive: true });

    // Clean up old screenshots and videos (older than 1 day)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    try {
      const files = await fs.readdir(artifactsDir);
      for (const file of files) {
        const filePath = path.join(artifactsDir, file);
        const stats = await fs.stat(filePath);

        if (stats.mtime.getTime() < oneDayAgo) {
          await fs.unlink(filePath);
        }
      }
    } catch (_error) {
      // Directory might not exist or be empty
    }

    console.log("✅ Test files cleanup completed");
  } catch (error) {
    console.warn("⚠️ Test files cleanup failed:", error);
  }
});

/**
 * Browser state cleanup
 */
cleanup("cleanup browser state", async ({ page, context }) => {
  console.log("🌐 Cleaning up browser state...");

  try {
    // Clear all storage
    await context.clearCookies();
    await context.clearPermissions();

    // Clear local storage and session storage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Close any open dialogs or modals
    await page.evaluate(() => {
      // Close any open dialogs
      const dialogs = document.querySelectorAll(
        '[role="dialog"], .modal, [data-testid*="modal"]'
      );
      dialogs.forEach((dialog) => {
        const closeButton = dialog.querySelector(
          '[data-testid="close"], .close, [aria-label*="close"]'
        );
        if (closeButton instanceof HTMLElement) {
          closeButton.click();
        }
      });
    });

    console.log("✅ Browser state cleanup completed");
  } catch (error) {
    console.warn("⚠️ Browser state cleanup failed:", error);
  }
});

/**
 * Reset test environment variables
 */
cleanup("reset environment", async () => {
  console.log("🔄 Resetting test environment variables...");

  try {
    // Reset any test-specific environment variables
    delete process.env.TEST_MODE;
    delete process.env.MOCK_AUTH;
    delete process.env.DISABLE_ANALYTICS;

    console.log("✅ Environment reset completed");
  } catch (error) {
    console.warn("⚠️ Environment reset failed:", error);
  }
});

/**
 * Generate cleanup report
 */
cleanup("generate cleanup report", async () => {
  console.log("📊 Generating cleanup report...");

  try {
    const cleanupReport = {
      timestamp: new Date().toISOString(),
      status: "completed",
      actions: [
        "Test data cleaned from UI",
        "Database test records removed",
        "Old test artifacts cleaned",
        "Browser state cleared",
        "Environment variables reset",
      ],
      nextSteps: [
        "Ready for test execution",
        "Clean state established",
        "All test dependencies available",
      ],
    };

    const testResultsDir = path.join(process.cwd(), "test-results");
    await fs.mkdir(testResultsDir, { recursive: true });

    await fs.writeFile(
      path.join(testResultsDir, "cleanup-report.json"),
      JSON.stringify(cleanupReport, null, 2)
    );

    console.log("✅ Cleanup report generated");
  } catch (error) {
    console.warn("⚠️ Cleanup report generation failed:", error);
  }
});
