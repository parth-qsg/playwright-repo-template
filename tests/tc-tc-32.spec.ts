import { test } from "@playwright/test";
import { LoginPage } from "../pages/loginPage";
import { UserStoriesPage } from "../pages/userStoriesPage";

test.describe(
  "TC-TC-32 - Attempt to verify product existence without selecting a client",
  { tag: ["@functional", "@smoke"] },
  () => {
    test("@new Attempt to search product without client selection shows validation", async ({ page }) => {
      const loginPage = new LoginPage(page);
      const userStoriesPage = new UserStoriesPage(page);

      // Arrange
      await loginPage.goto();

      // Act
      await loginPage.login();
      await loginPage.assertLoggedIn();

      await userStoriesPage.goto();

      // Attempt to open Products catalog without selecting a client
      await userStoriesPage.openProductsCatalogAndSelectTestProduct();

      // Assert
      await userStoriesPage.assertSelectClientPromptVisible();
    });
  }
);
