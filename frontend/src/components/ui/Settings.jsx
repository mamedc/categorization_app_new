// .\frontend\src\components\ui\Settings.jsx

import React, { useState, useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { CiSettings } from "react-icons/ci";
import {
    Button,
    CloseButton,
    Dialog,
    Portal,
    Text,
    Stack,
    Field,
    Input,
    Spinner,
    IconButton
} from "@chakra-ui/react";
import { initialBalanceAtom, ldbInitialBalanceAtom } from '../../context/atoms';
import { Toaster, toaster } from "@/components/ui/toaster"

export default function Settings() {
    const [open, setOpen] = useState(false);
    const [initialBalanceData] = useAtom(ldbInitialBalanceAtom);
    // Use useSetAtom for triggering the write operation
    const setBackendBalance = useSetAtom(initialBalanceAtom); // Renamed for clarity

    const [localBalance, setLocalBalance] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (initialBalanceData.state === 'hasData') {
            setLocalBalance(String(initialBalanceData.data));
        }
         // Add placeholder/loading handling if needed when state is 'loading' or 'hasError'
         else if (initialBalanceData.state === 'loading'){
             // Optionally set localBalance to a loading state or keep it empty
             // setLocalBalance('Loading...');
         }
         else if (initialBalanceData.state === 'hasError') {
             setLocalBalance('Error'); // Indicate error
         }
    }, [initialBalanceData.state, initialBalanceData.data]); // Depend on state and data


    const handleOpen = () => {
         if (initialBalanceData.state === 'hasData') {
            setLocalBalance(String(initialBalanceData.data));
         } else {
             setLocalBalance(''); // Clear or set default if not loaded
         }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setIsSaving(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        const numericBalance = localBalance === '' ? 0 : parseFloat(localBalance.replace(',', '.'));

        if (!isNaN(numericBalance)) {
            try {
                // Call the atom's write function. This triggers the API call.
                // Await the promise returned/thrown by the write function.
                await setBackendBalance(numericBalance);

                // UI feedback on successful save (handled by the write function triggering refresh)
                toaster.create({
                    title: "Settings Saved",
                    description: `Initial balance set to ${numericBalance.toFixed(2)}.`,
                    type: "success",
                    duration: 3000,
                    placement: "top-center",
                });
                handleClose();

            } catch (error) {
                // Handle errors thrown by the atom's write function (API failure)
                console.error("Error saving initial balance:", error);
                toaster.create({
                    title: "Save Failed",
                    description: error.message || "Could not save initial balance to the server.",
                    type: "error",
                    duration: 4000,
                    placement: "top-center",
                });
                // Keep the dialog open on error? Or close? User preference.
                // handleClose();
            } finally {
                setIsSaving(false);
            }
        } else {
            // Handle invalid input format
            console.error("Invalid balance input:", localBalance);
            toaster.create({
                title: "Invalid Input",
                description: "Please enter a valid number for the initial balance.",
                type: "error",
                duration: 4000,
                placement: "top-center",
            });
            setIsSaving(false);
        }
    };

    const handleInputChange = (event) => {
        setLocalBalance(event.target.value);
    };

    const isLoadingInitial = initialBalanceData.state === 'loading';

    return (
        <Dialog.Root lazyMount open={open} onOpenChange={(e) => setOpen(e.open)}>
            <Dialog.Trigger asChild>
                <IconButton size="md" variant="ghost" onClick={handleOpen}>
                    <CiSettings />
                </IconButton>
            </Dialog.Trigger>

            <Portal>
                <Toaster />
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Application Settings</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <Stack spacing={4}>
                                <Field.Root id="initialBalance">
                                    <Field.Label>Initial Balance</Field.Label>
                                    {isLoadingInitial ? (
                                         <Spinner size="sm" />
                                    ) : (
                                         <Input
                                            name="initBalance"
                                            value={localBalance}
                                            onChange={handleInputChange}
                                            type="text"
                                            inputMode="decimal"
                                            placeholder="R$ 0.00"
                                            disabled={isSaving || initialBalanceData.state === 'hasError'} // Disable if saving or error loading
                                        />
                                    )}
                                    <Field.HelperText>
                                        Set the starting balance for calculations.
                                    </Field.HelperText>
                                </Field.Root>
                                {/* Add more settings fields here in the future */}
                            </Stack>
                        </Dialog.Body>
                        <Dialog.Footer gap={3}>
                            <Button variant="outline" onClick={handleClose} disabled={isSaving}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                colorPalette="teal"
                                isLoading={isSaving}
                                loadingText="Saving..."
                                disabled={isSaving || isLoadingInitial || initialBalanceData.state === 'hasError'}
                            >
                                Save
                            </Button>
                        </Dialog.Footer>
                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" onClick={handleClose} disabled={isSaving} />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
}