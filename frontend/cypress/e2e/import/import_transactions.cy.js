// cypress/e2e/import/import_transactions.cy.js

describe('Import Transactions', () => {
    beforeEach(() => {
        cy.navigateTo('Import');
    });

    it('should import transactions from a CSV file', () => {
        const csvData = `Date,Description,Amount\n2023-12-01,Consulting Income,1500.00\n2023-12-02,Software Subscription,-29.99`;
        cy.writeFile('cypress/fixtures/import_test.csv', csvData);

        // Step 1: Upload File
        cy.get('input[type="file"]').selectFile('cypress/fixtures/import_test.csv', { force: true });
        cy.contains('import_test.csv').should('be.visible');
        cy.get('button').contains('Next').click();

        // Step 2: Map Columns & Preview (assuming default mapping is correct for this simple CSV)
        // Default mapping: Date -> A, Description -> B, Amount -> C
        // DateFormat default DD/MM/YYYY - needs to match CSV
        // Our CSV uses YYYY-MM-DD. We need to change date format or ensure CSV matches.
        // Let's adjust the CSV for default DD/MM/YYYY format
        const csvDataForDefaultFormat = `Date,Description,Amount\n01/12/2023,Consulting Income,1500.00\n02/12/2023,Software Subscription,-29.99`;
        cy.writeFile('cypress/fixtures/import_test_ddmmyyyy.csv', csvDataForDefaultFormat);
        
        // Re-upload with correct date format
        cy.visit('/');
        cy.navigateTo('Import');
        cy.get('input[type="file"]').selectFile('cypress/fixtures/import_test_ddmmyyyy.csv', { force: true });
        cy.contains('import_test_ddmmyyyy.csv').should('be.visible');
        cy.get('button').contains('Next').click();

        // In Step 2, verify some preview data
        cy.get('table').should('contain', '01/12/2023'); // From CSV
        cy.get('input[name="date_column"]').should('have.value', 'A');
        cy.get('input[name="descr_column"]').should('have.value', 'B');
        cy.get('input[name="amount_column"]').should('have.value', 'C');
        cy.get('input[name="date_format"]').should('have.value', 'DD/MM/YYYY'); // Default

        cy.get('button').contains('Next').click();

        // Step 3: Review & Import
        cy.contains('Final Review').should('be.visible');
        // Verify transformed data in the review table
        cy.get('table').should('contain', '2023-12-01'); // Transformed date
        cy.get('table').should('contain', 'Consulting Income');
        cy.get('table').should('contain', '1500.00'); // Standardized amount

        // Check for duplicates (assuming these are new transactions)
        cy.contains('td', '2023-12-01').parent('tr').within(() => {
             cy.get('td').contains('No').should('be.visible'); // No duplicate
        });

        cy.get('button').contains('Proceed to Import').click();

        // ConfirmImportDialog
        cy.get('[role="dialog"]').within(() => {
            cy.contains('Are you sure you want to import').should('be.visible');
            cy.get('button').contains('Import').click();
        });

        cy.contains('Import Complete').should('be.visible'); // Toast for success

        // Verify transactions in Transactions view
        cy.navigateTo('Transactions');
        cy.get('[data-cy="transaction-grid"]').should('contain', 'Consulting Income');
        cy.get('[data-cy="transaction-grid"]').should('contain', 'R$ 1.500,00');
        cy.get('[data-cy="transaction-grid"]').should('contain', 'Software Subscription');
        cy.get('[data-cy="transaction-grid"]').should('contain', '-R$ 29,99');
    });
});