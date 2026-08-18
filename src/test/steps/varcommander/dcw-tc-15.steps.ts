import { Given, When, Then } from '@cucumber/cucumber';
import { pageFixture } from '../../../hooks/pageFixture';
import { LoginPage } from '../../pages/LoginPage';
import { HeaderMenu } from '../../pages/HeaderMenu';
import { LactanetManagementPage } from '../../pages/LactanetManagementPage';
import { AddNewDairyPage } from '../../pages/AddNewDairyPage';

const getLoginPage = () => new LoginPage(pageFixture.page);
const getHeaderMenu = () => new HeaderMenu(pageFixture.page);
const getLactanetManagementPage = () => new LactanetManagementPage(pageFixture.page);
const getAddNewDairyPage = () => new AddNewDairyPage(pageFixture.page);

Given(
  'the user is authenticated and navigates to the Lactanet Management module under User Profile Dropdown',
  async function () {
    const username = process.env.TEST_USERNAME || process.env.APP_USERNAME;
    const password = process.env.TEST_PASSWORD || process.env.APP_PASSWORD;

    if (!username) throw new Error('TEST_USERNAME (or APP_USERNAME) is not set');
    if (!password) throw new Error('TEST_PASSWORD (or APP_PASSWORD) is not set');

    await getLoginPage().goto();
    await getLoginPage().login(username, password);

    await getHeaderMenu().openUserProfileDropdown();
    await getHeaderMenu().goToLactanetManagement();
  }
);

When('the user clicks the Add New Dairy action', async function () {
  await getLactanetManagementPage().clickAddNewDairy();
});

Then(
  'the stepper displays only 3 steps: Tell us about the Dairy, Set the Dairy Address, and Set the Dairy Owner',
  async function () {
    await getAddNewDairyPage().assertDefaultStepperHas3Steps();
  }
);

Then('Step 4 Confirmation is NOT visible in the stepper', async function () {
  await getAddNewDairyPage().assertStep4ConfirmationNotVisible();
});

When('the user selects a non-DCU product type such as Foundation in Step 1', async function () {
  await getAddNewDairyPage().selectFoundationProductType();
});

Then('Step 4 Confirmation is still NOT visible in the stepper', async function () {
  await getAddNewDairyPage().assertStep4ConfirmationNotVisible();
});

When('the user changes the product type selection to DCU', async function () {
  await getAddNewDairyPage().selectDCUProductType();
});

Then('Step 4 Confirmation becomes visible in the stepper as the fourth step', async function () {
  await getAddNewDairyPage().assertStep4ConfirmationVisible();
});

When('the user changes the product type selection back to a non-DCU type', async function () {
  await getAddNewDairyPage().selectFoundationProductType();
});

Then('Step 4 Confirmation is hidden from the stepper again', async function () {
  await getAddNewDairyPage().assertStep4ConfirmationNotVisible();
});
