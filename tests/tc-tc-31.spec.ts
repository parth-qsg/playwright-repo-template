import { test } from "@playwright/test";
import { LoginPage } from "../pages/loginPage";
import { UserStoriesPage } from "../pages/userStoriesPage";

test.describe(
  "TC-TC-31 - Open Test Product details after selecting TEST client",
  { tag: ["@functional"] },
  () => {
    test("@new Open Test Product details after selecting TEST client", async ({ page }) => {
      const loginPage = new LoginPage(page);
      const userStoriesPage = new UserStoriesPage(page);

      // Arrange
      await loginPage.goto();

      // Act
      await loginPage.login();
      await loginPage.assertLoggedIn();

      await userStoriesPage.goto();
      await userStoriesPage.assertOnUserStoriesPage();

      await userStoriesPage.selectClientTest();
      await userStoriesPage.openProductsCatalogAndSelectTestProduct();
      await userStoriesPage.openTestProductDetails();

      // Assert
      await userStoriesPage.assertTestProductDetailsVisible();
    });
  }
);
