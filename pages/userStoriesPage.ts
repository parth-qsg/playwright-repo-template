import { expect, Locator, Page } from "@playwright/test";

export class UserStoriesPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get clientsButton(): Locator {
    return this.page.getByRole("button", { name: "Clients TEST" });
  }

  private get productsButton(): Locator {
    return this.page.getByRole("button", { name: "Products Test Product" });
  }

  private get productsButtonExpanded(): Locator {
    return this.page.getByRole("button", { name: "Products Test Product", expanded: true });
  }

  private get selectClientDialogHeading(): Locator {
    return this.page.getByText("Select Client");
  }

  private get selectClientPromptText(): Locator {
    return this.page.getByText("Select Client");
  }

  private get selectClientCombobox(): Locator {
    return this.page.getByRole("combobox");
  }

  private get selectClientConfirmButton(): Locator {
    return this.page.getByRole("button", { name: "Confirm" });
  }

  private get switchProductDialogHeading(): Locator {
    return this.page.getByText("Switch Product");
  }

  private get testProductOptionButton(): Locator {
    return this.page.getByRole("button", { name: "Test Product 4 sprints" });
  }

  private get breadcrumbProductButton(): Locator {
    return this.page.getByRole("button", { name: "Test Product", exact: true });
  }

  private get sprintsHeading(): Locator {
    return this.page.getByRole("heading", { name: "Sprints" });
  }

  private get sprintsSubheading(): Locator {
    return this.page.getByText("Test Product - all sprints");
  }

  async goto(): Promise<void> {
    await this.page.goto(
      "/user-stories?projectId=&userStoryId=&isRefinementPage=&testCaseId=&addTestCase=&editMode=&currentStep="
    );
  }

  async assertOnUserStoriesPage(): Promise<void> {
    await expect(this.page).toHaveURL(
      "https://demo.qmagic.ai/user-stories?projectId=&userStoryId=&isRefinementPage=&testCaseId=&addTestCase=&editMode=&currentStep="
    );
  }

  async selectClientTest(): Promise<void> {
    await expect(this.clientsButton).toBeVisible();
    await expect(this.clientsButton).toBeEnabled();
    await this.clientsButton.click();

    await expect(this.selectClientDialogHeading).toBeVisible();
    await expect(this.selectClientCombobox).toBeVisible();
    await this.selectClientCombobox.selectOption(["TEST"]);

    await expect(this.selectClientConfirmButton).toBeEnabled();
    await this.selectClientConfirmButton.click();

    await expect(this.clientsButton).toBeVisible();
  }

  async openProductsCatalogAndSelectTestProduct(): Promise<void> {
    await expect(this.productsButton).toBeVisible();
    await expect(this.productsButton).toBeEnabled();
    await this.productsButton.click();

    await expect(this.switchProductDialogHeading).toBeVisible();
    await expect(this.testProductOptionButton).toBeVisible();
    await expect(this.testProductOptionButton).toBeEnabled();
    await this.testProductOptionButton.click();

    await expect(this.productsButtonExpanded).toBeVisible();
  }

  async assertSelectClientPromptVisible(): Promise<void> {
    await expect(this.selectClientPromptText).toBeVisible();
  }

  async openTestProductDetails(): Promise<void> {
    await expect(this.breadcrumbProductButton).toBeVisible();
    await expect(this.breadcrumbProductButton).toBeEnabled();
    await this.breadcrumbProductButton.click();
  }

  async assertTestProductDetailsVisible(): Promise<void> {
    await expect(this.breadcrumbProductButton).toBeVisible();
    await expect(this.sprintsHeading).toBeVisible();
    await expect(this.sprintsSubheading).toBeVisible();
  }
}
