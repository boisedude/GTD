import { Page, expect, Locator } from '@playwright/test';
import {
  Task,
  Project,
  TaskStatus,
  TaskContext,
  TaskEnergyLevel,
  TaskDuration,
  CreateTaskInput
} from '../../src/types/database';

export class GTDTestHelpers {
  constructor(private page: Page) {}

  /**
   * Authentication helpers
   */
  async loginWithOTP(email: string) {
    await this.page.goto('/auth/login');
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.click('[data-testid="send-otp-button"]');

    // Wait for verification page
    await expect(this.page).toHaveURL(/\/auth\/verify/);

    // For tests, we'll use a known OTP code or mock the verification
    await this.page.fill('[data-testid="otp-input"]', '123456');
    await this.page.click('[data-testid="verify-otp-button"]');

    // Wait for successful login redirect
    await expect(this.page).toHaveURL(/\/dashboard/);

    // Verify authentication state
    await expect(this.page.locator('[data-testid="user-menu"]')).toBeVisible();
  }

  async logout() {
    await this.page.click('[data-testid="user-menu"]');
    await this.page.click('[data-testid="logout-button"]');
    await expect(this.page).toHaveURL('/');
  }

  async ensureAuthenticated() {
    // Check if we're already authenticated
    const userMenu = this.page.locator('[data-testid="user-menu"]');
    const isAuthenticated = await userMenu.isVisible().catch(() => false);

    if (!isAuthenticated) {
      await this.loginWithOTP('test@example.com');
    }
  }

  /**
   * Task management helpers
   */
  async captureTask(title: string, options: Partial<CreateTaskInput> = {}) {
    // Measure capture time for performance testing
    const startTime = Date.now();

    // Open quick capture (should be always visible)
    const captureInput = this.page.locator('[data-testid="quick-capture-input"]');
    await expect(captureInput).toBeVisible();

    await captureInput.fill(title);

    // Add additional options if provided
    if (options.description) {
      await this.page.click('[data-testid="capture-expand"]');
      await this.page.fill('[data-testid="task-description"]', options.description);
    }

    if (options.context) {
      await this.page.click('[data-testid="capture-expand"]');
      await this.page.selectOption('[data-testid="task-context"]', options.context);
    }

    if (options.tags && options.tags.length > 0) {
      await this.page.click('[data-testid="capture-expand"]');
      for (const tag of options.tags) {
        await this.page.fill('[data-testid="task-tags"]', `${tag} `);
      }
    }

    // Submit the task
    await this.page.keyboard.press('Enter');

    // Verify task was captured
    await expect(this.page.locator(`[data-testid="task-item"]:has-text("${title}")`)).toBeVisible();

    const captureTime = Date.now() - startTime;

    return { captureTime, title };
  }

  async updateTaskStatus(taskTitle: string, newStatus: TaskStatus) {
    const taskItem = this.page.locator(`[data-testid="task-item"]:has-text("${taskTitle}")`);
    await taskItem.click();

    await this.page.selectOption('[data-testid="task-status-select"]', newStatus);
    await this.page.click('[data-testid="save-task"]');

    // Verify status change
    await expect(
      this.page.locator(`[data-testid="task-item"][data-status="${newStatus}"]:has-text("${taskTitle}")`)
    ).toBeVisible();
  }

  async completeTask(taskTitle: string) {
    const taskItem = this.page.locator(`[data-testid="task-item"]:has-text("${taskTitle}")`);

    // Try swipe action first (mobile-friendly)
    const completeButton = taskItem.locator('[data-testid="complete-task"]');
    if (await completeButton.isVisible()) {
      await completeButton.click();
    } else {
      // Fallback to context menu
      await taskItem.click({ button: 'right' });
      await this.page.click('[data-testid="complete-task-context"]');
    }

    // Verify task is marked as completed
    await expect(
      this.page.locator(`[data-testid="task-item"][data-status="completed"]:has-text("${taskTitle}")`)
    ).toBeVisible();
  }

  async deleteTask(taskTitle: string) {
    const taskItem = this.page.locator(`[data-testid="task-item"]:has-text("${taskTitle}")`);
    await taskItem.click();

    await this.page.click('[data-testid="delete-task"]');
    await this.page.click('[data-testid="confirm-delete"]');

    // Verify task is removed
    await expect(taskItem).not.toBeVisible();
  }

  /**
   * GTD Organization helpers
   */
  async navigateToList(listName: 'inbox' | 'next-actions' | 'waiting-for' | 'someday' | 'projects') {
    await this.page.click(`[data-testid="nav-${listName}"]`);
    await expect(this.page).toHaveURL(new RegExp(`/${listName}`));
  }

