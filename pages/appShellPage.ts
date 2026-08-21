import { expect, type Locator, type Page } from "@playwright/test";

export class AppShellPage {
  constructor(private readonly page: Page) {}

  private get dashboardNavLink(): Locator {
    return this.page.getByRole("link", { name: "Dashboard" });
  }

  private get userStoriesNavLink(): Locator {
    return this.page.getByRole("link", { name: "User Stories" });
  }

  private get executionNavLink(): Locator {
    return this.page.getByRole("link", { name: "Execution" });
  }

  private get accountMenuButton(): Locator {
    return this.page.getByRole("button", { name: "Account menu for Jane Smith" });
  }

  private get versionText(): Locator {
    return this.page.getByText("v0.1.11");
  }

  async assertAuthenticatedShellVisible(): Promise<void> {
    await expect(this.dashboardNavLink).toBeVisible();
    await expect(this.userStoriesNavLink).toBeVisible();
    await expect(this.executionNavLink).toBeVisible();
    await expect(this.accountMenuButton).toBeVisible();
    await expect(this.versionText).toBeVisible();
  }

  async clickUserStoriesNav(): Promise<void> {
    await expect(this.userStoriesNavLink).toBeVisible();
    await expect(this.userStoriesNavLink).toBeEnabled();
    await this.userStoriesNavLink.click();
  }

  async assertAtUserStories(): Promise<void> {
    await expect(this.page).toHaveURL("/user-stories");
  }
}
