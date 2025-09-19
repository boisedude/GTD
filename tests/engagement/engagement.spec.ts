import { test, expect } from "@playwright/test";
import { GTDTestHelpers, PERFORMANCE_THRESHOLDS } from "../helpers/test-utils";
import { TEST_USERS, TEST_CONTEXTS, TEST_TASKS } from "../fixtures/test-data";

test.describe("Engagement Interface", () => {
  let helpers: GTDTestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new GTDTestHelpers(page);
    await helpers.ensureAuthenticated();

    // Set up test tasks with various contexts and properties
    await helpers.captureTask("Call dentist", {
      status: "next_action",
      context: "calls",
      energy_level: "low",
      estimated_duration: "5min",
      priority: 2,
    });
    await helpers.captureTask("Write project proposal", {
      status: "next_action",
      context: "computer",
      energy_level: "high",
      estimated_duration: "2hour+",
      priority: 1,
    });
    await helpers.captureTask("Buy groceries", {
      status: "next_action",
      context: "errands",
      energy_level: "medium",
      estimated_duration: "1hour",
      priority: 3,
    });
    await helpers.captureTask("Review team feedback", {
      status: "next_action",
      context: "office",
      energy_level: "medium",
      estimated_duration: "30min",
      priority: 1,
    });
  });

  test.afterEach(async () => {
    await helpers.cleanupTestData();
  });

  test.describe("Engagement Dashboard", () => {
    test("should display engagement dashboard", async ({ page }) => {
      await helpers.goToEngagement();

      // Should show main engagement interface
      await expect(
        page.locator('[data-testid="engagement-dashboard"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="what-to-do-next"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="context-selector"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="suggested-tasks"]')
      ).toBeVisible();
    });

    test("should show current context information", async ({ page }) => {
      await helpers.goToEngagement();

      // Should display current context
      await expect(
        page.locator('[data-testid="current-context"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="current-location"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="available-time"]')
      ).toBeVisible();
      await expect(page.locator('[data-testid="energy-level"]')).toBeVisible();
    });

    test("should provide quick context switching", async ({ page }) => {
      await helpers.goToEngagement();

      // Should show context quick switcher
      await expect(
        page.locator('[data-testid="quick-context-switcher"]')
      ).toBeVisible();

      // Test context switching
      await page.click('[data-testid="context-office"]');
      await expect(
        page.locator('[data-testid="current-location"]')
      ).toContainText("office");

      await page.click('[data-testid="context-home"]');
      await expect(
        page.locator('[data-testid="current-location"]')
      ).toContainText("home");

      await page.click('[data-testid="context-mobile"]');
      await expect(
        page.locator('[data-testid="current-location"]')
      ).toContainText("mobile");
    });

    test("should update suggestions based on context", async ({ page }) => {
      await helpers.goToEngagement();

      // Set office context
      await helpers.setEngagementContext({
        location: "office",
        availableTime: "2hour+",
        energy: "high",
      });

      // Should suggest high-energy, long-duration office tasks
      const suggestions = await helpers.getTaskSuggestions();
      await expect(
        suggestions.filter({ hasText: "Write project proposal" })
      ).toBeVisible();
      await expect(
        suggestions.filter({ hasText: "Review team feedback" })
      ).toBeVisible();

      // Change to mobile context
      await helpers.setEngagementContext({
        location: "mobile",
        availableTime: "5min",
        energy: "low",
      });

      // Should suggest quick, low-energy tasks
      const mobileSuggestions = await helpers.getTaskSuggestions();
      await expect(
        mobileSuggestions.filter({ hasText: "Call dentist" })
      ).toBeVisible();
    });
  });

  test.describe("Task Recommendations", () => {
    test('should provide "What to do next" recommendations', async ({
      page,
    }) => {
      await helpers.goToEngagement();

      // Should show personalized recommendations
      await expect(
        page.locator('[data-testid="recommendation-header"]')
      ).toContainText("What should you do next?");

      const suggestions = await helpers.getTaskSuggestions();
      await expect(suggestions).toHaveCountGreaterThan(0);

      // Each suggestion should show reasoning
      const firstSuggestion = suggestions.first();
      await expect(
        firstSuggestion.locator('[data-testid="task-title"]')
      ).toBeVisible();
      await expect(
        firstSuggestion.locator('[data-testid="suggestion-reason"]')
      ).toBeVisible();
      await expect(
        firstSuggestion.locator('[data-testid="suggestion-score"]')
      ).toBeVisible();
    });

    test("should rank suggestions by relevance", async ({ page }) => {
      await helpers.goToEngagement();

      // Set specific context
      await helpers.setEngagementContext({
        location: "office",
        availableTime: "30min",
        energy: "medium",
      });

      const suggestions = await helpers.getTaskSuggestions();

      // First suggestion should be most relevant
      const firstSuggestion = suggestions.first();
      const firstScore = await firstSuggestion
        .locator('[data-testid="suggestion-score"]')
        .textContent();

      const secondSuggestion = suggestions.nth(1);
      const secondScore = await secondSuggestion
        .locator('[data-testid="suggestion-score"]')
        .textContent();

      // Scores should be in descending order
      const firstScoreNum = parseFloat(firstScore || "0");
      const secondScoreNum = parseFloat(secondScore || "0");
      expect(firstScoreNum).toBeGreaterThanOrEqual(secondScoreNum);
    });

    test("should explain recommendation reasoning", async ({ page }) => {
      await helpers.goToEngagement();

      await helpers.setEngagementContext({
        location: "office",
        availableTime: "30min",
        energy: "medium",
      });

      const suggestions = await helpers.getTaskSuggestions();
      const firstSuggestion = suggestions.first();

      // Should show clear reasoning
      const reason = await firstSuggestion
        .locator('[data-testid="suggestion-reason"]')
        .textContent();
      expect(reason).toBeTruthy();
      expect(reason?.length).toBeGreaterThan(10);

      // Reason should be contextually relevant
      expect(reason).toMatch(/(context|time|energy|priority)/i);
    });

    test("should update recommendations dynamically", async ({ page }) => {
      await helpers.goToEngagement();

      // Initial context
      await helpers.setEngagementContext({
        location: "office",
        availableTime: "2hour+",
        energy: "high",
      });

      const initialSuggestions = await helpers.getTaskSuggestions();
      const initialFirstTask = await initialSuggestions
        .first()
        .locator('[data-testid="task-title"]')
        .textContent();

      // Change context significantly
      await helpers.setEngagementContext({
        location: "mobile",
        availableTime: "5min",
        energy: "low",
      });

      const newSuggestions = await helpers.getTaskSuggestions();
      const newFirstTask = await newSuggestions
        .first()
        .locator('[data-testid="task-title"]')
        .textContent();

      // Suggestions should change
      expect(newFirstTask).not.toBe(initialFirstTask);
    });

    test("should handle no available tasks gracefully", async ({ page }) => {
      // Complete all tasks first
      await helpers.completeTask("Call dentist");
      await helpers.completeTask("Write project proposal");
      await helpers.completeTask("Buy groceries");
      await helpers.completeTask("Review team feedback");

      await helpers.goToEngagement();

      // Should show appropriate message
      await expect(
        page.locator('[data-testid="no-tasks-message"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="no-tasks-message"]')
      ).toContainText(/no tasks|all done|great job/i);

      // Should suggest review or capture
      await expect(
        page.locator('[data-testid="suggestion-capture"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="suggestion-review"]')
      ).toBeVisible();
    });

    test("should support task filtering in suggestions", async ({ page }) => {
      await helpers.goToEngagement();

      // Apply filters to suggestions
      await page.click('[data-testid="filter-suggestions"]');

      // Filter by priority
      await page.check('[data-testid="filter-high-priority"]');
      await page.click('[data-testid="apply-suggestion-filters"]');

      const suggestions = await helpers.getTaskSuggestions();

      // Should only show high-priority tasks
      for (let i = 0; i < (await suggestions.count()); i++) {
        const suggestion = suggestions.nth(i);
        await expect(
          suggestion.locator('[data-testid="task-priority"]')
        ).toContainText("1");
      }
    });
  });

  test.describe("Context-Aware Filtering", () => {
    test("should filter tasks by location context", async ({ page }) => {
      await helpers.goToEngagement();

      // Set location to office
      await helpers.setEngagementContext({ location: "office" });

      // Should show office and computer tasks
      const suggestions = await helpers.getTaskSuggestions();
      await expect(
        suggestions.filter({ hasText: "Review team feedback" })
      ).toBeVisible();
      await expect(
        suggestions.filter({ hasText: "Write project proposal" })
      ).toBeVisible();

      // Should not show errands or calls
      await expect(
        suggestions.filter({ hasText: "Buy groceries" })
      ).not.toBeVisible();
    });

    test("should filter tasks by available time", async ({ page }) => {
      await helpers.goToEngagement();

      // Set short time window
      await helpers.setEngagementContext({ availableTime: "5min" });

      const suggestions = await helpers.getTaskSuggestions();

      // Should only show quick tasks
      await expect(
        suggestions.filter({ hasText: "Call dentist" })
      ).toBeVisible();
      await expect(
        suggestions.filter({ hasText: "Write project proposal" })
      ).not.toBeVisible();
    });

    test("should filter tasks by energy level", async ({ page }) => {
      await helpers.goToEngagement();

      // Set low energy
      await helpers.setEngagementContext({ energy: "low" });

      const suggestions = await helpers.getTaskSuggestions();

      // Should prioritize low-energy tasks
      await expect(
        suggestions.filter({ hasText: "Call dentist" })
      ).toBeVisible();

      // High-energy tasks should be deprioritized or hidden
      const highEnergyTask = suggestions.filter({
        hasText: "Write project proposal",
      });
      if ((await highEnergyTask.count()) > 0) {
        // If shown, should be ranked lower
        const allSuggestions = await suggestions.count();
        const highEnergyIndex = await suggestions
          .locator('text="Write project proposal"')
          .count();
        expect(highEnergyIndex).toBeLessThan(allSuggestions);
      }
    });

    test("should combine multiple context filters", async ({ page }) => {
      await helpers.goToEngagement();

      // Set restrictive context
      await helpers.setEngagementContext({
        location: "mobile",
        availableTime: "5min",
        energy: "low",
      });

      const suggestions = await helpers.getTaskSuggestions();

      // Should show only tasks matching all criteria
      if ((await suggestions.count()) > 0) {
        const firstSuggestion = suggestions.first();
        await expect(
          firstSuggestion.locator('[data-testid="task-context"]')
        ).toContainText(/(calls|anywhere)/);
        await expect(
          firstSuggestion.locator('[data-testid="task-duration"]')
        ).toContainText(/(5min|15min)/);
        await expect(
          firstSuggestion.locator('[data-testid="task-energy"]')
        ).toContainText(/(low|medium)/);
      }
    });

    test("should handle context changes intelligently", async ({ page }) => {
      await helpers.goToEngagement();

      // Start with broad context
      await helpers.setEngagementContext({
        location: "home",
        availableTime: "2hour+",
        energy: "high",
      });

      let suggestions = await helpers.getTaskSuggestions();
      const initialCount = await suggestions.count();

      // Narrow context significantly
      await helpers.setEngagementContext({
        location: "mobile",
        availableTime: "5min",
        energy: "low",
      });

      suggestions = await helpers.getTaskSuggestions();
      const narrowedCount = await suggestions.count();

      // Should show fewer, more targeted suggestions
      expect(narrowedCount).toBeLessThanOrEqual(initialCount);
    });
  });

  test.describe("Task Timers and Focus Sessions", () => {
    test("should start timer for selected task", async ({ page }) => {
      await helpers.goToEngagement();

      const suggestions = await helpers.getTaskSuggestions();
      const firstTask = suggestions.first();
      const taskTitle = await firstTask
        .locator('[data-testid="task-title"]')
        .textContent();

      // Start timer for task
      await helpers.startTimer(taskTitle!);

      // Should show active timer
      await expect(page.locator('[data-testid="timer-active"]')).toBeVisible();
      await expect(
        page.locator('[data-testid="timer-task-title"]')
      ).toContainText(taskTitle!);
      await expect(
        page.locator('[data-testid="timer-duration"]')
      ).toBeVisible();

      // Timer controls should be available
      await expect(page.locator('[data-testid="pause-timer"]')).toBeVisible();
      await expect(page.locator('[data-testid="stop-timer"]')).toBeVisible();
    });

    test("should track timer duration", async ({ page }) => {
      await helpers.goToEngagement();

      const suggestions = await helpers.getTaskSuggestions();
      const firstTask = suggestions.first();
      const taskTitle = await firstTask
        .locator('[data-testid="task-title"]')
        .textContent();

      await helpers.startTimer(taskTitle!);

      // Wait a moment
      await page.waitForTimeout(2000);

      // Timer should show elapsed time
      const timerDisplay = page.locator('[data-testid="timer-duration"]');
      const timerText = await timerDisplay.textContent();
      expect(timerText).toMatch(/\d+:\d+/); // MM:SS format

      // Should be counting up
      await page.waitForTimeout(1000);
      const newTimerText = await timerDisplay.textContent();
      expect(newTimerText).not.toBe(timerText);
    });

    test("should pause and resume timer", async ({ page }) => {
      await helpers.goToEngagement();

      const suggestions = await helpers.getTaskSuggestions();
      const firstTask = suggestions.first();
      const taskTitle = await firstTask
        .locator('[data-testid="task-title"]')
        .textContent();

      await helpers.startTimer(taskTitle!);

      // Pause timer
      await page.click('[data-testid="pause-timer"]');
      await expect(page.locator('[data-testid="timer-paused"]')).toBeVisible();

      const pausedTime = await page
        .locator('[data-testid="timer-duration"]')
        .textContent();

      // Wait and verify time doesn't change
      await page.waitForTimeout(1000);
      const stillPausedTime = await page
        .locator('[data-testid="timer-duration"]')
        .textContent();
      expect(stillPausedTime).toBe(pausedTime);

      // Resume timer
      await page.click('[data-testid="resume-timer"]');
      await expect(page.locator('[data-testid="timer-active"]')).toBeVisible();
    });

    test("should complete task when timer stops", async ({ page }) => {
      await helpers.goToEngagement();

      const suggestions = await helpers.getTaskSuggestions();
      const firstTask = suggestions.first();
      const taskTitle = await firstTask
        .locator('[data-testid="task-title"]')
        .textContent();

      await helpers.startTimer(taskTitle!);
      await helpers.stopTimer();

      // Should prompt for task completion
      await expect(
        page.locator('[data-testid="timer-completion-dialog"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="complete-task-option"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="continue-task-option"]')
      ).toBeVisible();

      // Complete the task
      await page.click('[data-testid="complete-task-option"]');

      // Task should be marked as completed
      await expect(
        page.locator('[data-testid="task-completed-notification"]')
      ).toBeVisible();
    });

    test("should save timer sessions", async ({ page }) => {
      await helpers.goToEngagement();

      const suggestions = await helpers.getTaskSuggestions();
      const firstTask = suggestions.first();
      const taskTitle = await firstTask
        .locator('[data-testid="task-title"]')
        .textContent();

      await helpers.startTimer(taskTitle!);
      await page.waitForTimeout(3000); // Work for 3 seconds
      await helpers.stopTimer();

      // Complete dialog
      await page.click('[data-testid="continue-task-option"]');

      // Check task shows timer history
      const taskItem = page.locator(
        `[data-testid="task-item"]:has-text("${taskTitle!}")`
      );
      await taskItem.click();

      await expect(page.locator('[data-testid="timer-history"]')).toBeVisible();
      await expect(
        page.locator('[data-testid="total-time-logged"]')
      ).toBeVisible();
    });

    test("should support focus session modes", async ({ page }) => {
      await helpers.goToEngagement();

      // Start focus session
      await page.click('[data-testid="start-focus-session"]');

      // Should show focus mode options
      await expect(
        page.locator('[data-testid="focus-mode-dialog"]')
      ).toBeVisible();
      await expect(page.locator('[data-testid="pomodoro-mode"]')).toBeVisible();
      await expect(
        page.locator('[data-testid="deep-work-mode"]')
      ).toBeVisible();
      await expect(page.locator('[data-testid="sprint-mode"]')).toBeVisible();

      // Select Pomodoro mode
      await page.click('[data-testid="pomodoro-mode"]');

      // Should start 25-minute timer
      await expect(page.locator('[data-testid="focus-timer"]')).toBeVisible();
      await expect(
        page.locator('[data-testid="focus-mode-active"]')
      ).toContainText("Pomodoro");
      await expect(
        page.locator('[data-testid="timer-duration"]')
      ).toContainText("25:00");
    });
  });

  test.describe("Quick Actions", () => {
    test("should provide quick task actions", async ({ page }) => {
      await helpers.goToEngagement();

      const suggestions = await helpers.getTaskSuggestions();
      const firstSuggestion = suggestions.first();

      // Should show quick action buttons
      await expect(
        firstSuggestion.locator('[data-testid="quick-start"]')
      ).toBeVisible();
      await expect(
        firstSuggestion.locator('[data-testid="quick-defer"]')
      ).toBeVisible();
      await expect(
        firstSuggestion.locator('[data-testid="quick-complete"]')
      ).toBeVisible();
    });

    test("should support quick task completion", async ({ page }) => {
      await helpers.goToEngagement();

      const suggestions = await helpers.getTaskSuggestions();
      const firstSuggestion = suggestions.first();
      const taskTitle = await firstSuggestion
        .locator('[data-testid="task-title"]')
        .textContent();

      // Quick complete
      await firstSuggestion.locator('[data-testid="quick-complete"]').click();

      // Should show completion confirmation
      await expect(
        page.locator('[data-testid="quick-complete-confirmation"]')
      ).toBeVisible();
      await page.click('[data-testid="confirm-quick-complete"]');

      // Task should be completed and removed from suggestions
      const updatedSuggestions = await helpers.getTaskSuggestions();
      await expect(
        updatedSuggestions.filter({ hasText: taskTitle! })
      ).not.toBeVisible();
    });

    test("should support quick task deferral", async ({ page }) => {
      await helpers.goToEngagement();

      const suggestions = await helpers.getTaskSuggestions();
      const firstSuggestion = suggestions.first();

      // Quick defer
      await firstSuggestion.locator('[data-testid="quick-defer"]').click();

      // Should show defer options
      await expect(page.locator('[data-testid="defer-options"]')).toBeVisible();
      await expect(
        page.locator('[data-testid="defer-later-today"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="defer-tomorrow"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="defer-next-week"]')
      ).toBeVisible();

      // Defer until tomorrow
      await page.click('[data-testid="defer-tomorrow"]');

      // Task should be removed from current suggestions
      const updatedSuggestions = await helpers.getTaskSuggestions();
      expect(await updatedSuggestions.count()).toBeLessThan(
        await suggestions.count()
      );
    });

    test("should support swipe actions on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await helpers.goToEngagement();

      const suggestions = await helpers.getTaskSuggestions();
      const firstSuggestion = suggestions.first();

      // Test swipe actions
      await helpers.testMobileSwipeActions();

      // Should show swipe action options
      await expect(page.locator('[data-testid="swipe-actions"]')).toBeVisible();
      await expect(
        page.locator('[data-testid="swipe-complete"]')
      ).toBeVisible();
      await expect(page.locator('[data-testid="swipe-defer"]')).toBeVisible();
      await expect(page.locator('[data-testid="swipe-start"]')).toBeVisible();
    });
  });

  test.describe("Offline Action Queue", () => {
    test("should queue actions when offline", async ({ page }) => {
      await helpers.goToEngagement();

      // Go offline
      await page.context().setOffline(true);

      const suggestions = await helpers.getTaskSuggestions();
      const firstSuggestion = suggestions.first();

      // Try to complete task while offline
      await firstSuggestion.locator('[data-testid="quick-complete"]').click();
      await page.click('[data-testid="confirm-quick-complete"]');

      // Should show offline indicator and queue action
      await expect(
        page.locator('[data-testid="offline-indicator"]')
      ).toBeVisible();
      await expect(page.locator('[data-testid="action-queued"]')).toBeVisible();
      await expect(
        page.locator('[data-testid="pending-actions-count"]')
      ).toContainText("1");
    });

    test("should sync queued actions when back online", async ({ page }) => {
      await helpers.goToEngagement();

      // Go offline and queue action
      await page.context().setOffline(true);

      const suggestions = await helpers.getTaskSuggestions();
      const firstSuggestion = suggestions.first();
      const taskTitle = await firstSuggestion
        .locator('[data-testid="task-title"]')
        .textContent();

      await firstSuggestion.locator('[data-testid="quick-complete"]').click();
      await page.click('[data-testid="confirm-quick-complete"]');

      // Go back online
      await page.context().setOffline(false);

      // Should sync queued actions
      await expect(
        page.locator('[data-testid="syncing-actions"]')
      ).toBeVisible();
      await expect(page.locator('[data-testid="sync-complete"]')).toBeVisible();

      // Action should be applied
      const updatedSuggestions = await helpers.getTaskSuggestions();
      await expect(
        updatedSuggestions.filter({ hasText: taskTitle! })
      ).not.toBeVisible();
    });

    test("should show queued actions status", async ({ page }) => {
      await helpers.goToEngagement();

      await page.context().setOffline(true);

      // Queue multiple actions
      const suggestions = await helpers.getTaskSuggestions();
      for (let i = 0; i < 2; i++) {
        const suggestion = suggestions.nth(i);
        await suggestion.locator('[data-testid="quick-defer"]').click();
        await page.click('[data-testid="defer-tomorrow"]');
      }

      // Should show queued actions
      await expect(
        page.locator('[data-testid="pending-actions-count"]')
      ).toContainText("2");

      // Should show action details
      await page.click('[data-testid="show-pending-actions"]');
      await expect(
        page.locator('[data-testid="pending-actions-list"]')
      ).toBeVisible();
      await expect(page.locator('[data-testid="pending-action"]')).toHaveCount(
        2
      );
    });
  });

  test.describe("Performance and Accessibility", () => {
    test("should load engagement interface quickly", async ({ page }) => {
      const startTime = Date.now();
      await helpers.goToEngagement();
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.PAGE_LOAD_MAX_TIME);
    });

    test("should update suggestions responsively", async ({ page }) => {
      await helpers.goToEngagement();

      const updateStart = Date.now();
      await helpers.setEngagementContext({ location: "office" });
      await helpers.getTaskSuggestions();
      const updateTime = Date.now() - updateStart;

      expect(updateTime).toBeLessThan(2000); // 2 seconds for context update
    });

    test("should be keyboard accessible", async ({ page }) => {
      await helpers.goToEngagement();

      // Should be able to navigate suggestions with keyboard
      await page.keyboard.press("Tab");

      const focusedElement = page.locator(":focus");
      await expect(focusedElement).toBeVisible();

      // Should be able to activate suggestions with keyboard
      await page.keyboard.press("Enter");

      // Some action should occur (timer start, task detail, etc.)
      const hasTimer = await page
        .locator('[data-testid="timer-active"]')
        .isVisible();
      const hasModal = await page
        .locator('[data-testid="task-detail-modal"]')
        .isVisible();

      expect(hasTimer || hasModal).toBe(true);
    });

    test("should support screen readers", async ({ page }) => {
      await helpers.goToEngagement();

      // Suggestions should have proper ARIA labels
      const suggestions = await helpers.getTaskSuggestions();
      const firstSuggestion = suggestions.first();

      await expect(firstSuggestion).toHaveAttribute("role", "listitem");
      await expect(firstSuggestion).toHaveAttribute("aria-label");

      // Context information should be announced
      const contextInfo = page.locator('[data-testid="current-context"]');
      await expect(contextInfo).toHaveAttribute("aria-live", "polite");
    });

    test("should work well on mobile devices", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await helpers.goToEngagement();

      // Interface should be touch-friendly
      const suggestions = await helpers.getTaskSuggestions();
      const firstSuggestion = suggestions.first();

      const suggestionBounds = await firstSuggestion.boundingBox();
      expect(suggestionBounds?.height).toBeGreaterThanOrEqual(44); // Minimum touch target

      // Quick actions should be accessible
      await expect(
        firstSuggestion.locator('[data-testid="quick-start"]')
      ).toBeVisible();
    });

    test("should handle large numbers of suggestions efficiently", async ({
      page,
    }) => {
      // Create many tasks
      for (let i = 0; i < 50; i++) {
        await helpers.captureTask(`Bulk task ${i + 1}`, {
          status: "next_action",
          context: "office",
          energy_level: "medium",
          estimated_duration: "30min",
        });
      }

      const startTime = Date.now();
      await helpers.goToEngagement();
      await helpers.getTaskSuggestions();
      const loadTime = Date.now() - startTime;

      // Should handle large datasets efficiently
      expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.PAGE_LOAD_MAX_TIME);

      // Should implement pagination or virtualization
      const suggestions = await helpers.getTaskSuggestions();
      const visibleCount = await suggestions.count();
      expect(visibleCount).toBeLessThanOrEqual(20); // Reasonable display limit
    });
  });
});
