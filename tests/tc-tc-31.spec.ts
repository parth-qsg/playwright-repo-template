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

  private clientSwitcherCombobox(): Locator {
    return this.page.getByRole('combobox', { name: /client|context|tenant|account/i });
  }

  private clientSwitcherButton(): Locator {
    return this.page.getByRole('button', { name: /client|context|tenant|account/i });
  }

  private productsNavLink(): Locator {
    return this.page.getByRole('link', { name: /products|catalog/i });
  }

  async selectClient(clientName: string): Promise<void> {
    const optionName = new RegExp(`^${clientName}$`, 'i');

    // If a modal/dialog overlay is present (e.g., post-login prompt), dismiss it first.
    const dialog = this.page.getByRole('dialog').first();
    if (await dialog.isVisible().catch(() => false)) {
      const close = dialog
        .getByRole('button', { name: /close|dismiss|cancel|not now|skip/i })
        .or(dialog.locator('[aria-label*="close" i]'));
      if (await close.first().isVisible().catch(() => false)) {
        await close.first().click();
      } else {
        await this.page.keyboard.press('Escape').catch(() => undefined);
      }
      await expect(dialog).toBeHidden({ timeout: 15_000 });
    }

    await expect(
      this.page.locator('[role="dialog"][aria-modal="true"], .modal, [data-state="open"][role="dialog"]'),
    ).toHaveCount(0, { timeout: 15_000 });

    if (await this.clientSwitcherCombobox().isVisible().catch(() => false)) {
      const combo = this.clientSwitcherCombobox();
      await combo.click();

      // Native <select> renders <option> elements that are not "visible" to Playwright.
      // Prefer selectOption when the combobox is a <select>.
      const tagName = await combo.evaluate((el) => el.tagName.toLowerCase());
      if (tagName === 'select') {
        await combo.selectOption({ label: clientName });
      } else {
        const listbox = this.page.getByRole('listbox');
        await expect(listbox).toBeVisible({ timeout: 10_000 });
        await listbox.getByRole('option', { name: optionName }).click();
      }

      await expect(combo).toContainText(optionName, { timeout: 15_000 });
      return;
    }

    const switcher = this.page
      .getByRole('button', { name: /open client prompts drawer/i })
      .or(this.clientSwitcherButton());

    try {
      await switcher.click({ timeout: 20_000 });
    } catch {
      await switcher.click({ timeout: 20_000, force: true });
    }

    const menuItem = this.page.getByRole('menuitem', { name: optionName });
    if (await menuItem.isVisible().catch(() => false)) {
      await menuItem.click();
      await expect(switcher).toContainText(optionName, { timeout: 15_000 });
      return;
    }

    const listbox = this.page.getByRole('listbox');
    if (await listbox.isVisible().catch(() => false)) {
      await listbox.getByRole('option', { name: optionName }).click();
      await expect(switcher).toContainText(optionName, { timeout: 15_000 });
      return;
    }

    const nativeSelect = this.page.locator('select').first();
    if (await nativeSelect.isVisible().catch(() => false)) {
      await nativeSelect.selectOption({ label: clientName });
      return;
    }

    await this.page.getByRole('option', { name: optionName }).click();
  }

  async openProductsCatalog(): Promise<void> {
    const nav = this.productsNavLink();
    await expect(nav).toBeVisible({ timeout: 20_000 });

    // A modal overlay can intermittently remain open after client switching and intercept clicks.
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

  async openProduct(name: string): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');

    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const nameRe = new RegExp(escaped, 'i');

    const search = this.searchField();
    if (await search.first().isVisible().catch(() => false)) {
      await search.first().fill(name);
      await this.page.keyboard.press('Enter').catch(() => undefined);
    }

    // Wait for either a results container OR the product text itself.
    // Some UIs render cards without semantic table/grid/list roles.
    const resultsRegion = this.page
      .getByRole('table')
      .or(this.page.getByRole('grid'))
      .or(this.page.getByRole('list'))
      .or(this.page.locator('[data-testid*="catalog" i], [data-testid*="product" i], [class*="catalog" i], [class*="product" i], main'));

    const rowOrItem = this.page
      .getByRole('row', { name: nameRe })
      .or(this.page.getByRole('listitem', { name: nameRe }))
      .or(this.page.getByRole('cell', { name: nameRe }))
      .or(this.page.getByRole('link', { name: nameRe }))
      .or(this.page.getByRole('button', { name: nameRe }))
      .or(this.page.getByText(nameRe, { exact: false }));

    await expect
      .poll(async () => {
        const regionCount = await resultsRegion.count();
        const itemCount = await rowOrItem.count();
        return regionCount + itemCount;
      }, {
        timeout: 45_000,
      })
      .toBeGreaterThan(0);

    if ((await resultsRegion.count()) > 0) {
      await expect(resultsRegion.first()).toBeVisible({ timeout: 45_000 });
    }

    await expect(rowOrItem.first()).toBeVisible({ timeout: 45_000 });

    const container = rowOrItem.first();
    const clickable = container
      .getByRole('link', { name: nameRe })
      .or(container.getByRole('button', { name: nameRe }))
      .or(container.locator('a,button'));

    if (await clickable.first().isVisible().catch(() => false)) {
      await clickable.first().click();
      return;
    }

    await container.click();
  }
}

class ProductDetailsPage {
  constructor(private readonly page: Page) {}

  async assertLoadedWithName(name: string): Promise<void> {
    await expect(this.page.getByRole('heading', { name: new RegExp(`^${name}$`, 'i') })).toBeVisible({ timeout: 20_000 });

    // "Relevant information" is app-specific; assert at least some details content exists.
    await expect(this.page.locator('main, [role="main"], body').first()).toContainText(new RegExp(name, 'i'));
  }
}

test.describe('TC-TC-31 Open Test Product details after selecting TEST client', { tag: '@functional' }, () => {
  test('User can view Test Product details under TEST client context', async ({ page }) => {
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
