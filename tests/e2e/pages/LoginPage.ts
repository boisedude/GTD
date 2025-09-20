import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class LoginPage extends BasePage {
  readonly emailInput = this.page.getByPlaceholder("Enter your email");
  readonly signInButton = this.page.getByRole("button", { name: /sign in/i });
  readonly otpInput = this.page.getByPlaceholder("Enter OTP code");
  readonly verifyButton = this.page.getByRole("button", { name: /verify/i });
  readonly errorMessage = this.page.getByTestId("error-message");
  readonly successMessage = this.page.getByTestId("success-message");

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto("/auth/login");
    await this.page.waitForLoadState("networkidle");
  }

  async enterEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async clickSignIn() {
    await this.signInButton.click();
  }

  async signInWithEmail(email: string) {
    await this.enterEmail(email);
    await this.clickSignIn();
  }

  async enterOTP(otp: string) {
    await this.otpInput.fill(otp);
  }

  async clickVerify() {
    await this.verifyButton.click();
  }

  async verifyOTP(otp: string) {
    await this.enterOTP(otp);
    await this.clickVerify();
  }

  async completeLogin(email: string, otp?: string) {
    await this.signInWithEmail(email);

    // Wait for OTP screen or direct login
    try {
      await this.otpInput.waitFor({ state: "visible", timeout: 5000 });
      if (otp) {
        await this.verifyOTP(otp);
      }
    } catch {
      // OTP screen might not appear in test environment
    }

    // Wait for redirect to dashboard
    await this.page.waitForURL("/dashboard", { timeout: 10000 });
  }

  async expectEmailFieldVisible() {
    await expect(this.emailInput).toBeVisible();
  }

  async expectSignInButtonVisible() {
    await expect(this.signInButton).toBeVisible();
  }

  async expectOTPFieldVisible() {
    await expect(this.otpInput).toBeVisible();
  }

  async expectVerifyButtonVisible() {
    await expect(this.verifyButton).toBeVisible();
  }

  async expectErrorMessage(message: string) {
    await expect(this.errorMessage).toContainText(message);
  }

  async expectSuccessMessage(message: string) {
    await expect(this.successMessage).toContainText(message);
  }

  async expectSignInButtonDisabled() {
    await expect(this.signInButton).toBeDisabled();
  }

  async expectSignInButtonEnabled() {
    await expect(this.signInButton).toBeEnabled();
  }

  async expectVerifyButtonDisabled() {
    await expect(this.verifyButton).toBeDisabled();
  }

  async expectVerifyButtonEnabled() {
    await expect(this.verifyButton).toBeEnabled();
  }

  async waitForOTPSent() {
    await this.expectSuccessMessage("Check your email for the login code");
  }

  async clearEmail() {
    await this.emailInput.clear();
  }

  async clearOTP() {
    await this.otpInput.clear();
  }

  // Test specific scenarios
  async attemptInvalidEmail(email: string) {
    await this.enterEmail(email);
    await this.clickSignIn();
    await this.expectErrorMessage("Please enter a valid email address");
  }

  async attemptInvalidOTP(otp: string) {
    await this.enterOTP(otp);
    await this.clickVerify();
    await this.expectErrorMessage("Invalid or expired code");
  }

  async testKeyboardNavigation() {
    // Tab through the form
    await this.emailInput.focus();
    await this.page.keyboard.press("Tab");
    await expect(this.signInButton).toBeFocused();

    // Enter should submit the form
    await this.emailInput.focus();
    await this.enterEmail("test@example.com");
    await this.page.keyboard.press("Enter");
    await this.waitForOTPSent();
  }

  async testFormValidation() {
    // Test empty email
    await this.clickSignIn();
    await this.expectSignInButtonDisabled();

    // Test invalid email format
    await this.attemptInvalidEmail("invalid-email");

    // Test valid email
    await this.clearEmail();
    await this.enterEmail("test@example.com");
    await this.expectSignInButtonEnabled();
  }

  // Mobile-specific interactions
  async testMobileLayout() {
    const isMobile = await this.isMobile();

    if (isMobile) {
      // Check mobile-specific styling
      await expect(this.emailInput).toHaveCSS("font-size", "16px"); // Prevent zoom

      // Test touch interactions
      await this.tapOn('[data-testid="email-input"]');
      await this.enterEmail("test@example.com");
      await this.tapOn('[data-testid="sign-in-button"]');
    }
  }

  // Accessibility tests
  async testAccessibility() {
    // Check ARIA labels
    await expect(this.emailInput).toHaveAttribute(
      "aria-label",
      "Email address"
    );
    await expect(this.signInButton).toHaveAttribute(
      "aria-label",
      "Sign in with email"
    );

    // Check tab order
    await this.emailInput.focus();
    await this.page.keyboard.press("Tab");
    await expect(this.signInButton).toBeFocused();

    // Check screen reader text
    const srOnly = this.page.locator(".sr-only");
    await expect(srOnly).toHaveCount(0); // or specific count if expected
  }

  // Error recovery scenarios
  async testNetworkError() {
    // Mock network failure
    await this.page.route("**/auth/v1/**", (route) => {
      route.abort("failed");
    });

    await this.signInWithEmail("test@example.com");
    await this.expectErrorMessage("Network error. Please try again.");
  }

  async testRetryAfterError() {
    // First attempt fails
    await this.attemptInvalidEmail("invalid@email");

    // Clear error and retry with valid email
    await this.clearEmail();
    await this.enterEmail("test@example.com");
    await this.clickSignIn();
    await this.waitForOTPSent();
  }
}
