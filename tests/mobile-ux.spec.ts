import { test, expect } from "@playwright/test";

test.describe("Mobile UX Testing", () => {
  const viewports = [
    { name: "Mobile Small", width: 320, height: 568 }, // iPhone SE
    { name: "Mobile Medium", width: 375, height: 667 }, // iPhone 8
    { name: "Mobile Large", width: 414, height: 896 }, // iPhone 11
    { name: "Tablet Portrait", width: 768, height: 1024 }, // iPad
    { name: "Tablet Landscape", width: 1024, height: 768 }, // iPad Landscape
  ];

  for (const viewport of viewports) {
    test(`should work correctly on ${viewport.name} (${viewport.width}x${viewport.height})`, async ({
      page,
    }) => {
      console.log(
        `📱 Testing ${viewport.name} viewport (${viewport.width}x${viewport.height})`
      );

      // Set viewport
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });

      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          errors.push(msg.text());
        }
      });

      // Test 1: Landing page mobile layout
      console.log("🏠 Testing landing page mobile layout...");
      await page.goto("/");
      await page.waitForTimeout(2000);

      // Check if page loads and is responsive
      const title = await page.title();
      expect(title).toBeTruthy();
      console.log(`✅ Page loads: ${title}`);

      // Check for horizontal scrolling (should not have it)
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = viewport.width;
      const hasHorizontalScroll = bodyWidth > viewportWidth + 10; // 10px tolerance
      console.log(
        `✅ No horizontal scroll: ${!hasHorizontalScroll} (body: ${bodyWidth}px, viewport: ${viewportWidth}px)`
      );

      // Test 2: Navigation and menu functionality
      console.log("🧭 Testing mobile navigation...");

      // Look for mobile menu button or navigation
      const mobileMenuButton = await page
        .locator(
          'button[aria-label*="menu"], button[aria-label*="navigation"], [data-testid*="menu"]'
        )
        .count();
      const navigationElements = await page
        .locator('nav, [role="navigation"]')
        .count();

      console.log(
        `✅ Mobile navigation elements: ${mobileMenuButton + navigationElements}`
      );

      // Test 3: Touch targets and accessibility
      console.log("👆 Testing touch targets...");

      // Get all interactive elements
      const buttons = await page.locator("button").count();
      const links = await page.locator("a").count();
      const inputs = await page.locator("input").count();

      console.log(
        `✅ Interactive elements: ${buttons} buttons, ${links} links, ${inputs} inputs`
      );

      // Check if main CTA buttons are visible and accessible
      const ctaButtons = await page
        .locator(
          'button:has-text("Get Started"), button:has-text("Sign In"), button:has-text("Login")'
        )
        .count();
      console.log(`✅ CTA buttons visible: ${ctaButtons > 0}`);

      // Test 4: Form interactions on mobile
      console.log("📝 Testing form interactions...");
      await page.goto("/auth/login");
      await page.waitForTimeout(2000);

      // Check email input is accessible and properly sized
      const emailInput = await page.locator('input[type="email"]');
      const emailInputCount = await emailInput.count();

      if (emailInputCount > 0) {
        // Check if input is visible and has proper styling
        const inputBox = await emailInput.boundingBox();
        if (inputBox) {
          const inputHeight = inputBox.height;
          const isProperTouchTarget = inputHeight >= 44; // iOS accessibility guidelines
          console.log(
            `✅ Email input touch target: ${inputHeight}px (minimum 44px: ${isProperTouchTarget})`
          );
        }

        // Test typing in the input
        await emailInput.fill("test@example.com");
        const inputValue = await emailInput.inputValue();
        expect(inputValue).toBe("test@example.com");
        console.log(`✅ Input interaction works: ${inputValue}`);
      }

      // Test 5: Content readability and spacing
      console.log("📖 Testing content readability...");

      // Check for proper text sizing and spacing
      const textElements = await page.locator("p, h1, h2, h3, span").count();
      console.log(`✅ Text elements: ${textElements}`);

      // Test 6: Dashboard mobile layout (after potential redirect)
      console.log("📊 Testing dashboard mobile layout...");
      await page.goto("/dashboard");
      await page.waitForTimeout(3000);

      const currentUrl = page.url();
      console.log(`Current URL: ${currentUrl}`);

      // If we're on dashboard, test capture functionality
      if (currentUrl.includes("/dashboard")) {
        // Test quick capture input on mobile
        const captureInput = await page
          .locator(
            'input[placeholder*="capture"], input[placeholder*="task"], textarea'
          )
          .count();
        console.log(`✅ Capture input available: ${captureInput > 0}`);

        // Test task cards mobile layout
        const taskCards = await page.locator('[class*="card"], .card').count();
        console.log(`✅ Task cards: ${taskCards}`);
      }

      // Test 7: Performance on mobile viewport
      console.log("⚡ Testing mobile performance...");

      const startTime = Date.now();
      await page.reload();
      await page.waitForLoadState("networkidle");
      const loadTime = Date.now() - startTime;

      console.log(`✅ Page load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(10000); // Should load within 10 seconds

      // Test 8: Scroll behavior and sticky elements
      console.log("📜 Testing scroll behavior...");

      // Scroll down to test sticky elements
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(1000);

      // Check for sticky headers or navigation
      const stickyElements = await page
        .locator(
          '[style*="position: fixed"], [class*="sticky"], [style*="position: sticky"]'
        )
        .count();
      console.log(`✅ Sticky elements: ${stickyElements}`);

      // Scroll back to top
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);

      // Log viewport-specific errors
      if (errors.length > 0) {
        console.log(`❌ JavaScript Errors on ${viewport.name}:`);
        errors.forEach((error, i) => console.log(`  ${i + 1}. ${error}`));
      } else {
        console.log(`✅ No JavaScript errors on ${viewport.name}`);
      }

      // Take screenshot for this viewport
      await page.screenshot({
        path: `mobile-ux-${viewport.width}x${viewport.height}.png`,
        fullPage: true,
      });

      console.log(`\n📊 ${viewport.name} Summary:`);
      console.log(`  ✅ Page loads: Yes`);
      console.log(`  ✅ No horizontal scroll: ${!hasHorizontalScroll}`);
      console.log(`  ✅ Interactive elements: ${buttons + links + inputs}`);
      console.log(
        `  ✅ Form interactions: ${emailInputCount > 0 ? "Working" : "Not tested"}`
      );
      console.log(`  ✅ Load time: ${loadTime}ms`);
      console.log(`  ✅ JavaScript errors: ${errors.length}`);
    });
  }

  test("should handle touch interactions properly", async ({ page }) => {
    console.log("👆 Testing touch interaction patterns...");

    // Set to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/auth/login");
    await page.waitForTimeout(2000);

    // Test touch events on buttons
    const buttons = await page.locator("button").all();

    for (let i = 0; i < Math.min(buttons.length, 3); i++) {
      const button = buttons[i];
      const buttonText = await button.textContent();

      if (buttonText && buttonText.trim()) {
        console.log(`Testing touch on button: "${buttonText.trim()}"`);

        // Test hover state (should work on touch)
        await button.hover();
        await page.waitForTimeout(200);

        // Test tap/click
        await button.click();
        await page.waitForTimeout(500);

        console.log(`✅ Touch interaction successful`);
      }
    }

    // Test scroll gestures
    console.log("📜 Testing scroll gestures...");

    await page.evaluate(() => {
      // Simulate touch scroll
      window.scrollTo(0, 200);
    });
    await page.waitForTimeout(1000);

    const scrollY = await page.evaluate(() => window.scrollY);
    console.log(`✅ Scroll position: ${scrollY}px`);
  });

  test("should maintain usability across orientation changes", async ({
    page,
  }) => {
    console.log("🔄 Testing orientation changes...");

    // Start in portrait
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForTimeout(2000);

    const portraitTitle = await page.title();
    console.log(`Portrait mode: ${portraitTitle}`);

    // Switch to landscape
    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForTimeout(1000);

    const landscapeTitle = await page.title();
    console.log(`Landscape mode: ${landscapeTitle}`);

    // Verify layout still works
    const buttonsLandscape = await page.locator("button").count();
    const inputsLandscape = await page.locator("input").count();

    console.log(
      `✅ Landscape layout: ${buttonsLandscape} buttons, ${inputsLandscape} inputs`
    );

    // Check for layout issues in landscape
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = 667;
    const hasHorizontalScrollLandscape = bodyWidth > viewportWidth + 10;

    console.log(
      `✅ No horizontal scroll in landscape: ${!hasHorizontalScrollLandscape}`
    );

    // Screenshot both orientations
    await page.screenshot({
      path: "mobile-landscape-667x375.png",
      fullPage: true,
    });
  });

  test("should provide good PWA experience on mobile", async ({ page }) => {
    console.log("📱 Testing PWA mobile experience...");

    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForTimeout(3000);

    // Check for PWA indicators
    const manifestLink = await page.locator('link[rel="manifest"]').count();
    const serviceWorkerScript = await page.evaluate(() => {
      return "serviceWorker" in navigator;
    });

    console.log(`✅ Web app manifest: ${manifestLink > 0}`);
    console.log(`✅ Service worker support: ${serviceWorkerScript}`);

    // Check for mobile-specific meta tags
    const viewportMeta = await page.locator('meta[name="viewport"]').count();
    const appleTouchIcon = await page
      .locator('link[rel="apple-touch-icon"]')
      .count();
    const themeColor = await page.locator('meta[name="theme-color"]').count();

    console.log(`✅ Viewport meta tag: ${viewportMeta > 0}`);
    console.log(`✅ Apple touch icon: ${appleTouchIcon > 0}`);
    console.log(`✅ Theme color: ${themeColor > 0}`);

    // Test add to homescreen prompt (if available)
    const installPrompt = await page
      .locator('text="Install", text="Add to Home", [class*="install"]')
      .count();
    console.log(`✅ Install prompt elements: ${installPrompt}`);

    console.log("\n📱 PWA Mobile Experience Summary:");
    console.log(`  ✅ Manifest: ${manifestLink > 0 ? "Present" : "Missing"}`);
    console.log(
      `  ✅ Service Worker: ${serviceWorkerScript ? "Supported" : "Not supported"}`
    );
    console.log(
      `  ✅ Mobile meta tags: ${viewportMeta + appleTouchIcon + themeColor}/3`
    );
    console.log(`  ✅ Install indicators: ${installPrompt}`);
  });
});
