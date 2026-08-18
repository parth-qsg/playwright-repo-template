import { Page, Locator, expect } from '@playwright/test';

export class LactanetManagementPage {
  constructor(private page: Page) {}

  private readonly selectors = {
    addNewDairyButton: () => this.page.getByRole('button', { name: 'Add new Dairy' }),
  };

  private get addNewDairyButton(): Locator {
    return this.selectors.addNewDairyButton();
  }

  async clickAddNewDairy(): Promise<void> {
    await this.addNewDairyButton.click();
    await expect(this.page).toHaveURL(/\/support\/lactanet\/dairies\/create/);
    await expect(this.page.getByRole('heading', { name: 'Add New Dairy' })).toBeVisible();
  }
}
