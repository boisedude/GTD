import { test as setup, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

const authFile = "tests/e2e/.auth/user.json";

setup("authenticate", async ({ page }) => {
  // Perform authentication steps
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.completeLogin("test@example.com");

  // Wait for successful login
  await page.waitForURL("/dashboard");
  await expect(page.getByTestId("user-menu")).toBeVisible();

  // Save signed-in state to reuse in tests
  await page.context().storageState({ path: authFile });
});

setup("seed test data", async ({ page }) => {
  // This setup runs after authentication
  // We can seed test data here if needed

  await page.goto("/dashboard");

  // Create some test tasks for consistent test state
  const testTasks = [
    "Test captured task",
    "Test next action",
    "Test project task",
  ];

  for (const task of testTasks) {
    await page.getByTestId("capture-input").fill(task);
    await page.getByRole("button", { name: /add task/i }).click();

    // Wait for task to be created
    await expect(page.getByText(task)).toBeVisible();
  }

  // Move one task to next actions
  const taskCard = page
    .getByTestId("task-card")
    .filter({ hasText: "Test next action" });
  await taskCard.getByTestId("task-menu").click();
  await page.getByRole("menuitem", { name: /next action/i }).click();

  // Create a test project
  await page.getByTestId("nav-projects").click();
  await page.getByRole("button", { name: /new project/i }).click();

  const projectModal = page.getByTestId("project-edit-modal");
  await projectModal.getByPlaceholder("Project name").fill("Test Project");
  await projectModal.getByRole("button", { name: /create/i }).click();
});
