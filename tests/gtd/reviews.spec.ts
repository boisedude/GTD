import { test, expect } from "@playwright/test";
import { GTDTestHelpers, PERFORMANCE_THRESHOLDS } from "../helpers/test-utils";
import {
  TEST_USERS,
  REVIEW_WORKFLOWS,
  AI_COACHING_PROMPTS,
} from "../fixtures/test-data";

test.describe("GTD Review Workflows", () => {
  let helpers: GTDTestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new GTDTestHelpers(page);
    await helpers.ensureAuthenticated();

    // Set up some test data for reviews
    await helpers.captureTask("Inbox item 1", { status: "captured" });
    await helpers.captureTask("Inbox item 2", { status: "captured" });
    await helpers.captureTask("Next action task", { status: "next_action" });
    await helpers.captureTask("Waiting for feedback", {
      status: "waiting_for",
    });
    await helpers.captureTask("Someday learn Spanish", { status: "someday" });
  });

  test.afterEach(async () => {
    await helpers.cleanupTestData();
  });

  test.describe("Daily Review", () => {
    test("should start daily review", async ({ page }) => {
      await helpers.startDailyReview();

      // Should show review interface
      await expect(page.locator('[data-testid="review-header"]')).toContainText(
        "Daily Review"
      );
      await expect(
        page.locator('[data-testid="review-description"]')
      ).toContainText("Quick daily check-in");
      await expect(
        page.locator('[data-testid="estimated-time"]')
      ).toContainText("5-10 minutes");

      // Should show progress indicator
      await expect(
        page.locator('[data-testid="review-progress"]')
      ).toBeVisible();
      await expect(page.locator('[data-testid="current-step"]')).toContainText(
        "1"
      );
      await expect(page.locator('[data-testid="total-steps"]')).toContainText(
        "6"
      ); // Based on REVIEW_WORKFLOWS
    });

    test("should complete daily review steps", async ({ page }) => {
      await helpers.startDailyReview();

      // Step 1: Welcome
      await expect(page.locator('[data-testid="step-welcome"]')).toBeVisible();
      await expect(page.locator('[data-testid="step-title"]')).toContainText(
        "Welcome"
      );
      await helpers.completeReviewStep();

      // Step 2: Calendar Check
      await expect(
        page.locator('[data-testid="step-calendar-check"]')
      ).toBeVisible();
      await expect(page.locator('[data-testid="step-title"]')).toContainText(
        "Check Calendar"
      );

      // Should show today's schedule if available
      await expect(
        page.locator('[data-testid="calendar-events"]')
      ).toBeVisible();
      await helpers.completeReviewStep();

      // Step 3: Task Triage
      await expect(
        page.locator('[data-testid="step-task-triage"]')
      ).toBeVisible();
      await expect(page.locator('[data-testid="step-title"]')).toContainText(
        "Review Today's Tasks"
      );

      // Should show today's tasks
      await expect(page.locator('[data-testid="todays-tasks"]')).toBeVisible();
      await expect(page.locator('[data-testid="overdue-tasks"]')).toBeVisible();
      await helpers.completeReviewStep();

      // Step 4: Planning
      await expect(page.locator('[data-testid="step-planning"]')).toBeVisible();
      await expect(page.locator('[data-testid="step-title"]')).toContainText(
        "Plan Tomorrow"
      );

      // Should allow setting priorities for tomorrow
      await page.fill(
        '[data-testid="tomorrow-priorities"]',
        "Focus on urgent client work\nComplete project proposal"
      );
      await helpers.completeReviewStep();

      // Step 5: Reflection
      await expect(
        page.locator('[data-testid="step-reflection"]')
      ).toBeVisible();
      await expect(page.locator('[data-testid="step-title"]')).toContainText(
        "Quick Reflection"
      );

      // Should show reflection prompts
      await expect(
        page.locator('[data-testid="reflection-prompt"]')
      ).toBeVisible();
      await page.fill(
        '[data-testid="reflection-notes"]',
        "Good progress today. Need to focus more on deep work tomorrow."
      );
      await helpers.completeReviewStep();

      // Step 6: Completion
      await expect(
        page.locator('[data-testid="step-completion"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="review-summary"]')
      ).toBeVisible();
      await helpers.completeReviewStep();

      // Should complete review and return to dashboard
      await expect(page).toHaveURL(/\/dashboard/);
      await expect(
        page.locator('[data-testid="review-completed-message"]')
      ).toBeVisible();
    });

    test("should track daily review completion time", async ({ page }) => {
      const startTime = Date.now();
      await helpers.startDailyReview();

      // Complete all steps quickly
      for (let i = 0; i < 6; i++) {
        await helpers.completeReviewStep();
        await page.waitForTimeout(100);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should track completion time
      await expect(
        page.locator('[data-testid="review-duration"]')
      ).toContainText(/\d+ minutes?/);

      // Should complete within reasonable time (not enforced for testing)
      expect(duration).toBeLessThan(60000); // 1 minute for automated test
    });

    test("should pause and resume daily review", async ({ page }) => {
      await helpers.startDailyReview();

      // Complete first step
      await helpers.completeReviewStep();

      // Pause review
      await helpers.pauseReview();

      // Should show paused state
      await expect(page.locator('[data-testid="review-paused"]')).toBeVisible();
      await expect(page.locator('[data-testid="pause-message"]')).toContainText(
        "Review paused"
      );

      // Should be able to resume
      await helpers.resumeReview();

      // Should continue from where left off
      await expect(
        page.locator('[data-testid="step-calendar-check"]')
      ).toBeVisible();
      await expect(page.locator('[data-testid="current-step"]')).toContainText(
        "2"
      );
    });

    test("should handle daily review interruptions", async ({ page }) => {
      await helpers.startDailyReview();

      // Navigate away during review
      await page.goto("/dashboard");

      // Should show option to continue review
      await expect(
        page.locator('[data-testid="continue-review-banner"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="continue-review-banner"]')
      ).toContainText("Continue Daily Review");

      // Click to continue
      await page.click('[data-testid="continue-review"]');

      // Should return to review at correct step
      await expect(page).toHaveURL(/\/dashboard\/reviews\/daily/);
      await expect(page.locator('[data-testid="review-active"]')).toBeVisible();
    });

    test("should prevent multiple daily reviews", async ({ page }) => {
      // Complete a daily review
      await helpers.startDailyReview();
      for (let i = 0; i < 6; i++) {
        await helpers.completeReviewStep();
      }

      // Try to start another daily review
      await page.goto("/dashboard/reviews");
      const startButton = page.locator('[data-testid="start-daily-review"]');

      // Should be disabled or show already completed
      await expect(startButton).toBeDisabled();
      await expect(
        page.locator('[data-testid="daily-review-completed"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="daily-review-completed"]')
      ).toContainText("Completed today");
    });
  });

  test.describe("Weekly Review", () => {
    test("should start weekly review", async ({ page }) => {
      await helpers.startWeeklyReview();

      // Should show weekly review interface
      await expect(page.locator('[data-testid="review-header"]')).toContainText(
        "Weekly Review"
      );
      await expect(
        page.locator('[data-testid="review-description"]')
      ).toContainText("Comprehensive weekly review");
      await expect(
        page.locator('[data-testid="estimated-time"]')
      ).toContainText("30-60 minutes");

      // Should show more comprehensive progress
      await expect(
        page.locator('[data-testid="review-progress"]')
      ).toBeVisible();
      await expect(page.locator('[data-testid="total-steps"]')).toContainText(
        "9"
      ); // Based on REVIEW_WORKFLOWS
    });

    test("should complete weekly review workflow", async ({ page }) => {
      await helpers.startWeeklyReview();

      // Step 1: Welcome
      await expect(page.locator('[data-testid="step-welcome"]')).toBeVisible();
      await helpers.completeReviewStep();

      // Step 2: Calendar Review
      await expect(
        page.locator('[data-testid="step-calendar-check"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="past-week-calendar"]')
      ).toBeVisible();
      await helpers.completeReviewStep();

      // Step 3: Inbox Processing
      await expect(
        page.locator('[data-testid="step-inbox-process"]')
      ).toBeVisible();
      await expect(page.locator('[data-testid="inbox-items"]')).toBeVisible();

      // Should show inbox items for processing
      await expect(
        page.locator('[data-testid="task-item"]:has-text("Inbox item 1")')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="task-item"]:has-text("Inbox item 2")')
      ).toBeVisible();

      // Process each inbox item
      const inboxItems = page.locator('[data-testid="inbox-item"]');
      const count = await inboxItems.count();

      for (let i = 0; i < count; i++) {
        await inboxItems.nth(i).click();
        await page.selectOption(
          '[data-testid="clarify-action"]',
          "next_action"
        );
        await page.click('[data-testid="save-clarification"]');
      }

      await helpers.completeReviewStep();

      // Step 4: Project Review
      await expect(
        page.locator('[data-testid="step-project-review"]')
      ).toBeVisible();
      await expect(page.locator('[data-testid="all-projects"]')).toBeVisible();
      await helpers.completeReviewStep();

      // Continue through remaining steps...
      // Step 5: Waiting For Review
      await helpers.completeReviewStep();

      // Step 6: Someday Review
      await helpers.completeReviewStep();

      // Step 7: Planning
      await helpers.completeReviewStep();

      // Step 8: Reflection
      await helpers.completeReviewStep();

      // Step 9: Completion
      await helpers.completeReviewStep();

      // Should complete and show summary
      await expect(
        page.locator('[data-testid="weekly-review-summary"]')
      ).toBeVisible();
    });

    test("should show weekly insights and metrics", async ({ page }) => {
      await helpers.startWeeklyReview();

      // Navigate to completion step (or final reflection)
      for (let i = 0; i < 8; i++) {
        await helpers.completeReviewStep();
      }

      // Should show weekly insights
      await expect(
        page.locator('[data-testid="weekly-insights"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="tasks-completed-count"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="projects-progressed-count"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="avg-tasks-per-day"]')
      ).toBeVisible();
      await expect(page.locator('[data-testid="top-contexts"]')).toBeVisible();
      await expect(
        page.locator('[data-testid="productivity-streak"]')
      ).toBeVisible();
    });

    test("should handle weekly review sessions", async ({ page }) => {
      await helpers.startWeeklyReview();

      // Complete a few steps
      await helpers.completeReviewStep(); // Welcome
      await helpers.completeReviewStep(); // Calendar

      // Check session is saved
      await page.reload();

      // Should resume from correct step
      await expect(
        page.locator('[data-testid="step-inbox-process"]')
      ).toBeVisible();
      await expect(page.locator('[data-testid="current-step"]')).toContainText(
        "3"
      );
    });

    test("should track weekly review performance", async ({ page }) => {
      await helpers.startWeeklyReview();

      const startTime = Date.now();

      // Complete review
      for (let i = 0; i < 9; i++) {
        await helpers.completeReviewStep();
        await page.waitForTimeout(100);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should track completion metrics
      await expect(
        page.locator('[data-testid="review-duration"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="items-processed"]')
      ).toBeVisible();

      // Review should complete in reasonable time
      expect(duration).toBeLessThan(10000); // 10 seconds for automated test
    });
  });

  test.describe("AI Coaching System", () => {
    test("should provide contextual coaching during reviews", async ({
      page,
    }) => {
      await helpers.startDailyReview();

      // Move to task triage step
      await helpers.completeReviewStep(); // Welcome
      await helpers.completeReviewStep(); // Calendar

      // Should show AI coaching prompts
      await expect(page.locator('[data-testid="ai-coaching"]')).toBeVisible();
      await expect(
        page.locator('[data-testid="coaching-prompt"]')
      ).toBeVisible();

      // Should provide relevant suggestions
      const coachingText = await page
        .locator('[data-testid="coaching-prompt"]')
        .textContent();
      expect(coachingText).toBeTruthy();
      expect(coachingText?.length).toBeGreaterThan(10);
    });

    test("should adapt coaching based on user behavior", async ({ page }) => {
      // Create specific scenario with overdue tasks
      await helpers.captureTask("Overdue task", {
        status: "next_action",
        due_date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      });

      await helpers.startDailyReview();

      // Navigate to task review
      await helpers.completeReviewStep(); // Welcome
      await helpers.completeReviewStep(); // Calendar

      // AI should provide specific coaching about overdue tasks
      const coachingPrompt = page.locator('[data-testid="coaching-prompt"]');
      await expect(coachingPrompt).toContainText(/overdue|late|deadline/i);
    });

    test("should provide encouraging feedback", async ({ page }) => {
      // Complete several tasks to trigger positive feedback
      await helpers.captureTask("Completed task 1");
      await helpers.completeTask("Completed task 1");
      await helpers.captureTask("Completed task 2");
      await helpers.completeTask("Completed task 2");

      await helpers.startDailyReview();

      // Navigate to reflection step
      for (let i = 0; i < 4; i++) {
        await helpers.completeReviewStep();
      }

      // Should show encouraging feedback
      const reflection = page.locator('[data-testid="ai-reflection"]');
      await expect(reflection).toContainText(/great job|well done|progress/i);
    });

    test("should suggest process improvements", async ({ page }) => {
      // Create pattern that suggests improvement (many captured items)
      for (let i = 0; i < 10; i++) {
        await helpers.captureTask(`Unclarified task ${i + 1}`);
      }

      await helpers.startWeeklyReview();

      // Navigate to inbox processing
      await helpers.completeReviewStep(); // Welcome
      await helpers.completeReviewStep(); // Calendar

      // AI should suggest process improvements
      const coaching = page.locator('[data-testid="coaching-prompt"]');
      await expect(coaching).toContainText(/clarify|process|inbox/i);
    });

    test("should provide step-specific guidance", async ({ page }) => {
      await helpers.startWeeklyReview();

      // Navigate to project review step
      for (let i = 0; i < 3; i++) {
        await helpers.completeReviewStep();
      }

      // Should show project-specific guidance
      const guidance = page.locator('[data-testid="step-guidance"]');
      await expect(guidance).toContainText(/project/i);
      await expect(guidance).toBeVisible();
    });
  });

  test.describe("Review Analytics", () => {
    test("should track review completion rates", async ({ page }) => {
      await page.goto("/dashboard/reviews");

      // Should show review analytics
      await expect(
        page.locator('[data-testid="review-analytics"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="daily-review-streak"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="weekly-review-count"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="avg-review-time"]')
      ).toBeVisible();
    });

    test("should show productivity trends", async ({ page }) => {
      await page.goto("/dashboard/reviews");

      // Should show productivity charts
      await expect(
        page.locator('[data-testid="productivity-chart"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="completion-trends"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="context-analysis"]')
      ).toBeVisible();
    });

    test("should track review effectiveness", async ({ page }) => {
      // Complete a review first
      await helpers.startDailyReview();
      for (let i = 0; i < 6; i++) {
        await helpers.completeReviewStep();
      }

      await page.goto("/dashboard/reviews");

      // Should show effectiveness metrics
      await expect(
        page.locator('[data-testid="review-effectiveness"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="items-clarified"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="actions-identified"]')
      ).toBeVisible();
    });

    test("should provide review recommendations", async ({ page }) => {
      await page.goto("/dashboard/reviews");

      // Should show personalized recommendations
      await expect(
        page.locator('[data-testid="review-recommendations"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="next-review-suggestion"]')
      ).toBeVisible();

      // Recommendations should be actionable
      const recommendation = page.locator(
        '[data-testid="recommendation-text"]'
      );
      await expect(recommendation).toBeVisible();
    });
  });

  test.describe("Review Customization", () => {
    test("should allow customizing review steps", async ({ page }) => {
      await page.goto("/dashboard/reviews");
      await page.click('[data-testid="customize-reviews"]');

      // Should show customization options
      await expect(
        page.locator('[data-testid="review-customization"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="daily-review-steps"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="weekly-review-steps"]')
      ).toBeVisible();

      // Should allow enabling/disabling steps
      await page.uncheck('[data-testid="step-calendar-check"]');
      await page.click('[data-testid="save-customization"]');

      // Customization should be applied
      await helpers.startDailyReview();
      await helpers.completeReviewStep(); // Welcome

      // Calendar step should be skipped
      await expect(
        page.locator('[data-testid="step-task-triage"]')
      ).toBeVisible();
    });

    test("should support review templates", async ({ page }) => {
      await page.goto("/dashboard/reviews");
      await page.click('[data-testid="review-templates"]');

      // Should show template options
      await expect(
        page.locator('[data-testid="template-quick"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="template-comprehensive"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="template-custom"]')
      ).toBeVisible();

      // Apply quick template
      await page.click('[data-testid="apply-quick-template"]');

      // Should configure review accordingly
      await helpers.startDailyReview();

      // Should have fewer steps
      await expect(page.locator('[data-testid="total-steps"]')).toContainText(
        "3"
      );
    });

    test("should remember review preferences", async ({ page }) => {
      await page.goto("/dashboard/reviews");
      await page.click('[data-testid="review-settings"]');

      // Set preferences
      await page.selectOption(
        '[data-testid="preferred-review-time"]',
        "morning"
      );
      await page.check('[data-testid="skip-empty-steps"]');
      await page.click('[data-testid="save-preferences"]');

      // Start review
      await helpers.startDailyReview();

      // Preferences should be applied
      await expect(
        page.locator('[data-testid="morning-welcome"]')
      ).toBeVisible();
    });
  });

  test.describe("Review Accessibility", () => {
    test("should be keyboard navigable", async ({ page }) => {
      await helpers.startDailyReview();

      // Should be able to navigate with keyboard
      await page.keyboard.press("Tab");
      await expect(page.locator('[data-testid="complete-step"]')).toBeFocused();

      await page.keyboard.press("Enter");

      // Should advance to next step
      await expect(
        page.locator('[data-testid="step-calendar-check"]')
      ).toBeVisible();
    });

    test("should announce progress to screen readers", async ({ page }) => {
      await helpers.startDailyReview();

      // Progress should be announced
      const progressElement = page.locator('[data-testid="review-progress"]');
      await expect(progressElement).toHaveAttribute("aria-live", "polite");
      await expect(progressElement).toHaveAttribute("role", "status");
    });

    test("should support screen reader navigation", async ({ page }) => {
      await helpers.startDailyReview();

      // Review steps should have proper headings
      await expect(page.locator("h1, h2, h3")).toBeVisible();

      // Step content should be properly labeled
      const stepContent = page.locator('[data-testid="step-content"]');
      await expect(stepContent).toHaveAttribute("aria-labelledby");
    });
  });

  test.describe("Review Performance", () => {
    test("should load review quickly", async ({ page }) => {
      const startTime = Date.now();
      await helpers.startDailyReview();
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.PAGE_LOAD_MAX_TIME);
    });

    test("should handle step transitions smoothly", async ({ page }) => {
      await helpers.startDailyReview();

      const transitionStart = Date.now();
      await helpers.completeReviewStep();
      const transitionTime = Date.now() - transitionStart;

      expect(transitionTime).toBeLessThan(
        PERFORMANCE_THRESHOLDS.REVIEW_STEP_MAX_TIME
      );
    });

    test("should save progress efficiently", async ({ page }) => {
      await helpers.startDailyReview();

      // Complete step and measure save time
      const saveStart = Date.now();
      await helpers.completeReviewStep();
      const saveTime = Date.now() - saveStart;

      // Should save progress quickly
      expect(saveTime).toBeLessThan(2000);

      // Progress should persist
      await page.reload();
      await expect(
        page.locator('[data-testid="step-calendar-check"]')
      ).toBeVisible();
    });
  });
});
