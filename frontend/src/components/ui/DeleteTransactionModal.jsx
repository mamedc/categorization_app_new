// File path: C:\Users\mamed\Meu Drive\Code\categorization_app_new\frontend\src\components\ui\DeleteTransactionModal.jsx
import { useState, useMemo } from "react"; // Added useMemo
import { BASE_URL } from "../../App";
import { Button, CloseButton, Dialog, Portal, Text, Flex, Stack, Field, Input, Icon, RadioGroup, HStack, Textarea } from "@chakra-ui/react";
import { Toaster, toaster } from "@/components/ui/toaster";
import { FiAlertTriangle } from 'react-icons/fi';
import { useAtom, useAtomValue, useSetAtom } from "jotai"; // Added useAtomValue
import { selectedTransaction, refreshTransactionsAtom, ldbTransactionsAtom } from "../../context/atoms"; // Added ldbTransactionsAtom

export default function DeleteTransactionModal() {
    const refreshTransactions = useSetAtom(refreshTransactionsAtom);
    const [selectedTransac, setSelectedTransac] = useAtom(selectedTransaction);
    const { state: transactionState, data: allTransactionsData } = useAtomValue(ldbTransactionsAtom); // Get all transactions for child count

    const [open, setOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false); // State for loading indicator
    const [saveError, setSaveError] = useState(''); // State for potential errors

    // Calculate children count for parent transactions
    const childrenCount = useMemo(() => {
        if (!selectedTransac || !selectedTransac.children_flag || transactionState !== 'hasData' || !allTransactionsData) {
            return 0;
        }
        return allTransactionsData.filter(tx => tx.parent_id === selectedTransac.id).length;
    }, [selectedTransac, allTransactionsData, transactionState]);

    // Determine the type of transaction being deleted
    const isParentTransaction = selectedTransac?.children_flag === true;
    const isSubTransaction = selectedTransac?.parent_id !== null;

    // Generate the appropriate warning message
    const warningMessage = useMemo(() => {
        if (!selectedTransac) return "Are you sure?"; // Default or loading state

        if (isParentTransaction) {
            return `This is a parent transaction with ${childrenCount} sub-item(s). Deleting it will also delete all its sub-items. Are you sure you want to delete: "${selectedTransac.description || 'this transaction'}"?`;
        } else if (isSubTransaction) {
            return `Are you sure you want to delete this sub-transaction: "${selectedTransac.description || 'this item'}"?`;
        } else {
            // Standard transaction (neither parent nor child explicitly)
            return `Are you sure you want to delete: "${selectedTransac.description || 'this transaction'}"?`;
        }
    }, [selectedTransac, isParentTransaction, isSubTransaction, childrenCount]);


    const handleOpen = () => {
        setOpen(true);
        setSaveError(''); // Clear any previous error
    };
    const handleClose = () => {
        setOpen(false);
    };

    const handleDeleteTransaction = async () => {
        if (!selectedTransac || !selectedTransac.id) {
            console.error("No transaction selected for deletion.");
            toaster.create({
                title: "Error",
                description: "No transaction selected for deletion.",
                status: "error",
                duration: 4000,
                placement: "top-center",
            });
            return;
        }

        setIsSaving(true); // Start loading
        try {
            console.log(`Attempting to delete transaction ID: ${selectedTransac.id}`);
            const res = await fetch(BASE_URL + "/transactions/delete/" + selectedTransac.id, {
                method: "DELETE",
            });
            // Check if the response body is empty or not valid JSON before parsing
            const contentType = res.headers.get("content-type");
            let data;
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await res.json();
            } else {
                // Handle non-JSON responses (like plain text or empty)
                data = { message: await res.text() || (res.ok ? 'Success' : 'Error') }; // Use text or default message
            }

            if (!res.ok) {
                throw new Error(data.error || data.description || data.message || `HTTP error! status: ${res.status}`);
            }

            setSaveError(''); // Clear any previous error
            setOpen(false); // Close dialog
            setSelectedTransac(null); // Deselect the transaction
            refreshTransactions((prev) => prev + 1); // This triggers a refresh
            toaster.create({
                title: "Success!",
                description: "Transaction deleted.",
                type: "success",
                duration: 2000,
                placement: "top-center",
            });
        } catch (error) {
            console.error("Error deleting transaction:", error);
            toaster.create({
                title: "An error occurred.",
                description: error.message,
                status: "error",
                duration: 4000,
                placement: "top-center",
            });
            setSaveError(error.message); // Optionally show error in modal if it stays open
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog.Root lazyMount open={open} onOpenChange={(e) => { if (!e.open) handleClose() }}>
            <Dialog.Trigger asChild>
                <Button
                    size="xs"
                    colorPalette="red"
                    variant="subtle"
                    rounded="sm"
                    width={20}
                    onClick={handleOpen}
                    disabled={selectedTransac === null} // Disable if no transaction is selected
                    aria-label="Delete selected transaction"
                >
                    Delete
                </Button>
            </Dialog.Trigger>

            <Portal>
                <Toaster />
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            {/* Title can be dynamic too if needed */}
                             <Dialog.Title>Confirm Deletion</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <Flex direction="column" align="center" gap={4}>
                                <Icon as={FiAlertTriangle} color="red.500" boxSize={8} />
                                <Text color="fg" textAlign="center" fontSize="md">
                                    {warningMessage}
                                </Text>
                            </Flex>
                            {saveError && <Text color="red.500" mt={4} textAlign="center">{saveError}</Text>}
                        </Dialog.Body>

                        {/* Cancel and Delete buttons */}
                        <Dialog.Footer gap={3}>
                            <Button
                                variant="outline" // More standard variant
                                onClick={handleClose}
                                disabled={isSaving}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDeleteTransaction}
                                isLoading={isSaving} // Use isLoading prop
                                loadingText="Deleting..." // Add loading text
                                disabled={isSaving}
                                colorPalette="red" // Keep red color for destructive action
                            >
                                Delete
                            </Button>
                        </Dialog.Footer>

                         {/* Position close button */}
                        <Dialog.CloseTrigger asChild position="absolute" top="2" right="2">
                            <CloseButton size="sm" onClick={handleClose} disabled={isSaving} />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};