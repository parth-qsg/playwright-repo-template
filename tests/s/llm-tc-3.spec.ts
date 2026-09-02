import { test } from "@playwright/test";
import { LoginPage } from "../../pages/loginPage";
import { UserStoriesPage } from "../../pages/userStoriesPage";

test.describe(
  "LLM Script Generation - Reasoning view smoke",
  { tag: ["@regression", "@s"] },
  () => {
    test("@new LLM-TC-3 Smoke test: Verify LLM script generation reasoning/explanation page loads and primary elements are visible", async ({ page }) => {
      const loginPage = new LoginPage(page);
      const userStoriesPage = new UserStoriesPage(page);

      // Arrange
      await loginPage.goto();

      // Act
      await loginPage.login();
      await loginPage.selectClientIfPrompted({ clientName: "TEST" });

      // Assert
      // NOTE: In the current environment run, login does not progress beyond /login (no redirect and no client dialog).
      // We assert the login page is still present to provide a clear failure reason without guessing post-login locators.
      await page.getByRole("button", { name: "Sign In" }).isVisible();

      throw new Error(
        "Blocked: Login did not progress beyond the login page during execution (still on /login after submitting credentials). Unable to reach the authenticated area to validate the LLM reasoning/explanation view.",
      );
    });
  },
);