  async moveTaskToList(taskTitle: string, targetList: TaskStatus) {
    const taskItem = this.page.locator(`[data-testid="task-item"]:has-text("${taskTitle}")`);

    // Drag and drop if supported
    const targetArea = this.page.locator(`[data-testid="list-${targetList}"]`);

    if (await targetArea.isVisible()) {
      await taskItem.dragTo(targetArea);
    } else {
      // Fallback to status update
      await this.updateTaskStatus(taskTitle, targetList);
    }

    // Verify task moved
    await this.navigateToList(targetList as any);
    await expect(
      this.page.locator(`[data-testid="task-item"]:has-text("${taskTitle}")`)
    ).toBeVisible();
  }

  async createProject(name: string) {
    await this.page.click('[data-testid="create-project"]');
    await this.page.fill('[data-testid="project-name"]', name);
    await this.page.click('[data-testid="save-project"]');

    // Verify project created
    await expect(
      this.page.locator(`[data-testid="project-item"]:has-text("${name}")`)
    ).toBeVisible();
  }

  async assignTaskToProject(taskTitle: string, projectName: string) {
    const taskItem = this.page.locator(`[data-testid="task-item"]:has-text("${taskTitle}")`);
    await taskItem.click();

    await this.page.selectOption('[data-testid="task-project"]', projectName);
    await this.page.click('[data-testid="save-task"]');

    // Verify assignment
    await expect(
      taskItem.locator(`[data-testid="task-project-badge"]:has-text("${projectName}")`)
    ).toBeVisible();
  }

  async filterTasks(filters: {
    context?: TaskContext;
    energy?: TaskEnergyLevel;
    duration?: TaskDuration;
    tags?: string[];
  }) {
    await this.page.click('[data-testid="filter-button"]');

    if (filters.context) {
      await this.page.selectOption('[data-testid="filter-context"]', filters.context);
    }

    if (filters.energy) {
      await this.page.selectOption('[data-testid="filter-energy"]', filters.energy);
    }

    if (filters.duration) {
      await this.page.selectOption('[data-testid="filter-duration"]', filters.duration);
    }

    if (filters.tags) {
      for (const tag of filters.tags) {
        await this.page.check(`[data-testid="filter-tag-${tag}"]`);
      }
    }

    await this.page.click('[data-testid="apply-filters"]');
  }

  async searchTasks(query: string) {
    await this.page.fill('[data-testid="search-input"]', query);
    await this.page.keyboard.press('Enter');

    // Return search results
    return this.page.locator('[data-testid="task-item"]');
  }

  /**
   * Review workflow helpers
   */
  async startDailyReview() {
    await this.page.goto('/dashboard/reviews');
    await this.page.click('[data-testid="start-daily-review"]');

    // Should navigate to review workflow
    await expect(this.page).toHaveURL(/\/dashboard\/reviews\/daily/);
    await expect(this.page.locator('[data-testid="review-progress"]')).toBeVisible();
  }

  async startWeeklyReview() {
    await this.page.goto('/dashboard/reviews');
    await this.page.click('[data-testid="start-weekly-review"]');

    // Should navigate to review workflow
    await expect(this.page).toHaveURL(/\/dashboard\/reviews\/weekly/);
    await expect(this.page.locator('[data-testid="review-progress"]')).toBeVisible();
  }

  async completeReviewStep() {
    await this.page.click('[data-testid="complete-step"]');

    // Wait for next step or completion
    await this.page.waitForTimeout(500);
  }

  async pauseReview() {
    await this.page.click('[data-testid="pause-review"]');
    await expect(this.page.locator('[data-testid="review-paused"]')).toBeVisible();
  }

  async resumeReview() {
    await this.page.click('[data-testid="resume-review"]');
    await expect(this.page.locator('[data-testid="review-active"]')).toBeVisible();
  }

  /**
   * Engagement interface helpers
   */
  async goToEngagement() {
    await this.page.goto('/engage');
    await expect(this.page.locator('[data-testid="engagement-dashboard"]')).toBeVisible();
  }

  async setEngagementContext(context: {
    location?: 'home' | 'office' | 'mobile';
    availableTime?: TaskDuration;
    energy?: TaskEnergyLevel;
  }) {
    if (context.location) {
      await this.page.selectOption('[data-testid="context-location"]', context.location);
    }

    if (context.availableTime) {
      await this.page.selectOption('[data-testid="context-time"]', context.availableTime);
    }

    if (context.energy) {
      await this.page.selectOption('[data-testid="context-energy"]', context.energy);
    }

    await this.page.click('[data-testid="update-context"]');
  }

  async getTaskSuggestions() {
    await this.page.click('[data-testid="get-suggestions"]');
    await expect(this.page.locator('[data-testid="task-suggestion"]')).toBeVisible();

    return this.page.locator('[data-testid="task-suggestion"]');
  }

