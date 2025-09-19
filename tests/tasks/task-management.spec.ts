import { test, expect } from '@playwright/test';
import { GTDTestHelpers, PERFORMANCE_THRESHOLDS } from '../helpers/test-utils';
import { TEST_USERS, TEST_TASKS } from '../fixtures/test-data';

test.describe('Task Management', () => {
  let helpers: GTDTestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new GTDTestHelpers(page);
    await helpers.ensureAuthenticated();
  });

  test.afterEach(async () => {
    await helpers.cleanupTestData();
  });

  test.describe('Task Editing', () => {
    test('should open task detail modal', async ({ page }) => {
      await page.goto('/dashboard');

      // Create a task first
      await helpers.captureTask('Test task for editing');

      // Click on task to open detail modal
      const taskItem = page.locator('[data-testid="task-item"]:has-text("Test task for editing")');
      await taskItem.click();

      // Modal should open with task details
      await expect(page.locator('[data-testid="task-detail-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="task-title-input"]')).toHaveValue('Test task for editing');
      await expect(page.locator('[data-testid="task-description-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="task-context-select"]')).toBeVisible();
    });

    test('should update task title', async ({ page }) => {
      await page.goto('/dashboard');

      const originalTitle = 'Original task title';
      const newTitle = 'Updated task title';

      await helpers.captureTask(originalTitle);

      // Open task for editing
      const taskItem = page.locator(`[data-testid="task-item"]:has-text("${originalTitle}")`);
      await taskItem.click();

      // Update title
      await page.fill('[data-testid="task-title-input"]', newTitle);
      await page.click('[data-testid="save-task"]');

      // Verify title was updated
      await expect(page.locator(`[data-testid="task-item"]:has-text("${newTitle}")`)).toBeVisible();
      await expect(page.locator(`[data-testid="task-item"]:has-text("${originalTitle}")`)).not.toBeVisible();
    });

    test('should update task description', async ({ page }) => {
      await page.goto('/dashboard');

      await helpers.captureTask('Task with description');

      const taskItem = page.locator('[data-testid="task-item"]:has-text("Task with description")');
      await taskItem.click();

      const description = 'This is a detailed description of the task';
      await page.fill('[data-testid="task-description-input"]', description);
      await page.click('[data-testid="save-task"]');

      // Reopen task to verify description
      await taskItem.click();
      await expect(page.locator('[data-testid="task-description-input"]')).toHaveValue(description);
    });

    test('should update task properties', async ({ page }) => {
      await page.goto('/dashboard');

      await helpers.captureTask('Task for property updates');

      const taskItem = page.locator('[data-testid="task-item"]:has-text("Task for property updates")');
      await taskItem.click();

      // Update various properties
      await page.selectOption('[data-testid="task-context-select"]', 'office');
      await page.selectOption('[data-testid="task-energy-select"]', 'high');
      await page.selectOption('[data-testid="task-duration-select"]', '1hour');
      await page.selectOption('[data-testid="task-priority-select"]', '1');

      // Add tags
      await page.fill('[data-testid="task-tags-input"]', 'urgent work important ');

      await page.click('[data-testid="save-task"]');

      // Verify properties were saved
      await taskItem.click();
      await expect(page.locator('[data-testid="task-context-select"]')).toHaveValue('office');
      await expect(page.locator('[data-testid="task-energy-select"]')).toHaveValue('high');
      await expect(page.locator('[data-testid="task-duration-select"]')).toHaveValue('1hour');
      await expect(page.locator('[data-testid="task-priority-select"]')).toHaveValue('1');

      // Check tags
      await expect(page.locator('[data-testid="task-tag"]:has-text("urgent")')).toBeVisible();
      await expect(page.locator('[data-testid="task-tag"]:has-text("work")')).toBeVisible();
      await expect(page.locator('[data-testid="task-tag"]:has-text("important")')).toBeVisible();
    });

    test('should validate required fields during edit', async ({ page }) => {
      await page.goto('/dashboard');

      await helpers.captureTask('Task to validate');

      const taskItem = page.locator('[data-testid="task-item"]:has-text("Task to validate")');
      await taskItem.click();

      // Clear title (required field)
      await page.fill('[data-testid="task-title-input"]', '');
      await page.click('[data-testid="save-task"]');

      // Should show validation error
      await expect(page.locator('[data-testid="title-error"]')).toContainText('Title is required');
      await expect(page.locator('[data-testid="task-detail-modal"]')).toBeVisible(); // Modal should stay open
    });

    test('should cancel edit without saving', async ({ page }) => {
      await page.goto('/dashboard');

      const originalTitle = 'Original title';
      await helpers.captureTask(originalTitle);

      const taskItem = page.locator(`[data-testid="task-item"]:has-text("${originalTitle}")`);
      await taskItem.click();

      // Make changes but don't save
      await page.fill('[data-testid="task-title-input"]', 'Changed title');
      await page.fill('[data-testid="task-description-input"]', 'Changed description');

      // Cancel editing
      await page.click('[data-testid="cancel-edit"]');

      // Modal should close
      await expect(page.locator('[data-testid="task-detail-modal"]')).not.toBeVisible();

      // Changes should not be saved
      await expect(page.locator(`[data-testid="task-item"]:has-text("${originalTitle}")`)).toBeVisible();
      await expect(page.locator('[data-testid="task-item"]:has-text("Changed title")').first()).not.toBeVisible();
    });

    test('should auto-save drafts during editing', async ({ page }) => {
      await page.goto('/dashboard');

      await helpers.captureTask('Auto-save test task');

      const taskItem = page.locator('[data-testid="task-item"]:has-text("Auto-save test task")');
      await taskItem.click();

      // Start editing
      await page.fill('[data-testid="task-description-input"]', 'Draft description content');

      // Wait for auto-save
      await page.waitForTimeout(1000);

      // Close modal without explicitly saving
      await page.keyboard.press('Escape');

      // Reopen task - changes should be preserved
      await taskItem.click();
      await expect(page.locator('[data-testid="task-description-input"]')).toHaveValue('Draft description content');
    });
  });

  test.describe('Task Status Transitions', () => {
    test('should move task from captured to next action', async ({ page }) => {
      await page.goto('/dashboard');

      const taskTitle = 'Task to move to next action';
      await helpers.captureTask(taskTitle);

      // Initially in captured status
      await helpers.navigateToList('inbox');
      await expect(page.locator(`[data-testid="task-item"]:has-text("${taskTitle}")`)).toBeVisible();

      // Move to next action
      await helpers.updateTaskStatus(taskTitle, 'next_action');

      // Should appear in next actions list
      await helpers.navigateToList('next-actions');
      await expect(page.locator(`[data-testid="task-item"]:has-text("${taskTitle}")`)).toBeVisible();

      // Should not be in inbox anymore
      await helpers.navigateToList('inbox');
      await expect(page.locator(`[data-testid="task-item"]:has-text("${taskTitle}")`)).not.toBeVisible();
    });

    test('should move task to waiting for', async ({ page }) => {
      await page.goto('/dashboard');

      const taskTitle = 'Task waiting for response';
      await helpers.captureTask(taskTitle);

      await helpers.updateTaskStatus(taskTitle, 'waiting_for');

      // Should appear in waiting for list
      await helpers.navigateToList('waiting-for');
      await expect(page.locator(`[data-testid="task-item"]:has-text("${taskTitle}")`)).toBeVisible();
    });

    test('should move task to someday maybe', async ({ page }) => {
      await page.goto('/dashboard');

      const taskTitle = 'Maybe someday task';
      await helpers.captureTask(taskTitle);

      await helpers.updateTaskStatus(taskTitle, 'someday');

      // Should appear in someday list
      await helpers.navigateToList('someday');
      await expect(page.locator(`[data-testid="task-item"]:has-text("${taskTitle}")`)).toBeVisible();
    });

    test('should complete task', async ({ page }) => {
      await page.goto('/dashboard');

      const taskTitle = 'Task to complete';
      await helpers.captureTask(taskTitle);

      await helpers.completeTask(taskTitle);

      // Should show in completed tasks
      await page.click('[data-testid="show-completed"]');
      await expect(
        page.locator(`[data-testid="task-item"][data-status="completed"]:has-text("${taskTitle}")`)
      ).toBeVisible();

      // Should have completion timestamp
      const completedTask = page.locator(`[data-testid="task-item"]:has-text("${taskTitle}")`);
      await expect(completedTask.locator('[data-testid="completed-date"]')).toBeVisible();
    });

    test('should handle invalid status transitions', async ({ page }) => {
      await page.goto('/dashboard');

      const taskTitle = 'Invalid transition task';
      await helpers.captureTask(taskTitle);

      // Try to move to an invalid status (if validation exists)
      const taskItem = page.locator(`[data-testid="task-item"]:has-text("${taskTitle}")`);
      await taskItem.click();

      // If there are restrictions, test them
      // This would depend on your business logic
      await page.selectOption('[data-testid="task-status-select"]', 'completed');
      await page.click('[data-testid="save-task"]');

      // Task should complete successfully unless there are specific business rules
      await expect(
        page.locator(`[data-testid="task-item"][data-status="completed"]:has-text("${taskTitle}")`)
      ).toBeVisible();
    });

    test('should track status change history', async ({ page }) => {
      await page.goto('/dashboard');

      const taskTitle = 'Status history task';
      await helpers.captureTask(taskTitle);

      // Move through different statuses
      await helpers.updateTaskStatus(taskTitle, 'next_action');
      await helpers.updateTaskStatus(taskTitle, 'waiting_for');
      await helpers.updateTaskStatus(taskTitle, 'next_action');

      // Open task details
      const taskItem = page.locator(`[data-testid="task-item"]:has-text("${taskTitle}")`);
      await taskItem.click();

      // Check status history (if implemented)
      await page.click('[data-testid="show-history"]');
      await expect(page.locator('[data-testid="status-history"]')).toBeVisible();

      // Should show transitions
      await expect(page.locator('[data-testid="history-item"]:has-text("next_action")')).toBeVisible();
      await expect(page.locator('[data-testid="history-item"]:has-text("waiting_for")')).toBeVisible();
    });
  });

  test.describe('Task Completion', () => {
    test('should complete task with swipe action on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/dashboard');

      const taskTitle = 'Mobile swipe complete';
      await helpers.captureTask(taskTitle);

      // Test swipe to complete
      await helpers.testMobileSwipeActions();

      // Should show completion confirmation
      await expect(page.locator('[data-testid="task-completed-toast"]')).toBeVisible();
    });

    test('should show completion celebration', async ({ page }) => {
      await page.goto('/dashboard');

      const taskTitle = 'Celebration task';
      await helpers.captureTask(taskTitle);

      await helpers.completeTask(taskTitle);

      // Should show celebration animation/message
      await expect(page.locator('[data-testid="completion-celebration"]')).toBeVisible();
      await expect(page.locator('[data-testid="completion-message"]')).toContainText(/well done|completed|great job/i);
    });

    test('should handle bulk task completion', async ({ page }) => {
      await page.goto('/dashboard');

      // Create multiple tasks
      const tasks = ['Bulk task 1', 'Bulk task 2', 'Bulk task 3'];
      for (const task of tasks) {
        await helpers.captureTask(task);
      }

      // Select multiple tasks
      for (const task of tasks) {
        await page.locator(`[data-testid="task-item"]:has-text("${task}") [data-testid="task-checkbox"]`).check();
      }

      // Complete all selected
      await page.click('[data-testid="bulk-complete"]');
      await page.click('[data-testid="confirm-bulk-complete"]');

      // All tasks should be completed
      for (const task of tasks) {
        await expect(
          page.locator(`[data-testid="task-item"][data-status="completed"]:has-text("${task}")`)
        ).toBeVisible();
      }
    });

    test('should allow uncompleting tasks', async ({ page }) => {
      await page.goto('/dashboard');

      const taskTitle = 'Task to uncomplete';
      await helpers.captureTask(taskTitle);
      await helpers.completeTask(taskTitle);

      // Task should be completed
      await expect(
        page.locator(`[data-testid="task-item"][data-status="completed"]:has-text("${taskTitle}")`)
      ).toBeVisible();

      // Uncomplete the task
      const completedTask = page.locator(`[data-testid="task-item"]:has-text("${taskTitle}")`);
      await completedTask.click();
      await page.click('[data-testid="uncomplete-task"]');

      // Should be back to previous status
      await expect(
        page.locator(`[data-testid="task-item"][data-status="captured"]:has-text("${taskTitle}")`)
      ).toBeVisible();
    });
  });

  test.describe('Task Deletion', () => {
    test('should delete single task', async ({ page }) => {
      await page.goto('/dashboard');

      const taskTitle = 'Task to delete';
      await helpers.captureTask(taskTitle);

      await helpers.deleteTask(taskTitle);

      // Task should not be visible anywhere
      await expect(page.locator(`[data-testid="task-item"]:has-text("${taskTitle}")`)).not.toBeVisible();
    });

    test('should confirm before deleting', async ({ page }) => {
      await page.goto('/dashboard');

      const taskTitle = 'Confirm delete task';
      await helpers.captureTask(taskTitle);

      const taskItem = page.locator(`[data-testid="task-item"]:has-text("${taskTitle}")`);
      await taskItem.click();
      await page.click('[data-testid="delete-task"]');

      // Should show confirmation dialog
      await expect(page.locator('[data-testid="delete-confirmation"]')).toBeVisible();
      await expect(page.locator('[data-testid="delete-confirmation"]')).toContainText(taskTitle);

      // Cancel deletion
      await page.click('[data-testid="cancel-delete"]');
      await expect(page.locator('[data-testid="delete-confirmation"]')).not.toBeVisible();

      // Task should still exist
      await expect(taskItem).toBeVisible();
    });

    test('should handle bulk deletion', async ({ page }) => {
      await page.goto('/dashboard');

      // Create multiple tasks
      const tasks = ['Delete task 1', 'Delete task 2', 'Delete task 3'];
      for (const task of tasks) {
        await helpers.captureTask(task);
      }

      // Select multiple tasks
      for (const task of tasks) {
        await page.locator(`[data-testid="task-item"]:has-text("${task}") [data-testid="task-checkbox"]`).check();
      }

      // Delete all selected
      await page.click('[data-testid="bulk-delete"]');
      await page.click('[data-testid="confirm-bulk-delete"]');

      // All tasks should be deleted
      for (const task of tasks) {
        await expect(page.locator(`[data-testid="task-item"]:has-text("${task}")`)).not.toBeVisible();
      }
    });

    test('should provide undo for recently deleted tasks', async ({ page }) => {
      await page.goto('/dashboard');

      const taskTitle = 'Undo delete task';
      await helpers.captureTask(taskTitle);

      await helpers.deleteTask(taskTitle);

      // Should show undo option
      await expect(page.locator('[data-testid="delete-undo"]')).toBeVisible();
      await expect(page.locator('[data-testid="delete-undo"]')).toContainText(/undo|restore/i);

      // Click undo
      await page.click('[data-testid="delete-undo"]');

      // Task should be restored
      await expect(page.locator(`[data-testid="task-item"]:has-text("${taskTitle}")`)).toBeVisible();
    });
  });

  test.describe('Task Duplication', () => {
    test('should duplicate task', async ({ page }) => {
      await page.goto('/dashboard');

      const originalTitle = 'Original task';
      await helpers.captureTask(originalTitle, {
        description: 'Original description',
        context: 'office',
        tags: ['work', 'important']
      });

      // Duplicate task
      const taskItem = page.locator(`[data-testid="task-item"]:has-text("${originalTitle}")`);
      await taskItem.click();
      await page.click('[data-testid="duplicate-task"]');

      // Should create a new task with "Copy of" prefix
      await expect(page.locator(`[data-testid="task-item"]:has-text("Copy of ${originalTitle}")`)).toBeVisible();

      // Duplicated task should have same properties
      const duplicatedTask = page.locator(`[data-testid="task-item"]:has-text("Copy of ${originalTitle}")`);
      await duplicatedTask.click();

      await expect(page.locator('[data-testid="task-description-input"]')).toHaveValue('Original description');
      await expect(page.locator('[data-testid="task-context-select"]')).toHaveValue('office');
      await expect(page.locator('[data-testid="task-tag"]:has-text("work")')).toBeVisible();
      await expect(page.locator('[data-testid="task-tag"]:has-text("important")')).toBeVisible();
    });

    test('should create recurring task template', async ({ page }) => {
      await page.goto('/dashboard');

      const taskTitle = 'Weekly report';
      await helpers.captureTask(taskTitle, {
        description: 'Compile weekly status report',
        context: 'computer',
        estimated_duration: '1hour'
      });

      // Mark as recurring
      const taskItem = page.locator(`[data-testid="task-item"]:has-text("${taskTitle}")`);
      await taskItem.click();
      await page.check('[data-testid="make-recurring"]');
      await page.selectOption('[data-testid="recurring-frequency"]', 'weekly');
      await page.click('[data-testid="save-task"]');

      // Complete the current instance
      await helpers.completeTask(taskTitle);

      // Should automatically create next instance
      await expect(page.locator(`[data-testid="task-item"]:has-text("${taskTitle}")`)).toBeVisible();

      // New instance should have same properties but be uncompleted
      await taskItem.click();
      await expect(page.locator('[data-testid="task-status-select"]')).toHaveValue('captured');
    });
  });

  test.describe('Performance', () => {
    test('should handle task operations within performance thresholds', async ({ page }) => {
      await page.goto('/dashboard');

      // Test create performance
      const createStart = Date.now();
      await helpers.captureTask('Performance test task');
      const createTime = Date.now() - createStart;
      expect(createTime).toBeLessThan(PERFORMANCE_THRESHOLDS.TASK_CAPTURE_MAX_TIME);

      // Test edit performance
      const editStart = Date.now();
      const taskItem = page.locator('[data-testid="task-item"]:has-text("Performance test task")');
      await taskItem.click();
      await page.fill('[data-testid="task-description-input"]', 'Updated description');
      await page.click('[data-testid="save-task"]');
      const editTime = Date.now() - editStart;
      expect(editTime).toBeLessThan(3000); // 3 seconds for edit

      // Test status change performance
      const statusStart = Date.now();
      await helpers.updateTaskStatus('Performance test task', 'next_action');
      const statusTime = Date.now() - statusStart;
      expect(statusTime).toBeLessThan(2000); // 2 seconds for status change

      // Test delete performance
      const deleteStart = Date.now();
      await helpers.deleteTask('Performance test task');
      const deleteTime = Date.now() - deleteStart;
      expect(deleteTime).toBeLessThan(2000); // 2 seconds for delete
    });

    test('should maintain performance with large task lists', async ({ page }) => {
      await page.goto('/dashboard');

      // Create many tasks
      for (let i = 0; i < 50; i++) {
        await helpers.captureTask(`Bulk task ${i + 1}`);
        if (i % 10 === 0) {
          await page.waitForTimeout(100); // Small pause to avoid overwhelming
        }
      }

      // Test list navigation performance
      const navStart = Date.now();
      await helpers.navigateToList('inbox');
      const navTime = Date.now() - navStart;
      expect(navTime).toBeLessThan(PERFORMANCE_THRESHOLDS.PAGE_LOAD_MAX_TIME);

      // Test search performance
      const searchStart = Date.now();
      await helpers.searchTasks('Bulk task 25');
      const searchTime = Date.now() - searchStart;
      expect(searchTime).toBeLessThan(PERFORMANCE_THRESHOLDS.SEARCH_RESPONSE_MAX_TIME);
    });
  });
});