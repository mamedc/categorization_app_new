// cypress/e2e/tags/manage_tags.cy.js

describe('Tags Management', () => {
    const tagGroupName = 'Housing';
    const tagName = 'Rent';

    beforeEach(() => {
        cy.navigateTo('Tags');
    });

    it('should create a tag group, a tag, assign to transaction, and then delete them', () => {
        // --- Create Tag Group ---
        cy.get('button').contains('Add').click(); // Add button for CreateTagsGroupModal

        cy.get('[role="dialog"]').within(() => {
            cy.get('input[name="name"]').type(tagGroupName);
            cy.get('button').contains('Save').click();
        });
        cy.contains('New tag group added.').should('be.visible');
        cy.get('[data-cy="tag-groups-grid"]').should('contain', tagGroupName); // Add data-cy to TagsGroupsGrid

        // --- Select the new Tag Group ---
        cy.contains('[data-cy="tag-group-card-name"]', tagGroupName) // Add data-cy to name Text in TagGroupCard
            .closest('[data-cy="tag-group-card"]') // Add data-cy to TagGroupCard root
            .find('[role="checkbox"]')
            .click();

        // --- Create Tag within Group ---
        cy.get('button').contains('Edit').click(); // Opens EditTagGroupModal

        cy.get('[role="dialog"]').within(() => {
            // Inside EditTagGroupModal, click "Add" for CreateTagModal
            cy.get('button').contains(/^Add$/).click(); // Regex to match exact "Add"
        });

        // Now in CreateTagModal
        cy.get('[role="dialog"]').filter(':visible').within(() => { // Ensure we target the *newly opened* dialog
            cy.get('input[name="name"]').type(tagName);
            // Color picker interaction can be complex. For simplicity, let's assume a default color or skip direct interaction.
            // If a color must be picked:
            // cy.get('[data-cy="color-picker-trigger"]').click(); // Add data-cy to ColorPicker.Trigger
            // cy.get('[data-cy="color-picker-area"]').clickXY(10,10); // Click a point in area
            cy.get('button').contains('Save').click();
        });
        cy.contains('New tag added.').should('be.visible');

        // Close EditTagGroupModal
        cy.get('[role="dialog"]').filter(':visible').within(() => { // The EditTagGroupModal should still be open
            cy.get('button').contains('Close').click();
        });

        // Verify tag appears in the group (in TagsGroupsGrid > TagGroupCard > TagsGrid > TagCard)
        cy.contains('[data-cy="tag-group-card-name"]', tagGroupName)
            .closest('[data-cy="tag-group-card"]')
            .should('contain', tagName);

        // --- Assign Tag to Transaction (Requires a transaction) ---
        cy.createTransactionAPI({ date: '2023-10-05', amount: '-1200', description: 'Office Rent' }).then(tx => {
            cy.navigateTo('Transactions');
            cy.contains('[data-cy="transaction-card-description"]', 'Office Rent')
                .closest('[data-cy="transaction-card"]')
                .find('[role="checkbox"]')
                .click();

            cy.get('button').contains('Edit').click(); // EditTransactionModal

            // In EditTransactionModal for the transaction
            cy.get('[role="dialog"]').filter(':visible').within(() => {
                cy.get('button').contains('Edit Tags').click(); // Opens EditTransactionTagsModal
            });

            // In EditTransactionTagsModal
            cy.get('[role="dialog"]').filter(':visible').within(() => {
                cy.contains(tagGroupName).closest('[data-cy="tag-group-in-edit-tags-modal"]') // Add data-cy
                  .contains('label', tagName) // Find the label associated with the checkbox
                  .click(); // Click the label to toggle the checkbox
                cy.get('button').contains('Ok').click();
            });

            // Back in EditTransactionModal, save changes
            cy.get('[role="dialog"]').filter(':visible').within(() => {
                cy.get('button').contains('Save').click();
            });
            cy.contains('Transaction and tags updated successfully.').should('be.visible');

            // Verify tag is on transaction card
            cy.contains('[data-cy="transaction-card-description"]', 'Office Rent')
                .closest('[data-cy="transaction-card"]')
                .should('contain', tagName);
        });

        // --- Delete Tag ---
        cy.navigateTo('Tags');
        cy.contains('[data-cy="tag-group-card-name"]', tagGroupName)
            .closest('[data-cy="tag-group-card"]')
            .find('[role="checkbox"]')
            .click();
        cy.get('button').contains('Edit').click(); // Open EditTagGroupModal

        cy.get('[role="dialog"]').within(() => {
            // Select the tag to delete
            cy.contains('label', tagName) // Assuming tag name is unique enough for label
              .closest('[data-cy="tag-item-in-edit-modal"]') // Add data-cy
              .find('[role="checkbox"]')
              .click();
            cy.get('button').contains(/^Delete$/).click(); // Delete button for DeleteTagModal
        });

        // Confirm DeleteTagModal
        cy.get('[role="dialog"]').filter(':visible').within(() => {
            cy.get('button').contains('Delete').click();
        });
        cy.contains('Tag Group deleted.').should('be.visible'); // Message might be "Tag deleted"

        // Close EditTagGroupModal
        cy.get('[role="dialog"]').filter(':visible').within(() => {
            cy.get('button').contains('Close').click();
        });

        // --- Delete Tag Group ---
        cy.contains('[data-cy="tag-group-card-name"]', tagGroupName)
            .closest('[data-cy="tag-group-card"]')
            .find('[role="checkbox"]')
            .click(); // Ensure it's selected

        cy.get('button').contains('Delete').click(); // Delete button for DeleteTagsGroupsModal

        cy.get('[role="dialog"]').within(() => {
            cy.get('button').contains('Delete').click(); // Confirm deletion
        });
        cy.contains('TagGroup .* deleted.').should('be.visible');
        cy.get('[data-cy="tag-groups-grid"]').should('not.contain', tagGroupName);
    });
});