import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";

test.describe("Task Capture", () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);

    // Login before each test
    await loginPage.goto();
    await loginPage.completeLogin("test@example.com");
    await dashboardPage.expectToBeLoaded();
  });

  test("should capture task with quick capture", async () => {
    const taskTitle = "Quick captured task";

    await dashboardPage.captureTask(taskTitle);

    // Verify task appears in captured list
    await dashboardPage.expectTaskInList(taskTitle, "captured-list");

    // Verify input is cleared and focused
    await dashboardPage.expectCaptureInputEmpty();
    await dashboardPage.expectCaptureInputFocused();
  });

  test("should capture task using Enter key", async () => {
    const taskTitle = "Keyboard captured task";

    await dashboardPage.captureTask(taskTitle, true); // Use keyboard

    await dashboardPage.expectTaskInList(taskTitle, "captured-list");
    await dashboardPage.expectCaptureInputEmpty();
  });

  test("should capture task with details", async () => {
    const taskTitle = "Detailed task";
    const taskDescription = "This task has additional details";

    await dashboardPage.captureTaskWithDetails(taskTitle, taskDescription);

    await dashboardPage.expectTaskInList(taskTitle, "captured-list");

    // Click on task to view details
    await dashboardPage.clickTaskCard(taskTitle);

    // Should show description in task detail view
    await expect(dashboardPage.page.getByText(taskDescription)).toBeVisible();
  });

  test("should handle rapid task capture", async () => {
    const tasks = ["First rapid task", "Second rapid task", "Third rapid task"];

    // Capture multiple tasks rapidly
    for (const task of tasks) {
      await dashboardPage.captureTask(task);
    }

    // Verify all tasks appear in captured list
    for (const task of tasks) {
      await dashboardPage.expectTaskInList(task, "captured-list");
    }
  });

  test("should validate task input", async () => {
    // Try to capture empty task
    await dashboardPage.addTaskButton.click();

    // Should not create task
    await dashboardPage.expectCaptureInputEmpty();

    // Try to capture whitespace-only task
    await dashboardPage.captureInput.fill("   ");
    await dashboardPage.addTaskButton.click();

    // Should not create task
    await dashboardPage.expectCaptureInputEmpty();

    // Capture valid task
    await dashboardPage.captureTask("Valid task");
    await dashboardPage.expectTaskInList("Valid task", "captured-list");
  });

  test("should trim whitespace from task titles", async () => {
    const taskTitle = "Trimmed task";
    const taskWithWhitespace = `  ${taskTitle}  `;

    await dashboardPage.captureInput.fill(taskWithWhitespace);
    await dashboardPage.addTaskButton.click();

    // Should show trimmed version
    await dashboardPage.expectTaskInList(taskTitle, "captured-list");
  });

  test("should handle long task titles", async () => {
    const longTask =
      "This is a very long task title that exceeds the normal length and should be handled gracefully by the application";

    await dashboardPage.captureTask(longTask);
    await dashboardPage.expectTaskInList(longTask, "captured-list");

    // Verify task card displays properly
    const taskCard = await dashboardPage.getTaskCard(longTask);
    await expect(taskCard).toBeVisible();
  });

  test("should show capture states correctly", async ({ page }) => {
    // Start typing
    await dashboardPage.captureInput.fill("Test task");

    // Should show typing state
    await expect(page.getByText("Auto-saving...")).toBeVisible();

    // Clear input
    await dashboardPage.captureInput.clear();

    // Should return to idle state
    await expect(page.getByText("Auto-saving...")).toBeHidden();
  });

  test("should handle capture errors gracefully", async ({ page }) => {
    // Mock API failure
    await page.route("**/rest/v1/tasks", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Server error" }),
      });
    });

    await dashboardPage.captureInput.fill("Failed task");
    await dashboardPage.addTaskButton.click();

    // Should show error state
    await expect(page.getByText(/error/i)).toBeVisible();

    // Should preserve input value for retry
    await expect(dashboardPage.captureInput).toHaveValue("Failed task");
  });

  test("should clear input with Escape key", async () => {
    await dashboardPage.captureInput.fill("Task to clear");

    // Press Escape
    await dashboardPage.page.keyboard.press("Escape");

    await dashboardPage.expectCaptureInputEmpty();
  });

  test("should use keyboard shortcut for quick capture", async () => {
    // Use Cmd+N to focus capture input
    await dashboardPage.pressKey("n", ["Meta"]);

    await dashboardPage.expectCaptureInputFocused();

    // Type and save
    await dashboardPage.captureInput.fill("Shortcut task");
    await dashboardPage.page.keyboard.press("Enter");

    await dashboardPage.expectTaskInList("Shortcut task", "captured-list");
  });

  test("should open detailed capture with Shift+Tab", async () => {
    await dashboardPage.captureInput.focus();
    await dashboardPage.captureInput.fill("Detailed shortcut task");

    // Press Shift+Tab
    await dashboardPage.page.keyboard.press("Shift+Tab");

    // Should open detailed capture modal
    const modal = dashboardPage.page.getByTestId("task-edit-modal");
    await expect(modal).toBeVisible();

    // Save the task
    await dashboardPage.page.getByRole("button", { name: /save/i }).click();

    await dashboardPage.expectTaskInList(
      "Detailed shortcut task",
      "captured-list"
    );
  });

  test.describe("Auto-save functionality", () => {
    test("should auto-save after typing stops", async ({ page }) => {
      // Type without submitting
      await dashboardPage.captureInput.fill("Auto-saved task");

      // Wait for auto-save (2 seconds)
      await page.waitForTimeout(2500);

      // Should show success state
      await expect(page.getByText("Saved!")).toBeVisible();

      // Task should appear in list
      await dashboardPage.expectTaskInList("Auto-saved task", "captured-list");

      // Input should be cleared
      await dashboardPage.expectCaptureInputEmpty();
    });

    test("should cancel auto-save if input cleared", async ({ page }) => {
      // Start typing
      await dashboardPage.captureInput.fill("Canceled task");

      // Wait briefly
      await page.waitForTimeout(1000);

      // Clear input before auto-save
      await dashboardPage.captureInput.clear();

      // Wait past auto-save time
      await page.waitForTimeout(2000);

      // Task should not be created
      await dashboardPage.expectTaskNotInList("Canceled task", "captured-list");
    });

    test("should restart auto-save timer when continuing to type", async ({
      page,
    }) => {
      // Start typing
      await dashboardPage.captureInput.fill("Extended");

      // Wait part way through timer
      await page.waitForTimeout(1000);

      // Continue typing
      await dashboardPage.captureInput.fill("Extended task");

      // Wait original timer duration
      await page.waitForTimeout(1500);

      // Should not have saved yet
      await dashboardPage.expectTaskNotInList("Extended task", "captured-list");

      // Wait for new timer to complete
      await page.waitForTimeout(1000);

      // Should now be saved
      await dashboardPage.expectTaskInList("Extended task", "captured-list");
    });
  });

  test.describe("Mobile capture", () => {
    test("should work on mobile devices", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await dashboardPage.testMobileCapture();
    });

    test("should have touch-friendly buttons", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Check button sizes are touch-friendly (44px minimum)
      const addButton = dashboardPage.addTaskButton;
      const buttonBox = await addButton.boundingBox();

      expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
      expect(buttonBox?.width).toBeGreaterThanOrEqual(44);
    });

    test("should prevent iOS zoom", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Check input font size is 16px to prevent zoom
      const inputFontSize = await dashboardPage.captureInput.evaluate(
        (el) => window.getComputedStyle(el).fontSize
      );

      expect(inputFontSize).toBe("16px");
    });
  });

  test.describe("Performance", () => {
    test("should capture tasks quickly", async () => {
      await dashboardPage.expectFastCapture();
    });

    test("should handle many tasks without performance degradation", async () => {
      const taskCount = 50;
      const startTime = Date.now();

      // Create many tasks
      for (let i = 1; i <= taskCount; i++) {
        await dashboardPage.captureTask(`Task ${i}`);
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / taskCount;

      // Each task should take less than 1 second on average
      expect(averageTime).toBeLessThan(1000);

      // Verify all tasks are present
      const capturedList = dashboardPage.capturedList;
      const taskCards = await capturedList.getByTestId("task-card").count();
      expect(taskCards).toBe(taskCount);
    });
  });

  test.describe("Accessibility", () => {
    test("should be keyboard accessible", async () => {
      // Tab to capture input
      await dashboardPage.page.keyboard.press("Tab");
      await dashboardPage.expectCaptureInputFocused();

      // Type and save with Enter
      await dashboardPage.captureInput.fill("Accessible task");
      await dashboardPage.page.keyboard.press("Enter");

      await dashboardPage.expectTaskInList("Accessible task", "captured-list");
    });

    test("should have proper ARIA labels", async () => {
      await expect(dashboardPage.captureInput).toHaveAttribute(
        "aria-label",
        /capture|add|task/i
      );

      await expect(dashboardPage.addTaskButton).toHaveAttribute(
        "aria-label",
        /add|create|task/i
      );
    });

    test("should announce capture success to screen readers", async ({
      page,
    }) => {
      await dashboardPage.captureTask("Announced task");

      // Check for success announcement
      const announcement = page.getByRole("status");
      await expect(announcement).toContainText(/saved|added|created/i);
    });
  });
});
