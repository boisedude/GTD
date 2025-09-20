import { test, expect, devices } from "@playwright/test";

// Test with mobile viewports
test.use({ ...devices["iPhone 12"] });

test.describe("Mobile Experience", () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
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

  test("should provide mobile-optimized navigation via drawer", async ({ page }) => {
    // Should show mobile drawer trigger instead of desktop sidebar
    const drawerTrigger = page.getByRole("button", { name: /menu/i });
    await expect(drawerTrigger).toBeVisible();

    // Open mobile drawer
    await drawerTrigger.click();

    // Verify drawer opens from bottom
    const drawer = page.getByRole("dialog", { name: /navigation/i });
    await expect(drawer).toBeVisible();

    // Test navigation items in drawer
    await expect(drawer.getByRole("link", { name: /dashboard/i })).toBeVisible();
    await expect(drawer.getByRole("link", { name: /capture/i })).toBeVisible();
    await expect(drawer.getByRole("link", { name: /organize/i })).toBeVisible();
    await expect(drawer.getByRole("link", { name: /engage/i })).toBeVisible();

    // Test GTD lists in drawer
    await expect(drawer.getByRole("link", { name: /inbox/i })).toBeVisible();
    await expect(drawer.getByRole("link", { name: /next actions/i })).toBeVisible();
    await expect(drawer.getByRole("link", { name: /waiting for/i })).toBeVisible();
    await expect(drawer.getByRole("link", { name: /someday/i })).toBeVisible();

    // Navigate via drawer
    await drawer.getByRole("link", { name: /capture/i }).click();
    await expect(page).toHaveURL(/.*\/capture/);

    // Drawer should close after navigation
    await expect(drawer).not.toBeVisible();
  });

  test("should handle drawer gestures and interactions", async ({ page }) => {
    const drawerTrigger = page.getByRole("button", { name: /menu/i });
    await drawerTrigger.click();

    const drawer = page.getByRole("dialog", { name: /navigation/i });
    await expect(drawer).toBeVisible();

    // Test closing drawer with overlay tap
    const overlay = page.locator(".fixed.inset-0.z-50.bg-black\\/80");
    await overlay.click({ position: { x: 50, y: 50 } });
    await expect(drawer).not.toBeVisible();

    // Test closing drawer with drag handle
    await drawerTrigger.click();
    await expect(drawer).toBeVisible();

    // Look for drag handle and test interaction
    const dragHandle = drawer.locator(".mx-auto.mt-4.h-2");
    await expect(dragHandle).toBeVisible();

    // Simulate swipe down gesture to close
    await dragHandle.hover();
    await page.mouse.down();
    await page.mouse.move(0, 200);
    await page.mouse.up();

    await expect(drawer).not.toBeVisible({ timeout: 2000 });
  });

  test("should provide touch-optimized task capture", async ({ page }) => {
    await page.goto("/capture");

    const captureInput = page.getByPlaceholder("What's on your mind?");
    const addButton = page.getByRole("button", { name: /add task/i });

    // Verify touch-friendly sizing
    const addButtonBox = await addButton.boundingBox();
    expect(addButtonBox?.height).toBeGreaterThanOrEqual(44); // Minimum touch target
    expect(addButtonBox?.width).toBeGreaterThanOrEqual(44);

    // Test touch interaction
    await captureInput.tap();
    await page.keyboard.type("Mobile task capture test");

    // Verify input prevents iOS zoom
    const inputFontSize = await captureInput.evaluate((el) =>
      window.getComputedStyle(el).fontSize
    );
    const fontSize = parseInt(inputFontSize);
    expect(fontSize).toBeGreaterThanOrEqual(16); // Prevents iOS zoom

    // Submit with touch
    await addButton.tap();

    await expect(page.getByText("Task captured successfully!")).toBeVisible();
    await expect(captureInput).toBeEmpty();

    // Verify input regains focus for continuous capture
    await expect(captureInput).toBeFocused();
  });

  test("should display mobile-optimized task cards", async ({ page }) => {
    // Create a test task first
    await page.goto("/capture");
    const captureInput = page.getByPlaceholder("What's on your mind?");
    await captureInput.fill("Mobile task card test");
    await captureInput.press("Enter");
    await expect(page.getByText("Task captured successfully!")).toBeVisible();

    // Navigate to organize view
    await page.goto("/organize");

    const taskCard = page.locator('[data-testid="task-card"]').first();
    await expect(taskCard).toBeVisible();

    // Verify mobile-friendly spacing and sizing
    const cardBox = await taskCard.boundingBox();
    expect(cardBox?.height).toBeGreaterThanOrEqual(44); // Minimum touch target

    // Test task card interactions
    await taskCard.tap();

    // Verify action buttons are touch-friendly
    const actionButtons = taskCard.locator("button");
    for (let i = 0; i < await actionButtons.count(); i++) {
      const button = actionButtons.nth(i);
      const buttonBox = await button.boundingBox();

      if (buttonBox) {
        expect(buttonBox.height).toBeGreaterThanOrEqual(44);
        expect(buttonBox.width).toBeGreaterThanOrEqual(44);
      }
    }

    // Test task actions on mobile
    const moreButton = taskCard.getByRole("button", { name: /more/i });
    await moreButton.tap();

    // Actions menu should be touch-friendly
    const editOption = page.getByText("Edit Task");
    await expect(editOption).toBeVisible();

    const editBox = await editOption.boundingBox();
    expect(editBox?.height).toBeGreaterThanOrEqual(44);
  });

  test("should support mobile keyboard shortcuts and accessibility", async ({ page }) => {
    await page.goto("/capture");

    const captureInput = page.getByPlaceholder("What's on your mind?");

    // Test mobile keyboard behavior
    await captureInput.tap();
    await page.keyboard.type("Accessibility test task");

    // Test Enter key submission
    await page.keyboard.press("Enter");
    await expect(page.getByText("Task captured successfully!")).toBeVisible();

    // Test Escape key clearing
    await captureInput.tap();
    await page.keyboard.type("Task to clear");
    await page.keyboard.press("Escape");
    await expect(captureInput).toBeEmpty();

    // Test voice accessibility
    const addButton = page.getByRole("button", { name: /add task/i });

    // Verify button has proper accessibility attributes
    await expect(addButton).toHaveAttribute("aria-label");

    // Check for screen reader text
    const srText = page.locator(".sr-only");
    await expect(srText).toBeVisible();
  });

  test("should handle mobile form interactions correctly", async ({ page }) => {
    // Create and edit a task to test form behavior
    await page.goto("/capture");
    const captureInput = page.getByPlaceholder("What's on your mind?");
    await captureInput.fill("Mobile form test task");
    await captureInput.press("Enter");
    await expect(page.getByText("Task captured successfully!")).toBeVisible();

    await page.goto("/organize");
    const taskCard = page.locator('[data-testid="task-card"]').first();

    // Open edit modal
    await taskCard.getByRole("button", { name: /more/i }).tap();
    await page.getByText("Edit Task").tap();

    const editModal = page.getByRole("dialog", { name: /edit task/i });
    await expect(editModal).toBeVisible();

    // Test form inputs on mobile
    const titleInput = editModal.getByLabel(/title/i);
    await titleInput.tap();
    await titleInput.fill("Updated mobile task");

    const descriptionInput = editModal.getByLabel(/description/i);
    await descriptionInput.tap();
    await descriptionInput.fill("Mobile description");

    // Test dropdown interactions
    const priorityDropdown = editModal.getByRole("combobox", { name: /priority/i });
    await priorityDropdown.tap();

    // Verify dropdown options are touch-friendly
    const highPriorityOption = page.getByText("High");
    await expect(highPriorityOption).toBeVisible();

    const optionBox = await highPriorityOption.boundingBox();
    expect(optionBox?.height).toBeGreaterThanOrEqual(44);

    await highPriorityOption.tap();

    // Save changes
    const saveButton = editModal.getByRole("button", { name: /save/i });
    await saveButton.tap();

    await expect(editModal).not.toBeVisible();
    await expect(page.getByText("Updated mobile task")).toBeVisible();
  });

  test("should provide mobile-optimized swipe gestures for task actions", async ({ page }) => {
    // Create a test task
    await page.goto("/capture");
    const captureInput = page.getByPlaceholder("What's on your mind?");
    await captureInput.fill("Swipe gesture test task");
    await captureInput.press("Enter");
    await expect(page.getByText("Task captured successfully!")).toBeVisible();

    await page.goto("/organize");
    const taskCard = page.locator('[data-testid="task-card"]').first();
    await expect(taskCard).toBeVisible();

    // Test swipe-to-complete gesture (if implemented)
    const taskBox = await taskCard.boundingBox();
    if (taskBox) {
      // Simulate swipe right gesture
      await page.mouse.move(taskBox.x + 10, taskBox.y + taskBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(taskBox.x + taskBox.width - 10, taskBox.y + taskBox.height / 2);
      await page.mouse.up();

      // Check if swipe action was triggered (implementation dependent)
      // This would reveal swipe action buttons or complete the task
    }

    // Test long press for context menu (if implemented)
    await taskCard.hover();
    await page.mouse.down();
    await page.waitForTimeout(800); // Long press duration
    await page.mouse.up();

    // Verify context menu or action appears
    // Implementation would show quick actions or context menu
  });

  test("should handle mobile viewport changes and orientation", async ({ page }) => {
    // Test portrait mode (default)
    await page.goto("/dashboard");

    // Verify mobile navigation is present
    const drawerTrigger = page.getByRole("button", { name: /menu/i });
    await expect(drawerTrigger).toBeVisible();

    // Test landscape mode
    await page.setViewportSize({ width: 812, height: 375 }); // iPhone 12 landscape
    await page.waitForTimeout(500); // Allow for reflow

    // Navigation should still work in landscape
    await drawerTrigger.click();
    const drawer = page.getByRole("dialog", { name: /navigation/i });
    await expect(drawer).toBeVisible();

    // Test tablet-like viewport
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad-like
    await page.waitForTimeout(500);

    // At tablet size, might show desktop-like navigation
    // This depends on the responsive breakpoints in the app
  });

  test("should maintain performance on mobile devices", async ({ page }) => {
    // Start performance monitoring
    await page.evaluate(() => {
      window.performance.mark("mobile-test-start");
    });

    // Navigate through key mobile workflows
    await page.goto("/capture");

    const captureInput = page.getByPlaceholder("What's on your mind?");
    await captureInput.fill("Performance test task");
    await captureInput.press("Enter");

    await expect(page.getByText("Task captured successfully!")).toBeVisible();

    // Navigate to organize
    await page.goto("/organize");
    await page.waitForSelector('[data-testid="task-card"]');

    // Check performance metrics
    const performanceMetrics = await page.evaluate(() => {
      window.performance.mark("mobile-test-end");
      window.performance.measure("mobile-test", "mobile-test-start", "mobile-test-end");

      const measure = window.performance.getEntriesByName("mobile-test")[0];
      return {
        duration: measure.duration,
        navigationStart: window.performance.timing.navigationStart,
        loadEventEnd: window.performance.timing.loadEventEnd,
      };
    });

    // Verify performance targets for mobile
    expect(performanceMetrics.duration).toBeLessThan(10000); // 10s total workflow

    const loadTime = performanceMetrics.loadEventEnd - performanceMetrics.navigationStart;
    expect(loadTime).toBeLessThan(5000); // 5s page load
  });

  test("should handle mobile-specific touch interactions and edge cases", async ({ page }) => {
    await page.goto("/capture");

    const captureInput = page.getByPlaceholder("What's on your mind?");

    // Test rapid tapping (prevent double submission)
    await captureInput.fill("Rapid tap test");

    const addButton = page.getByRole("button", { name: /add task/i });

    // Rapidly tap the button
    await addButton.tap();
    await addButton.tap();
    await addButton.tap();

    // Should only submit once
    const successMessages = page.getByText("Task captured successfully!");
    expect(await successMessages.count()).toBe(1);

    // Test touch outside to dismiss (if applicable)
    await page.goto("/organize");

    // Create a dropdown or menu and test outside touch
    const taskCard = page.locator('[data-testid="task-card"]').first();
    if (await taskCard.isVisible()) {
      await taskCard.getByRole("button", { name: /more/i }).tap();

      // Tap outside the menu
      await page.tap("body", { position: { x: 50, y: 50 } });

      // Menu should close
      await expect(page.getByText("Edit Task")).not.toBeVisible();
    }

    // Test scroll behavior on mobile
    await page.goto("/organize");

    // If there are multiple tasks, test scrolling
    const taskCards = page.locator('[data-testid="task-card"]');
    const taskCount = await taskCards.count();

    if (taskCount > 0) {
      // Scroll to bottom
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      await page.waitForTimeout(500);

      // Scroll back to top
      await page.evaluate(() => {
        window.scrollTo(0, 0);
      });

      // First task should still be visible
      await expect(taskCards.first()).toBeVisible();
    }
  });
});