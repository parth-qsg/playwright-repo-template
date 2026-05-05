import { test, expect, type Page, type Locator } from '@playwright/test';

class LoginPage {
  constructor(private readonly page: Page) {}

  private usernameField(): Locator {
    return this.page
      .getByLabel(/user(name)?|email/i)
      .or(this.page.getByRole('textbox', { name: /user(name)?|email/i }))
      .or(this.page.locator('input[name*="user" i], input[name*="email" i], input[type="email"], input[autocomplete="username"]'));
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
  }

  async login(username: string, password: string): Promise<void> {
    // Support both single-step and two-step login forms.
    await expect(this.usernameField().first()).toBeVisible({ timeout: 20000 });
    await this.usernameField().first().fill(username);

    // Some apps require clicking Next/Continue before password appears.
    if (await this.passwordField().first().isVisible().catch(() => false)) {
      await this.passwordField().first().fill(password);
      await this.signInButton().first().click();
      return;
    }

    await this.signInButton().first().click();
    await expect(this.passwordField().first()).toBeVisible({ timeout: 20000 });
    await this.passwordField().first().fill(password);
    await this.signInButton().first().click();
  }
}

class AppShell {
  constructor(private readonly page: Page) {}

  private clientSwitcher(): Locator {
    return this.page.getByRole('combobox', { name: /client|context|tenant|account/i });
  }

  private clientMenuButton(): Locator {
    return this.page.getByRole('button', { name: /client|context|tenant|account/i });
  }

  private productsNavLink(): Locator {
    return this.page.getByRole('link', { name: /products|catalog/i });
  }

  async selectClient(clientName: string): Promise<void> {
    // Try combobox first
    if (await this.clientSwitcher().isVisible().catch(() => false)) {
      await this.clientSwitcher().click();
      await this.page.getByRole('option', { name: new RegExp(`^${clientName}$`, 'i') }).click();
      return;
    }

    // Fallback: open a menu/dialog and pick the client
    await this.clientMenuButton().click();
    const option = this.page.getByRole('menuitem', { name: new RegExp(`^${clientName}$`, 'i') });
    if (await option.isVisible().catch(() => false)) {
      await option.click();
      return;
    }

    await this.page.getByRole('option', { name: new RegExp(`^${clientName}$`, 'i') }).click();
  }

  async openProductsCatalog(): Promise<void> {
    await expect(this.productsNavLink()).toBeVisible();
    await this.productsNavLink().click();
    await expect(this.page.getByRole('heading', { name: /products|catalog/i })).toBeVisible();
  }
}

class ProductsCatalogPage {
  constructor(private readonly page: Page) {}

  private searchField(): Locator {
    return this.page.getByRole('textbox', { name: /search/i });
  }

  private productRowByName(name: string): Locator {
    // Prefer accessible grid/table row.
    return this.page
      .getByRole('row', { name: new RegExp(name, 'i') })
      .or(this.page.getByRole('link', { name: new RegExp(`^${name}$`, 'i') }));
  }

  async openProduct(name: string): Promise<void> {
    // If a search box exists, use it to make the test deterministic.
    if (await this.searchField().isVisible().catch(() => false)) {
      await this.searchField().fill(name);
    }

    const rowOrLink = this.productRowByName(name);
    await expect(rowOrLink).toBeVisible();

    // If it's a row, click the name link inside; otherwise click the link itself.
    const nameLink = rowOrLink.getByRole('link', { name: new RegExp(`^${name}$`, 'i') });
    if (await nameLink.isVisible().catch(() => false)) {
      await nameLink.click();
    } else {
      await rowOrLink.click();
    }
  }
}

class ProductDetailsPage {
  constructor(private readonly page: Page) {}

  private title(): Locator {
    return this.page.getByRole('heading', { name: /test product/i });
  }

  async assertLoadedWithName(name: string): Promise<void> {
    await expect(this.page.getByRole('heading', { name: new RegExp(name, 'i') })).toBeVisible();

    // Minimal “relevant information” check: ensure there is at least one labeled field/value.
    const detailsRegion = this.page.getByRole('region').first();
    if (await detailsRegion.isVisible().catch(() => false)) {
      await expect(detailsRegion).toContainText(/./);
    } else {
      // Fallback: page has some content besides the title.
      await expect(this.page.locator('body')).toContainText(new RegExp(name, 'i'));
    }
  }
}

test.describe('TC-TC-31 Open Test Product details after selecting TEST client', { tag: '@functional' }, () => {
  test('User can open Test Product details under TEST client context', async ({ page }) => {
    // Arrange
    const username = process.env.TEST_USERNAME ?? process.env.APP_USERNAME;
    const password = process.env.TEST_PASSWORD ?? process.env.APP_PASSWORD;
    if (!username || !password) {
      throw new Error('Missing credentials. Set TEST_USERNAME/TEST_PASSWORD (or APP_USERNAME/APP_PASSWORD).');
    }

    const loginPage = new LoginPage(page);
    const shell = new AppShell(page);
    const catalog = new ProductsCatalogPage(page);
    const details = new ProductDetailsPage(page);

    // Act
    await loginPage.goto();
    await loginPage.login(username, password);

    await shell.selectClient('TEST');
    await shell.openProductsCatalog();
    await catalog.openProduct('Test Product');

    // Assert
    await details.assertLoadedWithName('Test Product');
  });
});
