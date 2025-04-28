// EditTransactionModal.jsx

import { useState } from "react";
import { BASE_URL } from "../../App"
import { Button, CloseButton, Dialog, Portal, Text, VStack, Stack, Field, Input, Checkbox, Flex, Textarea, HStack, ColorSwatch, Box } from "@chakra-ui/react";
import { Toaster, toaster } from "@/components/ui/toaster"
import { useAtom, useSetAtom } from "jotai";
import { selectedTransaction, refreshTransactionsAtom, selectedTagId } from "../../context/atoms";
import EditTransactionTagsModal from "./EditTransactionTagsModal";


export default function EditTransactionModal ({ 
}) {
    
    const refreshTransactions = useSetAtom(refreshTransactionsAtom);
    const [selectedTransac, setSelectedTransac] = useAtom(selectedTransaction);
    const [selectedTag, setSelectedTag] = useAtom(selectedTagId);

    const [open, setOpen] = useState(false);
    const initialFormState = {id: "", amount: '', date: '',description: '', tags: [], tag_group: {}};
    const [formData, setFormData] = useState(initialFormState);
    const [isSaving, setIsSaving] = useState(false); // State for loading indicator
    const [saveError, setSaveError] = useState(''); // State for potential errors
    
    const requiredFields = [
        "id", "date", "amount", "description", "children_flag", "doc_flag", 
        "created_at", "updated_at", "tags",
    ];

    const hasRequiredFields = (data, requiredFields) => {
        return requiredFields.every(field => field in data);
      };

    const getTransaction = async (e) => {
        console.log('selectedTransac: ' + selectedTransac)
        try {
            const res = await fetch(BASE_URL + "/transactions/view/" + selectedTransac, { method: "GET" });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to fetch tag groups");
            };
            if (!hasRequiredFields(data, requiredFields)) {
                console.error("Fetched data does not have all fields:", data);
                return[]
            };
            return data;       
        } catch (error) {
            console.error("Error fetching transactions:", error);
            return [];
        };
    };

    const handleOpen = async () => {
        setOpen(true);
        setSaveError('');
        const data = await getTransaction();

        if (data && typeof data === "object") {
            requiredFields.forEach(field => {
                console.log(`${field}:`, data[field]);
            });
            setFormData({
                id: data.id || "",
                amount: data.amount || "",
                date: data.date || "",
                description: data.description || "",
                tags: data.tags || [],
                created_at: data.created_at || "",
                updated_at: data.updated_at || "",
            });
        };
    };
    const handleClose = () => {
        setFormData(initialFormState);
        setSelectedTransac(null);
        setOpen(false);
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    const handleLog = (e) => {
        console.log(formData);
    };
    const handleSelectTag = (tagId) => {
        const newSel = tagId === selectedTag ? null : tagId;
        setSelectedTag(newSel);
    };
    const handleSave = async () => { 
        setIsSaving(true); // Start loading
        try {
            const res = await fetch(BASE_URL + "/transactions/update/" + selectedTransac, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if(!res.ok) { 
                throw new Error(data.error); 
            };
            toaster.create({
                title: "Success!",
                description: "Changes saved to transaction.",
                type: "success",
                duration: 2000,
                placement: "top-center",
            })
            console.log(formData);
            setSaveError('');
            handleClose()
            refreshTransactions((prev) => prev + 1); // This triggers a refresh
        } catch (error) {
            toaster.create({
                title: "An error occurred.",
                description: error.message,
                type: "error",
                duration: 4000,
                placement: "top-center",
            })
            console.error('Error edditing transaction:', error);
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <Dialog.Root lazyMount open={open} onOpenChange={(e) => setOpen(e.open)}>
            
            <Dialog.Trigger asChild>
                <Button 
                    size="sm" 
                    colorPalette="yellow" 
                    rounded="sm" 
                    width={20} 
                    onClick={handleOpen}
                    disabled={selectedTransac === null}
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
                            <Stack direction={{ base: "column", md: "row" }} gap="4" width="100%">
                                
                                <p>Created at: { formData.created_at }</p>
                                <p>Updated at: { formData.updated_at }</p>

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

                            {/*Tags*/}
                            <p>Tags:</p>
                            <Box borderWidth="1px" p="4">
                                <VStack spacing={6} align="stretch" >
                                    {formData.tags.map((tag) => (
                                        <Flex
                                            key={tag.id}
                                            direction={'row'}
                                            align={{ base: 'start', md: 'center' }}
                                            gap={4}
                                            wrap="wrap"
                                        >
                                            {/*Checkbox*/}
                                            {/* <Checkbox.Root
                                                variant="outline"
                                                size="sm"
                                                colorPalette="cyan"
                                                mt={{ base: 1, md: 0 }}
                                                checked={tag.id === selectedTag}
                                                onCheckedChange={() => handleSelectTag(tag.id)}
                                            >
                                                <Checkbox.HiddenInput />
                                                <Checkbox.Control />
                                            </Checkbox.Root> */}

                                            {/* Left: Details */}
                                            <VStack align="start" spacing={1} flex="1">
                                                <HStack spacing={3} wrap="wrap">
                                                    <Text fontSize="sm" color="gray.500">
                                                    {tag.tag_group.name} / {tag.name}
                                                    </Text>
                                                </HStack>
                                            </VStack>

                                            {/* Right: Value + Flags */}
                                            <VStack align="end" spacing={1}>
                                                <ColorSwatch value={tag.color} size="xs" borderRadius="xl" />
                                            </VStack>

                                        </Flex>
                                    ))}
                                    <EditTransactionTagsModal transacData={formData} setTransacData={setFormData} existingTags={formData.tags} />
                                </VStack>
                            </Box>
                            
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
                        <Button 
                            onClick={handleLog} 
                        >
                            Log
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
};