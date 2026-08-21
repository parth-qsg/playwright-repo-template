import { expect, type Locator, type Page } from "@playwright/test";

export class UserStoriesPage {
  constructor(private readonly page: Page) {}

  private get productsHeading(): Locator {
    return this.page.getByRole("heading", { name: "Products" });
  }

  private get productsTable(): Locator {
    return this.page.getByRole("table");
  }

  private get firstProductCell(): Locator {
    return this.page.getByRole("cell", { name: "QMagic-Quality-Gate", exact: true });
  }

  private get sprintsHeading(): Locator {
    return this.page.getByRole("heading", { name: "Sprints" });
  }

  private get sprint3Cell(): Locator {
    return this.page.getByRole("cell", { name: "Sprint 3" });
  }

  private get userStoriesHeading(): Locator {
    return this.page.getByRole("heading", { name: "User Stories" });
  }

  private get manageExecutionsStoryCell(): Locator {
    return this.page.getByRole("cell", { name: "Manage Executions" });
  }

  async assertProductsListVisible(): Promise<void> {
    await expect(this.productsHeading).toBeVisible();
    await expect(this.productsTable).toBeVisible();
  }

  async openFirstProduct(): Promise<void> {
    await expect(this.firstProductCell).toBeVisible();
    await expect(this.firstProductCell).toBeEnabled();
    await this.firstProductCell.click();
  }

  async assertSprintsListVisible(): Promise<void> {
    await expect(this.sprintsHeading).toBeVisible();
  }

  async openSprint3(): Promise<void> {
    await expect(this.sprint3Cell).toBeVisible();
    await expect(this.sprint3Cell).toBeEnabled();
    await this.sprint3Cell.click();
  }

  async assertAtLeastOneUserStoryListed(): Promise<void> {
    await expect(this.userStoriesHeading).toBeVisible();
    await expect(this.manageExecutionsStoryCell).toBeVisible();
  }

  async openManageExecutionsStory(): Promise<void> {
    await expect(this.manageExecutionsStoryCell).toBeVisible();
    await expect(this.manageExecutionsStoryCell).toBeEnabled();
    await this.manageExecutionsStoryCell.click();
  }
}
