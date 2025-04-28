import React, { useState } from 'react'; // Assuming React and useState are used
// Assuming BASE_URL, toaster, selectedTransac, formData, handleClose, refreshTransactions are defined elsewhere

const handleSave = async () => {
    setIsSaving(true); // Start loading
    let successMessage = "Changes saved to transaction."; // Default success message

    try {
        // --- 1. Update Core Transaction Data ---
        console.log("Updating transaction data for ID:", selectedTransac);
        console.log("Data:", formData);
        const updateRes = await fetch(BASE_URL + "/transactions/update/" + selectedTransac, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", },
            body: JSON.stringify(formData),
        });
        const updateData = await updateRes.json();
        if (!updateRes.ok) {
            // Use detailed error from backend if available
            throw new Error(updateData.error || updateData.description || `Failed to update transaction (status ${updateRes.status})`);
        }
        console.log("Transaction data updated successfully.");

        // --- 2. Add New Tags ---
        // Ensure addedTags contains objects with an 'id' property, or adjust access accordingly
        if (addedTags && addedTags.length > 0) {
            console.log("Adding tags:", addedTags.map(tag => tag.id)); // Log IDs being added
            for (const tagToAdd of addedTags) {
                // Ensure we have a valid tag id
                if (!tagToAdd || typeof tagToAdd.id === 'undefined') {
                    console.warn("Skipping invalid tag object in addedTags:", tagToAdd);
                    continue;
                }
                const tagId = tagToAdd.id;
                const addTagRes = await fetch(`${BASE_URL}/api/transactions/${selectedTransac}/tags`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", },
                    body: JSON.stringify({ tag_id: tagId }),
                });
                const addTagData = await addTagRes.json();
                if (!addTagRes.ok) {
                    // Use detailed error from backend if available
                    throw new Error(addTagData.error || addTagData.description || `Failed to add tag ID ${tagId} (status ${addTagRes.status})`);
                }
                console.log(`Tag ID ${tagId} added successfully.`);
            }
            successMessage = "Transaction and tags updated successfully."; // Update success message
        }


        // --- 3. Remove Existing Tags ---
        // Ensure removedTags contains objects with an 'id' property, or adjust access accordingly
        if (removedTags && removedTags.length > 0) {
             console.log("Removing tags:", removedTags.map(tag => tag.id)); // Log IDs being removed
            for (const tagToRemove of removedTags) {
                 // Ensure we have a valid tag id
                if (!tagToRemove || typeof tagToRemove.id === 'undefined') {
                    console.warn("Skipping invalid tag object in removedTags:", tagToRemove);
                    continue;
                }
                const tagId = tagToRemove.id;
                const removeTagRes = await fetch(`${BASE_URL}/api/transactions/${selectedTransac}/tags/${tagId}`, {
                    method: "DELETE",
                    // No body needed for DELETE, headers might not be strictly required
                    // headers: { "Content-Type": "application/json", },
                });

                // DELETE might return 200 OK with data or 204 No Content
                // Handle both possibilities. If 204, .json() will fail, so check status first.
                if (!removeTagRes.ok) {
                     let errorData = {};
                    try { // Try to parse error json, but don't fail if body is empty
                         errorData = await removeTagRes.json();
                    } catch(e) {
                        // Ignore parsing error if status indicates failure without JSON body
                    }
                    throw new Error(errorData.error || errorData.description || `Failed to remove tag ID ${tagId} (status ${removeTagRes.status})`);
                }
                 console.log(`Tag ID ${tagId} removed successfully.`);
            }
             successMessage = "Transaction and tags updated successfully."; // Update success message
        }

        // --- 4. Success Handling ---
        toaster.create({
            title: "Success!",
            description: successMessage,
            type: "success",
            duration: 2000,
            placement: "top-center",
        });
        console.log("All operations completed successfully.");
        setSaveError(''); // Clear any previous specific error messages
        handleClose(); // Close the modal/form
        refreshTransactions((prev) => prev + 1); // This triggers a refresh

        // It's often good practice to clear the added/removed tags state here
        // or within handleClose, depending on your component structure.
        // setAddedTags([]);
        // setRemovedTags([]);


    } catch (error) {
        // --- 5. Error Handling ---
        toaster.create({
            title: "An error occurred.",
            description: error.message, // Display the specific error caught
            type: "error",
            duration: 4000,
            placement: "top-center",
        });
        console.error('Error saving transaction changes:', error);
        // Optionally set the specific error state if needed: setSaveError(error.message);

    } finally {
        // --- 6. Cleanup ---
        setIsSaving(false); // Ensure loading state is turned off
    }
};

// --- Dummy definitions for context ---
// const BASE_URL = "http://localhost:5000/api"; // Example
// const selectedTransac = 1; // Example: ID of the transaction being edited
// const [formData, setFormData] = useState({ amount: 100, description: 'Updated Desc' }); // Example
// const [addedTags, setAddedTags] = useState([{ id: 3, name: 'NewTag' }]); // Example: Array of tag objects to add
// const [removedTags, setRemovedTags] = useState([{ id: 1, name: 'OldTag' }]); // Example: Array of tag objects to remove
// const [isSaving, setIsSaving] = useState(false);
// const [saveError, setSaveError] = useState('');
// const toaster = { create: (config) => console.log("TOAST:", config) }; // Dummy toaster
// const handleClose = () => console.log("Closing modal..."); // Dummy close handler
// const refreshTransactions = (updater) => console.log("Refreshing transactions...", updater(0)); // Dummy refresh handler
// ----------------------------------------