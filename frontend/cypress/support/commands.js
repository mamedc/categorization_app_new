// cypress/support/commands.js

// Command to reset the database via an API call
Cypress.Commands.add('resetDatabase', () => {
    cy.request('POST', `${Cypress.env('API_URL')}/test/reset-database`)
      .its('status')
      .should('eq', 200);
    // Optionally seed initial data like settings here if not done by reset endpoint
    cy.request('POST', `${Cypress.env('API_URL')}/settings/initial_balance`, { value: '0.00' });
});

// Command to create a transaction via API for test setup
Cypress.Commands.add('createTransactionAPI', (transactionData) => {
    cy.request('POST', `${Cypress.env('API_URL')}/transactions/new`, transactionData)
      .its('body'); // Returns the created transaction
});

// Command to create a tag group via API
Cypress.Commands.add('createTagGroupAPI', (name) => {
    cy.request('POST', `${Cypress.env('API_URL')}/tag-groups`, { name })
      .its('body');
});

// Command to create a tag via API
Cypress.Commands.add('createTagAPI', (tagData) => {
    cy.request('POST', `${Cypress.env('API_URL')}/tags`, tagData)
      .its('body');
});

// Command to navigate to a specific section
Cypress.Commands.add('navigateTo', (sectionName) => {
    cy.contains('nav text', sectionName, { matchCase: false }).click();
    // Verify active view based on URL or a UI element unique to the view
    // For example, if URLs are like /transactions, /tags:
    // cy.url().should('include', `/${sectionName.toLowerCase()}`);
});

// Helper for Chakra UI v3 Select components
Cypress.Commands.add('selectChakraV3Option', (selectTriggerText, optionText) => {
    cy.contains('button', selectTriggerText).click({ force: true }); // Find trigger
    cy.get('[role="listbox"]').should('be.visible'); // Wait for content to appear
    cy.get('[role="option"]').contains(optionText).click();
});