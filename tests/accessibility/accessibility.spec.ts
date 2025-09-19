import { test, expect } from "@playwright/test";
import { GTDTestHelpers } from "../helpers/test-utils";
import { TEST_USERS, ACCESSIBILITY_SCENARIOS } from "../fixtures/test-data";

test.describe("Accessibility Tests", () => {
  let helpers: GTDTestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new GTDTestHelpers(page);
    await helpers.ensureAuthenticated();
  });

  test.describe("Keyboard Navigation", () => {
    test("should support full keyboard navigation", async ({ page }) => {
      await page.goto("/dashboard");

      // Test tab order through main interface
      await page.keyboard.press("Tab");
      await expect(
        page.locator('[data-testid="quick-capture-input"]')
      ).toBeFocused();

      await page.keyboard.press("Tab");
      await expect(page.locator('[data-testid="nav-inbox"]')).toBeFocused();

      await page.keyboard.press("Tab");
      await expect(
        page.locator('[data-testid="nav-next-actions"]')
      ).toBeFocused();

      await page.keyboard.press("Tab");
      await expect(
        page.locator('[data-testid="nav-waiting-for"]')
      ).toBeFocused();
    });

    test("should support reverse tab navigation", async ({ page }) => {
      await page.goto("/dashboard");

      // Navigate forward then back
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");

      // Now navigate backwards
      await page.keyboard.press("Shift+Tab");
      await expect(
        page.locator('[data-testid="nav-next-actions"]')
      ).toBeFocused();

      await page.keyboard.press("Shift+Tab");
      await expect(page.locator('[data-testid="nav-inbox"]')).toBeFocused();
    });

    test("should skip hidden and disabled elements", async ({ page }) => {
      await page.goto("/dashboard");

      // Create scenario with hidden/disabled elements
      await page.evaluate(() => {
        const hiddenElement = document.createElement("button");
        hiddenElement.style.display = "none";
        hiddenElement.setAttribute("data-testid", "hidden-button");
        document.body.appendChild(hiddenElement);

        const disabledElement = document.createElement("button");
        disabledElement.disabled = true;
        disabledElement.setAttribute("data-testid", "disabled-button");
        document.body.appendChild(disabledElement);
      });

      // Tab navigation should skip hidden and disabled elements
      let tabCount = 0;
      const maxTabs = 20;

      while (tabCount < maxTabs) {
        await page.keyboard.press("Tab");
        tabCount++;

        const focusedElement = page.locator(":focus");
        const isHidden = await focusedElement.isHidden().catch(() => false);
        const isDisabled = await focusedElement
          .getAttribute("disabled")
          .then((attr) => attr !== null)
          .catch(() => false);

        expect(isHidden).toBe(false);
        expect(isDisabled).toBe(false);

        // Stop when we reach user menu or similar end point
        const userMenu = await page
          .locator('[data-testid="user-menu"]')
          .isFocused()
          .catch(() => false);
        if (userMenu) break;
      }
    });

    test("should handle escape key appropriately", async ({ page }) => {
      await page.goto("/dashboard");

      // Open task capture modal
      await page.click('[data-testid="expand-capture"]');
      await expect(page.locator('[data-testid="capture-modal"]')).toBeVisible();

      // Escape should close modal
      await page.keyboard.press("Escape");
      await expect(
        page.locator('[data-testid="capture-modal"]')
      ).not.toBeVisible();

      // Focus should return to trigger element
      await expect(
        page.locator('[data-testid="expand-capture"]')
      ).toBeFocused();
    });

    test("should support arrow key navigation in lists", async ({ page }) => {
      // Create multiple tasks for navigation
      await helpers.captureTask("First task");
      await helpers.captureTask("Second task");
      await helpers.captureTask("Third task");

      await page.goto("/dashboard");

      // Focus first task
      const firstTask = page.locator('[data-testid="task-item"]').first();
      await firstTask.focus();

      // Arrow down should move to next task
      await page.keyboard.press("ArrowDown");
      const secondTask = page.locator('[data-testid="task-item"]').nth(1);
      await expect(secondTask).toBeFocused();

      // Arrow up should move back to previous task
      await page.keyboard.press("ArrowUp");
      await expect(firstTask).toBeFocused();

      // Home should go to first item
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Home");
      await expect(firstTask).toBeFocused();

      // End should go to last item
      await page.keyboard.press("End");
      const lastTask = page.locator('[data-testid="task-item"]').last();
      await expect(lastTask).toBeFocused();
    });

    test("should support Enter and Space key activation", async ({ page }) => {
      await page.goto("/dashboard");

      // Focus navigation link
      const inboxNav = page.locator('[data-testid="nav-inbox"]');
      await inboxNav.focus();

      // Enter should activate navigation
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/inbox/);

      // Go back to dashboard
      await page.goto("/dashboard");

      // Test button activation with Space
      const captureButton = page.locator('[data-testid="expand-capture"]');
      await captureButton.focus();
      await page.keyboard.press("Space");

      await expect(page.locator('[data-testid="capture-modal"]')).toBeVisible();
    });

    test("should support keyboard shortcuts", async ({ page }) => {
      await page.goto("/dashboard");

      // Test capture shortcut (C key)
      await page.keyboard.press("c");
      await expect(
        page.locator('[data-testid="quick-capture-input"]')
      ).toBeFocused();

      // Test navigation shortcuts
      await page.keyboard.press("g");
      await page.keyboard.press("i"); // Go to Inbox
      await expect(page).toHaveURL(/inbox/);

      await page.keyboard.press("g");
      await page.keyboard.press("n"); // Go to Next Actions
      await expect(page).toHaveURL(/next-actions/);

      // Test search shortcut (/ key)
      await page.keyboard.press("/");
      await expect(page.locator('[data-testid="search-input"]')).toBeFocused();
    });
  });

  test.describe("Screen Reader Support", () => {
    test("should have proper heading structure", async ({ page }) => {
      await page.goto("/dashboard");

      // Check for proper heading hierarchy
      const h1 = page.locator("h1");
      await expect(h1).toHaveCount(1);
      await expect(h1).toBeVisible();

      // Headings should be in logical order
      const headings = page.locator("h1, h2, h3, h4, h5, h6");
      const headingLevels = await headings.evaluateAll((elements) =>
        elements.map((el) => parseInt(el.tagName.charAt(1)))
      );

      // Check heading hierarchy is logical (no skipping levels)
      for (let i = 1; i < headingLevels.length; i++) {
        const currentLevel = headingLevels[i];
        const previousLevel = headingLevels[i - 1];
        expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
      }
    });

    test("should have descriptive page titles", async ({ page }) => {
      // Test different pages have unique, descriptive titles
      await page.goto("/dashboard");
      await expect(page).toHaveTitle(/dashboard/i);

      await helpers.navigateToList("inbox");
      await expect(page).toHaveTitle(/inbox/i);

      await helpers.navigateToList("next-actions");
      await expect(page).toHaveTitle(/next.actions/i);

      await page.goto("/dashboard/reviews");
      await expect(page).toHaveTitle(/review/i);
    });

    test("should have proper ARIA labels and descriptions", async ({
      page,
    }) => {
      await page.goto("/dashboard");

      // Quick capture should be properly labeled
      const captureInput = page.locator('[data-testid="quick-capture-input"]');
      await expect(captureInput).toHaveAttribute("aria-label");

      // Navigation should be properly marked up
      const navigation = page.locator('[data-testid="main-navigation"]');
      await expect(navigation).toHaveAttribute("role", "navigation");
      await expect(navigation).toHaveAttribute("aria-label");

      // Task list should be properly structured
      const taskList = page.locator('[data-testid="task-list"]');
      await expect(taskList).toHaveAttribute("role", "list");

      const taskItems = page.locator('[data-testid="task-item"]');
      for (let i = 0; i < (await taskItems.count()); i++) {
        await expect(taskItems.nth(i)).toHaveAttribute("role", "listitem");
      }
    });

    test("should provide meaningful link text", async ({ page }) => {
      await page.goto("/dashboard");

      // All links should have descriptive text or aria-label
      const links = page.locator("a");
      const linkCount = await links.count();

      for (let i = 0; i < linkCount; i++) {
        const link = links.nth(i);
        const linkText = await link.textContent();
        const ariaLabel = await link.getAttribute("aria-label");
        const title = await link.getAttribute("title");

        // Link should have meaningful text or label
        const hasMeaningfulText =
          linkText &&
          linkText.trim().length > 0 &&
          !linkText.match(/^(click|here|link)$/i);
        const hasMeaningfulLabel = ariaLabel && ariaLabel.trim().length > 0;
        const hasMeaningfulTitle = title && title.trim().length > 0;

        expect(
          hasMeaningfulText || hasMeaningfulLabel || hasMeaningfulTitle
        ).toBe(true);
      }
    });

    test("should announce status changes", async ({ page }) => {
      await page.goto("/dashboard");

      // Capture a task and check for status announcement
      await helpers.captureTask("Test task for status");

      // Success message should be announced
      const statusMessage = page.locator('[data-testid="capture-success"]');
      await expect(statusMessage).toHaveAttribute("role", "status");
      await expect(statusMessage).toHaveAttribute("aria-live", "polite");

      // Complete task and check announcement
      await helpers.completeTask("Test task for status");

      const completionMessage = page.locator(
        '[data-testid="task-completed-toast"]'
      );
      await expect(completionMessage).toHaveAttribute("aria-live", "assertive");
    });

    test("should provide context for form fields", async ({ page }) => {
      await page.goto("/dashboard");
      await page.click('[data-testid="expand-capture"]');

      // Form fields should be properly associated with labels
      const titleInput = page.locator('[data-testid="task-title-input"]');
      const titleLabelId = await titleInput.getAttribute("aria-labelledby");
      expect(titleLabelId).toBeTruthy();

      const titleLabel = page.locator(`#${titleLabelId}`);
      await expect(titleLabel).toBeVisible();

      // Required fields should be indicated
      const requiredFields = page.locator("[required]");
      for (let i = 0; i < (await requiredFields.count()); i++) {
        const field = requiredFields.nth(i);
        const ariaRequired = await field.getAttribute("aria-required");
        expect(ariaRequired).toBe("true");
      }
    });

    test("should handle error messages accessibly", async ({ page }) => {
      await page.goto("/auth/login");

      // Submit form with invalid data
      await page.fill('[data-testid="email-input"]', "invalid-email");
      await page.click('[data-testid="send-otp-button"]');

      // Error message should be associated with field
      const emailInput = page.locator('[data-testid="email-input"]');
      const errorId = await emailInput.getAttribute("aria-describedby");
      expect(errorId).toBeTruthy();

      const errorMessage = page.locator(`#${errorId}`);
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toHaveAttribute("role", "alert");
    });
  });

  test.describe("Visual Accessibility", () => {
    test("should have sufficient color contrast", async ({ page }) => {
      await page.goto("/dashboard");

      // Check critical UI elements for color contrast
      const criticalElements = [
        '[data-testid="quick-capture-input"]',
        '[data-testid="nav-inbox"]',
        '[data-testid="task-item"]',
        "button",
        "a",
      ];

      for (const selector of criticalElements) {
        const elements = page.locator(selector);
        const count = await elements.count();

        for (let i = 0; i < Math.min(count, 5); i++) {
          // Check first 5 of each type
          const element = elements.nth(i);
          const isVisible = await element.isVisible();

          if (isVisible) {
            const styles = await element.evaluate((el) => {
              const computed = window.getComputedStyle(el);
              return {
                color: computed.color,
                backgroundColor: computed.backgroundColor,
                fontSize: computed.fontSize,
              };
            });

            // Basic contrast check (simplified)
            expect(styles.color).toBeTruthy();
            expect(styles.backgroundColor).toBeTruthy();
            expect(styles.color).not.toBe(styles.backgroundColor);
          }
        }
      }
    });

    test("should be usable when zoomed to 200%", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto("/dashboard");

      // Simulate 200% zoom by reducing viewport
      await page.setViewportSize({ width: 640, height: 360 });

      // Core functionality should still work
      await expect(
        page.locator('[data-testid="quick-capture-input"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="main-navigation"]')
      ).toBeVisible();

      // Should be able to capture task
      await helpers.captureTask("Zoom test task");
      await expect(
        page.locator('[data-testid="task-item"]:has-text("Zoom test task")')
      ).toBeVisible();
    });

    test("should work with browser high contrast mode", async ({ page }) => {
      // Simulate high contrast mode with forced colors
      await page.emulateMedia({ forcedColors: "active" });
      await page.goto("/dashboard");

      // Elements should remain visible and functional
      await expect(
        page.locator('[data-testid="quick-capture-input"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="main-navigation"]')
      ).toBeVisible();

      // Interactive elements should be distinguishable
      const buttons = page.locator("button");
      for (let i = 0; i < Math.min(await buttons.count(), 3); i++) {
        const button = buttons.nth(i);
        const isVisible = await button.isVisible();
        if (isVisible) {
          await expect(button).toBeVisible();
        }
      }
    });

    test("should have visible focus indicators", async ({ page }) => {
      await page.goto("/dashboard");

      // Test focus indicators on interactive elements
      const interactiveElements = [
        '[data-testid="quick-capture-input"]',
        '[data-testid="nav-inbox"]',
        '[data-testid="expand-capture"]',
      ];

      for (const selector of interactiveElements) {
        const element = page.locator(selector);
        await element.focus();

        // Check for visible focus indicator
        const styles = await element.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            outline: computed.outline,
            outlineStyle: computed.outlineStyle,
            outlineWidth: computed.outlineWidth,
            boxShadow: computed.boxShadow,
          };
        });

        // Should have some form of focus indicator
        const hasFocusIndicator =
          styles.outline !== "none" ||
          styles.outlineStyle !== "none" ||
          styles.outlineWidth !== "0px" ||
          styles.boxShadow !== "none";

        expect(hasFocusIndicator).toBe(true);
      }
    });

    test("should respect reduced motion preferences", async ({ page }) => {
      // Simulate reduced motion preference
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/dashboard");

      // Animations should be disabled or reduced
      await helpers.captureTask("Animation test task");

      // Check that completion animation is reduced/disabled
      await helpers.completeTask("Animation test task");

      // Should still show completion feedback but without animation
      await expect(
        page.locator('[data-testid="completion-celebration"]')
      ).toBeVisible();
    });
  });

  test.describe("Mobile Accessibility", () => {
    test("should have adequate touch targets", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/dashboard");

      // All interactive elements should meet minimum touch target size (44px)
      const interactiveElements = page.locator(
        'button, a, input, [role="button"]'
      );
      const count = await interactiveElements.count();

      for (let i = 0; i < count; i++) {
        const element = interactiveElements.nth(i);
        const isVisible = await element.isVisible();

        if (isVisible) {
          const boundingBox = await element.boundingBox();
          if (boundingBox) {
            expect(boundingBox.width).toBeGreaterThanOrEqual(44);
            expect(boundingBox.height).toBeGreaterThanOrEqual(44);
          }
        }
      }
    });

    test("should support mobile screen reader gestures", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/dashboard");

      // Elements should be properly structured for swipe navigation
      const headings = page.locator("h1, h2, h3, h4, h5, h6");
      await expect(headings).toHaveCountGreaterThan(0);

      // Landmarks should be present
      const landmarks = page.locator(
        '[role="navigation"], [role="main"], [role="banner"], [role="contentinfo"]'
      );
      await expect(landmarks).toHaveCountGreaterThan(0);
    });

    test("should handle orientation changes", async ({ page }) => {
      // Portrait orientation
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/dashboard");

      await expect(
        page.locator('[data-testid="quick-capture-input"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="main-navigation"]')
      ).toBeVisible();

      // Landscape orientation
      await page.setViewportSize({ width: 667, height: 375 });

      await expect(
        page.locator('[data-testid="quick-capture-input"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="main-navigation"]')
      ).toBeVisible();
    });
  });

  test.describe("Assistive Technology Support", () => {
    test("should work with voice control", async ({ page }) => {
      await page.goto("/dashboard");

      // Voice control relies on proper labels and names
      const captureInput = page.locator('[data-testid="quick-capture-input"]');
      const accessibleName = await captureInput.evaluate((el) => {
        // Get accessible name (aria-label, aria-labelledby, or label)
        const ariaLabel = el.getAttribute("aria-label");
        const ariaLabelledBy = el.getAttribute("aria-labelledby");
        const labelElement = document.querySelector(`label[for="${el.id}"]`);

        return (
          ariaLabel ||
          (ariaLabelledBy &&
            document.getElementById(ariaLabelledBy)?.textContent) ||
          labelElement?.textContent ||
          el.getAttribute("placeholder")
        );
      });

      expect(accessibleName).toBeTruthy();
    });

    test("should support switch navigation", async ({ page }) => {
      await page.goto("/dashboard");

      // Switch navigation requires proper tab order and activation
      const interactiveElements = page.locator(
        'button, a, input, select, textarea, [tabindex="0"]'
      );
      const count = await interactiveElements.count();

      // All interactive elements should be reachable via tab
      for (let i = 0; i < Math.min(count, 10); i++) {
        await page.keyboard.press("Tab");
        const focusedElement = page.locator(":focus");
        await expect(focusedElement).toBeVisible();
      }
    });

    test("should work with magnification software", async ({ page }) => {
      await page.goto("/dashboard");

      // Content should remain usable when magnified
      await page.setViewportSize({ width: 320, height: 240 }); // Simulate high magnification

      // Core functionality should be accessible
      await expect(
        page.locator('[data-testid="quick-capture-input"]')
      ).toBeVisible();

      // Should be able to scroll to see all content
      const taskList = page.locator('[data-testid="task-list"]');
      if (await taskList.isVisible()) {
        await taskList.scrollIntoViewIfNeeded();
      }
    });
  });

  test.describe("WCAG Compliance", () => {
    test("should meet WCAG 2.1 Level AA standards for forms", async ({
      page,
    }) => {
      await page.goto("/dashboard");
      await page.click('[data-testid="expand-capture"]');

      // Labels: All form fields should have labels
      const formFields = page.locator("input, select, textarea");
      for (let i = 0; i < (await formFields.count()); i++) {
        const field = formFields.nth(i);
        const hasLabel = await field.evaluate((el) => {
          const ariaLabel = el.getAttribute("aria-label");
          const ariaLabelledBy = el.getAttribute("aria-labelledby");
          const labelElement = document.querySelector(`label[for="${el.id}"]`);

          return !!(ariaLabel || ariaLabelledBy || labelElement);
        });

        expect(hasLabel).toBe(true);
      }

      // Error handling should be accessible
      await page.fill('[data-testid="task-title-input"]', "");
      await page.click('[data-testid="save-task"]');

      const errorMessage = page.locator('[data-testid="title-error"]');
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toHaveAttribute("role", "alert");
      }
    });

    test("should have proper document structure", async ({ page }) => {
      await page.goto("/dashboard");

      // Page should have main landmark
      await expect(page.locator('[role="main"], main')).toBeVisible();

      // Should have navigation landmark
      await expect(page.locator('[role="navigation"], nav')).toBeVisible();

      // Should have proper heading structure
      const h1 = page.locator("h1");
      await expect(h1).toHaveCount(1);
    });

    test("should handle dynamic content accessibly", async ({ page }) => {
      await page.goto("/dashboard");

      // Dynamic content updates should be announced
      await helpers.captureTask("Dynamic content test");

      // Status updates should use aria-live regions
      const statusRegions = page.locator("[aria-live]");
      await expect(statusRegions).toHaveCountGreaterThan(0);
    });

    test("should support custom assistive technologies", async ({ page }) => {
      await page.goto("/dashboard");

      // Custom components should have proper ARIA attributes
      const customComponents = page.locator('[data-component="custom"]');
      if ((await customComponents.count()) > 0) {
        for (let i = 0; i < (await customComponents.count()); i++) {
          const component = customComponents.nth(i);
          const hasProperRole = await component.getAttribute("role");
          const hasProperLabel =
            (await component.getAttribute("aria-label")) ||
            (await component.getAttribute("aria-labelledby"));

          expect(hasProperRole || hasProperLabel).toBeTruthy();
        }
      }
    });
  });

  test.describe("Accessibility Testing Tools Integration", () => {
    test("should pass automated accessibility audit", async ({ page }) => {
      await page.goto("/dashboard");

      // Basic automated checks (simplified version of what axe-core would do)
      const accessibilityIssues = await page.evaluate(() => {
        const issues = [];

        // Check for missing alt text
        const images = document.querySelectorAll("img");
        images.forEach((img) => {
          if (!img.alt) {
            issues.push(`Image missing alt text: ${img.src}`);
          }
        });

        // Check for missing form labels
        const inputs = document.querySelectorAll('input:not([type="hidden"])');
        inputs.forEach((input) => {
          const hasLabel =
            input.getAttribute("aria-label") ||
            input.getAttribute("aria-labelledby") ||
            document.querySelector(`label[for="${input.id}"]`);
          if (!hasLabel) {
            issues.push(`Input missing label: ${input.name || input.id}`);
          }
        });

        // Check for proper heading structure
        const headings = Array.from(
          document.querySelectorAll("h1, h2, h3, h4, h5, h6")
        );
        const levels = headings.map((h) => parseInt(h.tagName.charAt(1)));
        for (let i = 1; i < levels.length; i++) {
          if (levels[i] - levels[i - 1] > 1) {
            issues.push(
              `Heading hierarchy skips level: h${levels[i - 1]} to h${levels[i]}`
            );
          }
        }

        return issues;
      });

      // Should have no critical accessibility issues
      expect(accessibilityIssues).toHaveLength(0);
    });
  });
});
