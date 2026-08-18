Feature: Add New Dairy - Dynamic stepper step count based on product type selection

  @smoke @varcommander
  Scenario: Stepper shows 3 steps by default and adds Step 4 only when DCU is selected
    Given the user is authenticated and navigates to the Lactanet Management module under User Profile Dropdown
    And the user clicks the Add New Dairy action
    Then the stepper displays only 3 steps: Tell us about the Dairy, Set the Dairy Address, and Set the Dairy Owner
    And Step 4 Confirmation is NOT visible in the stepper
    When the user selects a non-DCU product type such as Foundation in Step 1
    Then Step 4 Confirmation is still NOT visible in the stepper
    When the user changes the product type selection to DCU
    Then Step 4 Confirmation becomes visible in the stepper as the fourth step
    When the user changes the product type selection back to a non-DCU type
    Then Step 4 Confirmation is hidden from the stepper again
