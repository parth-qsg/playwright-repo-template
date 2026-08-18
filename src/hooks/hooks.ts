import { Before, After, BeforeAll } from '@cucumber/cucumber';
import { Browser, BrowserContext, chromium } from '@playwright/test';
import { pageFixture } from './pageFixture';
import * as fs from 'fs';

require('dotenv').config();

let browser: Browser;
let context: BrowserContext;

BeforeAll(async () => {
  const screenshotDir = 'test-results/screenshots';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
});

Before(async function (scenario) {
  const headless = process.env.HEADLESS !== 'false';
  browser = await chromium.launch({ headless });
  context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  pageFixture.page = await context.newPage();
  console.log(`▶ Scenario: ${scenario.pickle.name}`);
});

After(async function (scenario) {
  if (scenario.result?.status === 'FAILED') {
    const screenshot = await pageFixture.page.screenshot({ fullPage: true });
    const name = scenario.pickle.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filePath = `test-results/screenshots/${name}.png`;
    fs.writeFileSync(filePath, screenshot);
    await this.attach(screenshot, 'image/png');
  }
  await context.clearCookies();
  await browser.close();
});
