import { test, expect } from '@playwright/test';
import { GTDTestHelpers, PERFORMANCE_THRESHOLDS } from '../helpers/test-utils';
import { TEST_USERS, TEST_TASKS, PERFORMANCE_TEST_DATA } from '../fixtures/test-data';

test.describe('Task Capture', () => {
  let helpers: GTDTestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new GTDTestHelpers(page);
    await helpers.ensureAuthenticated();
  });

  test.afterEach(async () => {
    await helpers.cleanupTestData();
  });

  test.describe('Quick Capture Interface', () => {
    test('should have capture input always visible', async ({ page }) => {
      await page.goto('/dashboard');

      // Quick capture should be prominently displayed
      const captureInput = page.locator('[data-testid="quick-capture-input"]');
      await expect(captureInput).toBeVisible();
      await expect(captureInput).toHaveAttribute('placeholder');

      // Should be positioned at top of interface
      const inputBounds = await captureInput.boundingBox();
      expect(inputBounds?.y).toBeLessThan(200); // Near top of page
    });

    test('should capture task with title only', async ({ page }) => {
      await page.goto('/dashboard');

      const taskTitle = 'Quick test task';
      const { captureTime } = await helpers.captureTask(taskTitle);

      // Verify performance requirement
      expect(captureTime).toBeLessThan(PERFORMANCE_THRESHOLDS.TASK_CAPTURE_MAX_TIME);

      // Verify task appears in inbox
      await helpers.navigateToList('inbox');
      await expect(
        page.locator(`[data-testid="task-item"]:has-text("${taskTitle}")`)
      ).toBeVisible();
    });

    test('should capture task with Enter key', async ({ page }) => {
      await page.goto('/dashboard');

      const taskTitle = 'Enter key test task';
      const captureInput = page.locator('[data-testid="quick-capture-input"]');

      await captureInput.fill(taskTitle);
      await page.keyboard.press('Enter');

      // Task should be captured
      await expect(
        page.locator(`[data-testid="task-item"]:has-text("${taskTitle}")`)
      ).toBeVisible();

      // Input should be cleared and ready for next task
      await expect(captureInput).toHaveValue('');
      await expect(captureInput).toBeFocused();
    });

    test('should capture task with detailed information', async ({ page }) => {
      await page.goto('/dashboard');

      const taskData = {
        title: 'Detailed test task',
        description: 'This task has detailed information',
        context: 'office' as const,
        tags: ['work', 'test']
      };

      await helpers.captureTask(taskData.title, taskData);

      // Verify task with all details
      const taskItem = page.locator(`[data-testid="task-item"]:has-text("${taskData.title}")`);
      await taskItem.click();

      await expect(page.locator('[data-testid="task-description"]')).toContainText(taskData.description);
      await expect(page.locator('[data-testid="task-context"]')).toContainText(taskData.context);

      for (const tag of taskData.tags) {
        await expect(page.locator(`[data-testid="task-tag"]:has-text("${tag}")`)).toBeVisible();
      }
    });

    test('should provide capture feedback', async ({ page }) => {
      await page.goto('/dashboard');

      const taskTitle = 'Feedback test task';
      await helpers.captureTask(taskTitle);

      // Should show success feedback
      await expect(page.locator('[data-testid="capture-success"]')).toBeVisible();
      await expect(page.locator('[data-testid="capture-success"]')).toContainText(/captured|added/i);

      // Feedback should disappear after timeout
      await page.waitForTimeout(3000);
      await expect(page.locator('[data-testid="capture-success"]')).not.toBeVisible();
    });

    test('should handle capture errors gracefully', async ({ page }) => {
      await page.goto('/dashboard');

      // Mock network error
      await page.route('**/rest/v1/tasks', (route) => {
        if (route.request().method() === 'POST') {
          route.abort('failed');
        } else {
          route.continue();
        }
      });

      const captureInput = page.locator('[data-testid="quick-capture-input"]');
      await captureInput.fill('Error test task');
      await page.keyboard.press('Enter');

      // Should show error feedback
      await expect(page.locator('[data-testid="capture-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="capture-error"]')).toContainText(/error|failed/i);

      // Should provide retry option
      await expect(page.locator('[data-testid="retry-capture"]')).toBeVisible();
    });
  });

  test.describe('Expanded Capture Modal', () => {
    test('should open expanded capture modal', async ({ page }) => {
      await page.goto('/dashboard');

      await page.click('[data-testid="expand-capture"]');

      // Modal should open with all capture fields
      await expect(page.locator('[data-testid="capture-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="task-title-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="task-description-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="task-context-select"]')).toBeVisible();
      await expect(page.locator('[data-testid="task-energy-select"]')).toBeVisible();
      await expect(page.locator('[data-testid="task-duration-select"]')).toBeVisible();
      await expect(page.locator('[data-testid="task-tags-input"]')).toBeVisible();
    });

    test('should capture task with all properties', async ({ page }) => {
      await page.goto('/dashboard');
      await page.click('[data-testid="expand-capture"]');

      const taskData = {
        title: 'Complete task test',
        description: 'A task with all properties set',
        context: 'computer',
        energy_level: 'high',
        estimated_duration: '1hour',
        priority: 1,
        tags: ['urgent', 'work', 'test']
      };

      // Fill all fields
      await page.fill('[data-testid="task-title-input"]', taskData.title);
      await page.fill('[data-testid="task-description-input"]', taskData.description);
      await page.selectOption('[data-testid="task-context-select"]', taskData.context);
      await page.selectOption('[data-testid="task-energy-select"]', taskData.energy_level);
      await page.selectOption('[data-testid="task-duration-select"]', taskData.estimated_duration);
      await page.selectOption('[data-testid="task-priority-select"]', taskData.priority.toString());

      // Add tags
      for (const tag of taskData.tags) {
        await page.fill('[data-testid="task-tags-input"]', `${tag} `);
      }

      await page.click('[data-testid="save-task"]');

      // Verify task was created with all properties
      const taskItem = page.locator(`[data-testid="task-item"]:has-text("${taskData.title}")`);
      await expect(taskItem).toBeVisible();

      // Check task properties
      await taskItem.click();
      await expect(page.locator('[data-testid="task-detail-context"]')).toContainText(taskData.context);
      await expect(page.locator('[data-testid="task-detail-energy"]')).toContainText(taskData.energy_level);
      await expect(page.locator('[data-testid="task-detail-duration"]')).toContainText(taskData.estimated_duration);
      await expect(page.locator('[data-testid="task-detail-priority"]')).toContainText(taskData.priority.toString());

      for (const tag of taskData.tags) {
        await expect(page.locator(`[data-testid="task-tag"]:has-text("${tag}")`)).toBeVisible();
      }
    });

    test('should validate required fields', async ({ page }) => {
      await page.goto('/dashboard');
      await page.click('[data-testid="expand-capture"]');

      // Try to save without title
      await page.click('[data-testid="save-task"]');

      await expect(page.locator('[data-testid="title-error"]')).toContainText('Title is required');
      await expect(page.locator('[data-testid="capture-modal"]')).toBeVisible(); // Modal should stay open

      // Fill title and save successfully
      await page.fill('[data-testid="task-title-input"]', 'Valid task title');
      await page.click('[data-testid="save-task"]');

      await expect(page.locator('[data-testid="capture-modal"]')).not.toBeVisible();
    });

    test('should close modal with escape key', async ({ page }) => {
      await page.goto('/dashboard');
      await page.click('[data-testid="expand-capture"]');

      await expect(page.locator('[data-testid="capture-modal"]')).toBeVisible();

      await page.keyboard.press('Escape');

      await expect(page.locator('[data-testid="capture-modal"]')).not.toBeVisible();
    });

    test('should preserve partial input when modal is reopened', async ({ page }) => {
      await page.goto('/dashboard');
      await page.click('[data-testid="expand-capture"]');

      // Fill some fields
      await page.fill('[data-testid="task-title-input"]', 'Partial task');
      await page.fill('[data-testid="task-description-input"]', 'Partial description');

      // Close modal without saving
      await page.keyboard.press('Escape');

      // Reopen modal
      await page.click('[data-testid="expand-capture"]');

      // Fields should be preserved
      await expect(page.locator('[data-testid="task-title-input"]')).toHaveValue('Partial task');
      await expect(page.locator('[data-testid="task-description-input"]')).toHaveValue('Partial description');
    });
  });

  test.describe('Batch Capture', () => {
    test('should support rapid task entry', async ({ page }) => {
      await page.goto('/dashboard');

      const tasks = [
        'First rapid task',
        'Second rapid task',
        'Third rapid task',
        'Fourth rapid task',
        'Fifth rapid task'
      ];

      const startTime = Date.now();

      for (const taskTitle of tasks) {
        await helpers.captureTask(taskTitle);
        // Small delay to avoid overwhelming the system
        await page.waitForTimeout(100);
      }

      const totalTime = Date.now() - startTime;
      const averageTime = totalTime / tasks.length;

      // Each task should be captured within performance threshold
      expect(averageTime).toBeLessThan(PERFORMANCE_THRESHOLDS.TASK_CAPTURE_MAX_TIME);

      // All tasks should be visible
      for (const taskTitle of tasks) {
        await expect(
          page.locator(`[data-testid="task-item"]:has-text("${taskTitle}")`)
        ).toBeVisible();
      }
    });

    test('should handle bulk import from clipboard', async ({ page }) => {
      await page.goto('/dashboard');

      const bulkText = `Task one
Task two
Task three with description | This is a description
Task four @work #urgent
Task five`;

      // Open bulk capture
      await page.click('[data-testid="bulk-capture"]');
      await expect(page.locator('[data-testid="bulk-capture-modal"]')).toBeVisible();

      await page.fill('[data-testid="bulk-text-input"]', bulkText);
      await page.click('[data-testid="import-tasks"]');

      // Should parse and create multiple tasks
      await expect(page.locator('[data-testid="import-success"]')).toContainText('5 tasks imported');

      // Verify tasks were created
      await expect(page.locator('[data-testid="task-item"]:has-text("Task one")')).toBeVisible();
      await expect(page.locator('[data-testid="task-item"]:has-text("Task two")')).toBeVisible();

      // Task with description should be parsed correctly
      const taskWithDesc = page.locator('[data-testid="task-item"]:has-text("Task three")');
      await taskWithDesc.click();
      await expect(page.locator('[data-testid="task-description"]')).toContainText('This is a description');

      // Task with context and tags should be parsed
      const taskWithTags = page.locator('[data-testid="task-item"]:has-text("Task four")');
      await taskWithTags.click();
      await expect(page.locator('[data-testid="task-context"]')).toContainText('work');
      await expect(page.locator('[data-testid="task-tag"]:has-text("urgent")')).toBeVisible();
    });
  });

  test.describe('Performance Testing', () => {
    test('should meet capture time requirements', async ({ page }) => {
      await page.goto('/dashboard');

      // Test multiple capture scenarios
      const scenarios = [
        { title: 'Simple task', expected: 2000 },
        { title: 'Task with context', context: 'office', expected: 3000 },
        { title: 'Complex task', description: 'Description', context: 'computer', tags: ['test'], expected: 5000 }
      ];

      for (const scenario of scenarios) {
        const { captureTime } = await helpers.captureTask(scenario.title, scenario);
        expect(captureTime).toBeLessThan(scenario.expected);
      }
    });

    test('should handle large numbers of tasks efficiently', async ({ page }) => {
      await page.goto('/dashboard');

      // Capture batch of tasks
      const startTime = Date.now();

      for (let i = 0; i < 20; i++) {
        await helpers.captureTask(`Batch task ${i + 1}`);
      }

      const totalTime = Date.now() - startTime;
      const averageTime = totalTime / 20;

      expect(averageTime).toBeLessThan(PERFORMANCE_THRESHOLDS.TASK_CAPTURE_MAX_TIME);

      // Interface should remain responsive
      await helpers.navigateToList('inbox');
      const loadTime = await helpers.measurePageLoadTime('/dashboard');
      expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.PAGE_LOAD_MAX_TIME);
    });

    test('should optimize for mobile performance', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/dashboard');

      // Mobile capture should be optimized
      const { captureTime } = await helpers.captureTask('Mobile test task');
      expect(captureTime).toBeLessThan(PERFORMANCE_THRESHOLDS.TASK_CAPTURE_MAX_TIME);

      // Touch interactions should be responsive
      const captureInput = page.locator('[data-testid="quick-capture-input"]');
      const inputBounds = await captureInput.boundingBox();
      expect(inputBounds?.height).toBeGreaterThanOrEqual(44); // Minimum touch target
    });
  });

  test.describe('Voice Input (Future Feature)', () => {
    test.skip('should support voice-to-text capture', async ({ page }) => {
      await page.goto('/dashboard');

      // This test would be implemented when voice input is added
      await page.click('[data-testid="voice-capture"]');
      await expect(page.locator('[data-testid="voice-recording"]')).toBeVisible();

      // Mock voice input would be transcribed to text
      // await mockVoiceInput('Call the dentist for appointment');
      // await expect(page.locator('[data-testid="voice-transcription"]')).toContainText('Call the dentist');
    });
  });

  test.describe('Smart Suggestions', () => {
    test('should suggest task properties based on content', async ({ page }) => {
      await page.goto('/dashboard');
      await page.click('[data-testid="expand-capture"]');

      // Type task that suggests context
      await page.fill('[data-testid="task-title-input"]', 'Call dentist for appointment');

      // Should suggest 'calls' context
      await expect(page.locator('[data-testid="suggested-context"]')).toContainText('calls');

      // Type task that suggests tags
      await page.fill('[data-testid="task-title-input"]', 'Urgent: Fix production bug');

      // Should suggest 'urgent' tag
      await expect(page.locator('[data-testid="suggested-tag"]')).toContainText('urgent');
    });

    test('should learn from user patterns', async ({ page }) => {
      await page.goto('/dashboard');

      // Create several tasks with similar patterns
      const workTasks = [
        'Send email to client about project',
        'Review email from stakeholder',
        'Draft email for team update'
      ];

      for (const task of workTasks) {
        await helpers.captureTask(task, { context: 'computer', tags: ['work', 'email'] });
      }

      // New similar task should get suggestions
      await page.click('[data-testid="expand-capture"]');
      await page.fill('[data-testid="task-title-input"]', 'Reply to email from manager');

      // Should suggest learned patterns
      await expect(page.locator('[data-testid="suggested-context"]')).toContainText('computer');
      await expect(page.locator('[data-testid="suggested-tag"]')).toContainText('work');
      await expect(page.locator('[data-testid="suggested-tag"]')).toContainText('email');
    });
  });

  test.describe('Accessibility', () => {
    test('should be keyboard accessible', async ({ page }) => {
      await page.goto('/dashboard');

      // Tab to capture input
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="quick-capture-input"]')).toBeFocused();

      // Type and submit with keyboard
      await page.keyboard.type('Keyboard test task');
      await page.keyboard.press('Enter');

      await expect(
        page.locator('[data-testid="task-item"]:has-text("Keyboard test task")')
      ).toBeVisible();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await page.goto('/dashboard');

      const captureInput = page.locator('[data-testid="quick-capture-input"]');
      await expect(captureInput).toHaveAttribute('aria-label');

      await page.click('[data-testid="expand-capture"]');
      await expect(page.locator('[data-testid="capture-modal"]')).toHaveAttribute('role', 'dialog');
      await expect(page.locator('[data-testid="capture-modal"]')).toHaveAttribute('aria-labelledby');
    });

    test('should announce capture success to screen readers', async ({ page }) => {
      await page.goto('/dashboard');

      await helpers.captureTask('Accessibility test task');

      // Success message should be announced
      const successMessage = page.locator('[data-testid="capture-success"]');
      await expect(successMessage).toHaveAttribute('role', 'status');
      await expect(successMessage).toHaveAttribute('aria-live', 'polite');
    });
  });
});