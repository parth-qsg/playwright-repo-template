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

class AppShell {
  constructor(private readonly page: Page) {}

  private productsNavLink(): Locator {
    return this.page.getByRole('link', { name: /products|catalog/i });
  }

  async openProductsCatalog(): Promise<void> {
    const nav = this.productsNavLink();
    await expect(nav).toBeVisible({ timeout: 20_000 });

    // A modal overlay can intermittently remain open after login and intercept clicks.
    const modalOverlay = this.page.locator(
      '[role="dialog"][aria-modal="true"], .modal, [data-state="open"][role="dialog"], .fixed.inset-0.z-50',
    );
    if (await modalOverlay.first().isVisible().catch(() => false)) {
      await this.page.keyboard.press('Escape').catch(() => undefined);
      await expect(modalOverlay).toHaveCount(0, { timeout: 15_000 });
    }

    try {
      await nav.click({ timeout: 20_000 });
    } catch {
      await nav.click({ timeout: 20_000, force: true });
    }

    await expect(this.page.getByRole('heading', { name: /products|catalog/i })).toBeVisible({ timeout: 20_000 });
  }
}

class ProductsCatalogPage {
  constructor(private readonly page: Page) {}

  private searchField(): Locator {
    return this.page
      .getByRole('textbox', { name: /search/i })
      .or(this.page.getByPlaceholder(/search/i))
      .or(this.page.locator('input[type="search"], input[placeholder*="search" i]'));
  }

  private clientSelectionValidation(): Locator {
    return this.page
      .getByRole('alert')
      .or(this.page.getByRole('status'))
      .or(this.page.locator('[aria-live="assertive"], [aria-live="polite"], .toast, .notification, .alert'));
  }

  async searchForProduct(name: string): Promise<void> {
    // When no client is selected, some apps block the catalog UI and do not render the search box.
    // In that case, the expected behavior is a client-selection validation prompt.
    const search = this.searchField();
    const hasSearch = (await search.count()) > 0;
    if (!hasSearch) return;

    await expect(search.first()).toBeVisible({ timeout: 20_000 });
    await search.first().fill(name);
    await this.page.keyboard.press('Enter').catch(() => undefined);
  }

  async assertClientMustBeSelectedValidationShown(): Promise<void> {
    const validationText = /select (a )?client|client (must|is required)|choose (a )?client|no client selected/i;

    // Prefer explicit alert/status regions.
    const validation = this.clientSelectionValidation();
    if ((await validation.count()) > 0) {
      await expect(validation.first()).toContainText(validationText, { timeout: 15_000 });
      return;
    }

    // Fallback: any visible text on the page.
    await expect(this.page.getByText(validationText)).toBeVisible({ timeout: 15_000 });
  }

  async assertProductSearchNotPerformed(productName: string): Promise<void> {
    // If search is blocked, the product should not appear as a result row/item.
    const escaped = productName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const nameRe = new RegExp(escaped, 'i');

    const resultItem = this.page
      .getByRole('row', { name: nameRe })
      .or(this.page.getByRole('listitem', { name: nameRe }))
      .or(this.page.getByRole('cell', { name: nameRe }))
      .or(this.page.getByRole('link', { name: nameRe }))
      .or(this.page.getByRole('button', { name: nameRe }));

    await expect(resultItem).toHaveCount(0);
  }
}

test.describe('TC-TC-32 Attempt product search without selecting a client', { tag: '@smoke' }, () => {
  test('System prompts to select a client; product search is blocked', async ({ page }) => {
    // Arrange
    const username = process.env.TEST_USERNAME ?? process.env.APP_USERNAME;
    const password = process.env.TEST_PASSWORD ?? process.env.APP_PASSWORD;
    if (!username || !password) {
      throw new Error('Missing credentials. Set TEST_USERNAME/TEST_PASSWORD (or APP_USERNAME/APP_PASSWORD).');
    }

    const loginPage = new LoginPage(page);
    const shell = new AppShell(page);
    const catalog = new ProductsCatalogPage(page);

    // Act
    await loginPage.goto();
    await loginPage.login(username, password);

    // Do not select any client.
    await shell.openProductsCatalog();
    await catalog.searchForProduct('Test Product');

    // Assert
    await catalog.assertClientMustBeSelectedValidationShown();
    await catalog.assertProductSearchNotPerformed('Test Product');
  });
});
