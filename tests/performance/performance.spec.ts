import { test, expect } from "@playwright/test";
import { GTDTestHelpers, PERFORMANCE_THRESHOLDS } from "../helpers/test-utils";
// import { TEST_USERS, PERFORMANCE_TEST_DATA } from "../fixtures/test-data";

test.describe("Performance Tests", () => {
  let helpers: GTDTestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new GTDTestHelpers(page);
    await helpers.ensureAuthenticated();
  });

  test.describe("Core Performance Requirements", () => {
    test("should capture tasks within 5 seconds", async ({ page }) => {
      await page.goto("/dashboard");

      // Test various capture scenarios
      const scenarios = [
        { title: "Simple quick task", expected: 3000 },
        {
          title: "Task with basic details",
          options: { description: "Simple description", context: "office" },
          expected: 4000,
        },
        {
          title: "Complex task with all fields",
          options: {
            description: "Detailed task description",
            context: "computer",
            energy_level: "high",
            estimated_duration: "1hour",
            priority: 1,
            tags: ["urgent", "work", "client"],
          },
          expected: PERFORMANCE_THRESHOLDS.TASK_CAPTURE_MAX_TIME,
        },
      ];

      for (const scenario of scenarios) {
        const startTime = Date.now();
        await helpers.captureTask(scenario.title, scenario.options || {});
        const captureTime = Date.now() - startTime;

        expect(captureTime).toBeLessThan(scenario.expected);
        console.log(
          `${scenario.title}: ${captureTime}ms (limit: ${scenario.expected}ms)`
        );
      }
    });

    test("should load pages within performance thresholds", async ({
      page: _page,
    }) => {
      const pages = [
        { url: "/dashboard", name: "Dashboard" },
        { url: "/dashboard/inbox", name: "Inbox" },
        { url: "/dashboard/next-actions", name: "Next Actions" },
        { url: "/dashboard/projects", name: "Projects" },
        { url: "/dashboard/reviews", name: "Reviews" },
        { url: "/engage", name: "Engagement" },
      ];

      for (const pageInfo of pages) {
        const loadTime = await helpers.measurePageLoadTime(pageInfo.url);
        expect(loadTime).toBeLessThan(
          PERFORMANCE_THRESHOLDS.PAGE_LOAD_MAX_TIME
        );
        console.log(`${pageInfo.name}: ${loadTime}ms`);
      }
    });

    test("should search quickly", async ({ page }) => {
      // Create test data for search
      for (let i = 0; i < 20; i++) {
        await helpers.captureTask(`Search test task ${i + 1}`, {
          description: `Task description ${i + 1}`,
          tags: [`tag${i % 5}`, "search-test"],
        });
      }

      await page.goto("/dashboard");

      // Test various search queries
      const searchQueries = [
        "task",
        "description",
        "tag1",
        "search-test",
        "nonexistent",
      ];

      for (const query of searchQueries) {
        const startTime = Date.now();
        await helpers.searchTasks(query);
        const searchTime = Date.now() - startTime;

        expect(searchTime).toBeLessThan(
          PERFORMANCE_THRESHOLDS.SEARCH_RESPONSE_MAX_TIME
        );
        console.log(`Search "${query}": ${searchTime}ms`);
      }
    });

    test("should handle review steps within time limits", async ({ page }) => {
      await helpers.startDailyReview();

      // Measure time for each review step
      for (let step = 1; step <= 6; step++) {
        const startTime = Date.now();
        await helpers.completeReviewStep();
        const stepTime = Date.now() - startTime;

        expect(stepTime).toBeLessThan(
          PERFORMANCE_THRESHOLDS.REVIEW_STEP_MAX_TIME
        );
        console.log(`Review step ${step}: ${stepTime}ms`);
      }
    });
  });

  test.describe("Load Performance", () => {
    test("should handle large numbers of tasks efficiently", async ({
      page,
    }) => {
      // Create large dataset
      console.log("Creating large task dataset...");
      const batchSize = 25;
      const totalTasks = 100;

      for (let batch = 0; batch < totalTasks / batchSize; batch++) {
        const batchStart = Date.now();

        for (let i = 0; i < batchSize; i++) {
          const taskIndex = batch * batchSize + i + 1;
          await helpers.captureTask(`Load test task ${taskIndex}`, {
            status: "next_action",
            context: ["office", "home", "calls", "errands"][taskIndex % 4] as
              | "office"
              | "home"
              | "calls"
              | "errands",
            energy_level: ["high", "medium", "low"][taskIndex % 3] as
              | "high"
              | "medium"
              | "low",
            estimated_duration: ["5min", "15min", "30min", "1hour"][
              taskIndex % 4
            ] as "5min" | "15min" | "30min" | "1hour",
            priority: (taskIndex % 5) + 1,
            tags: [`batch${batch}`, `task${taskIndex}`],
          });

          // Small delay to avoid overwhelming the system
          if (i % 10 === 0) {
            await page.waitForTimeout(50);
          }
        }

        const batchTime = Date.now() - batchStart;
        console.log(`Batch ${batch + 1} (${batchSize} tasks): ${batchTime}ms`);
      }

      // Test performance with large dataset
      console.log("Testing performance with large dataset...");

      // Page load performance
      const loadStart = Date.now();
      await page.goto("/dashboard");
      const loadTime = Date.now() - loadStart;

      expect(loadTime).toBeLessThan(
        PERFORMANCE_THRESHOLDS.PAGE_LOAD_MAX_TIME * 2
      ); // Allow 2x for large dataset
      console.log(`Dashboard load with ${totalTasks} tasks: ${loadTime}ms`);

      // Navigation performance
      const navStart = Date.now();
      await helpers.navigateToList("next-actions");
      const navTime = Date.now() - navStart;

      expect(navTime).toBeLessThan(PERFORMANCE_THRESHOLDS.PAGE_LOAD_MAX_TIME);
      console.log(`Navigation to next-actions: ${navTime}ms`);

      // Search performance with large dataset
      const searchStart = Date.now();
      await helpers.searchTasks("Load test");
      const searchTime = Date.now() - searchStart;

      expect(searchTime).toBeLessThan(
        PERFORMANCE_THRESHOLDS.SEARCH_RESPONSE_MAX_TIME * 2
      );
      console.log(`Search with large dataset: ${searchTime}ms`);

      // Filter performance
      const filterStart = Date.now();
      await helpers.filterTasks({ context: "office" });
      const filterTime = Date.now() - filterStart;

      expect(filterTime).toBeLessThan(2000); // 2 seconds for filtering
      console.log(`Filter application: ${filterTime}ms`);
    });

    test("should handle concurrent operations", async ({ page, context }) => {
      // Create multiple pages to simulate concurrent users
      const pages = [page];
      for (let i = 0; i < 2; i++) {
        const newPage = await context.newPage();
        pages.push(newPage);
      }

      // Authenticate all pages
      for (const testPage of pages) {
        const pageHelpers = new GTDTestHelpers(testPage);
        await pageHelpers.ensureAuthenticated();
      }

      // Perform concurrent operations
      const operations = pages.map(async (testPage, index) => {
        const pageHelpers = new GTDTestHelpers(testPage);

        // Each page performs different operations
        const startTime = Date.now();

        switch (index % 3) {
          case 0:
            // Page 0: Task capture
            for (let i = 0; i < 5; i++) {
              await pageHelpers.captureTask(`Concurrent task ${index}-${i}`);
            }
            break;
          case 1:
            // Page 1: Navigation and filtering
            await pageHelpers.navigateToList("next-actions");
            await pageHelpers.filterTasks({ context: "office" });
            break;
          case 2:
            // Page 2: Search operations
            await pageHelpers.searchTasks("task");
            break;
        }

        return Date.now() - startTime;
      });

      const results = await Promise.all(operations);

      // All operations should complete within reasonable time
      for (const operationTime of results) {
        expect(operationTime).toBeLessThan(10000); // 10 seconds max
      }

      console.log("Concurrent operation times:", results);

      // Close additional pages
      for (let i = 1; i < pages.length; i++) {
        await pages[i].close();
      }
    });

    test("should maintain performance during heavy interaction", async ({
      page,
    }) => {
      await page.goto("/dashboard");

      // Simulate heavy user interaction
      const interactions = [];

      for (let round = 0; round < 5; round++) {
        const roundStart = Date.now();

        // Rapid task creation
        for (let i = 0; i < 3; i++) {
          await helpers.captureTask(`Heavy interaction task ${round}-${i}`);
        }

        // Navigation
        await helpers.navigateToList("next-actions");
        await helpers.navigateToList("inbox");

        // Search
        await helpers.searchTasks(`task ${round}`);

        // Clear search
        await page.fill('[data-testid="search-input"]', "");
        await page.keyboard.press("Escape");

        const roundTime = Date.now() - roundStart;
        interactions.push(roundTime);

        console.log(`Heavy interaction round ${round + 1}: ${roundTime}ms`);
      }

      // Performance should not degrade significantly
      const avgTime =
        interactions.reduce((a, b) => a + b, 0) / interactions.length;
      const maxTime = Math.max(...interactions);

      expect(avgTime).toBeLessThan(5000); // 5 seconds average
      expect(maxTime).toBeLessThan(8000); // 8 seconds max

      // Later rounds should not be significantly slower than early rounds
      const earlyAvg = interactions.slice(0, 2).reduce((a, b) => a + b, 0) / 2;
      const lateAvg = interactions.slice(-2).reduce((a, b) => a + b, 0) / 2;

      expect(lateAvg / earlyAvg).toBeLessThan(2); // No more than 2x slower
    });
  });

  test.describe("Mobile Performance", () => {
    test("should perform well on mobile devices", async ({ page }) => {
      // Simulate mobile device
      await page.setViewportSize({ width: 375, height: 667 });

      // Test mobile-specific performance
      const mobileTests = [
        {
          name: "Mobile dashboard load",
          action: async () => {
            await page.goto("/dashboard");
          },
        },
        {
          name: "Mobile task capture",
          action: async () => {
            await helpers.captureTask("Mobile performance test");
          },
        },
        {
          name: "Mobile navigation",
          action: async () => {
            await page.click('[data-testid="mobile-menu"]');
            await page.click('[data-testid="mobile-nav-next-actions"]');
          },
        },
        {
          name: "Mobile search",
          action: async () => {
            await helpers.searchTasks("performance");
          },
        },
      ];

      for (const testItem of mobileTests) {
        const startTime = Date.now();
        await testItem.action();
        const testTime = Date.now() - startTime;

        // Mobile should be within 1.5x of desktop performance thresholds
        expect(testTime).toBeLessThan(
          PERFORMANCE_THRESHOLDS.PAGE_LOAD_MAX_TIME * 1.5
        );
        console.log(`${testItem.name}: ${testTime}ms`);
      }
    });

    test("should handle touch interactions efficiently", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/dashboard");

      // Create tasks for touch testing
      await helpers.captureTask("Touch test task 1");
      await helpers.captureTask("Touch test task 2");

      // Test touch interactions
      const touchTests = [
        {
          name: "Touch task selection",
          action: async () => {
            const task = page.locator('[data-testid="task-item"]').first();
            await task.click();
          },
        },
        {
          name: "Touch swipe action",
          action: async () => {
            await helpers.testMobileSwipeActions();
          },
        },
        {
          name: "Touch navigation",
          action: async () => {
            await page.click('[data-testid="nav-next-actions"]');
          },
        },
      ];

      for (const test of touchTests) {
        const startTime = Date.now();
        await test.action();
        const testTime = Date.now() - startTime;

        expect(testTime).toBeLessThan(1000); // Touch interactions should be snappy
        console.log(`${test.name}: ${testTime}ms`);
      }
    });
  });

  test.describe("Network Performance", () => {
    test("should handle slow network conditions", async ({ page, context }) => {
      // Simulate slow 3G network
      await context.route("**/*", async (route) => {
        // Add delay to simulate slow network
        await new Promise((resolve) => setTimeout(resolve, 100));
        await route.continue();
      });

      await page.goto("/dashboard");

      // Test performance with slow network
      const slowNetworkTests = [
        {
          name: "Task capture on slow network",
          action: async () => {
            await helpers.captureTask("Slow network test");
          },
          threshold: PERFORMANCE_THRESHOLDS.TASK_CAPTURE_MAX_TIME * 2,
        },
        {
          name: "Page navigation on slow network",
          action: async () => {
            await helpers.navigateToList("next-actions");
          },
          threshold: PERFORMANCE_THRESHOLDS.PAGE_LOAD_MAX_TIME * 2,
        },
      ];

      for (const test of slowNetworkTests) {
        const startTime = Date.now();
        await test.action();
        const testTime = Date.now() - startTime;

        expect(testTime).toBeLessThan(test.threshold);
        console.log(`${test.name}: ${testTime}ms (slow network)`);
      }
    });

    test("should work offline and sync when reconnected", async ({ page }) => {
      await page.goto("/dashboard");

      // Go offline
      await page.context().setOffline(true);

      // Test offline task capture performance
      const offlineStart = Date.now();
      const _result = await helpers.testOfflineCapture();
      const offlineTime = Date.now() - offlineStart;

      expect(offlineTime).toBeLessThan(
        PERFORMANCE_THRESHOLDS.TASK_CAPTURE_MAX_TIME
      );
      console.log(`Offline task capture: ${offlineTime}ms`);

      // Go back online and test sync performance
      const syncStart = Date.now();
      await page.context().setOffline(false);

      // Wait for sync to complete
      await expect(page.locator('[data-testid="sync-complete"]')).toBeVisible({
        timeout: 10000,
      });
      const syncTime = Date.now() - syncStart;

      expect(syncTime).toBeLessThan(5000); // 5 seconds for sync
      console.log(`Offline sync: ${syncTime}ms`);
    });

    test("should handle network errors gracefully", async ({ page }) => {
      await page.goto("/dashboard");

      // Simulate network failures
      await page.route("**/rest/v1/tasks", (route) => route.abort("failed"));

      // Try to capture task with network failure
      const errorStart = Date.now();

      const captureInput = page.locator('[data-testid="quick-capture-input"]');
      await captureInput.fill("Network error test");
      await page.keyboard.press("Enter");

      // Should show error quickly
      await expect(page.locator('[data-testid="capture-error"]')).toBeVisible({
        timeout: 3000,
      });
      const errorTime = Date.now() - errorStart;

      expect(errorTime).toBeLessThan(3000); // Should fail fast
      console.log(`Network error handling: ${errorTime}ms`);
    });
  });

  test.describe("Memory and Resource Usage", () => {
    test("should not have memory leaks during extended use", async ({
      page,
    }) => {
      await page.goto("/dashboard");

      // Get initial memory usage
      const initialMemory = await page.evaluate(() => {
        if ("memory" in performance) {
          return (performance as { memory: { usedJSHeapSize: number } }).memory
            .usedJSHeapSize;
        }
        return 0;
      });

      // Simulate extended usage
      for (let cycle = 0; cycle < 10; cycle++) {
        // Create and delete tasks
        for (let i = 0; i < 5; i++) {
          await helpers.captureTask(`Memory test ${cycle}-${i}`);
        }

        // Navigate between pages
        await helpers.navigateToList("next-actions");
        await helpers.navigateToList("inbox");

        // Search and filter
        await helpers.searchTasks("memory");
        await helpers.filterTasks({ context: "office" });

        // Clear search and filters
        await page.fill('[data-testid="search-input"]', "");
        await page.click('[data-testid="clear-filters"]');

        // Delete created tasks
        for (let i = 0; i < 5; i++) {
          await helpers.deleteTask(`Memory test ${cycle}-${i}`);
        }

        // Force garbage collection if available
        await page.evaluate(() => {
          if ("gc" in window) {
            (window as { gc?: () => void }).gc?.();
          }
        });
      }

      // Check final memory usage
      const finalMemory = await page.evaluate(() => {
        if ("memory" in performance) {
          return (performance as { memory: { usedJSHeapSize: number } }).memory
            .usedJSHeapSize;
        }
        return 0;
      });

      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = finalMemory - initialMemory;
        const increasePercentage = (memoryIncrease / initialMemory) * 100;

        console.log(
          `Memory usage: ${initialMemory} -> ${finalMemory} (+${increasePercentage.toFixed(1)}%)`
        );

        // Memory should not increase by more than 50% during extended use
        expect(increasePercentage).toBeLessThan(50);
      }
    });

    test("should handle large datasets without performance degradation", async ({
      page,
    }) => {
      await page.goto("/dashboard");

      // Measure baseline performance
      const baselineStart = Date.now();
      await helpers.captureTask("Baseline task");
      const baselineTime = Date.now() - baselineStart;

      // Create large dataset
      for (let i = 0; i < 200; i++) {
        await helpers.captureTask(`Dataset task ${i + 1}`, {
          description: `Description for task ${i + 1}`,
          context: ["office", "home", "calls", "errands"][i % 4] as
            | "office"
            | "home"
            | "calls"
            | "errands",
          tags: [`tag${i % 10}`, "dataset-test"],
        });

        // Batch creation to avoid overwhelming
        if (i % 50 === 0 && i > 0) {
          console.log(`Created ${i + 1} tasks...`);
          await page.waitForTimeout(1000);
        }
      }

      // Measure performance with large dataset
      const loadedStart = Date.now();
      await helpers.captureTask("Performance test with large dataset");
      const loadedTime = Date.now() - loadedStart;

      console.log(`Baseline capture: ${baselineTime}ms`);
      console.log(`With large dataset: ${loadedTime}ms`);

      // Performance should not degrade significantly
      expect(loadedTime).toBeLessThan(baselineTime * 3); // No more than 3x slower
      expect(loadedTime).toBeLessThan(
        PERFORMANCE_THRESHOLDS.TASK_CAPTURE_MAX_TIME * 2
      );
    });
  });

  test.describe("Performance Monitoring", () => {
    test("should track Core Web Vitals", async ({ page }) => {
      await page.goto("/dashboard");

      // Wait for page to fully load
      await page.waitForLoadState("networkidle");

      // Get Web Vitals metrics
      const webVitals = await page.evaluate(() => {
        return new Promise((resolve) => {
          const metrics = {};

          // LCP (Largest Contentful Paint)
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            if (entries.length > 0) {
              (metrics as Record<string, number>).lcp =
                entries[entries.length - 1].startTime;
            }
          }).observe({ entryTypes: ["largest-contentful-paint"] });

          // FID (First Input Delay) - simulated
          (metrics as Record<string, number>).fid = 0; // Would be measured on real user interaction

          // CLS (Cumulative Layout Shift)
          new PerformanceObserver((list) => {
            let clsValue = 0;
            for (const entry of list.getEntries()) {
              if (!(entry as LayoutShift).hadRecentInput) {
                clsValue += (entry as LayoutShift).value;
              }
            }
            (metrics as Record<string, number>).cls = clsValue;
          }).observe({ entryTypes: ["layout-shift"] });

          // FCP (First Contentful Paint)
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            if (entries.length > 0) {
              (metrics as Record<string, number>).fcp = entries[0].startTime;
            }
          }).observe({ entryTypes: ["paint"] });

          setTimeout(() => resolve(metrics), 2000);
        });
      });

      console.log("Web Vitals:", webVitals);

      // Check Core Web Vitals thresholds
      if ((webVitals as Record<string, number>).lcp) {
        expect((webVitals as Record<string, number>).lcp).toBeLessThan(2500); // LCP should be < 2.5s
      }

      if ((webVitals as Record<string, number>).fcp) {
        expect((webVitals as Record<string, number>).fcp).toBeLessThan(1800); // FCP should be < 1.8s
      }

      if ((webVitals as Record<string, number>).cls !== undefined) {
        expect((webVitals as Record<string, number>).cls).toBeLessThan(0.1); // CLS should be < 0.1
      }
    });

    test("should provide performance insights", async ({ page }) => {
      await page.goto("/dashboard");

      // Collect performance timing data
      const timingData = await page.evaluate(() => {
        const navigation = performance.getEntriesByType(
          "navigation"
        )[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType("paint");

        return {
          dns: navigation.domainLookupEnd - navigation.domainLookupStart,
          connect: navigation.connectEnd - navigation.connectStart,
          request: navigation.responseStart - navigation.requestStart,
          response: navigation.responseEnd - navigation.responseStart,
          domLoading:
            navigation.domContentLoadedEventStart - navigation.responseEnd,
          domComplete:
            navigation.domComplete - navigation.domContentLoadedEventStart,
          firstPaint:
            paint.find((p) => p.name === "first-paint")?.startTime || 0,
          firstContentfulPaint:
            paint.find((p) => p.name === "first-contentful-paint")?.startTime ||
            0,
        };
      });

      console.log("Performance timing breakdown:", timingData);

      // Validate reasonable timing values
      expect(timingData.dns).toBeLessThan(1000); // DNS lookup < 1s
      expect(timingData.connect).toBeLessThan(1000); // Connection < 1s
      expect(timingData.request).toBeLessThan(500); // Request time < 500ms
      expect(timingData.response).toBeLessThan(2000); // Response time < 2s
      expect(timingData.domLoading).toBeLessThan(2000); // DOM processing < 2s
    });
  });
});
