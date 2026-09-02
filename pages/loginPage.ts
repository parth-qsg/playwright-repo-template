import { expect, type Locator, type Page } from "@playwright/test";

export class LoginPage {
  constructor(private readonly page: Page) {}

  private get emailGroup(): Locator {
    return this.page.getByRole("group", { name: "Email" });
  }

  private get emailInput(): Locator {
    return this.emailGroup.getByRole("textbox");
  }

  private get passwordGroup(): Locator {
    return this.page.getByRole("group", { name: "Password" });
  }

  private get passwordInput(): Locator {
    return this.passwordGroup.getByRole("textbox");
  }

  private get signInButton(): Locator {
    return this.page.getByRole("button", { name: "Sign In" });
  }

  private get selectClientDialog(): Locator {
    return this.page.getByRole("dialog");
  }

  private get selectClientCombobox(): Locator {
    return this.selectClientDialog.getByRole("combobox");
  }

  private get confirmClientButton(): Locator {
    return this.selectClientDialog.getByRole("button", { name: "Confirm" });
  }

  async goto(): Promise<void> {
    await this.page.goto("/login");
  }

  async login(params?: { username?: string; password?: string }): Promise<void> {
    const username =
      params?.username ??
      process.env.TEST_USERNAME ??
      process.env.APP_USERNAME ??
      "";

    const password =
      params?.password ??
      process.env.TEST_PASSWORD ??
      process.env.APP_PASSWORD ??
      "";

    await expect(this.emailInput).toBeVisible();
    await this.emailInput.fill(username);

    await expect(this.passwordInput).toBeVisible();
    await this.passwordInput.fill(password);

    await expect(this.signInButton).toBeVisible();
    await expect(this.signInButton).toBeEnabled();
    await this.signInButton.click();
  }

  async selectClientIfPrompted(params: { clientName: string }): Promise<void> {
    const isDialogVisible = await this.selectClientDialog.isVisible().catch(() => false);
    if (!isDialogVisible) return;

    await expect(this.selectClientCombobox).toBeVisible();
    await this.selectClientCombobox.selectOption(params.clientName);

    await expect(this.confirmClientButton).toBeVisible();
    await expect(this.confirmClientButton).toBeEnabled();
    await this.confirmClientButton.click();
  }

  async assertLoggedIn(): Promise<void> {
    await expect(this.page).not.toHaveURL("https://demo.qmagic.ai/login");
    await expect(this.signInButton).toHaveCount(0);
  }
}
