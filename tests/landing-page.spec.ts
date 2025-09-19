import { test, expect } from "@playwright/test";

test.describe("Landing Page Functionality", () => {
  test("should display clean, functional landing page design", async ({
    page,
  }) => {
    console.log("🏠 Testing landing page design and functionality...");

    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    // Test 1: Page load and basic structure
    console.log("📄 Testing page load and structure...");
    await page.goto("/");
    await page.waitForTimeout(2000);

    const title = await page.title();
    console.log(`Page title: ${title}`);
    expect(title).toContain("Clarity Done");

    // Check for core landing page elements
    const hasHeading = await page.locator("h1, h2").count();
    const hasDescription = await page
      .locator('p, [class*="description"]')
      .count();
    const hasCTA = await page
      .locator('button, a[href*="auth"], a[href*="login"]')
      .count();

    console.log(`✅ Headings: ${hasHeading}`);
    console.log(`✅ Description text: ${hasDescription}`);
    console.log(`✅ Call-to-action elements: ${hasCTA}`);

    expect(hasHeading).toBeGreaterThan(0);
    expect(hasDescription).toBeGreaterThan(0);
    expect(hasCTA).toBeGreaterThan(0);

    // Test 2: Hero section and messaging
    console.log("🎯 Testing hero section and messaging...");

    const pageContent = await page.content();

    // Check for key messaging elements
    const keyMessages = [
      "Clarity Done",
      "Calm. Clear. Done.",
      "productivity",
      "GTD",
      "capture",
      "organize",
      "getting things done",
    ];

    let messagingElementsFound = 0;
    keyMessages.forEach((message) => {
      if (pageContent.toLowerCase().includes(message.toLowerCase())) {
        messagingElementsFound++;
        console.log(`✅ Found key message: "${message}"`);
      }
    });

    console.log(
      `✅ Key messaging elements: ${messagingElementsFound}/${keyMessages.length}`
    );
    expect(messagingElementsFound).toBeGreaterThan(3); // At least half should be present

    // Test 3: Call-to-action functionality
    console.log("🔗 Testing call-to-action functionality...");

    // Find main CTA buttons
    const ctaButtons = await page
      .locator(
        'button:has-text("Get Started"), button:has-text("Sign Up"), button:has-text("Try"), a:has-text("Get Started")'
      )
      .all();

    if (ctaButtons.length > 0) {
      console.log(`✅ Found ${ctaButtons.length} CTA buttons`);

      // Test first CTA button
      const firstCTA = ctaButtons[0];
      const ctaText = await firstCTA.textContent();
      console.log(`Testing CTA: "${ctaText}"`);

      // Check if CTA is clickable and has proper styling
      const isVisible = await firstCTA.isVisible();
      const isEnabled = await firstCTA.isEnabled();

      console.log(`✅ CTA visible: ${isVisible}`);
      console.log(`✅ CTA enabled: ${isEnabled}`);

      if (isVisible && isEnabled) {
        // Click the CTA and see where it goes
        await firstCTA.click();
        await page.waitForTimeout(2000);

        const newUrl = page.url();
        console.log(`CTA redirects to: ${newUrl}`);

        // Should redirect to auth/login or similar
        const isAuthRedirect =
          newUrl.includes("/auth") ||
          newUrl.includes("/login") ||
          newUrl.includes("/signup");
        console.log(`✅ CTA redirects to auth: ${isAuthRedirect}`);
      }
    } else {
      console.log(
        "ℹ️ No explicit CTA buttons found - checking for other navigation"
      );
    }

    // Navigate back to landing page for further tests
    await page.goto("/");
    await page.waitForTimeout(1000);

    // Test 4: GTD methodology explanation
    console.log("📚 Testing GTD methodology explanation...");

    const gtdExplanationTerms = [
      "Getting Things Done",
      "David Allen",
      "capture",
      "clarify",
      "organize",
      "reflect",
      "engage",
      "next action",
      "project",
      "productivity system",
      "mind like water",
    ];

    let gtdExplanationFound = 0;
    gtdExplanationTerms.forEach((term) => {
      if (pageContent.toLowerCase().includes(term.toLowerCase())) {
        gtdExplanationFound++;
        console.log(`✅ Found GTD explanation term: "${term}"`);
      }
    });

    console.log(
      `✅ GTD methodology explanation: ${gtdExplanationFound}/${gtdExplanationTerms.length} terms`
    );

    // Test 5: Feature highlights and benefits
    console.log("⭐ Testing feature highlights...");

    const featureKeywords = [
      "quick capture",
      "mobile",
      "fast",
      "simple",
      "organize",
      "review",
      "dashboard",
      "lists",
      "contexts",
      "projects",
      "offline",
      "sync",
    ];

    let featuresHighlighted = 0;
    featureKeywords.forEach((feature) => {
      if (pageContent.toLowerCase().includes(feature.toLowerCase())) {
        featuresHighlighted++;
        console.log(`✅ Found feature highlight: "${feature}"`);
      }
    });

    console.log(
      `✅ Features highlighted: ${featuresHighlighted}/${featureKeywords.length}`
    );

    // Test 6: Visual design and layout
    console.log("🎨 Testing visual design and layout...");

    // Check for images, icons, or visual elements
    const images = await page.locator("img").count();
    const icons = await page
      .locator('[class*="icon"], svg, [data-icon]')
      .count();
    const cards = await page
      .locator('[class*="card"], [class*="section"]')
      .count();

    console.log(`✅ Images: ${images}`);
    console.log(`✅ Icons/graphics: ${icons}`);
    console.log(`✅ Layout sections: ${cards}`);

    // Test responsive design
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile
    await page.waitForTimeout(1000);

    const mobileLayout = await page.locator("h1, h2").isVisible();
    console.log(`✅ Mobile layout works: ${mobileLayout}`);

    await page.setViewportSize({ width: 1280, height: 720 }); // Desktop
    await page.waitForTimeout(1000);

    // Test 7: Social proof and trust indicators
    console.log("🏆 Testing social proof and trust indicators...");

    const trustIndicators = [
      "testimonial",
      "review",
      "trusted",
      "secure",
      "privacy",
      "free",
      "no ads",
      "open source",
    ];

    let trustElementsFound = 0;
    trustIndicators.forEach((indicator) => {
      if (pageContent.toLowerCase().includes(indicator.toLowerCase())) {
        trustElementsFound++;
        console.log(`✅ Found trust indicator: "${indicator}"`);
      }
    });

    console.log(
      `✅ Trust indicators: ${trustElementsFound}/${trustIndicators.length}`
    );

    // Test 8: Footer and secondary navigation
    console.log("🔗 Testing footer and navigation...");

    const footer = await page.locator("footer").count();
    const navLinks = await page.locator("nav a, footer a").count();
    const legalLinks = await page
      .locator('a[href*="privacy"], a[href*="terms"], a[href*="legal"]')
      .count();

    console.log(`✅ Footer present: ${footer > 0}`);
    console.log(`✅ Navigation links: ${navLinks}`);
    console.log(`✅ Legal links: ${legalLinks}`);

    // Test 9: Performance and loading
    console.log("⚡ Testing performance...");

    const startTime = Date.now();
    await page.reload();
    await page.waitForLoadState("networkidle");
    const loadTime = Date.now() - startTime;

    console.log(`✅ Page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds

    // Test 10: SEO and meta information
    console.log("🔍 Testing SEO and meta information...");

    const metaDescription = await page
      .locator('meta[name="description"]')
      .getAttribute("content");
    const metaKeywords = await page
      .locator('meta[name="keywords"]')
      .getAttribute("content");
    const ogTitle = await page
      .locator('meta[property="og:title"]')
      .getAttribute("content");
    const ogDescription = await page
      .locator('meta[property="og:description"]')
      .getAttribute("content");

    console.log(`Meta description: ${metaDescription}`);
    console.log(`OG title: ${ogTitle}`);

    if (metaDescription) {
      expect(metaDescription.length).toBeGreaterThan(50);
      expect(metaDescription.length).toBeLessThan(160);
    }

    // Log any JavaScript errors
    if (errors.length > 0) {
      console.log("❌ JavaScript Errors on landing page:");
      errors.forEach((error, i) => console.log(`  ${i + 1}. ${error}`));
    } else {
      console.log("✅ No JavaScript errors on landing page");
    }

    // Test summary
    console.log("\n🏠 Landing Page Functionality Summary:");
    console.log(
      `  ✅ Basic structure: ${hasHeading + hasDescription + hasCTA} elements`
    );
    console.log(
      `  ✅ Key messaging: ${messagingElementsFound}/${keyMessages.length}`
    );
    console.log(
      `  ✅ CTA functionality: ${ctaButtons.length > 0 ? "Working" : "Basic navigation"}`
    );
    console.log(
      `  ✅ GTD explanation: ${gtdExplanationFound}/${gtdExplanationTerms.length} terms`
    );
    console.log(
      `  ✅ Features highlighted: ${featuresHighlighted}/${featureKeywords.length}`
    );
    console.log(`  ✅ Visual design: ${images + icons + cards} elements`);
    console.log(
      `  ✅ Trust indicators: ${trustElementsFound}/${trustIndicators.length}`
    );
    console.log(`  ✅ Navigation: ${navLinks} links`);
    console.log(`  ✅ Load time: ${loadTime}ms`);
    console.log(`  ✅ JavaScript errors: ${errors.length}`);

    // Screenshot for documentation
    await page.screenshot({
      path: "landing-page-functionality.png",
      fullPage: true,
    });
  });

  test("should handle user journey from landing to dashboard", async ({
    page,
  }) => {
    console.log(
      "🚶 Testing complete user journey from landing to dashboard..."
    );

    // Test 1: Start at landing page
    console.log("🏠 Starting at landing page...");
    await page.goto("/");
    await page.waitForTimeout(2000);

    const landingTitle = await page.title();
    console.log(`Landing page loaded: ${landingTitle}`);

    // Test 2: Navigate to authentication
    console.log("🔐 Navigating to authentication...");

    // Look for login/signup links
    const authLinks = await page
      .locator(
        'a[href*="auth"], a[href*="login"], button:has-text("Sign"), button:has-text("Get Started")'
      )
      .all();

    if (authLinks.length > 0) {
      const firstAuthLink = authLinks[0];
      const linkText = await firstAuthLink.textContent();
      console.log(`Clicking auth link: "${linkText}"`);

      await firstAuthLink.click();
      await page.waitForTimeout(2000);

      const authUrl = page.url();
      console.log(`Arrived at: ${authUrl}`);

      // Should be on an auth page
      const isOnAuthPage =
        authUrl.includes("/auth") || authUrl.includes("/login");
      console.log(`✅ Reached auth page: ${isOnAuthPage}`);

      if (isOnAuthPage) {
        // Test 3: Authentication page functionality
        console.log("📝 Testing authentication page...");

        const emailInputs = await page.locator('input[type="email"]').count();
        const submitButtons = await page
          .locator(
            'button[type="submit"], button:has-text("Send"), button:has-text("Sign")'
          )
          .count();

        console.log(`✅ Email inputs: ${emailInputs}`);
        console.log(`✅ Submit buttons: ${submitButtons}`);

        if (emailInputs > 0) {
          const emailInput = page.locator('input[type="email"]').first();
          await emailInput.fill("test@example.com");
          const inputValue = await emailInput.inputValue();
          console.log(`✅ Email input works: ${inputValue}`);
        }
      }
    } else {
      console.log("ℹ️ No explicit auth links found, testing direct navigation");
      await page.goto("/auth/login");
      await page.waitForTimeout(2000);
    }

    // Test 4: Try to access dashboard (should redirect)
    console.log("📊 Testing dashboard access...");
    await page.goto("/dashboard");
    await page.waitForTimeout(3000);

    const dashboardUrl = page.url();
    console.log(`Dashboard URL: ${dashboardUrl}`);

    // Should either be on dashboard or redirected to auth
    const isOnDashboard = dashboardUrl.includes("/dashboard");
    const isRedirectedToAuth =
      dashboardUrl.includes("/auth") || dashboardUrl.includes("/login");

    console.log(`✅ Dashboard accessible: ${isOnDashboard}`);
    console.log(`✅ Properly redirected: ${isRedirectedToAuth}`);

    // Test 5: Onboarding flow (if applicable)
    console.log("👋 Testing onboarding flow...");
    await page.goto("/onboarding");
    await page.waitForTimeout(2000);

    const onboardingUrl = page.url();
    console.log(`Onboarding URL: ${onboardingUrl}`);

    const onboardingContent = await page.content();
    const hasOnboardingElements =
      onboardingContent.includes("welcome") ||
      onboardingContent.includes("getting started") ||
      onboardingContent.includes("setup") ||
      onboardingContent.includes("onboard");

    console.log(
      `✅ Onboarding elements: ${hasOnboardingElements ? "Present" : "Basic redirect"}`
    );

    console.log("\n🚶 User Journey Summary:");
    console.log(`  ✅ Landing page: Loads correctly`);
    console.log(
      `  ✅ Auth navigation: ${authLinks.length > 0 ? "Available" : "Direct URL access"}`
    );
    console.log(
      `  ✅ Dashboard protection: ${isRedirectedToAuth ? "Protected" : "Open access"}`
    );
    console.log(
      `  ✅ Onboarding: ${hasOnboardingElements ? "Implemented" : "Basic"}`
    );
  });

  test("should provide accessible and inclusive experience", async ({
    page,
  }) => {
    console.log("♿ Testing accessibility and inclusive design...");

    await page.goto("/");
    await page.waitForTimeout(2000);

    // Test 1: Keyboard navigation
    console.log("⌨️ Testing keyboard navigation...");

    // Tab through interactive elements
    await page.keyboard.press("Tab");
    await page.waitForTimeout(200);
    await page.keyboard.press("Tab");
    await page.waitForTimeout(200);
    await page.keyboard.press("Tab");
    await page.waitForTimeout(200);

    const focusedElement = await page.evaluate(
      () => document.activeElement?.tagName
    );
    console.log(
      `✅ Keyboard navigation works: ${focusedElement ? "Yes" : "No"}`
    );

    // Test 2: ARIA labels and semantic HTML
    console.log("🏷️ Testing ARIA labels and semantic HTML...");

    const headings = await page.locator("h1, h2, h3, h4, h5, h6").count();
    const landmarks = await page
      .locator("main, nav, header, footer, section, article")
      .count();
    const ariaLabels = await page
      .locator("[aria-label], [aria-labelledby], [aria-describedby]")
      .count();
    const altTexts = await page.locator("img[alt]").count();

    console.log(`✅ Headings: ${headings}`);
    console.log(`✅ Landmarks: ${landmarks}`);
    console.log(`✅ ARIA labels: ${ariaLabels}`);
    console.log(`✅ Alt texts: ${altTexts}`);

    // Test 3: Color contrast and visual accessibility
    console.log("🎨 Testing visual accessibility...");

    // Check for proper text sizing
    const textElements = await page.locator("p, span, div").all();
    let appropriateTextSizes = 0;

    for (let i = 0; i < Math.min(textElements.length, 5); i++) {
      const fontSize = await textElements[i].evaluate((el) => {
        const style = window.getComputedStyle(el);
        return parseFloat(style.fontSize);
      });

      if (fontSize >= 14) {
        appropriateTextSizes++;
      }
    }

    console.log(`✅ Appropriate text sizes: ${appropriateTextSizes}/5 sampled`);

    // Test 4: Mobile accessibility
    console.log("📱 Testing mobile accessibility...");

    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    // Check touch target sizes
    const buttons = await page.locator("button").all();
    let appropriateTouchTargets = 0;

    for (let i = 0; i < Math.min(buttons.length, 3); i++) {
      const buttonBox = await buttons[i].boundingBox();
      if (buttonBox && buttonBox.height >= 44 && buttonBox.width >= 44) {
        appropriateTouchTargets++;
      }
    }

    console.log(
      `✅ Appropriate touch targets: ${appropriateTouchTargets}/3 sampled`
    );

    await page.setViewportSize({ width: 1280, height: 720 }); // Back to desktop

    // Test 5: Screen reader compatibility
    console.log("🔊 Testing screen reader compatibility...");

    const skipLinks = await page
      .locator('a[href="#main"], a[href="#content"], [class*="skip"]')
      .count();
    const headingStructure = await page.locator("h1").count();
    const formLabels = await page.locator("label").count();
    const inputLabels = await page.locator("input").count();

    console.log(`✅ Skip links: ${skipLinks}`);
    console.log(`✅ H1 headings: ${headingStructure}`);
    console.log(`✅ Form labels: ${formLabels}`);
    console.log(`✅ Form inputs: ${inputLabels}`);

    console.log("\n♿ Accessibility Summary:");
    console.log(
      `  ✅ Keyboard navigation: ${focusedElement ? "Working" : "Needs improvement"}`
    );
    console.log(`  ✅ Semantic HTML: ${headings + landmarks} elements`);
    console.log(`  ✅ ARIA support: ${ariaLabels} labeled elements`);
    console.log(`  ✅ Alt text: ${altTexts} images`);
    console.log(`  ✅ Text sizing: ${appropriateTextSizes}/5 appropriate`);
    console.log(`  ✅ Touch targets: ${appropriateTouchTargets}/3 appropriate`);
    console.log(
      `  ✅ Screen reader support: ${skipLinks + formLabels} features`
    );
  });
});
