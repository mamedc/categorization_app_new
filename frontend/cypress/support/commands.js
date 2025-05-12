// File path: C:\Users\mamed\Meu Drive\Code\categorization_app_new\frontend\cypress\support\commands.js

// Helper function to ensure API_URL is valid
function getApiUrl() {
    const apiUrl = Cypress.env('API_URL');
    if (!apiUrl || typeof apiUrl !== 'string' || !apiUrl.startsWith('http')) {
        const envFromConfig = Cypress.config('env');
        const directApiUrl = envFromConfig ? envFromConfig.API_URL : 'N/A';

        console.error(
            `Problem with API_URL. Value from Cypress.env('API_URL'): "${apiUrl}". Type: "${typeof apiUrl}". ` +
            `Value from Cypress.config('env').API_URL: "${directApiUrl}".`
        );
        throw new Error(
            `API_URL ("${apiUrl}") is not a valid, fully qualified URL. ` +
            "Please check your cypress.config.js `env` block (ensure it's at the project root, not inside the 'cypress' folder) " +
            "or system environment variables (e.g., CYPRESS_API_URL), and ensure the Cypress Test Runner has been restarted if changes were made."
        );
    }
    return apiUrl;
}

// Command to reset the database via an API call
Cypress.Commands.add('resetDatabase', () => {
    const apiUrl = getApiUrl();
    
    cy.request('POST', `${apiUrl}/test/reset-database`)
      .its('status')
      .should('eq', 200);
      
    // Seed initial balance after reset
    cy.request({
        method: 'POST',
        url: `${apiUrl}/settings/initial_balance`,
        body: { value: '0.00' },
        failOnStatusCode: false 
    }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201]);
    });
});

// Command to create a transaction via API for test setup
Cypress.Commands.add('createTransactionAPI', (transactionData) => {
    const apiUrl = getApiUrl();
    cy.request('POST', `${apiUrl}/transactions/new`, transactionData)
      .its('body'); 
});

// Command to create a tag group via API
Cypress.Commands.add('createTagGroupAPI', (name) => {
    const apiUrl = getApiUrl();
    cy.request('POST', `${apiUrl}/tag-groups`, { name })
      .its('body');
});

// Command to create a tag via API
Cypress.Commands.add('createTagAPI', (tagData) => {
    const apiUrl = getApiUrl();
    cy.request('POST', `${apiUrl}/tags`, tagData)
      .its('body');
});

// Command to navigate to a specific section
Cypress.Commands.add('navigateTo', (sectionName) => {
    cy.get('nav').contains('div > p, div > span', new RegExp(`^${sectionName}$`, 'i')).click();
});

// Helper for Chakra UI v3 Select components
Cypress.Commands.add('selectChakraV3Option', (selectTriggerPlaceholder, optionText) => {
    cy.contains('[role="combobox"]', selectTriggerPlaceholder, { matchCase: false }).click({ force: true });
    cy.get('[role="listbox"]', { timeout: 10000 }).should('be.visible');
    cy.get('[role="option"]').contains(optionText).click();
});