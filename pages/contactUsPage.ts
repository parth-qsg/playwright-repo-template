import { expect, type Locator, type Page } from "@playwright/test";
import type { ContactUsFormData } from "../types/contactUs.types";

export class ContactUsPage {
  constructor(private readonly page: Page) {}

  private get notFoundText(): Locator {
    return this.page.getByText("Not Found");
  }

  async goto(): Promise<void> {
    await this.page.goto("/contact-us");
  }

  async assertAt(): Promise<void> {
    await expect(this.page).toHaveURL("https://demo.qmagic.ai/contact-us");
  }

  async assertContactUsPageIsAvailable(): Promise<void> {
    await expect(this.notFoundText).toHaveCount(0);
  }

  async submitValidForm(_data: ContactUsFormData): Promise<void> {
    throw new Error(
      "Contact Us form fields were not found during exploration (page shows 'Not Found'). Update locators after the Contact Us page is available.",
    );
  }

  async assertSuccessConfirmationVisible(): Promise<void> {
    throw new Error(
      "Success confirmation message could not be identified during exploration (page shows 'Not Found'). Update assertion after the Contact Us page is available.",
    );
  }
}
