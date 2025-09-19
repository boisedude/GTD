import { Page, expect } from '@playwright/test'

export class BasePage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  // Common navigation methods
  async goto(url: string) {
    await this.page.goto(url)
  }

  async waitForUrl(url: string | RegExp) {
    await this.page.waitForURL(url)
  }

  // Common UI interactions
  async clickByText(text: string) {
    await this.page.getByText(text).click()
  }

  async clickByRole(role: 'button' | 'link' | 'input', name?: string) {
    if (name) {
      await this.page.getByRole(role, { name }).click()
    } else {
      await this.page.getByRole(role).first().click()
    }
  }

  async fillByPlaceholder(placeholder: string, text: string) {
    await this.page.getByPlaceholder(placeholder).fill(text)
  }

  async fillByLabel(label: string, text: string) {
    await this.page.getByLabel(label).fill(text)
  }

  // Wait helpers
  async waitForText(text: string) {
    await this.page.waitForSelector(`text=${text}`)
  }

  async waitForElement(selector: string) {
    await this.page.waitForSelector(selector)
  }

  async waitForElementToBeHidden(selector: string) {
    await this.page.waitForSelector(selector, { state: 'hidden' })
  }

  // Assertion helpers
  async expectToHaveText(selector: string, text: string) {
    await expect(this.page.locator(selector)).toHaveText(text)
  }

  async expectToContainText(text: string) {
    await expect(this.page.locator('body')).toContainText(text)
  }

  async expectToBeVisible(selector: string) {
    await expect(this.page.locator(selector)).toBeVisible()
  }

  async expectToBeHidden(selector: string) {
    await expect(this.page.locator(selector)).toBeHidden()
  }

  // Mobile-specific helpers
  async isMobile(): Promise<boolean> {
    const viewport = this.page.viewportSize()
    return viewport ? viewport.width < 768 : false
  }

  async tapOn(selector: string) {
    if (await this.isMobile()) {
      await this.page.tap(selector)
    } else {
      await this.page.click(selector)
    }
  }

  // Keyboard shortcuts
  async pressKey(key: string, modifiers?: string[]) {
    const modifier = modifiers?.join('+') || ''
    const keyCombo = modifier ? `${modifier}+${key}` : key
    await this.page.keyboard.press(keyCombo)
  }

  async pressKeySequence(keys: string[]) {
    for (const key of keys) {
      await this.page.keyboard.press(key)
    }
  }

  // Loading and error states
  async waitForLoading() {
    await this.page.waitForLoadState('networkidle')
  }

  async waitForApiResponse(urlPattern: string | RegExp) {
    await this.page.waitForResponse(urlPattern)
  }

  // Screenshot helpers
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png` })
  }

  async takeFullScreenshot(name: string) {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}-full.png`,
      fullPage: true
    })
  }

  // Network helpers
  async waitForNetworkIdle() {
    await this.page.waitForLoadState('networkidle')
  }

  async mockApiResponse(url: string | RegExp, response: any) {
    await this.page.route(url, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      })
    })
  }

  async interceptApiCall(url: string | RegExp): Promise<any> {
    const responsePromise = this.page.waitForResponse(url)
    return responsePromise
  }

  // Authentication helpers
  async isLoggedIn(): Promise<boolean> {
    try {
      await this.page.waitForSelector('[data-testid="user-menu"]', { timeout: 3000 })
      return true
    } catch {
      return false
    }
  }

  async logout() {
    if (await this.isLoggedIn()) {
      await this.clickByTestId('user-menu')
      await this.clickByText('Logout')
      await this.waitForUrl('/auth/login')
    }
  }

  // Test ID helpers (recommended approach for reliable selectors)
  async clickByTestId(testId: string) {
    await this.page.getByTestId(testId).click()
  }

  async fillByTestId(testId: string, text: string) {
    await this.page.getByTestId(testId).fill(text)
  }

  async expectTestIdToBeVisible(testId: string) {
    await expect(this.page.getByTestId(testId)).toBeVisible()
  }

  async expectTestIdToHaveText(testId: string, text: string) {
    await expect(this.page.getByTestId(testId)).toHaveText(text)
  }

  // Drag and drop helpers
  async dragAndDrop(sourceSelector: string, targetSelector: string) {
    await this.page.dragAndDrop(sourceSelector, targetSelector)
  }

  // Form helpers
  async submitForm() {
    await this.page.keyboard.press('Enter')
  }

  async selectOption(selector: string, value: string) {
    await this.page.selectOption(selector, value)
  }

  // Error handling
  async expectNoConsoleErrors() {
    const consoleErrors: string[] = []

    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Check for errors after a short wait
    await this.page.waitForTimeout(1000)
    expect(consoleErrors).toHaveLength(0)
  }

  async expectNoNetworkErrors() {
    const failedRequests: string[] = []

    this.page.on('response', response => {
      if (response.status() >= 400) {
        failedRequests.push(`${response.status()}: ${response.url()}`)
      }
    })

    // Check for failed requests after a short wait
    await this.page.waitForTimeout(1000)
    expect(failedRequests).toHaveLength(0)
  }
}