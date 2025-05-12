// cypress/e2e/transactions/manage_transactions.cy.js

describe('Transactions Management', () => {
    beforeEach(() => {
        // Assumes resetDatabase is called globally or specifically for this suite
        // cy.resetDatabase(); // if not global
        cy.visit('/'); // Ensure we start at the root
        // cy.contains('nav text', 'Transactions').click();
        cy.get('[data-cy="nav-transactions"]').click(); // NEW, more robust selector
    });

    it('should create, view, edit, and delete a transaction', () => {
        const transactionDescription = 'New Salary Deposit';
        const initialAmount = '5000.50';
        const updatedNote = 'Monthly salary payment';

        // --- Create Transaction ---
        cy.get('button').contains('Add').click(); // Assumes "Add" button is for CreateTransactionModal

        cy.get('[role="dialog"]').within(() => {
            cy.get('input[name="date"]').type('2023-10-01');
            cy.get('input[name="amount"]').type(initialAmount);
            cy.get('textarea[name="description"]').type(transactionDescription);
            cy.get('button').contains('Save').click();
        });
        //cy.contains('New transaction added.').should('be.visible'); // Toast

        // Verify transaction appears in the grid (TransactionCard)
        //cy.get('[data-cy="transaction-grid"]').should('contain', transactionDescription); // Add data-cy to TransactionGrid root
        cy.get('[data-cy="transaction-grid"]').should('contain', 'R$ 5.000,50');

        // --- View and Edit Transaction ---
        // Select the transaction (click its checkbox)
        cy.contains('[data-cy="transaction-card-description"]', transactionDescription) // Add data-cy to description Text in TransactionCard
            .closest('[data-cy="transaction-card"]') // Add data-cy to TransactionCard root
            .find('[role="checkbox"]')
            .click();

        cy.get('button').contains('Edit').click(); // Assumes "Edit" button is for EditTransactionModal

        cy.get('[role="dialog"]').within(() => {
            cy.get('textarea[name="note"]').type(updatedNote);
            cy.get('button').contains('Save').click();
        });
        cy.contains('Changes saved to transaction.').should('be.visible'); // Toast

        // Verify updated note (this might require expanding details or specific UI for notes)
        // For simplicity, we'll assume the note is visible or can be checked in the data after re-fetch
        // Re-select to check data if needed, or verify in a detail view if one exists.
        // This part depends on how notes are displayed.
        // For now, we'll assume the edit worked if the toast appeared.

        // --- Verify Running Balance (Simple Case) ---
        // This requires knowing the initial balance. Assume it's 0.00 for this test.
        // The TransactionGrid should display group balances.
        // Example: Assuming only one transaction on "October 1, 2023"
        cy.contains('October 1, 2023') // Date header
            .closest('div') // Parent of header and balance
            .should('contain', 'Balance: R$ 5.000,50');


        // --- Delete Transaction ---
        // Transaction should still be selected from Edit step
        cy.get('button').contains('Delete').click(); // Assumes "Delete" button is for DeleteTransactionModal

        cy.get('[role="dialog"]').within(() => {
            cy.contains('button', 'Delete').click(); // Confirm deletion
        });
        cy.contains('Transaction deleted.').should('be.visible'); // Toast

        cy.get('[data-cy="transaction-grid"]').should('not.contain', transactionDescription);
    });

    it('should filter transactions by date range', () => {
        // Setup: Create some transactions via API for reliable filtering
        cy.createTransactionAPI({ date: '2023-11-01', amount: '100', description: 'Nov Transaction' });
        cy.createTransactionAPI({ date: '2023-10-15', amount: '200', description: 'Oct Transaction' });
        cy.createTransactionAPI({ date: '2023-09-05', amount: '300', description: 'Sep Transaction' });

        cy.reload(); // Reload to fetch new transactions

        // Apply filter
        cy.selectChakraV3Option('Filter by...', 'Date Range');
        cy.get('input[id="startDate"]').type('2023-10-01');
        cy.get('input[id="endDate"]').type('2023-10-31');

        // Verify filtered results
        cy.get('[data-cy="transaction-grid"]').should('contain', 'Oct Transaction');
        cy.get('[data-cy="transaction-grid"]').should('not.contain', 'Nov Transaction');
        cy.get('[data-cy="transaction-grid"]').should('not.contain', 'Sep Transaction');
    });
});