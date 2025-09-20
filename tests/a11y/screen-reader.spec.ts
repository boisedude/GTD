import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Screen Reader Accessibility", () => {
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

  test("should have proper landmark structure for screen readers", async ({ page }) => {
    // Check for semantic HTML landmarks
    await expect(page.locator("main, [role='main']")).toBeVisible();
    await expect(page.locator("nav, [role='navigation']")).toBeVisible();

    // Verify landmark labels
    const navigation = page.locator("[role='navigation'], nav").first();
    const navLabel = await navigation.getAttribute("aria-label");
    expect(navLabel).toBeTruthy();
    expect(navLabel).toMatch(/navigation|menu/i);

    // Check for page structure
    const headings = page.locator("h1, h2, h3, h4, h5, h6");
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);

    // Verify proper heading hierarchy
    const h1 = page.locator("h1");
    if (await h1.count() > 0) {
      await expect(h1.first()).toBeVisible();
    }
  });

  test("should provide proper ARIA labels and descriptions", async ({ page }) => {
    // Test navigation ARIA labels
    const sidebarLinks = page.locator("[role='navigation'] a, nav a");
    const linkCount = await sidebarLinks.count();

    for (let i = 0; i < Math.min(linkCount, 10); i++) {
      const link = sidebarLinks.nth(i);
      const ariaLabel = await link.getAttribute("aria-label");
      const textContent = await link.textContent();

      // Should have either aria-label or meaningful text content
      expect(ariaLabel || textContent).toBeTruthy();

      // If it's a current page, should have aria-current
      const ariaCurrent = await link.getAttribute("aria-current");
      if (ariaCurrent) {
        expect(ariaCurrent).toBe("page");
      }
    }

    // Test button ARIA labels
    const buttons = page.locator("button");
    const buttonCount = await buttons.count();

    for (let i = 0; i < Math.min(buttonCount, 20); i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute("aria-label");
      const textContent = await button.textContent();
      const ariaLabelledBy = await button.getAttribute("aria-labelledby");

      // Should have some form of accessible name
      const hasAccessibleName = ariaLabel || textContent?.trim() || ariaLabelledBy;
      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test("should announce task capture success to screen readers", async ({ page }) => {
    await page.goto("/capture");

    // Check for live region for announcements
    const captureInput = page.getByPlaceholder("What's on your mind?");
    await captureInput.fill("Screen reader test task");
    await captureInput.press("Enter");

    // Wait for success message
    await expect(page.getByText("Task captured successfully!")).toBeVisible();

    // Check if success message is in a live region or alert
    const successMessage = page.getByText("Task captured successfully!");
    const ariaLive = await successMessage.getAttribute("aria-live");
    const role = await successMessage.getAttribute("role");

    // Should be announced to screen readers
    expect(ariaLive === "polite" || ariaLive === "assertive" || role === "alert").toBe(true);
  });

  test("should provide meaningful descriptions for task cards", async ({ page }) => {
    // Create a test task with rich metadata
    await page.goto("/capture");
    await page.getByPlaceholder("What's on your mind?").fill("Screen reader task test");
    await page.keyboard.press("Enter");
    await expect(page.getByText("Task captured successfully!")).toBeVisible();

    await page.goto("/organize");
    await page.waitForSelector('[data-testid="task-card"]');

    const taskCard = page.locator('[data-testid="task-card"]').first();

    // Test task title accessibility
    const taskTitle = taskCard.locator("h3, [role='heading']").first();
    await expect(taskTitle).toBeVisible();

    const titleText = await taskTitle.textContent();
    expect(titleText).toBeTruthy();

    // Test task metadata accessibility
    const contextInfo = taskCard.locator("[data-context], .context");
    if (await contextInfo.count() > 0) {
      const contextText = await contextInfo.textContent();
      expect(contextText).toMatch(/@\w+/); // Should indicate context like @office
    }

    // Test action buttons accessibility
    const completeButton = taskCard.getByRole("button", { name: /complete/i });
    if (await completeButton.count() > 0) {
      const buttonLabel = await completeButton.getAttribute("aria-label");
      expect(buttonLabel).toBeTruthy();
    }

    const moreButton = taskCard.getByRole("button", { name: /more/i });
    if (await moreButton.count() > 0) {
      const buttonLabel = await moreButton.getAttribute("aria-label");
      expect(buttonLabel).toBeTruthy();
    }
  });

  test("should provide proper form accessibility", async ({ page }) => {
    // Test capture form
    await page.goto("/capture");

    const captureInput = page.getByPlaceholder("What's on your mind?");

    // Check for proper labeling
    const inputLabel = await captureInput.getAttribute("aria-label");
    const placeholder = await captureInput.getAttribute("placeholder");
    expect(inputLabel || placeholder).toBeTruthy();

    // Check for form structure
    const form = page.locator("form");
    if (await form.count() > 0) {
      const formRole = await form.getAttribute("role");
      expect(formRole === "form" || form.first()).toBeTruthy();
    }

    // Test form submission feedback
    await captureInput.fill("Form accessibility test");
    await captureInput.press("Enter");

    // Should provide feedback
    await expect(page.getByText("Task captured successfully!")).toBeVisible();

    // Test task edit form
    await page.goto("/organize");

    const taskCard = page.locator('[data-testid="task-card"]').first();
    if (await taskCard.count() > 0) {
      await taskCard.hover();
      await taskCard.getByRole("button", { name: /more/i }).click();
      await page.getByText("Edit Task").click();

      const editModal = page.getByRole("dialog", { name: /edit task/i });
      await expect(editModal).toBeVisible();

      // Check form fields in modal
      const titleInput = editModal.getByLabel(/title/i);
      await expect(titleInput).toBeVisible();

      const titleLabel = await titleInput.getAttribute("aria-label");
      const titleLabelledBy = await titleInput.getAttribute("aria-labelledby");
      expect(titleLabel || titleLabelledBy).toBeTruthy();

      // Check other form elements
      const descriptionInput = editModal.getByLabel(/description/i);
      if (await descriptionInput.count() > 0) {
        const descLabel = await descriptionInput.getAttribute("aria-label");
        const descLabelledBy = await descriptionInput.getAttribute("aria-labelledby");
        expect(descLabel || descLabelledBy).toBeTruthy();
      }
    }
  });

  test("should provide proper modal and dialog accessibility", async ({ page }) => {
    // Create a task to trigger modals
    await page.goto("/capture");
    await page.getByPlaceholder("What's on your mind?").fill("Modal accessibility test");
    await page.keyboard.press("Enter");
    await expect(page.getByText("Task captured successfully!")).toBeVisible();

    await page.goto("/organize");
    const taskCard = page.locator('[data-testid="task-card"]').first();

    // Test edit modal
    await taskCard.hover();
    await taskCard.getByRole("button", { name: /more/i }).click();
    await page.getByText("Edit Task").click();

    const editModal = page.getByRole("dialog", { name: /edit task/i });
    await expect(editModal).toBeVisible();

    // Check modal ARIA attributes
    const modalRole = await editModal.getAttribute("role");
    expect(modalRole).toBe("dialog");

    const ariaModal = await editModal.getAttribute("aria-modal");
    expect(ariaModal).toBe("true");

    const ariaLabelledBy = await editModal.getAttribute("aria-labelledby");
    const ariaLabel = await editModal.getAttribute("aria-label");
    expect(ariaLabelledBy || ariaLabel).toBeTruthy();

    // Check modal title
    const modalTitle = editModal.locator("h1, h2, h3, [role='heading']").first();
    if (await modalTitle.count() > 0) {
      await expect(modalTitle).toBeVisible();
    }

    // Close modal and test delete confirmation
    await page.keyboard.press("Escape");
    await expect(editModal).not.toBeVisible();

    // Test delete confirmation dialog
    await taskCard.hover();
    await taskCard.getByRole("button", { name: /more/i }).click();
    await page.getByText("Delete").click();

    const deleteDialog = page.getByRole("dialog", { name: /delete/i });
    await expect(deleteDialog).toBeVisible();

    // Check alert dialog attributes
    const deleteRole = await deleteDialog.getAttribute("role");
    expect(deleteRole).toMatch(/dialog|alertdialog/);

    // Should have proper labeling
    const deleteLabel = await deleteDialog.getAttribute("aria-label");
    const deleteLabelledBy = await deleteDialog.getAttribute("aria-labelledby");
    expect(deleteLabel || deleteLabelledBy).toBeTruthy();

    // Should have clear confirmation text
    const deleteText = await deleteDialog.textContent();
    expect(deleteText).toMatch(/delete|remove|confirm/i);
  });

  test("should provide proper status and state announcements", async ({ page }) => {
    // Test loading states
    await page.goto("/capture");

    const captureInput = page.getByPlaceholder("What's on your mind?");
    const addButton = page.getByRole("button", { name: /add task/i });

    await captureInput.fill("Loading state test");
    await addButton.click();

    // Check for loading state accessibility
    const loadingSpinner = page.locator(".animate-spin, [role='status']");
    if (await loadingSpinner.count() > 0) {
      const spinnerRole = await loadingSpinner.first().getAttribute("role");
      const ariaLabel = await loadingSpinner.first().getAttribute("aria-label");

      expect(spinnerRole === "status" || ariaLabel).toBeTruthy();

      // Should be hidden from screen readers if decorative
      const ariaHidden = await loadingSpinner.first().getAttribute("aria-hidden");
      if (ariaHidden === "true") {
        // If hidden, there should be text indication
        const loadingText = page.getByText(/loading|saving|processing/i);
        await expect(loadingText).toBeVisible();
      }
    }

    // Test task completion state
    await expect(page.getByText("Task captured successfully!")).toBeVisible();

    await page.goto("/organize");
    const taskCard = page.locator('[data-testid="task-card"]').first();

    const completeButton = taskCard.getByRole("button", { name: /complete/i });
    if (await completeButton.count() > 0) {
      await completeButton.click();

      // Check completed state announcement
      const completedTask = taskCard.locator(".line-through, [aria-label*='completed']");
      if (await completedTask.count() > 0) {
        const completedLabel = await completedTask.first().getAttribute("aria-label");
        const completedText = await completedTask.first().textContent();

        expect(completedLabel?.includes("completed") || completedText?.includes("completed")).toBe(true);
      }
    }
  });

  test("should provide proper navigation and breadcrumb accessibility", async ({ page }) => {
    // Test main navigation
    const mainNav = page.locator("[role='navigation'], nav").first();
    const navLabel = await mainNav.getAttribute("aria-label");
    expect(navLabel).toMatch(/main|primary|navigation/i);

    // Test breadcrumbs if present
    const breadcrumbs = page.locator("[aria-label*='breadcrumb'], .breadcrumb, nav[aria-label*='Breadcrumb']");
    if (await breadcrumbs.count() > 0) {
      const breadcrumbList = breadcrumbs.locator("ol, ul").first();
      if (await breadcrumbList.count() > 0) {
        await expect(breadcrumbList).toBeVisible();

        // Check individual breadcrumb items
        const breadcrumbItems = breadcrumbList.locator("li");
        const itemCount = await breadcrumbItems.count();

        for (let i = 0; i < itemCount; i++) {
          const item = breadcrumbItems.nth(i);
          const link = item.locator("a");

          if (await link.count() > 0) {
            const ariaCurrent = await link.getAttribute("aria-current");
            if (i === itemCount - 1) {
              // Last item should be current page
              expect(ariaCurrent).toBe("page");
            }
          }
        }
      }
    }

    // Test GTD list navigation
    const gtdLists = page.locator("[aria-label*='Inbox'], [aria-label*='Next Actions']");
    if (await gtdLists.count() > 0) {
      const firstList = gtdLists.first();
      const listLabel = await firstList.getAttribute("aria-label");
      expect(listLabel).toBeTruthy();

      // Should include count information
      expect(listLabel).toMatch(/\d+|empty|items/);
    }
  });

  test("should handle screen reader announcements for dynamic content", async ({ page }) => {
    await page.goto("/capture");

    // Test auto-save announcements
    const captureInput = page.getByPlaceholder("What's on your mind?");
    await captureInput.fill("Auto-save test");

    // Look for typing state indication
    const typingIndicator = page.getByText(/auto.saving|typing/i);
    if (await typingIndicator.count() > 0) {
      const liveRegion = typingIndicator.locator("..").first();
      const ariaLive = await liveRegion.getAttribute("aria-live");
      expect(ariaLive === "polite" || ariaLive === "assertive").toBe(true);
    }

    // Test task count updates
    await captureInput.press("Enter");
    await expect(page.getByText("Task captured successfully!")).toBeVisible();

    await page.goto("/organize");

    // Check if task counts are announced
    const taskCount = page.locator("[aria-label*='items'], .badge");
    if (await taskCount.count() > 0) {
      const countText = await taskCount.first().textContent();
      const countLabel = await taskCount.first().getAttribute("aria-label");

      expect(countText?.match(/\d+/) || countLabel?.match(/\d+/)).toBeTruthy();
    }
  });

  test("should provide comprehensive error message accessibility", async ({ page }) => {
    // Test form validation errors
    await page.goto("/capture");

    const captureInput = page.getByPlaceholder("What's on your mind?");
    const addButton = page.getByRole("button", { name: /add task/i });

    // Try to submit empty form
    await addButton.click();

    // Should provide error feedback
    const errorMessage = page.locator("[role='alert'], .error, [aria-live]");
    if (await errorMessage.count() > 0) {
      const errorRole = await errorMessage.first().getAttribute("role");
      const ariaLive = await errorMessage.first().getAttribute("aria-live");

      expect(errorRole === "alert" || ariaLive === "assertive").toBe(true);
    }

    // Test network error handling
    // Mock network failure
    await page.route("**/api/**", route => route.abort());

    await captureInput.fill("Network error test");
    await addButton.click();

    // Should announce error to screen readers
    const networkError = page.getByText(/error|failed|network/i);
    if (await networkError.count() > 0) {
      const errorParent = networkError.locator("..").first();
      const ariaLive = await errorParent.getAttribute("aria-live");
      const role = await errorParent.getAttribute("role");

      expect(ariaLive === "assertive" || role === "alert").toBe(true);
    }
  });

  test("should run comprehensive axe accessibility audit", async ({ page }) => {
    const pages = ["/dashboard", "/capture", "/organize"];

    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState("networkidle");

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .include("main, [role='main'], form, [role='dialog']")
        .exclude("[data-testid='loading']") // Exclude loading states
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);

      // Log any incomplete rules for manual review
      if (accessibilityScanResults.incomplete.length > 0) {
        console.log(`Incomplete accessibility checks for ${pagePath}:`,
          accessibilityScanResults.incomplete.map(item => item.id)
        );
      }
    }
  });
});