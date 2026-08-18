import { Page, Locator, expect } from '@playwright/test';

export class uiActions {
  protected page: Page;
  protected _defaultTimeout = 30_000;
  protected _shortTimeout = 10_000;

  constructor(page: Page) {
    this.page = page;
  }

  async clickElement(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout: this._defaultTimeout });
    await locator.click();
  }

  async typeText(locator: Locator, text: string): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout: this._defaultTimeout });
    await locator.fill(text);
  }

  async assertVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible({ timeout: this._defaultTimeout });
  }

  async assertText(locator: Locator, expected: string): Promise<void> {
    await expect(locator).toHaveText(expected, { timeout: this._defaultTimeout });
  }

  async assertUrlContains(partial: string): Promise<void> {
    await expect(this.page).toHaveURL(
      new RegExp(partial.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      { timeout: this._defaultTimeout }
    );
  }

  async navigateTo(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  getElementText(locator: Locator): Promise<string | null> {
    return locator.textContent();
  }
}
