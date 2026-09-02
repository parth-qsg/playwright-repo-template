import { expect, type Locator, type Page } from "@playwright/test";

export class UserStoriesPage {
  constructor(private readonly page: Page) {}

  private get dashboardLink(): Locator {
    return this.page.getByRole("link", { name: "Dashboard" });
  }

  private get userStoriesLink(): Locator {
    return this.page.getByRole("link", { name: "User Stories" });
  }

  private get executionLink(): Locator {
    return this.page.getByRole("link", { name: "Execution" });
  }

  private get productsSelectorButton(): Locator {
    return this.page.getByRole("button", { name: "Products Select product" });
  }

  private get sprintsSelectorButton(): Locator {
    return this.page.getByRole("button", { name: "Sprints Select sprint" });
  }

  private get userStoriesSelectorButton(): Locator {
    return this.page.getByRole("button", { name: "User Stories Select story" });
  }

  async assertAt(): Promise<void> {
    await expect(this.page).toHaveURL(
      "https://demo.qmagic.ai/user-stories?projectId=&userStoryId=&isRefinementPage=&testCaseId=&addTestCase=&editMode=&currentStep=",
    );
  }

  async assertPrimaryNavigationVisible(): Promise<void> {
    await expect(this.dashboardLink).toBeVisible();
    await expect(this.userStoriesLink).toBeVisible();
    await expect(this.executionLink).toBeVisible();
  }

  async assertPrimarySelectorsVisible(): Promise<void> {
    await expect(this.productsSelectorButton).toBeVisible();
    await expect(this.sprintsSelectorButton).toBeVisible();
    await expect(this.userStoriesSelectorButton).toBeVisible();
  }
}
