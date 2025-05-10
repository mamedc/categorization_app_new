// cypress/support/e2e.js
import './commands';

// Optional: Global beforeEach for all tests
beforeEach(() => {
    // Example: Reset database before each test to ensure a clean state
    // This relies on a custom command, detailed in section 5.
    cy.resetDatabase();

    // Example: Visit the base URL
    cy.visit('/');
});