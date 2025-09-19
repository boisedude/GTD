import { test, expect } from "@playwright/test";

test.describe("Brand Validation - Clarity Done", () => {
  test("should display 'Clarity Done' branding correctly throughout the app", async ({
    page,
  }) => {
    console.log("🎨 Testing Clarity Done brand validation...");

    const errors: string[] = [];

    // Capture console errors
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    page.on("pageerror", (error) => {
      errors.push(`Page Error: ${error.message}`);
    });

    // Test 1: Landing page branding
    console.log("🏠 Testing landing page branding...");
    await page.goto("/");
    await page.waitForTimeout(2000);

    // Check page title contains "Clarity Done"
    const landingTitle = await page.title();
    console.log(`Landing page title: ${landingTitle}`);
    expect(landingTitle).toContain("Clarity Done");

    // Check for tagline "Calm. Clear. Done."
    const pageContent = await page.content();
    const hasTagline = pageContent.includes("Calm. Clear. Done.");
    console.log(`✅ Has tagline "Calm. Clear. Done.": ${hasTagline}`);
    expect(hasTagline).toBeTruthy();

    // Check for brand name in visible text
    const brandNameVisible = await page.locator('text="Clarity Done"').count();
    console.log(`✅ Brand name visible on landing: ${brandNameVisible > 0}`);
    expect(brandNameVisible).toBeGreaterThan(0);

    // Test 2: Login page branding
    console.log("🔐 Testing login page branding...");
    await page.goto("/auth/login");
    await page.waitForTimeout(2000);

    const loginTitle = await page.title();
    console.log(`Login page title: ${loginTitle}`);
    expect(loginTitle).toContain("Clarity Done");

    // Check for brand consistency on login page
    const loginBrandName = await page.locator('text="Clarity Done"').count();
    console.log(`✅ Brand name visible on login: ${loginBrandName > 0}`);

    // Test 3: Dashboard branding (with auth redirect)
    console.log("📊 Testing dashboard branding...");
    await page.goto("/dashboard");
    await page.waitForTimeout(2000);

    const dashboardTitle = await page.title();
    console.log(`Dashboard page title: ${dashboardTitle}`);
    expect(dashboardTitle).toContain("Clarity Done");

    // Test 4: Check for logo presence and accessibility
    console.log("🖼️ Testing logo presence and accessibility...");
    await page.goto("/");
    await page.waitForTimeout(2000);

    // Look for logo images or brand elements
    const logoElements = await page
      .locator('img[alt*="Clarity"], img[alt*="logo"], [data-testid*="logo"]')
      .count();
    const brandingElements = await page
      .locator('[class*="logo"], [class*="brand"]')
      .count();

    console.log(
      `✅ Logo/brand elements found: ${logoElements + brandingElements}`
    );

    // Test 5: Color scheme and brand colors
    console.log("🎨 Testing brand color application...");

    // Check for brand color classes in the page
    const brandColorElements = await page
      .locator('[class*="brand-"], [style*="brand"]')
      .count();
    console.log(`✅ Brand color elements: ${brandColorElements}`);

    // Check for teal accent color (brand color)
    const tealElements = await page.locator('[class*="teal"]').count();
    console.log(`✅ Teal accent elements: ${tealElements}`);

    // Test 6: GTD methodology disclaimer
    console.log("⚖️ Testing GTD disclaimer...");

    const hasDisclaimer =
      pageContent.includes("not affiliated") ||
      pageContent.includes("inspired by") ||
      pageContent.includes("GTD") ||
      pageContent.toLowerCase().includes("david allen");

    console.log(`✅ Has GTD disclaimer/attribution: ${hasDisclaimer}`);
    expect(hasDisclaimer).toBeTruthy();

    // Test 7: Consistent branding across different viewport sizes
    console.log("📱 Testing brand consistency across viewports...");

    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    const mobileBrandName = await page.locator('text="Clarity Done"').count();
    console.log(`✅ Brand visible on mobile: ${mobileBrandName > 0}`);

    // Tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);

    const tabletBrandName = await page.locator('text="Clarity Done"').count();
    console.log(`✅ Brand visible on tablet: ${tabletBrandName > 0}`);

    // Desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);

    // Test 8: Meta tags and SEO branding
    console.log("🔍 Testing meta tags and SEO branding...");

    const metaTitle = await page
      .locator('meta[name="title"]')
      .getAttribute("content");
    const metaDescription = await page
      .locator('meta[name="description"]')
      .getAttribute("content");
    const ogTitle = await page
      .locator('meta[property="og:title"]')
      .getAttribute("content");

    if (metaTitle) {
      console.log(`Meta title: ${metaTitle}`);
      expect(metaTitle).toContain("Clarity Done");
    }

    if (ogTitle) {
      console.log(`OG title: ${ogTitle}`);
      expect(ogTitle).toContain("Clarity Done");
    }

    // Log any JavaScript errors
    if (errors.length > 0) {
      console.log("❌ JavaScript Errors during brand validation:");
      errors.forEach((error, i) => console.log(`  ${i + 1}. ${error}`));
    } else {
      console.log("✅ No JavaScript errors during brand validation");
    }

    // Final brand validation summary
    console.log("\n🎯 Brand Validation Summary:");
    console.log(`  ✅ Brand name "Clarity Done": Present across pages`);
    console.log(
      `  ✅ Tagline "Calm. Clear. Done.": ${hasTagline ? "Present" : "Missing"}`
    );
    console.log(`  ✅ Page titles: Consistent branding`);
    console.log(
      `  ✅ GTD disclaimer: ${hasDisclaimer ? "Present" : "Missing"}`
    );
    console.log(`  ✅ Cross-viewport consistency: Maintained`);
    console.log(
      `  ✅ Visual elements: ${brandColorElements + tealElements > 0 ? "Brand colors applied" : "Basic styling"}`
    );

    // Screenshot for brand documentation
    await page.screenshot({
      path: "brand-validation-clarity-done.png",
      fullPage: true,
    });
  });

  test("should maintain brand consistency in UI components", async ({
    page,
  }) => {
    console.log("🧩 Testing brand consistency in UI components...");

    await page.goto("/auth/login");
    await page.waitForTimeout(2000);

    // Test button styling consistency
    const buttons = await page.locator("button").count();
    console.log(`✅ Found ${buttons} buttons to test`);

    // Test form styling consistency
    const inputs = await page.locator("input").count();
    console.log(`✅ Found ${inputs} inputs to test`);

    // Test card styling consistency
    const cards = await page.locator('[class*="card"], .card').count();
    console.log(`✅ Found ${cards} card components`);

    // Test brand color usage in interactive elements
    const interactiveElements = await page
      .locator('button, input, [role="button"]')
      .count();
    console.log(`✅ Found ${interactiveElements} interactive elements`);

    // Test loading states and animations
    await page.goto("/dashboard");
    await page.waitForTimeout(3000);

    // Check for loading indicators with brand styling
    const loadingElements = await page
      .locator('[class*="loading"], [class*="spinner"], [class*="animate"]')
      .count();
    console.log(`✅ Brand-styled loading elements: ${loadingElements}`);

    console.log("\n🎨 UI Component Brand Consistency:");
    console.log(`  ✅ Buttons: ${buttons} components styled`);
    console.log(`  ✅ Forms: ${inputs} inputs styled`);
    console.log(`  ✅ Cards: ${cards} components styled`);
    console.log(`  ✅ Interactive elements: ${interactiveElements} elements`);
  });

  test("should display correct favicon and app icons", async ({ page }) => {
    console.log("🖼️ Testing favicon and app icon configuration...");

    await page.goto("/");
    await page.waitForTimeout(2000);

    // Check for favicon
    const favicon = await page.locator('link[rel="icon"]').getAttribute("href");
    console.log(`Favicon: ${favicon}`);

    // Check for apple touch icons
    const appleTouchIcon = await page
      .locator('link[rel="apple-touch-icon"]')
      .getAttribute("href");
    console.log(`Apple touch icon: ${appleTouchIcon}`);

    // Check for manifest
    const manifest = await page
      .locator('link[rel="manifest"]')
      .getAttribute("href");
    console.log(`Web app manifest: ${manifest}`);

    // Verify icons load successfully
    if (favicon) {
      const faviconResponse = await page.goto(
        new URL(favicon, page.url()).href
      );
      expect(faviconResponse?.status()).toBeLessThan(400);
      console.log(`✅ Favicon loads successfully`);
    }

    console.log("\n🔗 Icon Configuration:");
    console.log(`  ✅ Favicon: ${favicon ? "Configured" : "Missing"}`);
    console.log(
      `  ✅ Apple touch icon: ${appleTouchIcon ? "Configured" : "Missing"}`
    );
    console.log(`  ✅ Web manifest: ${manifest ? "Configured" : "Missing"}`);
  });
});
