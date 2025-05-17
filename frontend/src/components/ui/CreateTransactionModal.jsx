import { useState } from "react";
import { BASE_URL } from "../../App"
import { Button, CloseButton, Dialog, Portal, Text, Flex, Stack,Field, Input, RadioGroup, HStack, Textarea, Theme } from "@chakra-ui/react";
import { Toaster, toaster } from "@/components/ui/toaster"
import { useAtom, useSetAtom } from "jotai";
import { selectedTransaction, refreshTransactionsAtom } from "../../context/atoms";


export default function CreateTransactionModal ({ 
    //setTransactions, 
    //selectedTransactionId 
}) {
    
    const refreshTransactions = useSetAtom(refreshTransactionsAtom);
    const [selectedTransac, setSelectedTransac] = useAtom(selectedTransaction);

    const [open, setOpen] = useState(false);
    const initialFormState = {amount: '', date: '', description: '', note: ''};
    const [formData, setFormData] = useState(initialFormState);
    const [isSaving, setIsSaving] = useState(false); // State for loading indicator
    const [saveError, setSaveError] = useState(''); // State for potential errors
    
    const handleOpen = () => {
        setOpen(true);
        setFormData(initialFormState);
        setSaveError(''); // Clear any previous error
    };
    const handleClose = () => {
        setFormData(initialFormState);
        setOpen(false);
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSave = async () => { 
        setIsSaving(true); // Start loading
        try {
            const res = await fetch(BASE_URL + "/transactions/new", {
                method: "POST",
                headers: { "Content-Type": "application/json", },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if(!res.ok) { 
                throw new Error(data.error); 
            };
            toaster.create({
                title: "Success!",
                description: "New transaction added.",
                type: "success",
                duration: 2000,
                placement: "top-center",
            })
            console.log(formData);
            setSaveError(''); // Clear any previous error
            setOpen(false); // Close dialog
            //setTransactions((prevTransactions) => [...prevTransactions, data]); // Add new transaction to Transactions without new rendering
            refreshTransactions((prev) => prev + 1); // This triggers a refresh
        } catch (error) {
            toaster.create({
                title: "An error occurred.",
                description: error.message,
                type: "error",
                duration: 4000,
                placement: "top-center",
            })
            console.error('Error saving name:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog.Root lazyMount open={open} onOpenChange={(e) => setOpen(e.open)}>
            
            <Dialog.Trigger asChild>
                <Button 
                    size="xs" 
                    colorPalette="cyan" 
                    variant="subtle"
                    rounded="sm" 
                    width={20} 
                    onClick={handleOpen}
                    disabled={selectedTransac !== null}
                >
                    Add
                </Button>
            </Dialog.Trigger>

            <Portal>
            <Theme appearance="light">
                <Toaster />
                <Dialog.Backdrop />
                <Dialog.Positioner>
                <Dialog.Content>
                    <Dialog.Header><Dialog.Title>New Transaction</Dialog.Title></Dialog.Header>
                    <Dialog.Body>
                        <Stack direction="column" gap="6">
                            <Stack direction={{ base: "column", md: "row" }} gap="4" width="100%">
                                
                                {/*Left: Date*/}
                                <Field.Root>
                                    <Field.Label>Date:</Field.Label>
                                    <Input
                                        name="date"
                                        type="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        disabled={isSaving} // Disable input during saving
                                    />
                                </Field.Root>  

                                {/*Right: Value*/}
                                <Field.Root>
                                    <Field.Label>Amount:</Field.Label>
                                    <Input 
                                        placeholder="R$ 0.00"
                                        name="amount"
                                        type="number"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        disabled={isSaving}
                                    />
                                </Field.Root> 
                            {/*</Flex>*/}
                            </Stack>

                            {/*Description*/}
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
                                    disabled={isSaving}
                                />
                            </Field.Root> 

                            {/*Note*/}
                            <Field.Root>
                                <Field.Label>Note:</Field.Label>
                                <Textarea 
                                    autoresize 
                                    size="md"
                                    placeholder="Enter description"
                                    resize="none"
                                    name="note"
                                    value={formData.note}
                                    onChange={handleChange}
                                    disabled={isSaving}
                                />
                            </Field.Root> 
                        </Stack>
                        {saveError && <Text color="red.500">{saveError}</Text>}
                    </Dialog.Body>
                    
                    {/* Cancel and Save buttons */}
                    <Dialog.Footer>
                        <Button 
                            variant="surface" 
                            onClick={handleClose} 
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleSave} 
                            disabled={isSaving}
                        >
                            Save
                        </Button>
                    </Dialog.Footer>
                    
                    <Dialog.CloseTrigger asChild>
                        <CloseButton size="sm" onClick={handleClose} disabled={isSaving} />
                    </Dialog.CloseTrigger>  
                </Dialog.Content>
                </Dialog.Positioner>
            </Theme>
            </Portal>
    </Dialog.Root>
    );
};