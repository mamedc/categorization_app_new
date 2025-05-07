// File path: C:\Users\mamed\Meu Drive\Code\categorization_app_new\frontend\src\components\ui\Settings.jsx
// Settings.jsx - CORRECTED for standard Input

import React, { useState } from 'react';
import { useAtom } from 'jotai';
import {
    Button,
    CloseButton,
    Dialog,
    Portal,
    Text,
    Stack,
    Field,
    Input, // Using standard Input
} from "@chakra-ui/react";
import { initialBalanceAtom } from '../../context/atoms'; // Adjust path if needed
import { Toaster, toaster } from "@/components/ui/toaster" // Assuming toaster is used for feedback

export default function Settings() {
    const [open, setOpen] = useState(false);
    const [balance, setBalance] = useAtom(initialBalanceAtom);
    const [localBalance, setLocalBalance] = useState(String(balance));

    const handleOpen = () => {
        setLocalBalance(String(balance));
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSave = () => {
        const numericBalance = localBalance === '' ? 0 : parseFloat(localBalance);
        if (!isNaN(numericBalance)) {
            setBalance(numericBalance);
            toaster.create({
                title: "Settings Saved",
                description: `Initial balance set to ${numericBalance.toFixed(2)}.`,
                type: "success",
                duration: 3000,
                placement: "top-center",
            });
            handleClose();
        } else {
            console.error("Invalid balance input:", localBalance);
            toaster.create({
                title: "Invalid Input",
                description: "Please enter a valid number for the initial balance.",
                type: "error",
                duration: 4000,
                placement: "top-center",
            });
        }
    };

    // Correct handler for standard Input onChange event
    const handleInputChange = (event) => {
        // Extract the value from the event target
        setLocalBalance(event.target.value);
    };

    return (
        <Dialog.Root lazyMount open={open} onOpenChange={(e) => setOpen(e.open)}>
            <Dialog.Trigger asChild>
                <Text
                    fontSize="lg"
                    fontWeight="bold"
                    color="teal.700"
                    cursor="pointer"
                    _hover={{ color: "teal.500" }}
                    onClick={handleOpen}
                    display={{ base: "none", md: "block" }}
                >
                    Settings
                </Text>
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
                                    {/* Using standard Input */}
                                    <Input
                                        name="initBalance"
                                        value={localBalance}
                                        onChange={handleInputChange} // Attach the corrected handler
                                        type="number"
                                        placeholder="R$ 0.00"
                                        step="0.01"
                                    />
                                    <Field.HelperText>
                                        Set the starting balance for calculations.
                                    </Field.HelperText>
                                </Field.Root>
                                {/* Add more settings fields here in the future */}
                            </Stack>
                        </Dialog.Body>
                        <Dialog.Footer gap={3}>
                            <Button variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave} colorPalette="teal">
                                Save
                            </Button>
                        </Dialog.Footer>
                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" onClick={handleClose} />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
}