// cypress/e2e/settings/manage_settings.cy.js

describe('Settings Management', () => {
    beforeEach(() => {
        // Create a transaction to see balance changes
        cy.createTransactionAPI({ date: '2023-10-01', amount: '100', description: 'Initial Item' });
        cy.visit('/');
    });

    it('should update initial balance and verify its effect on transactions', () => {
        const newInitialBalance = '1000.75';

        // Navigate to transactions and check initial running balance
        cy.navigateTo('Transactions');
        cy.contains('October 1, 2023') // Date header for 'Initial Item'
            .closest('div')
            .should('contain', 'Balance: R$ 100,00'); // 0 (default initial) + 100

        // Open Settings
        cy.contains('nav text', 'Settings').click(); // Assumes "Settings" text in Navbar opens the modal

        cy.get('[role="dialog"]').within(() => {
            cy.get('input[name="initBalance"]').clear().type(newInitialBalance);
            cy.get('button').contains('Save').click();
        });
        cy.contains('Settings Saved').should('be.visible'); // Toast

        // Verify effect on transaction running balance
        cy.navigateTo('Transactions'); // Re-navigate to ensure data re-fetch with new initial balance
        
        // Balance should be 1000.75 (new initial) + 100 (transaction) = 1100.75
        cy.contains('October 1, 2023')
            .closest('div')
            .should('contain', 'Balance: R$ 1.100,75');
    });
});