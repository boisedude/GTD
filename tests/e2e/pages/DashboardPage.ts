import { Page, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class DashboardPage extends BasePage {
  readonly captureInput = this.page.getByTestId('capture-input')
  readonly addTaskButton = this.page.getByRole('button', { name: /add task/i })
  readonly detailsButton = this.page.getByRole('button', { name: /details/i })
  readonly userMenu = this.page.getByTestId('user-menu')
  readonly sidebarToggle = this.page.getByTestId('sidebar-toggle')

  // GTD Lists
  readonly capturedList = this.page.getByTestId('captured-list')
  readonly nextActionsList = this.page.getByTestId('next-actions-list')
  readonly projectsList = this.page.getByTestId('projects-list')
  readonly waitingForList = this.page.getByTestId('waiting-for-list')
  readonly somedayList = this.page.getByTestId('someday-list')

  // Navigation
  readonly navNextActions = this.page.getByTestId('nav-next-actions')
  readonly navProjects = this.page.getByTestId('nav-projects')
  readonly navWaitingFor = this.page.getByTestId('nav-waiting-for')
  readonly navSomeday = this.page.getByTestId('nav-someday')
  readonly navReviews = this.page.getByTestId('nav-reviews')

  constructor(page: Page) {
    super(page)
  }

  async goto() {
    await this.page.goto('/dashboard')
    await this.page.waitForLoadState('networkidle')
  }

  async expectToBeLoaded() {
    await expect(this.captureInput).toBeVisible()
    await expect(this.userMenu).toBeVisible()
  }

  // Capture functionality
  async captureTask(title: string, useKeyboard = false) {
    await this.captureInput.fill(title)

    if (useKeyboard) {
      await this.page.keyboard.press('Enter')
    } else {
      await this.addTaskButton.click()
    }

    // Wait for task to appear in captured list
    await expect(this.capturedList.getByText(title)).toBeVisible()
  }

  async captureTaskWithDetails(title: string, description?: string) {
    await this.captureInput.fill(title)
    await this.detailsButton.click()

    // Should open detailed capture modal
    const modal = this.page.getByTestId('task-edit-modal')
    await expect(modal).toBeVisible()

    if (description) {
      await this.page.getByPlaceholder('Add description...').fill(description)
    }

    await this.page.getByRole('button', { name: /save/i }).click()
    await expect(modal).toBeHidden()

    // Wait for task to appear in captured list
    await expect(this.capturedList.getByText(title)).toBeVisible()
  }

  async expectCaptureInputEmpty() {
    await expect(this.captureInput).toHaveValue('')
  }

  async expectCaptureInputFocused() {
    await expect(this.captureInput).toBeFocused()
  }

  // Task management
  async getTaskCard(title: string) {
    return this.page.getByTestId('task-card').filter({ hasText: title })
  }

  async clickTaskCard(title: string) {
    const taskCard = await this.getTaskCard(title)
    await taskCard.click()
  }

  async expectTaskInList(title: string, listTestId: string) {
    const list = this.page.getByTestId(listTestId)
    await expect(list.getByText(title)).toBeVisible()
  }

  async expectTaskNotInList(title: string, listTestId: string) {
    const list = this.page.getByTestId(listTestId)
    await expect(list.getByText(title)).toBeHidden()
  }

  async deleteTask(title: string) {
    const taskCard = await this.getTaskCard(title)
    await taskCard.getByTestId('task-menu').click()
    await this.page.getByRole('menuitem', { name: /delete/i }).click()

    // Confirm deletion if modal appears
    try {
      const confirmButton = this.page.getByRole('button', { name: /confirm/i })
      await confirmButton.click({ timeout: 2000 })
    } catch {
      // No confirmation modal
    }

    // Expect task to be removed
    await expect(taskCard).toBeHidden()
  }

  async moveTaskToNextAction(title: string) {
    const taskCard = await this.getTaskCard(title)
    await taskCard.getByTestId('task-menu').click()
    await this.page.getByRole('menuitem', { name: /next action/i }).click()

    await this.expectTaskInList(title, 'next-actions-list')
  }

  async completeTask(title: string) {
    const taskCard = await this.getTaskCard(title)
    await taskCard.getByTestId('complete-checkbox').click()

    // Task should be removed from active lists
    await expect(taskCard).toBeHidden()
  }

  // Drag and drop
  async dragTaskBetweenLists(title: string, fromList: string, toList: string) {
    await this.dragAndDrop(
      `[data-testid="${fromList}"] [data-testid="task-card"]:has-text("${title}")`,
      `[data-testid="${toList}"]`
    )

    await this.expectTaskInList(title, toList)
    await this.expectTaskNotInList(title, fromList)
  }

  // Navigation
  async navigateToNextActions() {
    await this.navNextActions.click()
    await expect(this.nextActionsList).toBeVisible()
  }

  async navigateToProjects() {
    await this.navProjects.click()
    await expect(this.projectsList).toBeVisible()
  }

  async navigateToWaitingFor() {
    await this.navWaitingFor.click()
    await expect(this.waitingForList).toBeVisible()
  }

  async navigateToSomeday() {
    await this.navSomeday.click()
    await expect(this.somedayList).toBeVisible()
  }

  async navigateToReviews() {
    await this.navReviews.click()
    await this.page.waitForURL('/dashboard/reviews')
  }

  // Keyboard shortcuts
  async testKeyboardShortcuts() {
    // Quick capture (Cmd+N)
    await this.pressKey('n', ['Meta'])
    await this.expectCaptureInputFocused()

    // Navigate to Next Actions (Cmd+1)
    await this.pressKey('1', ['Meta'])
    await expect(this.nextActionsList).toBeVisible()

    // Navigate to Projects (Cmd+2)
    await this.pressKey('2', ['Meta'])
    await expect(this.projectsList).toBeVisible()

    // Search (Cmd+K)
    await this.pressKey('k', ['Meta'])
    const searchModal = this.page.getByTestId('search-modal')
    await expect(searchModal).toBeVisible()

    // Close with Escape
    await this.pressKey('Escape')
    await expect(searchModal).toBeHidden()
  }

  // Project management
  async createProject(name: string, description?: string) {
    await this.navigateToProjects()
    await this.page.getByRole('button', { name: /new project/i }).click()

    const modal = this.page.getByTestId('project-edit-modal')
    await expect(modal).toBeVisible()

    await this.page.getByPlaceholder('Project name').fill(name)

    if (description) {
      await this.page.getByPlaceholder('Description...').fill(description)
    }

    await this.page.getByRole('button', { name: /create/i }).click()
    await expect(modal).toBeHidden()

    // Expect project to appear in list
    await expect(this.projectsList.getByText(name)).toBeVisible()
  }

  async addTaskToProject(taskTitle: string, projectName: string) {
    const taskCard = await this.getTaskCard(taskTitle)
    await taskCard.getByTestId('task-menu').click()
    await this.page.getByRole('menuitem', { name: /assign to project/i }).click()

    const projectSelect = this.page.getByTestId('project-select')
    await projectSelect.click()
    await this.page.getByRole('option', { name: projectName }).click()

    await this.page.getByRole('button', { name: /assign/i }).click()

    // Verify task is assigned to project
    await expect(taskCard.getByText(projectName)).toBeVisible()
  }

  // Filters and search
  async searchTasks(query: string) {
    await this.pressKey('k', ['Meta'])
    const searchModal = this.page.getByTestId('search-modal')
    const searchInput = searchModal.getByPlaceholder('Search tasks...')

    await searchInput.fill(query)

    // Wait for search results
    const searchResults = searchModal.getByTestId('search-results')
    await expect(searchResults).toBeVisible()

    return searchResults
  }

  async filterByContext(context: string) {
    const contextFilter = this.page.getByTestId('context-filter')
    await contextFilter.click()
    await this.page.getByRole('option', { name: context }).click()

    // Wait for filtered results
    await this.waitForNetworkIdle()
  }

  async filterByEnergyLevel(level: string) {
    const energyFilter = this.page.getByTestId('energy-filter')
    await energyFilter.click()
    await this.page.getByRole('option', { name: level }).click()

    await this.waitForNetworkIdle()
  }

  // User menu and settings
  async openUserMenu() {
    await this.userMenu.click()
    const userDropdown = this.page.getByTestId('user-dropdown')
    await expect(userDropdown).toBeVisible()
  }

  async logout() {
    await this.openUserMenu()
    await this.page.getByRole('menuitem', { name: /logout/i }).click()
    await this.page.waitForURL('/auth/login')
  }

  async openSettings() {
    await this.openUserMenu()
    await this.page.getByRole('menuitem', { name: /settings/i }).click()
    await this.page.waitForURL('/settings')
  }

  // Mobile-specific tests
  async testMobileNavigation() {
    const isMobile = await this.isMobile()

    if (isMobile) {
      // Test sidebar toggle
      await this.sidebarToggle.click()
      const sidebar = this.page.getByTestId('sidebar')
      await expect(sidebar).toBeVisible()

      // Test navigation
      await this.navNextActions.click()
      await expect(sidebar).toBeHidden() // Should auto-close on mobile
      await expect(this.nextActionsList).toBeVisible()
    }
  }

  async testMobileCapture() {
    const isMobile = await this.isMobile()

    if (isMobile) {
      // Test touch-friendly capture
      await this.tapOn('[data-testid="capture-input"]')
      await this.captureInput.fill('Mobile task')
      await this.tapOn('[data-testid="add-task-button"]')

      await this.expectTaskInList('Mobile task', 'captured-list')
    }
  }

  // Performance and loading states
  async expectFastCapture() {
    const startTime = Date.now()

    await this.captureTask('Performance test task')

    const endTime = Date.now()
    const duration = endTime - startTime

    // Task capture should complete within 5 seconds
    expect(duration).toBeLessThan(5000)
  }

  async expectDataToLoad() {
    // Wait for all lists to be present
    await expect(this.capturedList).toBeVisible()
    await expect(this.nextActionsList).toBeVisible()
    await expect(this.projectsList).toBeVisible()
    await expect(this.waitingForList).toBeVisible()
    await expect(this.somedayList).toBeVisible()

    // Should not show loading skeletons
    const loadingSkeleton = this.page.getByTestId('loading-skeleton')
    await expect(loadingSkeleton).toHaveCount(0)
  }

  // Error states
  async expectErrorState() {
    const errorMessage = this.page.getByTestId('error-message')
    await expect(errorMessage).toBeVisible()
  }

  async retryAfterError() {
    const retryButton = this.page.getByRole('button', { name: /retry/i })
    await retryButton.click()
    await this.expectDataToLoad()
  }
}