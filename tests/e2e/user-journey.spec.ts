import { test, expect } from '@playwright/test';
import { GTDTestHelpers } from '../helpers/test-utils';
import { TEST_USERS } from '../fixtures/test-data';

test.describe('End-to-End User Journeys', () => {
  let helpers: GTDTestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new GTDTestHelpers(page);
  });

  test.describe('Complete GTD Workflow', () => {
    test('should complete full GTD workflow from capture to engagement', async ({ page }) => {
      console.log('🎯 Testing complete GTD workflow...');

      // 1. Authentication
      await helpers.loginWithOTP(TEST_USERS.standard.email!);
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

      // 2. Capture Phase
      console.log('📝 Phase 1: Capture');
      const tasks = [
        { title: 'Call dentist for appointment', context: 'calls' },
        { title: 'Write quarterly report', context: 'computer' },
        { title: 'Buy groceries for dinner party', context: 'errands' },
        { title: 'Research vacation destinations', context: 'computer' },
        { title: 'Fix leaky faucet', context: 'home' }
      ];

      for (const task of tasks) {
        await helpers.captureTask(task.title, { context: task.context as any });
      }

      // Verify all tasks are in inbox
      await helpers.navigateToList('inbox');
      for (const task of tasks) {
        await expect(page.locator(`[data-testid="task-item"]:has-text("${task.title}")`)).toBeVisible();
      }

      // 3. Clarify Phase
      console.log('💭 Phase 2: Clarify');

      // Process each inbox item
      await helpers.updateTaskStatus('Call dentist for appointment', 'next_action');
      await helpers.updateTaskStatus('Write quarterly report', 'project');
      await helpers.updateTaskStatus('Buy groceries for dinner party', 'next_action');
      await helpers.updateTaskStatus('Research vacation destinations', 'someday');

      // 4. Organize Phase
      console.log('📋 Phase 3: Organize');

      // Create project for quarterly report
      await helpers.navigateToList('projects');
      await helpers.createProject('Q4 Quarterly Report');

      // Assign tasks to project
      await page.goto('/dashboard');
      await helpers.captureTask('Gather Q4 metrics', { status: 'next_action' });
      await helpers.assignTaskToProject('Gather Q4 metrics', 'Q4 Quarterly Report');

      // Organize by context
      await helpers.navigateToList('next-actions');
      await helpers.filterTasks({ context: 'calls' });
      await expect(page.locator('[data-testid="task-item"]:has-text("Call dentist")')).toBeVisible();

      // 5. Reflect Phase (Weekly Review)
      console.log('🔍 Phase 4: Reflect');

      await helpers.startWeeklyReview();

      // Complete review steps
      for (let step = 0; step < 5; step++) {
        await helpers.completeReviewStep();
        await page.waitForTimeout(500);
      }

      // Verify review completion
      await expect(page.locator('[data-testid="review-completed"]')).toBeVisible();

      // 6. Engage Phase
      console.log('⚡ Phase 5: Engage');

      await helpers.goToEngagement();

      // Set context and get recommendations
      await helpers.setEngagementContext({
        location: 'office',
        availableTime: '30min',
        energy: 'medium'
      });

      const suggestions = await helpers.getTaskSuggestions();
      await expect(suggestions.first()).toBeVisible();

      // Start working on suggested task
      const firstSuggestion = suggestions.first();
      const taskTitle = await firstSuggestion.locator('[data-testid="task-title"]').textContent();

      await helpers.startTimer(taskTitle!);
      await expect(page.locator('[data-testid="timer-active"]')).toBeVisible();

      // Complete task
      await page.waitForTimeout(2000); // Work for 2 seconds
      await helpers.stopTimer();
      await page.click('[data-testid="complete-task-option"]');

      // Verify task completion
      await expect(page.locator('[data-testid="task-completed-notification"]')).toBeVisible();

      console.log('✅ Complete GTD workflow test passed!');
    });
  });

  test.describe('New User Onboarding Journey', () => {
    test('should guide new user through complete onboarding', async ({ page }) => {
      console.log('👋 Testing new user onboarding journey...');

      // Start as new user
      await page.goto('/');
      await page.click('[data-testid="get-started-free"]');

      // Login flow
      await page.fill('[data-testid="email-input"]', TEST_USERS.newUser.email!);
      await page.click('[data-testid="send-otp-button"]');

      await page.fill('[data-testid="otp-input"]', '123456');
      await page.click('[data-testid="verify-otp-button"]');

      // Should redirect to onboarding
      await expect(page).toHaveURL(/\/onboarding/);

      // Complete onboarding steps
      await expect(page.locator('[data-testid="onboarding-welcome"]')).toBeVisible();
      await page.click('[data-testid="start-onboarding"]');

      // GTD Introduction
      await expect(page.locator('[data-testid="gtd-introduction"]')).toBeVisible();
      await page.click('[data-testid="next-step"]');

      // Interactive tutorial
      await expect(page.locator('[data-testid="tutorial-capture"]')).toBeVisible();

      // Practice capturing a task
      await page.fill('[data-testid="tutorial-task-input"]', 'My first task');
      await page.click('[data-testid="tutorial-capture-button"]');
      await expect(page.locator('[data-testid="tutorial-success"]')).toBeVisible();

      await page.click('[data-testid="next-step"]');

      // Complete onboarding
      await page.click('[data-testid="complete-onboarding"]');

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/dashboard/);
      await expect(page.locator('[data-testid="onboarding-complete-message"]')).toBeVisible();

      // Test first real task capture
      await helpers.captureTask('My second task after onboarding');
      await expect(page.locator('[data-testid="task-item"]:has-text("My second task")')).toBeVisible();

      console.log('✅ New user onboarding journey test passed!');
    });
  });

  test.describe('Power User Daily Routine', () => {
    test('should support power user daily routine', async ({ page }) => {
      console.log('🚀 Testing power user daily routine...');

      await helpers.ensureAuthenticated();

      // Morning routine: Daily review
      console.log('🌅 Morning: Daily Review');
      await helpers.startDailyReview();

      // Quick daily review
      for (let step = 0; step < 6; step++) {
        await helpers.completeReviewStep();
      }

      // Rapid task capture during the day
      console.log('💨 Midday: Rapid Task Capture');
      const rapidTasks = [
        'Email follow-up with client',
        'Schedule team meeting',
        'Review design mockups',
        'Call IT support',
        'Update project timeline'
      ];

      const captureStart = Date.now();
      for (const task of rapidTasks) {
        await helpers.captureTask(task);
      }
      const captureTime = Date.now() - captureStart;

      // Should complete all captures quickly
      expect(captureTime).toBeLessThan(15000); // 15 seconds for 5 tasks

      // Quick task processing using keyboard shortcuts
      console.log('⌨️ Quick Processing with Shortcuts');

      await page.keyboard.press('g');
      await page.keyboard.press('i'); // Go to inbox

      // Process tasks with keyboard
      await page.keyboard.press('j'); // Navigate down
      await page.keyboard.press('n'); // Mark as next action

      await page.keyboard.press('j'); // Navigate down
      await page.keyboard.press('w'); // Mark as waiting for

      // Context-based work session
      console.log('📞 Context-based Work Session');
      await helpers.goToEngagement();

      await helpers.setEngagementContext({
        location: 'office',
        availableTime: '1hour',
        energy: 'high'
      });

      // Work on high-energy tasks
      const suggestions = await helpers.getTaskSuggestions();
      const highEnergyTask = suggestions.first();

      await highEnergyTask.locator('[data-testid="quick-start"]').click();
      await expect(page.locator('[data-testid="timer-active"]')).toBeVisible();

      // Bulk operations for end of day cleanup
      console.log('🧹 End of Day: Bulk Operations');
      await page.goto('/dashboard');

      // Select multiple completed tasks
      const taskItems = page.locator('[data-testid="task-item"]');
      const count = Math.min(await taskItems.count(), 3);

      for (let i = 0; i < count; i++) {
        await taskItems.nth(i).locator('[data-testid="task-checkbox"]').check();
      }

      // Bulk complete
      await page.click('[data-testid="bulk-complete"]');
      await page.click('[data-testid="confirm-bulk-complete"]');

      console.log('✅ Power user daily routine test passed!');
    });
  });

  test.describe('Mobile-First User Journey', () => {
    test('should work seamlessly on mobile device', async ({ page }) => {
      console.log('📱 Testing mobile-first user journey...');

      await page.setViewportSize({ width: 375, height: 667 });

      await helpers.ensureAuthenticated();

      // Mobile task capture on the go
      console.log('🏃 Mobile Capture on the Go');
      await page.goto('/dashboard');

      // Quick capture should be prominent
      const captureInput = page.locator('[data-testid="quick-capture-input"]');
      await expect(captureInput).toBeVisible();

      // Test thumb-friendly capture
      await helpers.testMobileCapture();

      // Voice-style rapid input
      const quickTasks = [
        'Pick up dry cleaning',
        'Gas station stop',
        'Call mom',
        'Pharmacy prescription'
      ];

      for (const task of quickTasks) {
        await captureInput.fill(task);
        await page.keyboard.press('Enter');
        await expect(page.locator(`[data-testid="task-item"]:has-text("${task}")`)).toBeVisible();
      }

      // Mobile navigation
      console.log('📲 Mobile Navigation');
      await page.click('[data-testid="mobile-menu"]');
      await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();

      await page.click('[data-testid="mobile-nav-next-actions"]');
      await expect(page).toHaveURL(/\/next-actions/);

      // Mobile swipe actions
      console.log('👆 Mobile Swipe Actions');
      await helpers.testMobileSwipeActions();

      // Mobile engagement interface
      console.log('⚡ Mobile Engagement');
      await page.click('[data-testid="mobile-nav-engage"]');

      await helpers.setEngagementContext({
        location: 'mobile',
        availableTime: '5min',
        energy: 'low'
      });

      const mobileSuggestions = await helpers.getTaskSuggestions();
      await expect(mobileSuggestions.first()).toBeVisible();

      // Touch-friendly task completion
      const suggestion = mobileSuggestions.first();
      await suggestion.locator('[data-testid="quick-complete"]').click();
      await page.click('[data-testid="confirm-quick-complete"]');

      console.log('✅ Mobile-first user journey test passed!');
    });
  });

  test.describe('Accessibility User Journey', () => {
    test('should be fully accessible via keyboard and screen reader', async ({ page }) => {
      console.log('♿ Testing accessibility user journey...');

      await helpers.ensureAuthenticated();

      // Keyboard-only navigation
      console.log('⌨️ Keyboard-only Navigation');
      await page.goto('/dashboard');

      // Tab through main interface
      await page.keyboard.press('Tab'); // Capture input
      await expect(page.locator('[data-testid="quick-capture-input"]')).toBeFocused();

      await page.keyboard.press('Tab'); // Navigation
      await expect(page.locator('[data-testid="nav-inbox"]')).toBeFocused();

      // Navigate with keyboard
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/\/inbox/);

      // Keyboard task operations
      console.log('📝 Keyboard Task Operations');
      await page.keyboard.press('c'); // Capture shortcut
      await expect(page.locator('[data-testid="quick-capture-input"]')).toBeFocused();

      await page.keyboard.type('Accessibility test task');
      await page.keyboard.press('Enter');

      // Navigate to task and edit with keyboard
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      const taskItem = page.locator('[data-testid="task-item"]:has-text("Accessibility test task")');
      await taskItem.focus();
      await page.keyboard.press('Enter');

      // Should open task details
      await expect(page.locator('[data-testid="task-detail-modal"]')).toBeVisible();

      // Escape to close
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-testid="task-detail-modal"]')).not.toBeVisible();

      // Screen reader announcements
      console.log('📢 Screen Reader Announcements');
      await helpers.captureTask('Screen reader test');

      // Success should be announced
      const successMessage = page.locator('[data-testid="capture-success"]');
      await expect(successMessage).toHaveAttribute('aria-live', 'polite');

      // High contrast mode
      console.log('🎨 High Contrast Mode');
      await page.emulateMedia({ forcedColors: 'active' });

      // Interface should remain functional
      await expect(page.locator('[data-testid="quick-capture-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="main-navigation"]')).toBeVisible();

      console.log('✅ Accessibility user journey test passed!');
    });
  });

  test.describe('Performance Under Load Journey', () => {
    test('should maintain performance with realistic data load', async ({ page }) => {
      console.log('⚡ Testing performance under realistic load...');

      await helpers.ensureAuthenticated();

      // Create realistic dataset
      console.log('📊 Creating Realistic Dataset');
      const dataSetup = Date.now();

      // Simulate 6 months of usage
      for (let week = 0; week < 24; week++) {
        for (let day = 0; day < 5; day++) {
          const taskIndex = week * 5 + day;
          await helpers.captureTask(`Week ${week + 1} Day ${day + 1} Task`, {
            status: taskIndex % 3 === 0 ? 'completed' : 'next_action',
            context: ['office', 'home', 'calls', 'errands'][taskIndex % 4] as any,
            tags: [`week${week}`, `priority${taskIndex % 3}`]
          });
        }

        // Batch processing to avoid overwhelming
        if (week % 4 === 0) {
          await page.waitForTimeout(100);
        }
      }

      const setupTime = Date.now() - dataSetup;
      console.log(`Dataset creation took ${setupTime}ms`);

      // Test performance with large dataset
      console.log('🔍 Testing Performance with Large Dataset');

      // Navigation performance
      const navStart = Date.now();
      await helpers.navigateToList('next-actions');
      const navTime = Date.now() - navStart;
      console.log(`Navigation time: ${navTime}ms`);
      expect(navTime).toBeLessThan(3000);

      // Search performance
      const searchStart = Date.now();
      await helpers.searchTasks('Week 12');
      const searchTime = Date.now() - searchStart;
      console.log(`Search time: ${searchTime}ms`);
      expect(searchTime).toBeLessThan(2000);

      // Filter performance
      const filterStart = Date.Now();
      await helpers.filterTasks({ context: 'office', tags: ['priority1'] });
      const filterTime = Date.now() - filterStart;
      console.log(`Filter time: ${filterTime}ms`);
      expect(filterTime).toBeLessThan(2000);

      // Capture performance with large dataset
      const captureStart = Date.now();
      await helpers.captureTask('Performance test with large dataset');
      const captureTime = Date.now() - captureStart;
      console.log(`Capture time with large dataset: ${captureTime}ms`);
      expect(captureTime).toBeLessThan(5000);

      console.log('✅ Performance under load journey test passed!');
    });
  });

  test.afterEach(async ({ page }) => {
    // Clean up any test data
    try {
      await helpers.cleanupTestData();
    } catch (error) {
      console.warn('Cleanup warning:', error);
    }
  });
});