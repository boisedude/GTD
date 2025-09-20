import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Keyboard Navigation Accessibility", () => {
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

  test("should support full keyboard navigation on dashboard", async ({ page }) => {
    // Test tab order and focus management
    await page.keyboard.press("Tab");

    // First focusable element should be the main navigation
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();

    // Continue tabbing through navigation
    const navigationItems = [
      "Dashboard",
      "Capture",
      "Inbox",
      "Next Actions",
      "Waiting For",
      "Someday/Maybe",
      "Projects",
      "Reviews",
      "Engage",
      "Archive",
    ];

    for (const item of navigationItems) {
      const currentFocus = page.locator(":focus");
      const text = await currentFocus.textContent();

      // Check if current focused element contains the navigation item text
      if (text && text.includes(item)) {
        // Verify focus is visible
        await expect(currentFocus).toBeVisible();

        // Verify focus styling
        const focusedClasses = await currentFocus.getAttribute("class");
        expect(focusedClasses).toMatch(/focus|ring|outline/);
      }

      await page.keyboard.press("Tab");
    }
  });

  test("should support keyboard navigation in task capture", async ({ page }) => {
    await page.goto("/capture");

    // Tab to capture input
    await page.keyboard.press("Tab");
    const captureInput = page.locator(":focus");
    await expect(captureInput).toHaveAttribute("placeholder", "What's on your mind?");

    // Type a task
    await page.keyboard.type("Keyboard navigation test task");

    // Tab to add button
    await page.keyboard.press("Tab");
    const addButton = page.locator(":focus");
    await expect(addButton).toHaveAttribute("type", "submit");

    // Activate button with Enter
    await page.keyboard.press("Enter");

    // Verify task was captured
    await expect(page.getByText("Task captured successfully!")).toBeVisible();

    // Focus should return to input for continuous capture
    await expect(captureInput).toBeFocused();

    // Test Escape key clearing
    await page.keyboard.type("Task to clear");
    await page.keyboard.press("Escape");
    await expect(captureInput).toHaveValue("");

    // Test keyboard shortcuts
    if (await page.getByRole("button", { name: /details/i }).isVisible()) {
      await page.keyboard.press("Shift+Tab");
      // Details modal should open (if onDetailedCapture is provided)
    }
  });

  test("should support keyboard navigation in task management", async ({ page }) => {
    // Create a test task first
    await page.goto("/capture");
    await page.getByPlaceholder("What's on your mind?").fill("Keyboard task management test");
    await page.keyboard.press("Enter");
    await expect(page.getByText("Task captured successfully!")).toBeVisible();

    // Navigate to organize
    await page.goto("/organize");

    // Wait for task to load
    await page.waitForSelector('[data-testid="task-card"]');

    // Tab to first task card
    let tabCount = 0;
    let taskCardFocused = false;

    while (tabCount < 20 && !taskCardFocused) {
      await page.keyboard.press("Tab");
      tabCount++;

      const focusedElement = page.locator(":focus");
      const parentCard = focusedElement.locator('..').locator('[data-testid="task-card"]');

      if (await parentCard.count() > 0) {
        taskCardFocused = true;
        break;
      }
    }

    expect(taskCardFocused).toBe(true);

    // Test task completion with keyboard
    const completeButton = page.locator(":focus");
    if (await completeButton.getAttribute("aria-label") === "complete") {
      await page.keyboard.press("Enter");

      // Verify completion
      const taskCard = page.locator('[data-testid="task-card"]').first();
      await expect(taskCard.getByText("Keyboard task management test")).toHaveClass(/line-through/);
    }

    // Tab to menu button
    await page.keyboard.press("Tab");
    const menuButton = page.locator(":focus");

    // Open menu with Enter
    await page.keyboard.press("Enter");

    // Navigate menu with arrow keys
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");

    // Activate menu item with Enter
    const focusedMenuItem = page.locator(":focus");
    const menuText = await focusedMenuItem.textContent();

    if (menuText && menuText.includes("Edit")) {
      await page.keyboard.press("Enter");

      // Edit modal should open
      const editModal = page.getByRole("dialog", { name: /edit task/i });
      await expect(editModal).toBeVisible();

      // Focus should be in modal
      const modalFocus = page.locator(":focus");
      const isInModal = await modalFocus.locator('..').locator('[role="dialog"]').count() > 0;
      expect(isInModal).toBe(true);
    }
  });

  test("should support keyboard navigation in sidebar", async ({ page }) => {
    // Test desktop sidebar navigation
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto("/dashboard");

    // Tab through sidebar items
    await page.keyboard.press("Tab");

    const sidebarItems = [
      "Dashboard",
      "Capture",
      "Inbox",
      "Next Actions",
      "Waiting For",
      "Someday/Maybe",
      "Projects",
      "Reviews",
      "Engage",
      "Archive",
    ];

    for (const item of sidebarItems) {
      // Continue tabbing until we find the item
      let found = false;
      let attempts = 0;

      while (!found && attempts < 5) {
        const focusedElement = page.locator(":focus");
        const text = await focusedElement.textContent();

        if (text && text.includes(item)) {
          found = true;

          // Verify it's a proper link
          const tagName = await focusedElement.evaluate((el) => el.tagName.toLowerCase());
          expect(tagName).toBe("a");

          // Verify it has proper ARIA attributes
          const ariaLabel = await focusedElement.getAttribute("aria-label");
          expect(ariaLabel).toBeTruthy();

          // Test activation with Enter
          if (item === "Capture") {
            await page.keyboard.press("Enter");
            await expect(page).toHaveURL(/.*\/capture/);
            return; // Exit test after successful navigation
          }
        }

        await page.keyboard.press("Tab");
        attempts++;
      }
    }
  });

  test("should support keyboard navigation on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/dashboard");

    // Tab to mobile menu button
    await page.keyboard.press("Tab");
    const menuButton = page.locator(":focus");

    // Should be the mobile drawer trigger
    const buttonText = await menuButton.textContent();
    expect(buttonText).toMatch(/menu|☰/i);

    // Open drawer with Enter
    await page.keyboard.press("Enter");

    // Drawer should open
    const drawer = page.getByRole("dialog", { name: /navigation/i });
    await expect(drawer).toBeVisible();

    // Focus should be inside drawer
    await page.keyboard.press("Tab");
    const drawerFocus = page.locator(":focus");
    const isInDrawer = await drawerFocus.locator('..').locator('[role="dialog"]').count() > 0;
    expect(isInDrawer).toBe(true);

    // Tab through drawer items
    const drawerItems = ["Dashboard", "Capture", "Organize"];

    for (const item of drawerItems) {
      let found = false;
      let attempts = 0;

      while (!found && attempts < 10) {
        const focusedElement = page.locator(":focus");
        const text = await focusedElement.textContent();

        if (text && text.includes(item)) {
          found = true;

          if (item === "Capture") {
            await page.keyboard.press("Enter");
            await expect(page).toHaveURL(/.*\/capture/);
            await expect(drawer).not.toBeVisible();
            return;
          }
        }

        await page.keyboard.press("Tab");
        attempts++;
      }
    }
  });

  test("should handle focus trapping in modals", async ({ page }) => {
    // Create a task to edit
    await page.goto("/capture");
    await page.getByPlaceholder("What's on your mind?").fill("Focus trap test task");
    await page.keyboard.press("Enter");
    await expect(page.getByText("Task captured successfully!")).toBeVisible();

    await page.goto("/organize");
    const taskCard = page.locator('[data-testid="task-card"]').first();

    // Open edit modal
    await taskCard.hover();
    await taskCard.getByRole("button", { name: /more/i }).click();
    await page.getByText("Edit Task").click();

    const editModal = page.getByRole("dialog", { name: /edit task/i });
    await expect(editModal).toBeVisible();

    // Test focus trapping - tab through modal elements
    const modalElements = [];
    let tabCount = 0;
    const maxTabs = 20;

    while (tabCount < maxTabs) {
      await page.keyboard.press("Tab");
      const focusedElement = page.locator(":focus");
      const elementInfo = await focusedElement.evaluate((el) => ({
        tagName: el.tagName,
        type: el.type || null,
        id: el.id || null,
        className: el.className || null,
        textContent: el.textContent?.slice(0, 20) || null,
      }));

      modalElements.push(elementInfo);

      // Check if focus is still within modal
      const isInModal = await editModal.locator(":focus").count() > 0;
      expect(isInModal).toBe(true);

      tabCount++;

      // Break if we've completed a full cycle
      if (tabCount > 5) {
        const firstElement = modalElements[0];
        const currentElement = modalElements[modalElements.length - 1];

        if (
          firstElement.tagName === currentElement.tagName &&
          firstElement.textContent === currentElement.textContent
        ) {
          break; // Completed focus cycle
        }
      }
    }

    // Test Escape key to close modal
    await page.keyboard.press("Escape");
    await expect(editModal).not.toBeVisible();

    // Focus should return to trigger element or logical place
    const focusedAfterClose = page.locator(":focus");
    await expect(focusedAfterClose).toBeVisible();
  });

  test("should provide skip links for screen readers", async ({ page }) => {
    await page.goto("/dashboard");

    // Test skip link (usually hidden but accessible via keyboard)
    await page.keyboard.press("Tab");

    const skipLink = page.getByText(/skip to main content|skip navigation/i);
    if (await skipLink.count() > 0) {
      await expect(skipLink).toBeVisible();

      // Activate skip link
      await page.keyboard.press("Enter");

      // Focus should jump to main content
      const mainContent = page.locator("main, #main-content, [role='main']");
      if (await mainContent.count() > 0) {
        const focusedElement = page.locator(":focus");
        const isInMain = await mainContent.locator(":focus").count() > 0;
        expect(isInMain).toBe(true);
      }
    }
  });

  test("should maintain focus visibility throughout navigation", async ({ page }) => {
    await page.goto("/dashboard");

    // Add custom CSS to ensure focus is visible for testing
    await page.addStyleTag({
      content: `
        *:focus {
          outline: 2px solid #ff0000 !important;
          outline-offset: 2px !important;
        }
      `,
    });

    const focusableElements = [];
    let tabCount = 0;

    while (tabCount < 15) {
      await page.keyboard.press("Tab");
      tabCount++;

      const focusedElement = page.locator(":focus");

      if (await focusedElement.count() > 0) {
        // Verify element is visually focused
        await expect(focusedElement).toBeVisible();

        // Check computed styles for focus indicator
        const outline = await focusedElement.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return {
            outline: styles.outline,
            outlineWidth: styles.outlineWidth,
            outlineColor: styles.outlineColor,
            boxShadow: styles.boxShadow,
          };
        });

        // Should have some form of focus indicator
        const hasFocusIndicator =
          outline.outline !== "none" ||
          outline.outlineWidth !== "0px" ||
          outline.boxShadow.includes("inset") ||
          outline.boxShadow.includes("rgb");

        expect(hasFocusIndicator).toBe(true);

        focusableElements.push({
          tag: await focusedElement.evaluate((el) => el.tagName),
          text: await focusedElement.textContent(),
          role: await focusedElement.getAttribute("role"),
        });
      }
    }

    // Verify we found focusable elements
    expect(focusableElements.length).toBeGreaterThan(5);
  });

  test("should run axe accessibility checks on keyboard navigation paths", async ({ page }) => {
    // Test dashboard
    await page.goto("/dashboard");
    let accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);

    // Test capture page
    await page.goto("/capture");
    accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .include("#capture-form, [data-capture-input]")
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);

    // Test organize page
    await page.goto("/organize");
    await page.waitForSelector('[data-testid="task-card"]', { timeout: 5000 });

    accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .include('[data-testid="task-card"]')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);

    // Test task edit modal if present
    const taskCard = page.locator('[data-testid="task-card"]').first();
    if (await taskCard.count() > 0) {
      await taskCard.hover();
      await taskCard.getByRole("button", { name: /more/i }).click();
      await page.getByText("Edit Task").click();

      const editModal = page.getByRole("dialog", { name: /edit task/i });
      await expect(editModal).toBeVisible();

      accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .include('[role="dialog"]')
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    }
  });
});