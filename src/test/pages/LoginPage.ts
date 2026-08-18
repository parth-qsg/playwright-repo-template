import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  private readonly selectors = {
    email: () => this.page.getByRole('textbox', { name: 'Email *' }),
    password: () => this.page.getByRole('textbox', { name: 'Password *' }),
    signIn: () => this.page.getByRole('button', { name: 'Sign in' }),
  };

  private get emailField(): Locator {
    return this.selectors.email();
  }

  private get passwordField(): Locator {
    return this.selectors.password();
  }

  private get signInButton(): Locator {
    return this.selectors.signIn();
  }

  async goto(): Promise<void> {
    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) throw new Error('BASE_URL is not set');
    await this.page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await expect(this.page).toHaveURL(/\/login\?redirect=%2F/);
  }

  async login(username: string, password: string): Promise<void> {
    await this.emailField.fill(username);
    await this.passwordField.fill(password);
    await this.signInButton.click();
    await expect(this.page).toHaveURL(/\/user\/my-home/);
  }
}
