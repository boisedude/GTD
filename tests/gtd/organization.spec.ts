import { test, expect } from '@playwright/test';
import { GTDTestHelpers, PERFORMANCE_THRESHOLDS } from '../helpers/test-utils';
import { TEST_USERS, TEST_TASKS, TEST_FILTERS } from '../fixtures/test-data';

test.describe('GTD Organization', () => {
  let helpers: GTDTestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new GTDTestHelpers(page);
    await helpers.ensureAuthenticated();
  });

  test.afterEach(async () => {
    await helpers.cleanupTestData();
  });

  test.describe('GTD Lists Navigation', () => {
    test('should navigate to inbox', async ({ page }) => {
      await helpers.navigateToList('inbox');

      await expect(page).toHaveURL(/\/inbox/);
      await expect(page.locator('[data-testid="page-title"]')).toContainText('Inbox');
      await expect(page.locator('[data-testid="list-description"]')).toContainText('Capture and process items');
    });

    test('should navigate to next actions', async ({ page }) => {
      await helpers.navigateToList('next-actions');

      await expect(page).toHaveURL(/\/next-actions/);
      await expect(page.locator('[data-testid="page-title"]')).toContainText('Next Actions');
      await expect(page.locator('[data-testid="list-description"]')).toContainText('Ready to be acted upon');
    });

    test('should navigate to waiting for', async ({ page }) => {
      await helpers.navigateToList('waiting-for');

      await expect(page).toHaveURL(/\/waiting-for/);
      await expect(page.locator('[data-testid="page-title"]')).toContainText('Waiting For');
      await expect(page.locator('[data-testid="list-description"]')).toContainText('Waiting for others');
    });

    test('should navigate to someday maybe', async ({ page }) => {
      await helpers.navigateToList('someday');

      await expect(page).toHaveURL(/\/someday/);
      await expect(page.locator('[data-testid="page-title"]')).toContainText('Someday/Maybe');
      await expect(page.locator('[data-testid="list-description"]')).toContainText('Things to do someday');
    });

    test('should navigate to projects', async ({ page }) => {
      await helpers.navigateToList('projects');

      await expect(page).toHaveURL(/\/projects/);
      await expect(page.locator('[data-testid="page-title"]')).toContainText('Projects');
      await expect(page.locator('[data-testid="list-description"]')).toContainText('Multi-step outcomes');
    });

    test('should show active navigation state', async ({ page }) => {
      await helpers.navigateToList('next-actions');

      // Next Actions nav should be highlighted
      await expect(page.locator('[data-testid="nav-next-actions"]')).toHaveClass(/active|current|selected/);

      // Other nav items should not be active
      await expect(page.locator('[data-testid="nav-inbox"]')).not.toHaveClass(/active|current|selected/);
      await expect(page.locator('[data-testid="nav-waiting-for"]')).not.toHaveClass(/active|current|selected/);
    });

    test('should preserve navigation state on page reload', async ({ page }) => {
      await helpers.navigateToList('waiting-for');
      await page.reload();

      await expect(page).toHaveURL(/\/waiting-for/);
      await expect(page.locator('[data-testid="nav-waiting-for"]')).toHaveClass(/active|current|selected/);
    });
  });

  test.describe('Task Organization by Status', () => {
    test('should show tasks in appropriate lists', async ({ page }) => {
      // Create tasks with different statuses
      await helpers.captureTask('Inbox task', { status: 'captured' });
      await helpers.captureTask('Next action task', { status: 'next_action' });
      await helpers.captureTask('Waiting task', { status: 'waiting_for' });
      await helpers.captureTask('Someday task', { status: 'someday' });

      // Check inbox
      await helpers.navigateToList('inbox');
      await expect(page.locator('[data-testid="task-item"]:has-text("Inbox task")')).toBeVisible();
      await expect(page.locator('[data-testid="task-item"]:has-text("Next action task")')).not.toBeVisible();

      // Check next actions
      await helpers.navigateToList('next-actions');
      await expect(page.locator('[data-testid="task-item"]:has-text("Next action task")')).toBeVisible();
      await expect(page.locator('[data-testid="task-item"]:has-text("Inbox task")')).not.toBeVisible();

      // Check waiting for
      await helpers.navigateToList('waiting-for');
      await expect(page.locator('[data-testid="task-item"]:has-text("Waiting task")')).toBeVisible();

      // Check someday
      await helpers.navigateToList('someday');
      await expect(page.locator('[data-testid="task-item"]:has-text("Someday task")')).toBeVisible();
    });

    test('should move tasks between lists via drag and drop', async ({ page }) => {
      await page.goto('/dashboard');

      await helpers.captureTask('Drag and drop task');

      // Go to inbox
      await helpers.navigateToList('inbox');

      const taskItem = page.locator('[data-testid="task-item"]:has-text("Drag and drop task")');
      await expect(taskItem).toBeVisible();

      // Drag to next actions area (if drag-drop interface exists)
      const nextActionsDropZone = page.locator('[data-testid="drop-zone-next-actions"]');

      if (await nextActionsDropZone.isVisible()) {
        await taskItem.dragTo(nextActionsDropZone);

        // Verify task moved
        await helpers.navigateToList('next-actions');
        await expect(page.locator('[data-testid="task-item"]:has-text("Drag and drop task")')).toBeVisible();

        // Should not be in inbox anymore
        await helpers.navigateToList('inbox');
        await expect(page.locator('[data-testid="task-item"]:has-text("Drag and drop task")')).not.toBeVisible();
      } else {
        // Fallback to context menu or status change
        await helpers.moveTaskToList('Drag and drop task', 'next_action');
      }
    });

    test('should support keyboard navigation for task movement', async ({ page }) => {
      await page.goto('/dashboard');

      await helpers.captureTask('Keyboard move task');
      await helpers.navigateToList('inbox');

      const taskItem = page.locator('[data-testid="task-item"]:has-text("Keyboard move task")');
      await taskItem.focus();

      // Press keyboard shortcut to move (if implemented)
      await page.keyboard.press('M'); // Move menu
      await page.keyboard.press('N'); // Next actions

      // Verify task moved
      await helpers.navigateToList('next-actions');
      await expect(page.locator('[data-testid="task-item"]:has-text("Keyboard move task")')).toBeVisible();
    });

    test('should provide visual feedback during task movement', async ({ page }) => {
      await page.goto('/dashboard');

      await helpers.captureTask('Visual feedback task');
      await helpers.navigateToList('inbox');

      const taskItem = page.locator('[data-testid="task-item"]:has-text("Visual feedback task")');

      // Right-click for context menu
      await taskItem.click({ button: 'right' });
      await expect(page.locator('[data-testid="context-menu"]')).toBeVisible();

      // Select move option
      await page.click('[data-testid="move-to-next-actions"]');

      // Should show movement animation or feedback
      await expect(page.locator('[data-testid="task-moving"]')).toBeVisible();
      await expect(page.locator('[data-testid="move-success"]')).toBeVisible();
    });
  });

  test.describe('Project Management', () => {
    test('should create new project', async ({ page }) => {
      await helpers.navigateToList('projects');

      const projectName = 'Test Project';
      await helpers.createProject(projectName);

      // Verify project appears in list
      await expect(page.locator(`[data-testid="project-item"]:has-text("${projectName}")`)).toBeVisible();

      // Project should have default active status
      const projectItem = page.locator(`[data-testid="project-item"]:has-text("${projectName}")`);
      await expect(projectItem.locator('[data-testid="project-status"]')).toContainText('Active');
    });

    test('should assign tasks to projects', async ({ page }) => {
      // Create project first
      await helpers.navigateToList('projects');
      const projectName = 'Task Assignment Project';
      await helpers.createProject(projectName);

      // Create task
      await page.goto('/dashboard');
      const taskTitle = 'Project task';
      await helpers.captureTask(taskTitle);

      // Assign task to project
      await helpers.assignTaskToProject(taskTitle, projectName);

      // Verify assignment
      const taskItem = page.locator(`[data-testid="task-item"]:has-text("${taskTitle}")`);
      await expect(taskItem.locator(`[data-testid="task-project-badge"]:has-text("${projectName}")`)).toBeVisible();
    });

    test('should show project tasks count', async ({ page }) => {
      const projectName = 'Task Count Project';
      await helpers.navigateToList('projects');
      await helpers.createProject(projectName);

      // Create multiple tasks for the project
      const tasks = ['Project task 1', 'Project task 2', 'Project task 3'];
      await page.goto('/dashboard');

      for (const taskTitle of tasks) {
        await helpers.captureTask(taskTitle);
        await helpers.assignTaskToProject(taskTitle, projectName);
      }

      // Check project shows task count
      await helpers.navigateToList('projects');
      const projectItem = page.locator(`[data-testid="project-item"]:has-text("${projectName}")`);
      await expect(projectItem.locator('[data-testid="project-task-count"]')).toContainText('3');
    });

    test('should complete project', async ({ page }) => {
      const projectName = 'Completable Project';
      await helpers.navigateToList('projects');
      await helpers.createProject(projectName);

      // Complete the project
      const projectItem = page.locator(`[data-testid="project-item"]:has-text("${projectName}")`);
      await projectItem.click();
      await page.click('[data-testid="complete-project"]');

      // Project should show as completed
      await expect(projectItem.locator('[data-testid="project-status"]')).toContainText('Complete');

      // Should appear in completed projects filter
      await page.click('[data-testid="show-completed-projects"]');
      await expect(projectItem).toBeVisible();
    });

    test('should show project overview with task breakdown', async ({ page }) => {
      const projectName = 'Overview Project';
      await helpers.navigateToList('projects');
      await helpers.createProject(projectName);

      // Add tasks with different statuses
      await page.goto('/dashboard');
      await helpers.captureTask('Project task 1');
      await helpers.assignTaskToProject('Project task 1', projectName);
      await helpers.updateTaskStatus('Project task 1', 'next_action');

      await helpers.captureTask('Project task 2');
      await helpers.assignTaskToProject('Project task 2', projectName);
      await helpers.updateTaskStatus('Project task 2', 'waiting_for');

      // View project details
      await helpers.navigateToList('projects');
      const projectItem = page.locator(`[data-testid="project-item"]:has-text("${projectName}")`);
      await projectItem.click();

      // Should show task breakdown
      await expect(page.locator('[data-testid="project-overview"]')).toBeVisible();
      await expect(page.locator('[data-testid="next-actions-count"]')).toContainText('1');
      await expect(page.locator('[data-testid="waiting-for-count"]')).toContainText('1');
    });

    test('should handle project deletion with task reassignment', async ({ page }) => {
      const projectName = 'Deletable Project';
      await helpers.navigateToList('projects');
      await helpers.createProject(projectName);

      // Add task to project
      await page.goto('/dashboard');
      await helpers.captureTask('Orphaned task');
      await helpers.assignTaskToProject('Orphaned task', projectName);

      // Delete project
      await helpers.navigateToList('projects');
      const projectItem = page.locator(`[data-testid="project-item"]:has-text("${projectName}")`);
      await projectItem.click();
      await page.click('[data-testid="delete-project"]');

      // Should ask what to do with tasks
      await expect(page.locator('[data-testid="task-reassignment-modal"]')).toBeVisible();

      // Choose to unassign tasks
      await page.click('[data-testid="unassign-tasks"]');
      await page.click('[data-testid="confirm-delete-project"]');

      // Project should be deleted
      await expect(projectItem).not.toBeVisible();

      // Task should exist but without project assignment
      await page.goto('/dashboard');
      const taskItem = page.locator('[data-testid="task-item"]:has-text("Orphaned task")');
      await expect(taskItem).toBeVisible();
      await expect(taskItem.locator('[data-testid="task-project-badge"]')).not.toBeVisible();
    });
  });

  test.describe('Task Filtering', () => {
    test('should filter by context', async ({ page }) => {
      // Create tasks with different contexts
      await helpers.captureTask('Office task', { context: 'office' });
      await helpers.captureTask('Home task', { context: 'home' });
      await helpers.captureTask('Call task', { context: 'calls' });

      await page.goto('/dashboard');

      // Apply context filter
      await helpers.filterTasks({ context: 'office' });

      // Should only show office tasks
      await expect(page.locator('[data-testid="task-item"]:has-text("Office task")')).toBeVisible();
      await expect(page.locator('[data-testid="task-item"]:has-text("Home task")')).not.toBeVisible();
      await expect(page.locator('[data-testid="task-item"]:has-text("Call task")')).not.toBeVisible();

      // Clear filter
      await page.click('[data-testid="clear-filters"]');

      // All tasks should be visible again
      await expect(page.locator('[data-testid="task-item"]:has-text("Office task")')).toBeVisible();
      await expect(page.locator('[data-testid="task-item"]:has-text("Home task")')).toBeVisible();
      await expect(page.locator('[data-testid="task-item"]:has-text("Call task")')).toBeVisible();
    });

    test('should filter by energy level', async ({ page }) => {
      await helpers.captureTask('High energy task', { energy_level: 'high' });
      await helpers.captureTask('Low energy task', { energy_level: 'low' });

      await page.goto('/dashboard');

      await helpers.filterTasks({ energy: 'high' });

      await expect(page.locator('[data-testid="task-item"]:has-text("High energy task")')).toBeVisible();
      await expect(page.locator('[data-testid="task-item"]:has-text("Low energy task")')).not.toBeVisible();
    });

    test('should filter by estimated duration', async ({ page }) => {
      await helpers.captureTask('Quick task', { estimated_duration: '5min' });
      await helpers.captureTask('Long task', { estimated_duration: '2hour+' });

      await page.goto('/dashboard');

      await helpers.filterTasks({ duration: '5min' });

      await expect(page.locator('[data-testid="task-item"]:has-text("Quick task")')).toBeVisible();
      await expect(page.locator('[data-testid="task-item"]:has-text("Long task")')).not.toBeVisible();
    });

    test('should filter by tags', async ({ page }) => {
      await helpers.captureTask('Work task', { tags: ['work', 'urgent'] });
      await helpers.captureTask('Personal task', { tags: ['personal', 'home'] });

      await page.goto('/dashboard');

      await helpers.filterTasks({ tags: ['work'] });

      await expect(page.locator('[data-testid="task-item"]:has-text("Work task")')).toBeVisible();
      await expect(page.locator('[data-testid="task-item"]:has-text("Personal task")')).not.toBeVisible();
    });

    test('should combine multiple filters', async ({ page }) => {
      await helpers.captureTask('Office urgent task', {
        context: 'office',
        energy_level: 'high',
        tags: ['urgent']
      });
      await helpers.captureTask('Office normal task', {
        context: 'office',
        energy_level: 'medium',
        tags: ['normal']
      });

      await page.goto('/dashboard');

      // Apply multiple filters
      await helpers.filterTasks({
        context: 'office',
        energy: 'high',
        tags: ['urgent']
      });

      await expect(page.locator('[data-testid="task-item"]:has-text("Office urgent task")')).toBeVisible();
      await expect(page.locator('[data-testid="task-item"]:has-text("Office normal task")')).not.toBeVisible();
    });

    test('should show filter count and active filters', async ({ page }) => {
      await helpers.captureTask('Filtered task', { context: 'office', tags: ['work'] });

      await page.goto('/dashboard');

      await helpers.filterTasks({ context: 'office', tags: ['work'] });

      // Should show active filter badges
      await expect(page.locator('[data-testid="active-filter"]:has-text("office")')).toBeVisible();
      await expect(page.locator('[data-testid="active-filter"]:has-text("work")')).toBeVisible();

      // Should show result count
      await expect(page.locator('[data-testid="filter-result-count"]')).toContainText('1 task');
    });

    test('should save and restore filter preferences', async ({ page }) => {
      await page.goto('/dashboard');

      // Apply filters
      await helpers.filterTasks({ context: 'office', energy: 'high' });

      // Navigate away and back
      await helpers.navigateToList('projects');
      await helpers.navigateToList('next-actions');

      // Filters should be preserved
      await expect(page.locator('[data-testid="active-filter"]:has-text("office")')).toBeVisible();
      await expect(page.locator('[data-testid="active-filter"]:has-text("high")')).toBeVisible();
    });
  });

  test.describe('Search Functionality', () => {
    test('should search tasks by title', async ({ page }) => {
      await helpers.captureTask('Important meeting preparation');
      await helpers.captureTask('Grocery shopping list');
      await helpers.captureTask('Meeting room booking');

      await page.goto('/dashboard');

      const results = await helpers.searchTasks('meeting');

      // Should find tasks containing "meeting"
      await expect(results.filter({ hasText: 'Important meeting preparation' })).toBeVisible();
      await expect(results.filter({ hasText: 'Meeting room booking' })).toBeVisible();
      await expect(results.filter({ hasText: 'Grocery shopping list' })).not.toBeVisible();
    });

    test('should search tasks by description', async ({ page }) => {
      await helpers.captureTask('Task 1', { description: 'Prepare quarterly budget report' });
      await helpers.captureTask('Task 2', { description: 'Schedule team meeting' });

      await page.goto('/dashboard');

      const results = await helpers.searchTasks('budget');

      await expect(results.filter({ hasText: 'Task 1' })).toBeVisible();
      await expect(results.filter({ hasText: 'Task 2' })).not.toBeVisible();
    });

    test('should search tasks by tags', async ({ page }) => {
      await helpers.captureTask('Tagged task', { tags: ['urgent', 'client'] });
      await helpers.captureTask('Other task', { tags: ['normal'] });

      await page.goto('/dashboard');

      const results = await helpers.searchTasks('urgent');

      await expect(results.filter({ hasText: 'Tagged task' })).toBeVisible();
      await expect(results.filter({ hasText: 'Other task' })).not.toBeVisible();
    });

    test('should handle fuzzy search', async ({ page }) => {
      await helpers.captureTask('Schedule appointment with dentist');

      await page.goto('/dashboard');

      // Fuzzy search with typo
      const results = await helpers.searchTasks('apointment');

      // Should still find the task
      await expect(results.filter({ hasText: 'Schedule appointment with dentist' })).toBeVisible();
    });

    test('should search across all lists', async ({ page }) => {
      await helpers.captureTask('Inbox search task', { status: 'captured' });
      await helpers.captureTask('Next action search task', { status: 'next_action' });
      await helpers.captureTask('Waiting search task', { status: 'waiting_for' });

      await page.goto('/dashboard');

      const results = await helpers.searchTasks('search');

      // Should find tasks from all statuses
      await expect(results.filter({ hasText: 'Inbox search task' })).toBeVisible();
      await expect(results.filter({ hasText: 'Next action search task' })).toBeVisible();
      await expect(results.filter({ hasText: 'Waiting search task' })).toBeVisible();
    });

    test('should highlight search terms', async ({ page }) => {
      await helpers.captureTask('Important deadline approaching');

      await page.goto('/dashboard');

      await helpers.searchTasks('deadline');

      // Search term should be highlighted
      const searchResult = page.locator('[data-testid="task-item"]:has-text("Important deadline approaching")');
      await expect(searchResult.locator('[data-testid="search-highlight"]')).toContainText('deadline');
    });

    test('should show search suggestions', async ({ page }) => {
      await helpers.captureTask('Email client about project');
      await helpers.captureTask('Email team about meeting');

      await page.goto('/dashboard');

      // Start typing search query
      await page.fill('[data-testid="search-input"]', 'ema');

      // Should show suggestions
      await expect(page.locator('[data-testid="search-suggestions"]')).toBeVisible();
      await expect(page.locator('[data-testid="search-suggestion"]:has-text("email")')).toBeVisible();
    });

    test('should perform fast search', async ({ page }) => {
      // Create multiple tasks
      for (let i = 0; i < 20; i++) {
        await helpers.captureTask(`Search test task ${i + 1}`);
      }

      await page.goto('/dashboard');

      const searchStart = Date.now();
      await helpers.searchTasks('test task 15');
      const searchTime = Date.now() - searchStart;

      expect(searchTime).toBeLessThan(PERFORMANCE_THRESHOLDS.SEARCH_RESPONSE_MAX_TIME);
    });
  });

  test.describe('List Management', () => {
    test('should show task counts for each list', async ({ page }) => {
      // Create tasks in different lists
      await helpers.captureTask('Inbox task 1', { status: 'captured' });
      await helpers.captureTask('Inbox task 2', { status: 'captured' });
      await helpers.captureTask('Next action task', { status: 'next_action' });

      await page.goto('/dashboard');

      // Check navigation shows counts
      await expect(page.locator('[data-testid="nav-inbox"] [data-testid="task-count"]')).toContainText('2');
      await expect(page.locator('[data-testid="nav-next-actions"] [data-testid="task-count"]')).toContainText('1');
      await expect(page.locator('[data-testid="nav-waiting-for"] [data-testid="task-count"]')).toContainText('0');
    });

    test('should support list-specific views', async ({ page }) => {
      await helpers.navigateToList('next-actions');

      // Should show context-specific options for next actions
      await expect(page.locator('[data-testid="context-filter"]')).toBeVisible();
      await expect(page.locator('[data-testid="energy-filter"]')).toBeVisible();
      await expect(page.locator('[data-testid="duration-filter"]')).toBeVisible();

      await helpers.navigateToList('waiting-for');

      // Should show waiting-for specific options
      await expect(page.locator('[data-testid="follow-up-date"]')).toBeVisible();
      await expect(page.locator('[data-testid="waiting-for-who"]')).toBeVisible();
    });

    test('should support custom list sorting', async ({ page }) => {
      // Create tasks with different priorities and dates
      await helpers.captureTask('High priority task', { priority: 1 });
      await helpers.captureTask('Low priority task', { priority: 5 });
      await helpers.captureTask('Medium priority task', { priority: 3 });

      await page.goto('/dashboard');

      // Sort by priority
      await page.click('[data-testid="sort-options"]');
      await page.click('[data-testid="sort-by-priority"]');

      // Tasks should be sorted by priority
      const tasks = page.locator('[data-testid="task-item"]');
      await expect(tasks.first()).toContainText('High priority task');
      await expect(tasks.last()).toContainText('Low priority task');

      // Sort by title
      await page.click('[data-testid="sort-options"]');
      await page.click('[data-testid="sort-by-title"]');

      // Tasks should be sorted alphabetically
      const sortedTasks = page.locator('[data-testid="task-item"]');
      await expect(sortedTasks.first()).toContainText('High priority task'); // Alphabetically first
    });

    test('should support bulk operations', async ({ page }) => {
      // Create multiple tasks
      const tasks = ['Bulk task 1', 'Bulk task 2', 'Bulk task 3'];
      for (const task of tasks) {
        await helpers.captureTask(task);
      }

      await page.goto('/dashboard');

      // Select multiple tasks
      for (const task of tasks) {
        await page.locator(`[data-testid="task-item"]:has-text("${task}") [data-testid="task-checkbox"]`).check();
      }

      // Bulk operations should be available
      await expect(page.locator('[data-testid="bulk-actions"]')).toBeVisible();
      await expect(page.locator('[data-testid="bulk-move"]')).toBeVisible();
      await expect(page.locator('[data-testid="bulk-complete"]')).toBeVisible();
      await expect(page.locator('[data-testid="bulk-delete"]')).toBeVisible();

      // Test bulk move
      await page.click('[data-testid="bulk-move"]');
      await page.click('[data-testid="move-to-next-actions"]');

      // All selected tasks should move
      await helpers.navigateToList('next-actions');
      for (const task of tasks) {
        await expect(page.locator(`[data-testid="task-item"]:has-text("${task}")`)).toBeVisible();
      }
    });
  });

  test.describe('Mobile Organization Interface', () => {
    test('should work on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/dashboard');

      // Mobile navigation should be accessible
      await page.click('[data-testid="mobile-menu"]');
      await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();

      // Navigate to lists on mobile
      await page.click('[data-testid="mobile-nav-next-actions"]');
      await expect(page).toHaveURL(/\/next-actions/);

      // Mobile task operations should work
      await helpers.captureTask('Mobile test task');
      await helpers.testMobileSwipeActions();
    });

    test('should support mobile-friendly interactions', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/dashboard');

      await helpers.captureTask('Mobile interaction task');

      // Task items should be thumb-friendly
      const taskItem = page.locator('[data-testid="task-item"]:has-text("Mobile interaction task")');
      const taskBounds = await taskItem.boundingBox();
      expect(taskBounds?.height).toBeGreaterThanOrEqual(44); // Minimum touch target

      // Mobile context menu should work
      await taskItem.press('Space'); // Long press equivalent
      await expect(page.locator('[data-testid="mobile-context-menu"]')).toBeVisible();
    });
  });
});