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

  async goto(): Promise<void> {
    const baseURL = test.info().project.use?.baseURL;
    if (!baseURL) throw new Error('baseURL is not configured in Playwright project config.');

    await this.page.goto(baseURL, { waitUntil: 'domcontentloaded' });
    await expect(this.usernameField().first()).toBeVisible({ timeout: 20_000 });
  }

  async login(username: string, password: string): Promise<void> {
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
}

class DashboardPage {
  constructor(private readonly page: Page) {}

  private dashboardHeading(): Locator {
    return this.page.getByRole('heading', { name: /dashboard/i });
  }

  private appShell(): Locator {
    return this.page
      .getByRole('navigation')
      .or(this.page.getByRole('banner'))
      .or(this.page.getByRole('main'))
      .or(this.page.locator('nav, header, main'));
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');

    // Some apps don't use a <main> landmark. Wait for any typical authenticated shell.
    await expect(this.appShell().first()).toBeVisible({ timeout: 30_000 });

    // Prefer a semantic dashboard heading when present.
    if (await this.dashboardHeading().first().isVisible().catch(() => false)) {
      await expect(this.dashboardHeading().first()).toBeVisible({ timeout: 30_000 });
      return;
    }

    // Fallback: assert we are no longer on the login form.
    await expect(this.page.getByLabel(/password/i).first()).toBeHidden({ timeout: 30_000 });
  }

  async assertOnDashboard(): Promise<void> {
    if (await this.dashboardHeading().first().isVisible().catch(() => false)) {
      await expect(this.dashboardHeading().first()).toBeVisible();
      return;
    }

    await expect(this.appShell().first()).toBeVisible();
    await expect(this.page.getByLabel(/password/i).first()).toBeHidden();
  }
}

test.describe('QM-TC-2 Successful login with valid credentials', { tag: '@new' }, () => {
  test('User is authenticated and presented with the dashboard', async ({ page }) => {
    // Arrange
    const username = process.env.TEST_USERNAME ?? process.env.APP_USERNAME;
    const password = process.env.TEST_PASSWORD ?? process.env.APP_PASSWORD;
    if (!username || !password) {
      throw new Error('Missing credentials. Set TEST_USERNAME/TEST_PASSWORD (or APP_USERNAME/APP_PASSWORD).');
    }

    const loginPage = new LoginPage(page);
    const dashboard = new DashboardPage(page);

    // Act
    await loginPage.goto();
    await loginPage.login(username, password);

    // Assert
    await dashboard.waitForLoad();
    await dashboard.assertOnDashboard();
  });
});
