import { test } from "@playwright/test";
import { LoginPage } from "../pages/loginPage";
import { ContactUsPage } from "../pages/contactUsPage";
import type { ContactUsFormData } from "../types/contactUs.types";

test.describe("Contact Us", { tag: "@functional" }, () => {
  test("@new TC-TC-40 Verify successful Contact Us form submission with all valid data shows confirmation message", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const contactUsPage = new ContactUsPage(page);

    const formData: ContactUsFormData = {
      name: "John Doe",
      email: "john.doe@test.com",
      message: "This is a test message.",
    };

    // Arrange
    await loginPage.goto();
    await loginPage.login();
    await loginPage.selectClientIfPrompted({ clientName: "TEST" });
    await loginPage.assertLoggedIn();

    // Act
    await contactUsPage.goto();

    // Assert
    await contactUsPage.assertAt();
    await contactUsPage.assertContactUsPageIsAvailable();

    await contactUsPage.submitValidForm(formData);
    await contactUsPage.assertSuccessConfirmationVisible();
  });
});
