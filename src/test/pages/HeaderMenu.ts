import { Page, Locator, expect } from '@playwright/test';

export class HeaderMenu {
  constructor(private page: Page) {}

  private readonly selectors = {
    userThumbnail: () => this.page.getByRole('img', { name: 'user thumbnail' }),
    lactanetManagementLink: () => this.page.getByRole('link', { name: 'Lactanet Management' }),
  };

  private get userThumbnail(): Locator {
    return this.selectors.userThumbnail();
  }

  private get lactanetManagementLink(): Locator {
    return this.selectors.lactanetManagementLink();
  }

  async openUserProfileDropdown(): Promise<void> {
    await this.userThumbnail.click();
  }

  async goToLactanetManagement(): Promise<void> {
    await this.lactanetManagementLink.click();
    await expect(this.page).toHaveURL(/\/support\/lactanet\/dairies/);
  }
}
