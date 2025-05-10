// File path: C:\Users\mamed\Meu Drive\Code\categorization_app_new\frontend\src\components\ui\EditTransactionModal.jsx
// File path: frontend/src/components/ui/EditTransactionModal.jsx
// EditTransactionModal.jsx

import { useState, useCallback, useEffect, useMemo } from "react";
import { Button, CloseButton, Dialog, Portal, Text, VStack, Stack, Field, Input, Flex, Textarea, HStack, ColorSwatch, Box, Spinner } from "@chakra-ui/react";
import { Fragment } from "react";
import { Toaster, toaster } from "@/components/ui/toaster";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { selectedTransaction, refreshTransactionsAtom, ldbTransactionsAtom } from "../../context/atoms";
import EditTransactionTagsModal from "./EditTransactionTagsModal";
import TagCard from "./TagCard";
import { BASE_URL } from "../../App";
import { formatBrazilianCurrency } from "../../utils/currency";

export default function EditTransactionModal ({
}) {

    const refreshTransactions = useSetAtom(refreshTransactionsAtom);
    const [selectedTransacAtomValue, setSelectedTransacAtom] = useAtom(selectedTransaction);
    const { state: transactionState, data: allTransactionsData } = useAtomValue(ldbTransactionsAtom);

    const [open, setOpen] = useState(false);
    const initialFormState = {
        id: "",
        amount: '',
        date: '',
        description: '',
        note: '',
        tags: [],
        tag_group: {},
        created_at: '',
        updated_at: '',
        children_flag: false,
        parent_id: null,
    };
    const [formData, setFormData] = useState(initialFormState);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    const [selectedTagIds, setSelectedTagIds] = useState(new Set());
    const [addedTags, setAddedTags] = useState([]);
    const [removedTags, setRemovedTags] = useState([]);

    const calculatedEffectiveAmount = useMemo(() => {
        if (!formData.children_flag || transactionState !== 'hasData' || !allTransactionsData) {
            return null;
        }
        const children = allTransactionsData.filter(tx => tx.parent_id === formData.id);
        const childrenSum = children.reduce((sum, child) => {
            const amount = parseFloat(child.amount || '0');
            return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
        const originalAmount = parseFloat(formData.amount || '0');
        return isNaN(originalAmount) ? 0 : originalAmount - childrenSum;
    }, [formData.id, formData.amount, formData.children_flag, allTransactionsData, transactionState]);

    const handleOpen = async () => {
        const currentSelectedTransaction = selectedTransacAtomValue;
        if (!currentSelectedTransaction || typeof currentSelectedTransaction !== 'object' || !currentSelectedTransaction.id) {
            console.error("Edit modal opened without a selected transaction object or ID.");
            toaster.create({
                title: "Error",
                description: "No transaction selected for editing.",
                type: "error",
                duration: 3000,
                placement: "top-center",
            });
            return;
        }
        setSaveError('');
        setAddedTags([]);
        setRemovedTags([]);
        try {
            setFormData({
                id: currentSelectedTransaction.id ?? "",
                amount: currentSelectedTransaction.amount ?? "",
                date: currentSelectedTransaction.date ?? "",
                description: currentSelectedTransaction.description ?? "",
                note: currentSelectedTransaction.note ?? "",
                tags: currentSelectedTransaction.tags ?? [],
                created_at: currentSelectedTransaction.created_at ?? "",
                updated_at: currentSelectedTransaction.updated_at ?? "",
                parent_id: currentSelectedTransaction.parent_id ?? null,
                children_flag: currentSelectedTransaction.children_flag ?? false,
            });
            setSelectedTagIds(new Set(currentSelectedTransaction.tags?.map(tag => tag.id) ?? []));
            setOpen(true);
        } catch (error) {
            console.error("Error setting form data in Edit modal:", error);
            toaster.create({
                title: "Error",
                description: "Could not load transaction data into the form.",
                type: "error",
            });
        }
    };

    const handleClose = () => {
        setFormData(initialFormState);
        setSelectedTransacAtom(null);
        setAddedTags([])
        setRemovedTags([])
        setSelectedTagIds(new Set());
        setOpen(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSave = useCallback(async () => {
        setIsSaving(true);
        let successMessage = "Changes saved to transaction.";
        const transactionIdToUpdate = formData.id;

        if (!transactionIdToUpdate) {
            toaster.create({
                title: "Save Error",
                description: "Transaction ID is missing. Cannot save changes.",
                type: "error",
            });
            setIsSaving(false);
            return;
        }

        const updatePayload = {
            date: formData.date,
            description: formData.description,
            note: formData.note,
        };

        if (!formData.children_flag) {
            updatePayload.amount = formData.amount;
        }

        try {
            // --- 1. Update Core Transaction Data ---
            console.log("Updating transaction data for ID:", transactionIdToUpdate);
            const updateRes = await fetch(BASE_URL + "/transactions/update/" + transactionIdToUpdate, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", },
                body: JSON.stringify(updatePayload),
            });
            const updateData = await updateRes.json();
            if (!updateRes.ok) {
                throw new Error(updateData.error || updateData.description || `Failed to update transaction (status ${updateRes.status})`);
            }
            console.log("Transaction data updated successfully.");

            // --- 2. Add New Tags ---
            if (addedTags && addedTags.length > 0) {
                console.log("Attempting to add tags with IDs:", addedTags);
                for (const tagIdToAdd of addedTags) {
                    if (typeof tagIdToAdd !== 'number' || tagIdToAdd === null || typeof tagIdToAdd === 'undefined') {
                        console.warn("Skipping invalid tag ID found in addedTags:", tagIdToAdd);
                        continue;
                    }
                    const addTagRes = await fetch(`${BASE_URL}/transactions/${transactionIdToUpdate}/tags`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", },
                        body: JSON.stringify({ tag_id: tagIdToAdd }),
                    });
                    const addTagData = await addTagRes.json();
                    if (!addTagRes.ok && addTagRes.status !== 409 && !(addTagData.message || addTagData.error || '').includes("already associated")) {
                         throw new Error(addTagData.error || addTagData.description || `Failed to add tag ID ${tagIdToAdd} (status ${addTagRes.status})`);
                    } else {
                        console.log(`Tag ID ${tagIdToAdd} added or already associated.`);
                    }
                }
                successMessage = "Transaction and tags updated successfully.";
            }

            // --- 3. Remove Tags ---
            if (removedTags && removedTags.length > 0) {
                console.log("Attempting to remove tags with IDs:", removedTags);
                for (const tagIdToRemove of removedTags) {
                    if (typeof tagIdToRemove !== 'number' || tagIdToRemove === null || typeof tagIdToRemove === 'undefined') {
                        console.warn("Skipping invalid tag ID found in removedTags:", tagIdToRemove);
                        continue;
                    }
                    const removeTagRes = await fetch(`${BASE_URL}/transactions/${transactionIdToUpdate}/tags/${tagIdToRemove}`, { method: "DELETE" });
                    if (!removeTagRes.ok && removeTagRes.status !== 404) {
                        let errorData = {};
                        try { errorData = await removeTagRes.json(); } catch (e) { /* Ignore */ }
                        throw new Error(errorData.error || errorData.description || `Failed to remove tag ID ${tagIdToRemove} (status ${removeTagRes.status})`);
                    }
                     console.log(`Tag ID ${tagIdToRemove} removed or already removed.`);
                 successMessage = "Transaction and tags updated successfully.";
                }
            }

            // --- 4. Success Handling ---
            toaster.create({ title: "Success!", description: successMessage, type: "success", duration: 2000, placement: "top-center" });
            console.log("All operations completed successfully.");
            setSaveError('');
            handleClose();
            refreshTransactions((prev) => prev + 1);

        } catch (error) {
            // --- 5. Error Handling ---
            toaster.create({ title: "An error occurred.", description: error.message, type: "error", duration: 4000, placement: "top-center" });
            console.error('Error saving transaction changes:', error);
            setSaveError(error.message);

        } finally {
            // --- 6. Cleanup ---
            setIsSaving(false);
        }
    }, [formData, addedTags, removedTags, refreshTransactions, handleClose]); // Dependencies kept minimal

    const isParentTransaction = formData.children_flag === true;

    return (
        <Dialog.Root lazyMount open={open} onOpenChange={(e) => { if (!e.open) handleClose() }}>

            <Dialog.Trigger asChild>
                <Button
                    size="sm"
                    colorPalette="yellow"
                    variant="outline"
                    rounded="sm"
                    width={20}
                    onClick={handleOpen}
                    disabled={!selectedTransacAtomValue}
                    aria-label="Edit selected transaction"
                >
                    Edit
                </Button>
            </Dialog.Trigger>

            <Portal>
                <Toaster />
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header><Dialog.Title>Edit Transaction</Dialog.Title></Dialog.Header>
                        <Dialog.Body>
                            <Stack direction="column" gap="6">

                                <Stack direction={{ base: "column", md: "row" }} gap="8" width="100%" textStyle="xs" fontWeight="semibold">
                                    <Text>Created at: {formData.created_at ? new Date(formData.created_at).toLocaleDateString("pt-BR") : 'N/A'}</Text>
                                    <Text>Updated at: {formData.updated_at ? new Date(formData.updated_at).toLocaleDateString("pt-BR") : 'N/A'}</Text>
                                </Stack>

                                <Stack direction={"row"} gap="4" width="100%">
                                    {/* Date Field */}
                                    <Field.Root>
                                        <Field.Label>Date:</Field.Label>
                                        <Input
                                            name="date"
                                            type="date"
                                            value={formData.date}
                                            onChange={handleChange}
                                            disabled={isSaving || isParentTransaction}
                                        />
                                        {isParentTransaction && (
                                            <Field.HelperText>Date cannot be changed for parent transactions.</Field.HelperText>
                                        )}
                                    </Field.Root>

                                    {/* Amount Field */}
                                    <Field.Root>
                                        <Field.Label>Amount:</Field.Label>
                                        <Input
                                            placeholder="R$ 0.00"
                                            name="amount"
                                            type="number"
                                            step="0.01"
                                            value={formData.amount}
                                            onChange={handleChange}
                                            disabled={isSaving || isParentTransaction}
                                        />
                                        {isParentTransaction && (
                                            transactionState === 'loading' ? <Spinner size="xs" /> :
                                            <Field.HelperText>
                                                This is the original amount. The effective amount is{' '}
                                                {calculatedEffectiveAmount !== null ? formatBrazilianCurrency(calculatedEffectiveAmount) : 'Calculating...'}
                                                {' '}based on its sub-transactions. Edit sub-transactions to change their individual amounts.
                                            </Field.HelperText>
                                        )}
                                    </Field.Root>
                                </Stack>

                                {/* Description Field */}
                                <Field.Root>
                                    <Field.Label>Description:</Field.Label>
                                    <Textarea
                                        autoresize
                                        size="md"
                                        placeholder="Enter description"
                                        resize="none"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        disabled={isSaving || isParentTransaction}
                                    />
                                    {isParentTransaction && (
                                        <Field.HelperText>Description cannot be changed for parent transactions.</Field.HelperText>
                                    )}
                                </Field.Root>

                                {/* Note Field */}
                                <Field.Root>
                                    <Field.Label>Note:</Field.Label>
                                    <Textarea
                                        autoresize
                                        size="md"
                                        placeholder="Enter note"
                                        resize="none"
                                        name="note"
                                        value={formData.note}
                                        onChange={handleChange}
                                        disabled={isSaving}
                                    />
                                </Field.Root>

                                {/*Tags*/}
                                <Stack direction={"row"} gap="4" width="100%">
                                    
                                    
                                <Stack direction={ "column" } gap="4">
                                    <p>Tags:</p>
                                     {/* Pass necessary state and setters to EditTransactionTagsModal */}
                                    <EditTransactionTagsModal
                                        //transacData={formData}
                                        setTransacData={setFormData}
                                        existingTags={formData.tags}
                                        selectedTagIds={selectedTagIds}
                                        setSelectedTagIds={setSelectedTagIds}
                                        addedTags={addedTags}
                                        setAddedTags={setAddedTags}
                                        removedTags={removedTags}
                                        setRemovedTags={setRemovedTags}
                                        isDisabled={isSaving || isParentTransaction}
                                    />
                                    {/* Conditional Helper Text now correctly inside Field.Root */}
                                    {isParentTransaction && (
                                        <Text mt={1}> {/* Added margin top */}
                                            Tags cannot be changed for parent transactions.
                                        </Text>
                                    )}
                                </Stack>

                                {/* Right side: Tag display box */}
                                <Box borderWidth="1px" p="4" flexGrow={1} minH="80px">
                                    <VStack spacing={4} align="stretch" >
                                        {Array.isArray(formData.tags) && formData.tags.length > 0 ? (
                                            formData.tags.map((tag) => (
                                                <Flex
                                                    key={tag.id}
                                                    direction={'row'}
                                                    align={{ base: 'start', md: 'center' }}
                                                    gap={4}
                                                    wrap="wrap"
                                                >
                                                    <VStack align="start" spacing={1} flex="1">
                                                        <HStack spacing={3} wrap="wrap">
                                                            <Text fontSize="sm" color="gray.500">
                                                                {tag.tag_group?.name || 'No Group'}
                                                            </Text>
                                                        </HStack>
                                                    </VStack>
                                                    <Fragment key={tag.name}>
                                                        <TagCard key={tag.id} tag={tag} />
                                                    </Fragment>
                                                </Flex>
                                            ))
                                        ) : (
                                            <Text fontSize="sm" color="gray.500">No tags assigned.</Text>
                                        )}
                                    </VStack>
                                </Box>
                                        
                            </Stack>
                            </Stack>
                            {saveError && <Text color="red.500" fontSize="sm" mt={2}>{saveError}</Text>}
                        </Dialog.Body>

                        <Dialog.Footer gap={3}>
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                disabled={isSaving}
                            >
                                Cancel
                            </Button>
                            <Button
                                colorPalette="teal"
                                onClick={handleSave}
                                isLoading={isSaving}
                                loadingText="Saving..."
                                disabled={isSaving}
                            >
                                Save
                            </Button>
                        </Dialog.Footer>

                        <Dialog.CloseTrigger asChild position="absolute" top="2" right="2">
                            <CloseButton size="sm" onClick={handleClose} disabled={isSaving} />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};