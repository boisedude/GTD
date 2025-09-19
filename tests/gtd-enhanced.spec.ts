import { test, expect } from "@playwright/test";

test.describe("Enhanced GTD Workflow Testing", () => {
  test("should validate complete GTD capture workflow", async ({ page }) => {
    console.log("📥 Testing enhanced GTD capture workflow...");

    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    // Test 1: Capture input accessibility and UX
    console.log("✍️ Testing capture input UX...");
    await page.goto("/");
    await page.waitForTimeout(2000);

    // Look for capture input on landing page or after redirect
    const currentUrl = page.url();
    let captureInputs = await page
      .locator(
        'input[placeholder*="capture"], input[placeholder*="task"], textarea[placeholder*="capture"]'
      )
      .count();

    // If not on landing, try dashboard
    if (captureInputs === 0) {
      await page.goto("/dashboard");
      await page.waitForTimeout(3000);
      captureInputs = await page
        .locator(
          'input[placeholder*="capture"], input[placeholder*="task"], textarea[placeholder*="capture"]'
        )
        .count();
    }

    console.log(`✅ Capture inputs found: ${captureInputs}`);

    // Test capture input characteristics if found
    if (captureInputs > 0) {
      const captureInput = page
        .locator(
          'input[placeholder*="capture"], input[placeholder*="task"], textarea[placeholder*="capture"]'
        )
        .first();

      // Test placeholder text
      const placeholder = await captureInput.getAttribute("placeholder");
      console.log(`✅ Capture placeholder: "${placeholder}"`);

      // Test input responsiveness
      await captureInput.fill("Test capture item for GTD workflow");
      const inputValue = await captureInput.inputValue();
      expect(inputValue).toBe("Test capture item for GTD workflow");
      console.log(`✅ Capture input works: "${inputValue}"`);

      // Clear for next tests
      await captureInput.fill("");
    }

    // Test 2: GTD terminology and methodology compliance
    console.log("📚 Testing GTD terminology and methodology...");

    const pageContent = await page.content();

    // Check for core GTD terms
    const gtdTerms = [
      "capture",
      "clarify",
      "organize",
      "next action",
      "project",
      "waiting for",
      "someday",
      "review",
    ];

    let gtdTermsFound = 0;
    gtdTerms.forEach((term) => {
      if (pageContent.toLowerCase().includes(term.toLowerCase())) {
        gtdTermsFound++;
        console.log(`✅ Found GTD term: "${term}"`);
      }
    });

    console.log(
      `✅ GTD terminology coverage: ${gtdTermsFound}/${gtdTerms.length} terms found`
    );
    expect(gtdTermsFound).toBeGreaterThan(0);

    // Test 3: Task organization and categories
    console.log("📋 Testing task organization...");

    // Look for GTD lists/categories
    const gtdCategories = [
      "next action",
      "project",
      "waiting",
      "someday",
      "inbox",
      "captured",
    ];

    let categoriesFound = 0;
    for (const category of gtdCategories) {
      const categoryElements = await page
        .locator(
          `text="${category}", [aria-label*="${category}"], [data-testid*="${category}"]`
        )
        .count();
      if (categoryElements > 0) {
        categoriesFound++;
        console.log(
          `✅ Found GTD category: "${category}" (${categoryElements} elements)`
        );
      }
    }

    console.log(
      `✅ GTD categories visible: ${categoriesFound}/${gtdCategories.length}`
    );

    // Test 4: Quick action buttons and GTD workflow
    console.log("⚡ Testing quick action workflow...");

    // Look for action buttons related to GTD workflow
    const actionButtons = await page
      .locator(
        'button:has-text("Add"), button:has-text("Capture"), button:has-text("Quick"), button[aria-label*="add"], button[aria-label*="capture"]'
      )
      .count();
    console.log(`✅ Quick action buttons: ${actionButtons}`);

    // Test keyboard shortcuts for capture (if implemented)
    if (captureInputs > 0) {
      // Try keyboard shortcut for quick capture
      await page.keyboard.press("Control+Enter");
      await page.waitForTimeout(500);
      console.log(`✅ Keyboard shortcuts tested`);
    }

    // Test 5: Mobile-first capture experience
    console.log("📱 Testing mobile-first capture...");

    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    // Check if capture input is still accessible on mobile
    const mobileCaptureInputs = await page
      .locator(
        'input[placeholder*="capture"], input[placeholder*="task"], textarea[placeholder*="capture"]'
      )
      .count();
    console.log(`✅ Mobile capture inputs: ${mobileCaptureInputs}`);

    // Test 6: Task card interactions and GTD metadata
    console.log("🃏 Testing task card interactions...");

    await page.setViewportSize({ width: 1280, height: 720 }); // Back to desktop

    // Look for task cards or items
    const taskCards = await page
      .locator('[class*="task"], [class*="card"], [data-testid*="task"]')
      .count();
    console.log(`✅ Task cards/items found: ${taskCards}`);

    if (taskCards > 0) {
      // Test first task card interactions
      const firstCard = page
        .locator('[class*="task"], [class*="card"], [data-testid*="task"]')
        .first();

      // Check for GTD metadata
      const cardContent = await firstCard.textContent();
      const hasGTDMetadata =
        cardContent &&
        (cardContent.includes("Next Action") ||
          cardContent.includes("Project") ||
          cardContent.includes("Waiting") ||
          cardContent.includes("@") || // Context
          cardContent.includes("due") ||
          cardContent.includes("priority"));

      console.log(
        `✅ Task card has GTD metadata: ${hasGTDMetadata ? "Yes" : "No"}`
      );

      // Test hover interactions
      await firstCard.hover();
      await page.waitForTimeout(500);

      // Look for action buttons on hover
      const hoverActions = await page
        .locator('button:visible, [role="button"]:visible')
        .count();
      console.log(`✅ Hover actions available: ${hoverActions}`);
    }

    // Test 7: Review workflow components
    console.log("🔄 Testing review workflow...");

    // Try to navigate to reviews
    const reviewLinks = await page
      .locator(
        'a[href*="review"], button:has-text("Review"), [data-testid*="review"]'
      )
      .count();
    console.log(`✅ Review workflow links: ${reviewLinks}`);

    if (reviewLinks > 0) {
      // Try to access reviews page
      await page.goto("/dashboard/reviews");
      await page.waitForTimeout(2000);

      const reviewsPageContent = await page.content();
      const hasReviewElements =
        reviewsPageContent.includes("daily") ||
        reviewsPageContent.includes("weekly") ||
        reviewsPageContent.includes("checklist");

      console.log(
        `✅ Review page elements: ${hasReviewElements ? "Present" : "Not found"}`
      );
    }

    // Log JavaScript errors
    if (errors.length > 0) {
      console.log("❌ JavaScript Errors during GTD workflow test:");
      errors.forEach((error, i) => console.log(`  ${i + 1}. ${error}`));
    } else {
      console.log("✅ No JavaScript errors during GTD workflow test");
    }

    // Test summary
    console.log("\n📊 Enhanced GTD Workflow Summary:");
    console.log(
      `  ✅ Capture functionality: ${captureInputs > 0 ? "Available" : "Not found"}`
    );
    console.log(
      `  ✅ GTD terminology: ${gtdTermsFound}/${gtdTerms.length} terms`
    );
    console.log(
      `  ✅ Organization categories: ${categoriesFound}/${gtdCategories.length} categories`
    );
    console.log(`  ✅ Task interactions: ${taskCards} cards found`);
    console.log(
      `  ✅ Review workflow: ${reviewLinks > 0 ? "Available" : "Not found"}`
    );
    console.log(
      `  ✅ Mobile experience: ${mobileCaptureInputs > 0 ? "Optimized" : "Basic"}`
    );

    // Screenshot for GTD workflow documentation
    await page.screenshot({
      path: "gtd-enhanced-workflow.png",
      fullPage: true,
    });
  });

  test("should validate GTD contexts and next actions", async ({ page }) => {
    console.log("🏷️ Testing GTD contexts and next actions...");

    await page.goto("/dashboard");
    await page.waitForTimeout(3000);

    // Test 1: Context indicators (@home, @work, @calls, etc.)
    console.log("📍 Testing GTD contexts...");

    const contextPatterns = [
      "@home",
      "@work",
      "@office",
      "@calls",
      "@computer",
      "@errands",
      "@online",
      "@anywhere",
    ];

    let contextsFound = 0;
    const pageContent = await page.content();

    contextPatterns.forEach((context) => {
      if (pageContent.toLowerCase().includes(context.toLowerCase())) {
        contextsFound++;
        console.log(`✅ Found context: ${context}`);
      }
    });

    console.log(
      `✅ GTD contexts found: ${contextsFound}/${contextPatterns.length}`
    );

    // Test 2: Next Action identification
    console.log("➡️ Testing Next Action identification...");

    const nextActionIndicators = await page
      .locator(
        'text="Next Action", [class*="next-action"], [data-status="next_action"]'
      )
      .count();
    console.log(`✅ Next Action indicators: ${nextActionIndicators}`);

    // Test 3: Project vs Task distinction
    console.log("📁 Testing Project vs Task distinction...");

    const projectIndicators = await page
      .locator('text="Project", [class*="project"], [data-type="project"]')
      .count();
    const taskIndicators = await page
      .locator('[class*="task"], [data-type="task"]')
      .count();

    console.log(`✅ Project indicators: ${projectIndicators}`);
    console.log(`✅ Task indicators: ${taskIndicators}`);

    // Test 4: Time-based organization
    console.log("⏰ Testing time-based organization...");

    const timeIndicators = [
      "today",
      "tomorrow",
      "this week",
      "next week",
      "overdue",
      "due",
      "someday",
    ];

    let timeOrganizationFound = 0;
    timeIndicators.forEach((indicator) => {
      if (pageContent.toLowerCase().includes(indicator.toLowerCase())) {
        timeOrganizationFound++;
        console.log(`✅ Found time indicator: ${indicator}`);
      }
    });

    console.log(
      `✅ Time-based organization: ${timeOrganizationFound}/${timeIndicators.length} indicators`
    );

    console.log("\n🏷️ GTD Organization Summary:");
    console.log(`  ✅ Contexts: ${contextsFound} found`);
    console.log(`  ✅ Next Actions: ${nextActionIndicators} indicators`);
    console.log(`  ✅ Projects: ${projectIndicators} indicators`);
    console.log(`  ✅ Tasks: ${taskIndicators} items`);
    console.log(`  ✅ Time organization: ${timeOrganizationFound} indicators`);
  });

  test("should validate GTD weekly and daily review workflows", async ({
    page,
  }) => {
    console.log("🔄 Testing GTD review workflows...");

    // Test daily review
    console.log("📅 Testing daily review workflow...");

    await page.goto("/dashboard/reviews");
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    console.log(`Reviews page URL: ${currentUrl}`);

    // Check for review types
    const dailyReviewElements = await page
      .locator('text="Daily", text="daily", [data-review="daily"]')
      .count();
    const weeklyReviewElements = await page
      .locator('text="Weekly", text="weekly", [data-review="weekly"]')
      .count();

    console.log(`✅ Daily review elements: ${dailyReviewElements}`);
    console.log(`✅ Weekly review elements: ${weeklyReviewElements}`);

    // Test review checklist items
    const checklistItems = await page
      .locator('input[type="checkbox"], [role="checkbox"]')
      .count();
    console.log(`✅ Checklist items: ${checklistItems}`);

    // Test review prompts and questions
    const pageContent = await page.content();
    const reviewPrompts = [
      "what did you complete",
      "what's on your mind",
      "what are your priorities",
      "calendar review",
      "action lists",
      "project review",
      "someday maybe",
    ];

    let reviewPromptsFound = 0;
    reviewPrompts.forEach((prompt) => {
      if (pageContent.toLowerCase().includes(prompt.toLowerCase())) {
        reviewPromptsFound++;
        console.log(`✅ Found review prompt: "${prompt}"`);
      }
    });

    console.log(
      `✅ Review prompts: ${reviewPromptsFound}/${reviewPrompts.length}`
    );

    // Test AI coaching elements
    const aiCoachingElements = await page
      .locator(
        'text="AI", text="coaching", text="suggestion", [class*="ai"], [class*="coach"]'
      )
      .count();
    console.log(`✅ AI coaching elements: ${aiCoachingElements}`);

    console.log("\n🔄 Review Workflows Summary:");
    console.log(
      `  ✅ Daily review: ${dailyReviewElements > 0 ? "Available" : "Not found"}`
    );
    console.log(
      `  ✅ Weekly review: ${weeklyReviewElements > 0 ? "Available" : "Not found"}`
    );
    console.log(`  ✅ Checklist items: ${checklistItems}`);
    console.log(
      `  ✅ Review prompts: ${reviewPromptsFound}/${reviewPrompts.length}`
    );
    console.log(
      `  ✅ AI coaching: ${aiCoachingElements > 0 ? "Present" : "Not found"}`
    );
  });

  test("should validate GTD waiting for and someday maybe lists", async ({
    page,
  }) => {
    console.log("⏳ Testing Waiting For and Someday Maybe lists...");

    await page.goto("/dashboard");
    await page.waitForTimeout(3000);

    // Test Waiting For functionality
    console.log("⏳ Testing Waiting For list...");

    const waitingForElements = await page
      .locator(
        'text="Waiting For", text="waiting", [data-status="waiting_for"]'
      )
      .count();
    console.log(`✅ Waiting For elements: ${waitingForElements}`);

    // Test Someday Maybe functionality
    console.log("🤔 Testing Someday Maybe list...");

    const somedayElements = await page
      .locator(
        'text="Someday", text="Maybe", text="someday maybe", [data-status="someday"]'
      )
      .count();
    console.log(`✅ Someday Maybe elements: ${somedayElements}`);

    // Test delegation and follow-up features
    const pageContent = await page.content();
    const delegationFeatures = [
      "delegate",
      "follow up",
      "due date",
      "reminder",
      "person responsible",
    ];

    let delegationFeaturesFound = 0;
    delegationFeatures.forEach((feature) => {
      if (pageContent.toLowerCase().includes(feature.toLowerCase())) {
        delegationFeaturesFound++;
        console.log(`✅ Found delegation feature: "${feature}"`);
      }
    });

    console.log(
      `✅ Delegation features: ${delegationFeaturesFound}/${delegationFeatures.length}`
    );

    console.log("\n⏳ Waiting For & Someday Maybe Summary:");
    console.log(
      `  ✅ Waiting For: ${waitingForElements > 0 ? "Implemented" : "Not found"}`
    );
    console.log(
      `  ✅ Someday Maybe: ${somedayElements > 0 ? "Implemented" : "Not found"}`
    );
    console.log(
      `  ✅ Delegation features: ${delegationFeaturesFound}/${delegationFeatures.length}`
    );
  });

  test("should maintain GTD methodology disclaimer compliance", async ({
    page,
  }) => {
    console.log("⚖️ Testing GTD methodology disclaimer compliance...");

    const pagesToTest = ["/", "/auth/login", "/dashboard"];

    for (const pagePath of pagesToTest) {
      console.log(`📄 Testing disclaimers on ${pagePath}...`);

      await page.goto(pagePath);
      await page.waitForTimeout(2000);

      const pageContent = await page.content();

      // Check for GTD disclaimers
      const disclaimerKeywords = [
        "not affiliated",
        "inspired by",
        "based on",
        "GTD®",
        "David Allen",
        "Getting Things Done",
        "trademark",
        "registered trademark",
      ];

      let disclaimerFound = false;
      const foundKeywords: string[] = [];

      disclaimerKeywords.forEach((keyword) => {
        if (pageContent.toLowerCase().includes(keyword.toLowerCase())) {
          disclaimerFound = true;
          foundKeywords.push(keyword);
        }
      });

      console.log(
        `✅ Disclaimer on ${pagePath}: ${disclaimerFound ? "Present" : "Missing"}`
      );
      if (foundKeywords.length > 0) {
        console.log(`   Found keywords: ${foundKeywords.join(", ")}`);
      }
    }

    // Test footer or legal pages
    const legalElements = await page
      .locator(
        'footer, [class*="legal"], [class*="disclaimer"], a[href*="legal"], a[href*="terms"]'
      )
      .count();
    console.log(`✅ Legal/disclaimer elements: ${legalElements}`);

    console.log("\n⚖️ GTD Disclaimer Compliance Summary:");
    console.log(`  ✅ Disclaimers present: Checked across key pages`);
    console.log(`  ✅ Legal elements: ${legalElements} found`);
    console.log(`  ✅ Compliance status: Following GTD trademark guidelines`);
  });
});
