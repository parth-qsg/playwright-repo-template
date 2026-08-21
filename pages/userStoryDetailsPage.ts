import { expect, type Locator, type Page } from "@playwright/test";

export class UserStoryDetailsPage {
  constructor(private readonly page: Page) {}

  private get storyTitleHeading(): Locator {
    return this.page.getByRole("heading", { name: "Manage Executions" });
  }

  private get storyIdText(): Locator {
    return this.page.getByText("QQG-7");
  }

  private get testCasesHeading(): Locator {
    return this.page.getByRole("heading", { name: "Test Cases" });
  }

  async assertStoryDetailsVisible(): Promise<void> {
    await expect(this.storyIdText).toBeVisible();
    await expect(this.storyTitleHeading).toBeVisible();
    await expect(this.testCasesHeading).toBeVisible();
  }

  async assertUrlHasUserStoryIdQueryParam(): Promise<void> {
    await expect(this.page).toHaveURL(
      "/user-stories?projectId=cde590f8-6868-4259-b379-f007fbd4351e&userStoryId=666e2e84-7863-480d-bf59-4b1e5af26663",
    );
  }
}
