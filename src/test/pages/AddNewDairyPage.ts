import { Page, Locator, expect } from '@playwright/test';

export class AddNewDairyPage {
  constructor(private page: Page) {}

  private readonly selectors = {
    step1TellUs: () => this.page.getByText('Tell us about the Dairy', { exact: true }),
    step2Address: () => this.page.getByText('Set the Dairy Address', { exact: true }),
    step3Owner: () => this.page.getByText('Set the Dairy Owner', { exact: true }),
    step4Confirmation: () => this.page.getByText('Confirmation', { exact: true }),

    // React-select input for "Dairy Product Type *" (observed id: react-select-5-input)
    dairyProductTypeInput: () => this.page.locator('#react-select-5-input'),
    productTypeOptionFoundation: () => this.page.getByText('Foundation', { exact: true }),
    productTypeOptionDCU: () => this.page.getByText('DCU', { exact: true }),
  };

  private get step1TellUs(): Locator {
    return this.selectors.step1TellUs();
  }

  private get step2Address(): Locator {
    return this.selectors.step2Address();
  }

  private get step3Owner(): Locator {
    return this.selectors.step3Owner();
  }

  private get step4Confirmation(): Locator {
    return this.selectors.step4Confirmation();
  }

  private get dairyProductTypeInput(): Locator {
    return this.selectors.dairyProductTypeInput();
  }

  private get productTypeOptionFoundation(): Locator {
    return this.selectors.productTypeOptionFoundation();
  }

  private get productTypeOptionDCU(): Locator {
    return this.selectors.productTypeOptionDCU();
  }

  async assertDefaultStepperHas3Steps(): Promise<void> {
    await expect(this.step1TellUs).toBeVisible();
    await expect(this.step2Address).toBeVisible();
    await expect(this.step3Owner).toBeVisible();
  }

  async assertStep4ConfirmationNotVisible(): Promise<void> {
    await expect(this.step4Confirmation).toHaveCount(0);
  }

  async assertStep4ConfirmationVisible(): Promise<void> {
    await expect(this.step4Confirmation).toBeVisible();
  }

  async selectFoundationProductType(): Promise<void> {
    await this.dairyProductTypeInput.click();
    await this.productTypeOptionFoundation.click();
  }

  async selectDCUProductType(): Promise<void> {
    await this.dairyProductTypeInput.click();
    await this.productTypeOptionDCU.click();
  }
}
