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

  async gotoAndMeasureLoadMs(): Promise<number> {
    const baseURL = test.info().project.use?.baseURL;
    if (!baseURL) throw new Error('baseURL is not configured in Playwright project config.');

    const start = Date.now();
    await this.page.goto(baseURL, { waitUntil: 'domcontentloaded' });
    await expect(this.usernameField().first()).toBeVisible({ timeout: 20_000 });
    return Date.now() - start;
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

    await expect(this.appShell().first()).toBeVisible({ timeout: 30_000 });

    if (await this.dashboardHeading().first().isVisible().catch(() => false)) {
      await expect(this.dashboardHeading().first()).toBeVisible({ timeout: 30_000 });
      return;
    }

    await expect(this.page.getByLabel(/password/i).first()).toBeHidden({ timeout: 30_000 });
  }
}

test.describe('QM-TC-5 Login page performance under load', { tag: '@new' }, () => {
  test('Login page load time and login response time are within thresholds', async ({ page }) => {
    // Arrange
    const username = process.env.TEST_USERNAME ?? process.env.APP_USERNAME;
    const password = process.env.TEST_PASSWORD ?? process.env.APP_PASSWORD;
    if (!username || !password) {
      throw new Error('Missing credentials. Set TEST_USERNAME/TEST_PASSWORD (or APP_USERNAME/APP_PASSWORD).');
    }

    // Thresholds can be tuned per environment.
    const maxLoginPageLoadMs = Number(process.env.MAX_LOGIN_PAGE_LOAD_MS ?? '5000');
    const maxLoginResponseMs = Number(process.env.MAX_LOGIN_RESPONSE_MS ?? '5000');

    const loginPage = new LoginPage(page);
    const dashboard = new DashboardPage(page);

    // Act: measure login page load time
    const loginPageLoadMs = await loginPage.gotoAndMeasureLoadMs();
    test.info().annotations.push({ type: 'performance', description: `login_page_domcontentloaded_ms=${loginPageLoadMs}` });

    // Act: measure login response time (click submit -> authenticated shell visible)
    const loginStart = Date.now();
    await loginPage.login(username, password);
    await dashboard.waitForLoad();
    const loginResponseMs = Date.now() - loginStart;
    test.info().annotations.push({ type: 'performance', description: `login_response_ms=${loginResponseMs}` });

    // Assert
    expect(loginPageLoadMs, `Login page load time (ms) should be <= ${maxLoginPageLoadMs}`).toBeLessThanOrEqual(
      maxLoginPageLoadMs,
    );
    expect(loginResponseMs, `Login response time (ms) should be <= ${maxLoginResponseMs}`).toBeLessThanOrEqual(
      maxLoginResponseMs,
    );
  });
});
