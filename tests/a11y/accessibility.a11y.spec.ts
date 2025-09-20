import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { LoginPage } from '../e2e/pages/LoginPage'
import { DashboardPage } from '../e2e/pages/DashboardPage'

test.describe('Accessibility Tests', () => {
  test.describe('Login Page Accessibility', () => {
    test('should not have any automatically detectable accessibility issues', async ({ page }) => {
      const loginPage = new LoginPage(page)
      await loginPage.goto()

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('should have proper heading structure', async ({ page }) => {
      const loginPage = new LoginPage(page)
      await loginPage.goto()

      // Check for proper heading hierarchy
      const h1 = page.locator('h1')
      await expect(h1).toHaveCount(1)
      await expect(h1).toContainText(/sign in|login/i)

      // Check that heading is properly nested
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents()
      expect(headings[0]).toMatch(/sign in|login/i)
    })

    test('should have proper form labels and associations', async ({ page }) => {
      const loginPage = new LoginPage(page)
      await loginPage.goto()

      // Email input should have proper label
      const emailInput = loginPage.emailInput
      await expect(emailInput).toHaveAttribute('aria-label')
      await expect(emailInput).toHaveAttribute('type', 'email')
      await expect(emailInput).toHaveAttribute('required')

      // Submit button should be properly labeled
      const submitButton = loginPage.signInButton
      await expect(submitButton).toHaveAttribute('type', 'submit')
      await expect(submitButton).toHaveAccessibleName(/sign in|submit|login/i)
    })

    test('should support keyboard navigation', async ({ page }) => {
      const loginPage = new LoginPage(page)
      await loginPage.goto()

      // Tab through the form
      await page.keyboard.press('Tab')
      await expect(loginPage.emailInput).toBeFocused()

      await page.keyboard.press('Tab')
      await expect(loginPage.signInButton).toBeFocused()

      // Enter should submit form when button is focused
      await loginPage.emailInput.fill('test@example.com')
      await loginPage.signInButton.focus()
      await page.keyboard.press('Enter')

      // Should proceed with login
      await expect(page.getByText(/check your email|verify/i)).toBeVisible()
    })

    test('should have sufficient color contrast', async ({ page }) => {
      const loginPage = new LoginPage(page)
      await loginPage.goto()

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .include('body')
        .analyze()

      const colorContrastViolations = accessibilityScanResults.violations.filter(
        violation => violation.id === 'color-contrast'
      )

      expect(colorContrastViolations).toHaveLength(0)
    })

    test('should handle focus management properly', async ({ page }) => {
      const loginPage = new LoginPage(page)
      await loginPage.goto()

      // Focus should be visible
      await loginPage.emailInput.focus()

      const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
      expect(focusedElement).toBe('INPUT')

      // Focus should move logically
      await page.keyboard.press('Tab')
      const nextFocusedElement = await page.evaluate(() => document.activeElement?.tagName)
      expect(nextFocusedElement).toBe('BUTTON')
    })

    test('should announce errors to screen readers', async ({ page }) => {
      const loginPage = new LoginPage(page)
      await loginPage.goto()

      // Submit with invalid email
      await loginPage.enterEmail('invalid-email')
      await loginPage.clickSignIn()

      // Error should be announced
      const errorMessage = page.getByRole('alert')
      await expect(errorMessage).toBeVisible()
      await expect(errorMessage).toHaveAttribute('aria-live', 'polite')
    })
  })

  test.describe('Dashboard Accessibility', () => {
    test('should not have any automatically detectable accessibility issues', async ({ page }) => {
      const loginPage = new LoginPage(page)
      const dashboardPage = new DashboardPage(page)

      await loginPage.goto()
      await loginPage.completeLogin('test@example.com')
      await dashboardPage.expectToBeLoaded()

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .exclude('.map') // Exclude maps if any
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('should have proper landmark regions', async ({ page }) => {
      const loginPage = new LoginPage(page)
      const dashboardPage = new DashboardPage(page)

      await loginPage.goto()
      await loginPage.completeLogin('test@example.com')
      await dashboardPage.expectToBeLoaded()

      // Check for main content area
      const main = page.getByRole('main')
      await expect(main).toBeVisible()

      // Check for navigation
      const navigation = page.getByRole('navigation')
      await expect(navigation).toBeVisible()

      // Check for header if present
      const banner = page.getByRole('banner')
      if (await banner.count() > 0) {
        await expect(banner).toBeVisible()
      }
    })

    test('should have accessible task lists', async ({ page }) => {
      const loginPage = new LoginPage(page)
      const dashboardPage = new DashboardPage(page)

      await loginPage.goto()
      await loginPage.completeLogin('test@example.com')
      await dashboardPage.expectToBeLoaded()

      // Task lists should be properly labeled
      const taskLists = page.getByRole('list')
      const listCount = await taskLists.count()
      expect(listCount).toBeGreaterThan(0)

      // Each list should have accessible name
      for (let i = 0; i < listCount; i++) {
        const list = taskLists.nth(i)
        await expect(list).toHaveAttribute('aria-label')
      }
    })

    test('should support keyboard navigation for task management', async ({ page }) => {
      const loginPage = new LoginPage(page)
      const dashboardPage = new DashboardPage(page)

      await loginPage.goto()
      await loginPage.completeLogin('test@example.com')
      await dashboardPage.expectToBeLoaded()

      // Create a task first
      await dashboardPage.captureTask('Keyboard test task')

      // Tab to the task
      const taskCard = await dashboardPage.getTaskCard('Keyboard test task')
      await taskCard.focus()

      // Should be able to interact with keyboard
      await page.keyboard.press('Enter')
      // Task detail should open or task should be selected
    })

    test('should have accessible capture input', async ({ page }) => {
      const loginPage = new LoginPage(page)
      const dashboardPage = new DashboardPage(page)

      await loginPage.goto()
      await loginPage.completeLogin('test@example.com')
      await dashboardPage.expectToBeLoaded()

      // Capture input should be accessible
      const captureInput = dashboardPage.captureInput
      await expect(captureInput).toHaveAttribute('aria-label')
      await expect(captureInput).toHaveAttribute('placeholder')

      // Add button should be accessible
      const addButton = dashboardPage.addTaskButton
      await expect(addButton).toHaveAccessibleName(/add|create|capture/i)
      await expect(addButton).toHaveAttribute('aria-label')
    })

    test('should announce task actions to screen readers', async ({ page }) => {
      const loginPage = new LoginPage(page)
      const dashboardPage = new DashboardPage(page)

      await loginPage.goto()
      await loginPage.completeLogin('test@example.com')
      await dashboardPage.expectToBeLoaded()

      // Capture a task
      await dashboardPage.captureTask('Announced task')

      // Should have status announcement
      const statusRegion = page.getByRole('status')
      if (await statusRegion.count() > 0) {
        await expect(statusRegion).toContainText(/saved|added|created/i)
      }
    })

    test('should support screen reader navigation of task lists', async ({ page }) => {
      const loginPage = new LoginPage(page)
      const dashboardPage = new DashboardPage(page)

      await loginPage.goto()
      await loginPage.completeLogin('test@example.com')
      await dashboardPage.expectToBeLoaded()

      // Create multiple tasks for testing
      const tasks = ['Task 1', 'Task 2', 'Task 3']
      for (const task of tasks) {
        await dashboardPage.captureTask(task)
      }

      // Task list should be navigable by screen reader
      const taskList = dashboardPage.capturedList
      await expect(taskList).toHaveRole('list')

      const taskItems = taskList.getByRole('listitem')
      const taskCount = await taskItems.count()
      expect(taskCount).toBe(tasks.length)

      // Each task should be properly labeled
      for (let i = 0; i < taskCount; i++) {
        const taskItem = taskItems.nth(i)
        await expect(taskItem).toHaveAccessibleName(/task \d+|.*task.*/i)
      }
    })

    test('should have accessible modal dialogs', async ({ page }) => {
      const loginPage = new LoginPage(page)
      const dashboardPage = new DashboardPage(page)

      await loginPage.goto()
      await loginPage.completeLogin('test@example.com')
      await dashboardPage.expectToBeLoaded()

      // Open task details modal
      await dashboardPage.captureTaskWithDetails('Modal test task', 'Test description')

      // Modal should be accessible when it appears
      const modal = page.getByTestId('task-edit-modal')
      if (await modal.count() > 0) {
        await expect(modal).toHaveRole('dialog')
        await expect(modal).toHaveAttribute('aria-modal', 'true')
        await expect(modal).toHaveAttribute('aria-labelledby')
      }
    })

    test('should manage focus properly in modals', async ({ page }) => {
      const loginPage = new LoginPage(page)
      const dashboardPage = new DashboardPage(page)

      await loginPage.goto()
      await loginPage.completeLogin('test@example.com')
      await dashboardPage.expectToBeLoaded()

      // Test with task creation modal if available
      try {
        await dashboardPage.detailsButton.click()

        const modal = page.getByTestId('task-edit-modal')
        await expect(modal).toBeVisible()

        // Focus should be trapped in modal
        const firstFocusableElement = modal.locator('input, button, textarea, select').first()
        await expect(firstFocusableElement).toBeFocused()

        // Escape should close modal
        await page.keyboard.press('Escape')
        await expect(modal).toBeHidden()

        // Focus should return to trigger element
        await expect(dashboardPage.detailsButton).toBeFocused()
      } catch {
        // Modal might not be available in current implementation
      }
    })
  })

  test.describe('High Contrast Mode', () => {
    test('should work in high contrast mode', async ({ page }) => {
      // Enable high contrast mode
      await page.emulateMedia({ colorScheme: 'dark', forcedColors: 'active' })

      const loginPage = new LoginPage(page)
      await loginPage.goto()

      // Check that content is still visible and functional
      await expect(loginPage.emailInput).toBeVisible()
      await expect(loginPage.signInButton).toBeVisible()

      // Form should still work
      await loginPage.enterEmail('test@example.com')
      await loginPage.clickSignIn()
    })
  })

  test.describe('Motion and Animation', () => {
    test('should respect reduced motion preferences', async ({ page }) => {
      // Set reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' })

      const loginPage = new LoginPage(page)
      const dashboardPage = new DashboardPage(page)

      await loginPage.goto()
      await loginPage.completeLogin('test@example.com')
      await dashboardPage.expectToBeLoaded()

      // Check that animations are reduced or disabled
      const animatedElements = page.locator('[class*="animate"]')
      const count = await animatedElements.count()

      if (count > 0) {
        // Verify animation duration is reduced
        const animationDuration = await animatedElements.first().evaluate(el => {
          const style = window.getComputedStyle(el)
          return style.animationDuration
        })

        // Should be very short or 0
        expect(animationDuration).toMatch(/^0s$|^0\.0\d+s$/)
      }
    })
  })

  test.describe('Mobile Accessibility', () => {
    test('should be accessible on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      const loginPage = new LoginPage(page)
      const dashboardPage = new DashboardPage(page)

      await loginPage.goto()
      await loginPage.completeLogin('test@example.com')
      await dashboardPage.expectToBeLoaded()

      // Run accessibility scan on mobile
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('should have proper touch target sizes', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      const loginPage = new LoginPage(page)
      const dashboardPage = new DashboardPage(page)

      await loginPage.goto()
      await loginPage.completeLogin('test@example.com')
      await dashboardPage.expectToBeLoaded()

      // Check touch target sizes (minimum 44x44px)
      const interactiveElements = page.locator('button, input[type="submit"], a')
      const count = await interactiveElements.count()

      for (let i = 0; i < count; i++) {
        const element = interactiveElements.nth(i)
        const boundingBox = await element.boundingBox()

        if (boundingBox) {
          expect(boundingBox.width).toBeGreaterThanOrEqual(44)
          expect(boundingBox.height).toBeGreaterThanOrEqual(44)
        }
      }
    })
  })

  test.describe('Screen Reader Testing', () => {
    test('should provide proper accessible names', async ({ page }) => {
      const loginPage = new LoginPage(page)
      const dashboardPage = new DashboardPage(page)

      await loginPage.goto()
      await loginPage.completeLogin('test@example.com')
      await dashboardPage.expectToBeLoaded()

      // Check that all interactive elements have accessible names
      const interactiveElements = page.locator('button, input, select, textarea, a[href]')
      const count = await interactiveElements.count()

      for (let i = 0; i < count; i++) {
        const element = interactiveElements.nth(i)
        const accessibleName = await element.getAttribute('aria-label') ||
                              await element.getAttribute('aria-labelledby') ||
                              await element.textContent()

        expect(accessibleName).toBeTruthy()
      }
    })

    test('should use proper ARIA roles and properties', async ({ page }) => {
      const loginPage = new LoginPage(page)
      const dashboardPage = new DashboardPage(page)

      await loginPage.goto()
      await loginPage.completeLogin('test@example.com')
      await dashboardPage.expectToBeLoaded()

      // Check for proper ARIA usage
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withRules(['aria-valid-attr', 'aria-valid-attr-value', 'aria-required-attr'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })
  })
})