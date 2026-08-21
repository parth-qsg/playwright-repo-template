import { test } from "@playwright/test";
import { LoginPage } from "../../pages/loginPage";
import { AppShellPage } from "../../pages/appShellPage";
import { UserStoriesPage } from "../../pages/userStoriesPage";
import { UserStoryDetailsPage } from "../../pages/userStoryDetailsPage";

test.describe(
  "NE-TC-1 - Smoke test: Login, select assigned client, navigate to User Stories, and view a story",
  { tag: ["@dv", "@regression"] },
  () => {
    test("@new Login, select client, open User Stories, and view a story", async ({ page }) => {
      const loginPage = new LoginPage(page);
      const appShellPage = new AppShellPage(page);
      const userStoriesPage = new UserStoriesPage(page);
      const userStoryDetailsPage = new UserStoryDetailsPage(page);

      // Arrange
      await loginPage.goto();

      // Assert
      await loginPage.assertLoginPageVisible();

      // Act
      await loginPage.login();
      await loginPage.selectClientIfPrompted({ clientName: "QMagic" });

      // Assert
      await loginPage.assertAuthenticationAdvanced();
      await appShellPage.assertAuthenticatedShellVisible();

      // Act
      await appShellPage.clickUserStoriesNav();

      // Assert
      await appShellPage.assertAtUserStories();
      await userStoriesPage.assertProductsListVisible();

      // Act
      await userStoriesPage.openFirstProduct();
      await userStoriesPage.assertSprintsListVisible();
      await userStoriesPage.openSprint3();

      // Assert
      await userStoriesPage.assertAtLeastOneUserStoryListed();

      // Act
      await userStoriesPage.openManageExecutionsStory();

      // Assert
      await userStoryDetailsPage.assertUrlHasUserStoryIdQueryParam();
      await userStoryDetailsPage.assertStoryDetailsVisible();
    });
  },
);