  async startTimer(taskTitle: string) {
    const taskItem = this.page.locator(`[data-testid="task-item"]:has-text("${taskTitle}")`);
    await taskItem.locator('[data-testid="start-timer"]').click();

    await expect(this.page.locator('[data-testid="timer-active"]')).toBeVisible();
  }

  async stopTimer() {
    await this.page.click('[data-testid="stop-timer"]');
    await expect(this.page.locator('[data-testid="timer-stopped"]')).toBeVisible();
  }

  /**
   * Performance and accessibility helpers
   */
  async measurePageLoadTime(url: string) {
    const startTime = Date.now();
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
    return Date.now() - startTime;
  }

  async checkAccessibility() {
    // Basic accessibility checks
    const focusableElements = await this.page.locator('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])').count();
    expect(focusableElements).toBeGreaterThan(0);

    // Check for alt text on images
    const images = this.page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }

    // Check color contrast (simplified)
    const body = this.page.locator('body');
    const styles = await body.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        color: computed.color,
        backgroundColor: computed.backgroundColor
      };
    });

    expect(styles.color).toBeTruthy();
    expect(styles.backgroundColor).toBeTruthy();
  }

  async testKeyboardNavigation() {
    // Test tab navigation
    await this.page.keyboard.press('Tab');

    // Verify focus is visible
    const focusedElement = this.page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Test Enter key on focused element
    await this.page.keyboard.press('Enter');
  }

  /**
   * Mobile-specific helpers
   */
  async testMobileSwipeActions() {
    const taskItem = this.page.locator('[data-testid="task-item"]').first();

    // Swipe right to complete
    await taskItem.hover();
    await this.page.mouse.down();
    await this.page.mouse.move(100, 0);
    await this.page.mouse.up();

    // Check if swipe action was triggered
    await expect(this.page.locator('[data-testid="swipe-actions"]')).toBeVisible();
  }

  async testMobileCapture() {
    // Test mobile-optimized capture
    await this.page.setViewportSize({ width: 375, height: 667 });

    const captureInput = this.page.locator('[data-testid="quick-capture-input"]');
    await expect(captureInput).toBeVisible();

    // Test thumb-friendly interaction
    const inputBounds = await captureInput.boundingBox();
    expect(inputBounds?.height).toBeGreaterThanOrEqual(44); // Minimum touch target
  }

  /**
   * Offline functionality helpers
   */
  async testOfflineCapture() {
    // Simulate offline state
    await this.page.context().setOffline(true);

    // Try to capture task
    const result = await this.captureTask('Offline task test');

    // Should show offline indicator
    await expect(this.page.locator('[data-testid="offline-indicator"]')).toBeVisible();

    // Go back online
    await this.page.context().setOffline(false);

    // Wait for sync
    await expect(this.page.locator('[data-testid="sync-complete"]')).toBeVisible();

    return result;
  }

  /**
   * Data cleanup helpers
   */
  async cleanupTestData() {
    // This would typically call API endpoints to clean up test data
    // For now, we'll use UI cleanup

    // Delete all test tasks
    const testTasks = this.page.locator('[data-testid="task-item"]:has-text("test")');
    const count = await testTasks.count();

    for (let i = 0; i < count; i++) {
      await testTasks.first().click();
      await this.page.click('[data-testid="delete-task"]');
      await this.page.click('[data-testid="confirm-delete"]');
    }
  }
}

// Utility functions for test data
export function createTestTask(overrides: Partial<CreateTaskInput> = {}): CreateTaskInput {
  return {
    title: 'Test Task',
    description: 'Test task description',
    status: 'captured',
    context: 'anywhere',
    energy_level: 'medium',
    estimated_duration: '15min',
    priority: 3,
    tags: ['test'],
    ...overrides
  };
}

export function createTestProject(overrides: Partial<Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>> = {}) {
  return {
    name: 'Test Project',
    status: 'active' as const,
    ...overrides
  };
}

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  TASK_CAPTURE_MAX_TIME: 5000, // 5 seconds as per requirements
  PAGE_LOAD_MAX_TIME: 3000,
  SEARCH_RESPONSE_MAX_TIME: 1000,
  REVIEW_STEP_MAX_TIME: 2000
};

// Common test data
export const TEST_USERS = {
  STANDARD: 'test@example.com',
  PREMIUM: 'premium@example.com',
  NEW_USER: 'newuser@example.com'
};

export const TEST_TASKS = {
  SIMPLE: createTestTask({ title: 'Simple test task' }),
  COMPLEX: createTestTask({
    title: 'Complex test task',
    description: 'This is a complex task with many properties',
    context: 'office',
    energy_level: 'high',
    estimated_duration: '2hour+',
    priority: 1,
    tags: ['urgent', 'work', 'test']
  }),
  PROJECT_TASK: createTestTask({
    title: 'Project task',
    status: 'next_action',
    context: 'computer'
  })
};