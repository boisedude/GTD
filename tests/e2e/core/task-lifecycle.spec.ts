import { test, expect } from "@playwright/test";

test.describe("Task Lifecycle - Core User Journey", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app and ensure we're logged in
    await page.goto("/");

    // Mock authentication for testing
    await page.addInitScript(() => {
      localStorage.setItem(
        "sb-localhost-auth-token",
        JSON.stringify({
          access_token: "mock-token",
          refresh_token: "mock-refresh",
          user: {
            id: "test-user-1",
            email: "test@example.com",
          },
        })
      );
    });

    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
  });

  test("should complete full task lifecycle: create, edit, complete, delete", async ({
    page,
  }) => {
    // STEP 1: Create a new task
    const taskTitle = "Complete end-to-end test task";

    // Navigate to capture page
    await page.click('[aria-label*="Capture"]');
    await expect(page).toHaveURL(/.*\/capture/);

    // Fill and submit the capture form
    const captureInput = page.getByPlaceholder("What's on your mind?");
    await captureInput.fill(taskTitle);
    await captureInput.press("Enter");

    // Verify success feedback
    await expect(page.getByText("Task captured successfully!")).toBeVisible({
      timeout: 5000,
    });

    // Verify input is cleared
    await expect(captureInput).toBeEmpty();

    // STEP 2: Navigate to organize to see the task
    await page.click('[aria-label*="Organize"]');
    await expect(page).toHaveURL(/.*\/organize/);

    // Wait for tasks to load
    await page.waitForSelector('[data-testid="task-card"]', { timeout: 10000 });

    // Find the created task
    const taskCard = page.locator('[data-testid="task-card"]').filter({
      hasText: taskTitle,
    });
    await expect(taskCard).toBeVisible();

    // STEP 3: Edit the task
    await taskCard.hover();
    await taskCard.getByRole("button", { name: /more/i }).click();
    await page.getByText("Edit Task").click();

    // Update task details in the edit modal
    const editModal = page.getByRole("dialog", { name: /edit task/i });
    await expect(editModal).toBeVisible();

    const titleInput = editModal.getByLabel(/title/i);
    const updatedTitle = "Updated end-to-end test task";
    await titleInput.fill(updatedTitle);

    const descriptionInput = editModal.getByLabel(/description/i);
    await descriptionInput.fill("This task has been updated with a description");

    // Set priority
    await editModal.getByRole("combobox", { name: /priority/i }).click();
    await page.getByText("High").click();

    // Set context
    await editModal.getByRole("combobox", { name: /context/i }).click();
    await page.getByText("@office").click();

    // Save changes
    await editModal.getByRole("button", { name: /save/i }).click();

    // Verify modal closes and changes are reflected
    await expect(editModal).not.toBeVisible();
    await expect(page.getByText(updatedTitle)).toBeVisible();
    await expect(page.getByText("@office")).toBeVisible();

    // Verify high priority styling
    const updatedTaskCard = page.locator('[data-testid="task-card"]').filter({
      hasText: updatedTitle,
    });
    await expect(updatedTaskCard.getByText("High")).toBeVisible();

    // STEP 4: Move task to Next Actions
    await updatedTaskCard.hover();
    await updatedTaskCard.getByRole("button", { name: /more/i }).click();
    await page.getByText("Move to Next Actions").click();

    // Verify task appears in Next Actions list
    await page.click('[aria-label*="Next Actions"]');
    await expect(page.getByText(updatedTitle)).toBeVisible();

    // STEP 5: Complete the task
    const nextActionCard = page.locator('[data-testid="task-card"]').filter({
      hasText: updatedTitle,
    });

    const completeButton = nextActionCard.getByRole("button", { name: /complete/i });
    await completeButton.click();

    // Verify completion visual feedback
    await expect(nextActionCard.getByText(updatedTitle)).toHaveClass(/line-through/);

    // Alternative: Complete via menu
    await nextActionCard.hover();
    await nextActionCard.getByRole("button", { name: /more/i }).click();
    await page.getByText("Mark Complete").click();

    // STEP 6: View completed task in archive
    await page.click('[aria-label*="Archive"]');
    await expect(page.getByText(updatedTitle)).toBeVisible();

    const archivedTaskCard = page.locator('[data-testid="task-card"]').filter({
      hasText: updatedTitle,
    });
    await expect(archivedTaskCard).toHaveClass(/opacity-60/);

    // STEP 7: Delete the task
    await archivedTaskCard.hover();
    await archivedTaskCard.getByRole("button", { name: /more/i }).click();
    await page.getByText("Delete").click();

    // Confirm deletion in dialog
    const deleteDialog = page.getByRole("dialog", { name: /delete/i });
    await expect(deleteDialog).toBeVisible();
    await expect(deleteDialog.getByText(updatedTitle)).toBeVisible();

    await deleteDialog.getByRole("button", { name: /delete/i }).click();

    // Verify task is removed
    await expect(deleteDialog).not.toBeVisible();
    await expect(
      page.locator('[data-testid="task-card"]').filter({
        hasText: updatedTitle,
      })
    ).not.toBeVisible();
  });

  test("should handle task status transitions correctly", async ({ page }) => {
    const taskTitle = "Status transition test task";

    // Create task via quick capture
    await page.goto("/capture");
    const captureInput = page.getByPlaceholder("What's on your mind?");
    await captureInput.fill(taskTitle);
    await captureInput.press("Enter");

    await expect(page.getByText("Task captured successfully!")).toBeVisible();

    // Navigate to organize
    await page.goto("/organize");
    const taskCard = page.locator('[data-testid="task-card"]').filter({
      hasText: taskTitle,
    });

    // Test all status transitions
    const statusTransitions = [
      { from: "Inbox", to: "Next Actions", filter: "next_action" },
      { from: "Next Actions", to: "Waiting For", filter: "waiting_for" },
      { from: "Waiting For", to: "Someday/Maybe", filter: "someday" },
      { from: "Someday/Maybe", to: "Projects", filter: "project" },
    ];

    for (const transition of statusTransitions) {
      // Move task to new status
      await taskCard.hover();
      await taskCard.getByRole("button", { name: /more/i }).click();
      await page.getByText(`Move to ${transition.to}`).click();

      // Navigate to the target list and verify task is there
      await page.click(`[aria-label*="${transition.to}"]`);
      await expect(page.getByText(taskTitle)).toBeVisible();
    }
  });

  test("should support keyboard navigation throughout task lifecycle", async ({
    page,
  }) => {
    const taskTitle = "Keyboard navigation test";

    // Capture with keyboard
    await page.goto("/capture");
    await page.keyboard.press("Tab"); // Focus capture input
    await page.keyboard.type(taskTitle);
    await page.keyboard.press("Enter");

    await expect(page.getByText("Task captured successfully!")).toBeVisible();

    // Navigate to organize with keyboard
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter"); // Navigate to organize

    // Find task and interact with keyboard
    await page.goto("/organize"); // Ensure we're on organize page
    const taskCard = page.locator('[data-testid="task-card"]').filter({
      hasText: taskTitle,
    });

    // Tab to task card and activate menu
    await taskCard.focus();
    await page.keyboard.press("Tab"); // Tab to menu button
    await page.keyboard.press("Enter"); // Open menu

    // Navigate menu with arrow keys
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter"); // Select "Edit Task"

    // Edit with keyboard
    const editModal = page.getByRole("dialog", { name: /edit task/i });
    await expect(editModal).toBeVisible();

    await page.keyboard.press("Tab"); // Tab to title field
    await page.keyboard.press("Control+a"); // Select all
    await page.keyboard.type("Updated via keyboard");

    await page.keyboard.press("Tab"); // Tab to description
    await page.keyboard.type("Added description via keyboard");

    // Save with keyboard
    await page.keyboard.press("Tab"); // Continue tabbing to save button
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter"); // Save

    await expect(editModal).not.toBeVisible();
    await expect(page.getByText("Updated via keyboard")).toBeVisible();
  });

  test("should handle offline scenarios gracefully", async ({ page }) => {
    const taskTitle = "Offline test task";

    // Go offline
    await page.context().setOffline(true);

    // Try to create a task while offline
    await page.goto("/capture");
    const captureInput = page.getByPlaceholder("What's on your mind?");
    await captureInput.fill(taskTitle);
    await captureInput.press("Enter");

    // Should show offline indicator or appropriate feedback
    await expect(
      page.getByText(/offline|network|connection/i)
    ).toBeVisible({
      timeout: 5000,
    });

    // Go back online
    await page.context().setOffline(false);

    // Task should sync when back online
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Task captured successfully!")).toBeVisible({
      timeout: 10000,
    });
  });

  test("should handle rapid task operations without conflicts", async ({
    page,
  }) => {
    // Rapidly create multiple tasks
    await page.goto("/capture");
    const captureInput = page.getByPlaceholder("What's on your mind?");

    const taskTitles = [
      "Rapid task 1",
      "Rapid task 2",
      "Rapid task 3",
      "Rapid task 4",
      "Rapid task 5",
    ];

    for (let i = 0; i < taskTitles.length; i++) {
      await captureInput.fill(taskTitles[i]);
      await captureInput.press("Enter");

      // Wait for success before continuing
      await expect(page.getByText("Task captured successfully!")).toBeVisible();
      await page.waitForTimeout(100); // Brief pause to ensure state clears
    }

    // Verify all tasks were created
    await page.goto("/organize");

    for (const title of taskTitles) {
      await expect(page.getByText(title)).toBeVisible();
    }

    // Rapidly update tasks
    const taskCards = page.locator('[data-testid="task-card"]');
    const taskCount = await taskCards.count();
    expect(taskCount).toBeGreaterThanOrEqual(taskTitles.length);
  });

  test("should maintain data consistency across page refreshes", async ({
    page,
  }) => {
    const taskTitle = "Persistence test task";

    // Create task
    await page.goto("/capture");
    const captureInput = page.getByPlaceholder("What's on your mind?");
    await captureInput.fill(taskTitle);
    await captureInput.press("Enter");

    await expect(page.getByText("Task captured successfully!")).toBeVisible();

    // Navigate to organize and verify task exists
    await page.goto("/organize");
    await expect(page.getByText(taskTitle)).toBeVisible();

    // Refresh page
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Verify task still exists after refresh
    await expect(page.getByText(taskTitle)).toBeVisible();

    // Edit task
    const taskCard = page.locator('[data-testid="task-card"]').filter({
      hasText: taskTitle,
    });
    await taskCard.hover();
    await taskCard.getByRole("button", { name: /more/i }).click();
    await page.getByText("Edit Task").click();

    const editModal = page.getByRole("dialog", { name: /edit task/i });
    const descriptionInput = editModal.getByLabel(/description/i);
    await descriptionInput.fill("Added after refresh");
    await editModal.getByRole("button", { name: /save/i }).click();

    // Refresh again and verify changes persist
    await page.reload();
    await page.waitForLoadState("networkidle");

    await taskCard.click(); // View task details
    await expect(page.getByText("Added after refresh")).toBeVisible();
  });

  test("should provide appropriate loading states during operations", async ({
    page,
  }) => {
    const taskTitle = "Loading state test task";

    // Create task and observe loading states
    await page.goto("/capture");
    const captureInput = page.getByPlaceholder("What's on your mind?");
    await captureInput.fill(taskTitle);

    const addButton = page.getByRole("button", { name: /add task/i });
    await addButton.click();

    // Should show loading state on button
    await expect(addButton.locator(".animate-spin")).toBeVisible();
    await expect(addButton).toBeDisabled();

    // Wait for completion
    await expect(page.getByText("Task captured successfully!")).toBeVisible();
    await expect(addButton).not.toBeDisabled();

    // Test loading state during task operations
    await page.goto("/organize");
    const taskCard = page.locator('[data-testid="task-card"]').filter({
      hasText: taskTitle,
    });

    // Complete task and observe loading
    const completeButton = taskCard.getByRole("button", { name: /complete/i });
    await completeButton.click();

    // Should show loading state
    await expect(completeButton.locator(".animate-spin")).toBeVisible();
    await expect(completeButton).toBeDisabled();

    // Wait for completion
    await expect(taskCard.getByText(taskTitle)).toHaveClass(/line-through/);
  });
});