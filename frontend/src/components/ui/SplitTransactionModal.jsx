// File path: frontend/src/components/ui/SplitTransactionModal.jsx
import { useState } from "react";
import {
    Button,
    CloseButton,
    Dialog,
    Portal,
    Text,
    Field,
    Input,
    Stack,
    Spinner,
    Alert,
} from "@chakra-ui/react";
import { useSetAtom } from "jotai";
import { Toaster, toaster } from "@/components/ui/toaster"; // Assuming toaster setup exists globally or via Portal
import { refreshTransactionsAtom } from "../../context/atoms";
import { BASE_URL } from "../../App"; // Assuming BASE_URL is correctly defined

export default function SplitTransactionModal({ isOpen, onClose, transactionToSplit }) {
    const [numberOfSplits, setNumberOfSplits] = useState(2);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const refreshTransactions = useSetAtom(refreshTransactionsAtom);

    const handleConfirmSplit = async () => {
        const numSplits = parseInt(numberOfSplits, 10);
        if (isNaN(numSplits) || numSplits < 2) {
            const errorMsg = "Number of sub-transactions must be at least 2.";
            setErrorMessage(errorMsg);
            toaster.create({
                title: "Validation Error",
                description: errorMsg,
                type: "error",
                duration: 4000,
                placement: "top-center",
            });
            return;
        }

        setIsSaving(true);
        setErrorMessage('');

        try {
            const response = await fetch(`${BASE_URL}/transactions/${transactionToSplit.id}/split`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ num_children: numSplits }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Use error message from backend if available
                throw new Error(data.error || data.description || `Server error: ${response.status}`);
            }

            // On success
            toaster.create({
                title: "Split Successful",
                description: `Transaction split into ${numSplits} sub-transactions.`,
                type: "success",
                duration: 3000,
                placement: "top-center",
            });
            refreshTransactions(prev => prev + 1); // Trigger transaction list refresh
            onClose(); // Close the modal

        } catch (error) {
            console.error("Error splitting transaction:", error);
            const errMsg = error.message || "An unexpected error occurred while splitting.";
            setErrorMessage(errMsg);
            toaster.create({
                title: "Split Failed",
                description: errMsg,
                type: "error",
                duration: 5000,
                placement: "top-center",
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Reset local state when the modal is closed externally or cancelled
    const handleClose = () => {
        setNumberOfSplits(2);
        setErrorMessage('');
        setIsSaving(false);
        onClose(); // Call the parent's onClose handler
    };

    // Handle changes to the isOpen prop to reset state if it closes
    useState(() => {
        if (!isOpen) {
            setNumberOfSplits(2);
            setErrorMessage('');
            setIsSaving(false);
        }
    }, [isOpen]);


    return (
        // Use onOpenChange to handle closing via overlay click or Esc key
        <Dialog.Root open={isOpen} onOpenChange={(e) => { if (!e.open) handleClose(); }}>
            <Portal>
                <Toaster /> {/* Render toaster within the modal's portal context */}
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            {/* Use transaction details in the title */}
                            <Dialog.Title>Split Transaction: {transactionToSplit?.description || `ID: ${transactionToSplit?.id}`}</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <Stack spacing={4}>
                                {/* Display error message if it exists */}
                                {errorMessage && (
                                    <Alert.Root status="error" variant="subtle" borderRadius="md">
                                        <Alert.Indicator />
                                        <Alert.Content>
                                            <Alert.Title>Error:</Alert.Title>
                                            <Alert.Description>{errorMessage}</Alert.Description>
                                        </Alert.Content>
                                    </Alert.Root>
                                )}
                                <Field.Root id="numberOfSplits">
                                    <Field.Label>Number of sub-transactions:</Field.Label>
                                    <Input
                                        type="number"
                                        value={numberOfSplits}
                                        onChange={(e) => setNumberOfSplits(e.target.value)}
                                        min={1}
                                        disabled={isSaving}
                                        placeholder="e.g., 2"
                                    />
                                    <Field.HelperText>
                                        How many new transactions to create? (min 2)
                                    </Field.HelperText>
                                </Field.Root>
                            </Stack>
                        </Dialog.Body>
                        <Dialog.Footer gap={3}>
                            <Button variant="outline" onClick={handleClose} disabled={isSaving}>
                                Cancel
                            </Button>
                            <Button
                                colorPalette="teal"
                                onClick={handleConfirmSplit}
                                isLoading={isSaving}
                                loadingText="Splitting..."
                                // Disable confirm if input is invalid or saving
                                disabled={isSaving || parseInt(numberOfSplits, 10) < 2 || isNaN(parseInt(numberOfSplits, 10))}
                            >
                                Confirm Split
                            </Button>
                        </Dialog.Footer>
                        {/* Close button in the corner */}
                        <Dialog.CloseTrigger asChild position="absolute" top="2" right="2">
                            <CloseButton size="sm" onClick={handleClose} disabled={isSaving} />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
}