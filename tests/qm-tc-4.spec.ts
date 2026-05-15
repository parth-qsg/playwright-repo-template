import { test, expect, type Locator, type Page } from '@playwright/test';

class LoginPage {
  constructor(private readonly page: Page) {}

  private usernameField(): Locator {
    return this.page
      .getByLabel(/user(name)?|email/i)
      .or(this.page.getByRole('textbox', { name: /user(name)?|email/i }))
      .or(
        this.page.locator(
          'input[name*="user" i], input[name*="email" i], input[type="email"], input[autocomplete="username"]',
        ),
      );
  }

  private passwordField(): Locator {
    return this.page
      .getByLabel(/password/i)
      .or(this.page.getByRole('textbox', { name: /password/i }))
      .or(this.page.locator('input[type="password"], input[name*="pass" i], input[autocomplete="current-password"]'));
  }

  private signInButton(): Locator {
    return this.page
      .getByRole('button', { name: /sign in|log in|login/i })
      .or(this.page.getByRole('button', { name: /continue|next/i }))
      .or(this.page.locator('button[type="submit"], input[type="submit"]'));
  }

  private authError(): Locator {
    return this.page
      .getByRole('alert')
      .or(this.page.getByText(/invalid|incorrect|authentication failed|unauthorized|wrong|error/i))
      .or(this.page.locator('[data-testid*="error" i], .error, .alert, .toast, [role="status"]'));
  }

  async goto(): Promise<void> {
    const baseURL = test.info().project.use?.baseURL;
    if (!baseURL) throw new Error('baseURL is not configured in Playwright project config.');

    await this.page.goto(baseURL, { waitUntil: 'domcontentloaded' });
    await expect(this.usernameField().first()).toBeVisible({ timeout: 20_000 });
  }

  async attemptLogin(username: string, password: string): Promise<void> {
    await this.usernameField().first().fill(username);

    // Support both single-step and two-step login forms.
    if (await this.passwordField().first().isVisible().catch(() => false)) {
      await this.passwordField().first().fill(password);
      await this.signInButton().first().click();
      return;
    }

    await this.signInButton().first().click();
    await expect(this.passwordField().first()).toBeVisible({ timeout: 20_000 });
    await this.passwordField().first().fill(password);
    await this.signInButton().first().click();
  }

  async assertInvalidCredentialsErrorShownAndRetryAllowed(): Promise<void> {
    // Error message indicating invalid credentials is displayed.
    await expect(this.authError().first()).toBeVisible({ timeout: 20_000 });

    // Login form remains visible for retry.
    await expect(this.usernameField().first()).toBeVisible();
    await expect(this.signInButton().first()).toBeVisible();

    // Ensure we did not land on an authenticated shell (heuristic).
    await expect(this.page.getByRole('link', { name: /logout|sign out/i })).toHaveCount(0);
  }
}

test.describe('QM-TC-4 Login fails with invalid credentials shows error message', { tag: '@new' }, () => {
  test('Invalid credentials are rejected; error is shown and login form remains available', async ({ page }) => {
    // Arrange
    const validUsername = process.env.TEST_USERNAME ?? process.env.APP_USERNAME;
    if (!validUsername) {
      throw new Error('Missing username env var. Set TEST_USERNAME (or APP_USERNAME).');
    }

    const loginPage = new LoginPage(page);
    const invalidUsername = `${validUsername}.invalid`;
    const invalidPassword = `invalid-${Date.now()}`;

    // Act
    await loginPage.goto();
    await loginPage.attemptLogin(invalidUsername, invalidPassword);

    // Assert
    await loginPage.assertInvalidCredentialsErrorShownAndRetryAllowed();
  });
});
