// File path: C:\Users\mamed\Meu Drive\Code\categorization_app_new\frontend\src\components\ui\EditTransactionModal.jsx
// File path: frontend/src/components/ui/EditTransactionModal.jsx
// EditTransactionModal.jsx

import { useState, useCallback, useEffect, useMemo } from "react";
import { 
    Button, CloseButton, Dialog, Portal, Text, VStack, Stack, Field, Input, FileUpload, 
    Flex, Textarea, HStack, Box, Spinner, Link, IconButton, Heading, Theme
} from "@chakra-ui/react";
// import { Tooltip } from "@/components/ui/tooltip";
import { Fragment } from "react";
import { Toaster, toaster } from "@/components/ui/toaster";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { selectedTransaction, refreshTransactionsAtom, ldbTransactionsAtom, recentlyEditedTransactionIdAtom } from "../../context/atoms";
import EditTransactionTagsModal from "./EditTransactionTagsModal";
import TagCard from "./TagCard";
import { BASE_URL } from "../../App";
import { formatBrazilianCurrency } from "../../utils/currency";
import { LuDownload, LuEye, LuTrash2, LuUpload } from "react-icons/lu";
import { IoIosAttach } from "react-icons/io";


// API utility functions
const uploadDocumentAPI = async (transactionId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BASE_URL}/transactions/${transactionId}/documents`, {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to upload document" }));
        throw new Error(errorData.error || errorData.description || `HTTP error ${response.status}`);
    }
    return response.json();
};

const deleteDocumentAPI = async (documentId) => {
    const response = await fetch(`${BASE_URL}/documents/${documentId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to delete document" }));
        throw new Error(errorData.error || errorData.description || `HTTP error ${response.status}`);
    }
    // If backend returns 204 No Content, response.json() will fail.
    // Check status and handle accordingly or expect a JSON message.
    if (response.status === 204) return { message: "Document deleted successfully." };
    return response.json();
};


export default function EditTransactionModal ({
}) {

    const refreshTransactions = useSetAtom(refreshTransactionsAtom);
    const [selectedTransacAtomValue, setSelectedTransacAtom] = useAtom(selectedTransaction);
    const { state: transactionState, data: allTransactionsData } = useAtomValue(ldbTransactionsAtom);
    const setRecentlyEditedId = useSetAtom(recentlyEditedTransactionIdAtom);
    
    const [open, setOpen] = useState(false);
    const initialFormState = {
        id: "",
        amount: '',
        date: '',
        description: '',
        note: '',
        tags: [],
        documents: [],
        tag_group: {},
        created_at: '',
        updated_at: '',
        children_flag: false,
        doc_flag: false,
        parent_id: null,
    };
    const [formData, setFormData] = useState(initialFormState);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false); // For document upload
    const [deletingDocId, setDeletingDocId] = useState(null); // ID of document being deleted
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
        setIsUploading(false);
        setDeletingDocId(null);
        try {
            setFormData({
                id: currentSelectedTransaction.id ?? "",
                amount: currentSelectedTransaction.amount ?? "",
                date: currentSelectedTransaction.date ?? "",
                description: currentSelectedTransaction.description ?? "",
                note: currentSelectedTransaction.note ?? "",
                tags: currentSelectedTransaction.tags ?? [],
                documents: currentSelectedTransaction.documents ?? [],
                doc_flag: currentSelectedTransaction.doc_flag ?? false,
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
        setDeletingDocId(null);
        setOpen(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Helper to refetch and update transaction data (documents, doc_flag)
    const refreshTransactionDocuments = async () => {
        if (!formData.id) return;
        try {
            const updatedTransaction = await fetch(`${BASE_URL}/transactions/view/${formData.id}`).then(res => {
                if (!res.ok) throw new Error('Failed to refetch transaction');
                return res.json();
            });
            if (updatedTransaction) {
                setFormData(prev => ({ ...prev, documents: updatedTransaction.documents, doc_flag: updatedTransaction.doc_flag }));
                setSelectedTransacAtom(updatedTransaction); // Update global state
            }
        } catch (error) {
            console.error("Error refreshing transaction documents:", error);
            toaster.create({ title: "Data Sync Error", description: "Could not refresh document list.", type: "warning" });
        }
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
                  // doc_flag is managed by document uploads/deletes, 
                  // no need to send from here unless manual override is intended
        };

        if (!formData.children_flag) {
            updatePayload.amount = formData.amount;
        }

        try {
            // --- 1. Update Core Transaction Data ---
            const updateRes = await fetch(BASE_URL + "/transactions/update/" + transactionIdToUpdate, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", },
                body: JSON.stringify(updatePayload),
            });
            const updateData = await updateRes.json();
            if (!updateRes.ok) {
                throw new Error(updateData.error || updateData.description || `Failed to update transaction (status ${updateRes.status})`);
            }
            
            // --- 2. Add New Tags ---
            if (addedTags && addedTags.length > 0) {
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
                }
                successMessage = "Transaction and tags updated successfully.";
            }

            // --- 4. Success Handling ---
            toaster.create({ title: "Success!", description: successMessage, type: "success", duration: 3000, placement: "top-center" });
            setSaveError('');
            refreshTransactions((prev) => prev + 1);
            // Fetch the updated transaction to ensure UI consistency
            const newSelectedTx = await fetch(`${BASE_URL}/transactions/view/${transactionIdToUpdate}`).then(res => res.json());
            setSelectedTransacAtom(newSelectedTx); // Update the global atom
            setRecentlyEditedId(transactionIdToUpdate); // Set the ID of the edited transaction for animation
            handleClose();

        } catch (error) {
            // --- 5. Error Handling ---
            toaster.create({ title: "An error occurred.", description: error.message, type: "error", duration: 4000, placement: "top-center" });
            console.error('Error saving transaction changes:', error);
            setSaveError(error.message);

        } finally {
            // --- 6. Cleanup ---
            setIsSaving(false);
        }
    }, [formData, addedTags, removedTags, refreshTransactions, setSelectedTransacAtom, setRecentlyEditedId, handleClose]); // Dependencies kept minimal


    const handleFileUpload = async (fileDetails) => {
            if (!fileDetails.acceptedFiles || fileDetails.acceptedFiles.length === 0) {
                return;
            }
            const file = fileDetails.acceptedFiles[0];
            setIsUploading(true);
            try {
                await uploadDocumentAPI(formData.id, file);
                toaster.create({
                    title: "Document Uploaded",
                    description: `${file.name} has been attached.`,
                    type: "success",
                });
                refreshTransactions((prev) => prev + 1); // Refresh data
                // Refetch the specific transaction to update formData.documents
                const updatedTransaction = await fetch(`${BASE_URL}/transactions/view/${formData.id}`).then(res => res.json());
                if (updatedTransaction) {
                     setFormData(prev => ({ ...prev, documents: updatedTransaction.documents, doc_flag: updatedTransaction.doc_flag }));
                     setSelectedTransacAtom(updatedTransaction); // Update global state as well
                }
    
            } catch (error) {
                console.error("Error uploading document:", error);
                toaster.create({
                    title: "Upload Failed",
                    description: error.message || "Could not upload document.",
                    type: "error",
                });
            } finally {
                setIsUploading(false);
            }
        };
    
    const handleDeleteDocument = async (documentId) => {
        if (!formData.id) return;
        if (!window.confirm("Are you sure you want to delete this document?")) return;

        setDeletingDocId(documentId); // Mark this document as being deleted
        try {
            await deleteDocumentAPI(documentId);
            toaster.create({
                title: "Document Deleted",
                description: `Document has been removed.`,
                type: "success",
            });
            refreshTransactions((prev) => prev + 1); // Refresh data
            await refreshTransactionDocuments(); // Local refresh
            // Refetch the specific transaction to update formData.documents and doc_flag
            // const updatedTransaction = await fetch(`${BASE_URL}/transactions/view/${formData.id}`).then(res => res.json());
            // if (updatedTransaction) {
            //     setFormData(prev => ({ ...prev, documents: updatedTransaction.documents, doc_flag: updatedTransaction.doc_flag }));
            //     setSelectedTransacAtom(updatedTransaction); // Update global state
            // }
        } catch (error) {
            console.error("Error deleting document:", error);
            toaster.create({
                title: "Delete Failed",
                description: error.message || "Could not delete document.",
                type: "error",
            });
        }
    };
    

    const isParentTransaction = formData.children_flag === true;

    return (
        <Dialog.Root lazyMount open={open} onOpenChange={(e) => { if (!e.open) handleClose() }}>

            <Dialog.Trigger asChild>
                <Button
                    size="xs"
                    colorPalette="yellow"
                    variant="subtle"
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
            <Theme appearance="light">
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
                                        <Field.Label fontSize="xs">Date:</Field.Label>
                                        <Input
                                            name="date"
                                            type="date"
                                            value={formData.date}
                                            onChange={handleChange}
                                            disabled={isSaving || isParentTransaction}
                                        />
                                    </Field.Root>

                                    {/* Amount Field */}
                                    <Field.Root>
                                        <Field.Label fontSize="xs">Amount:</Field.Label>
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
                                                Original: {formatBrazilianCurrency(formData.amount)}. Effective: {' '}
                                                {calculatedEffectiveAmount !== null ? formatBrazilianCurrency(calculatedEffectiveAmount) : 'Calculating...'}
                                            </Field.HelperText>
                                        )}
                                    </Field.Root>
                                </Stack>

                                {/* Description Field */}
                                <Field.Root>
                                    <Field.Label fontSize="xs">Description:</Field.Label>
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
                                </Field.Root>

                                {/* Note Field */}
                                <Field.Root>
                                    <Field.Label fontSize="xs">Note:</Field.Label>
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
                                <Stack direction={"column"} gap="1" width="100%">

                                    {/* Tags section title and edit button */}
                                    <Stack direction={ "row" } gap="0" align="center">
                                        <Text fontSize="xs">Tags:</Text>
                                        <EditTransactionTagsModal
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
                                    </Stack>

                                    {/* Tags display box */}
                                    <Box borderWidth="1px" p="2" flexGrow={1} minH="80px" borderRadius="md">
                                        <VStack spacing={0} gap={0} p={0} align="stretch" >
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
                                                            <HStack spacing={1} wrap="wrap">
                                                                <Text fontSize="xs" color="gray.500">
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
                                                <Text fontSize="xs" color="gray.500">No tags assigned.</Text>
                                            )}
                                        </VStack>
                                    </Box>     
                                </Stack>
                            
                                {/* Attach Documents Section */}
                                <VStack spacing={3} align="stretch">
                                    
                                    {/* Documents section title and add button */}
                                    <Stack direction={ "row" } gap="0" align="center">
                                        <Text fontSize="xs">Documents:</Text>
                                        <FileUpload.Root
                                            onFileChange={handleFileUpload}
                                            maxFiles={1}
                                            disabled={isUploading || isSaving}
                                        >
                                            <FileUpload.HiddenInput />
                                            <FileUpload.Trigger asChild>
                                                <IconButton 
                                                    size="xs"
                                                    colorPalette="cyan"
                                                    variant={"ghost"}
                                                    onClick={handleOpen}
                                                    disabled={isUploading || isSaving}
                                                    isLoading={isUploading}
                                                    loadingText="Uploading..."
                                                >
                                                    <IoIosAttach />
                                                </IconButton>
                                            </FileUpload.Trigger>
                                        </FileUpload.Root>
                                    </Stack>

                                    {/* Documents display box */}
                                    {formData.documents && formData.documents.length > 0 ? (
                                        <VStack spacing={2} align="stretch" mt={0} borderWidth="1px" borderRadius="md" p={2} gap={1}>
                                            {formData.documents.map(doc => (
                                                <Flex key={doc.id} justify="space-between" align="center" p={0} _hover={{bg: "gray.50"}} borderRadius="sm">
                                                    <Text fontSize="xs" noOfLines={1} title={doc.original_filename}>
                                                        {doc.original_filename}
                                                    </Text>
                                                    <HStack spacing={1} gap={1}>

                                                        <IconButton 
                                                            colorPalette="cyan"
                                                            as="a" // Render as anchor tag
                                                            href={`${BASE_URL}/documents/${doc.id}/view`}
                                                            target="_blank" // Open in new tab
                                                            rel="noopener noreferrer"
                                                            size="2xs" 
                                                            variant="ghost" 
                                                            aria-label="View document"
                                                        >
                                                            <LuEye />
                                                        </IconButton>

                                                        <IconButton 
                                                            colorPalette="cyan"
                                                            as="a" // Render as anchor tag
                                                            href={`${BASE_URL}/documents/${doc.id}/download`}
                                                            target="_blank" // Open in new tab
                                                            rel="noopener noreferrer"
                                                            size="2xs" 
                                                            variant="ghost" 
                                                            aria-label="Download document"
                                                        >
                                                            <LuDownload />
                                                        </IconButton>

                                                        <IconButton 
                                                            colorPalette="cyan"
                                                            size="2xs" 
                                                            variant="ghost" 
                                                            aria-label="Delete document"
                                                            onClick={() => handleDeleteDocument(doc.id)}
                                                            disabled={isUploading || isSaving}
                                                        >
                                                            <LuTrash2 />
                                                        </IconButton>

                                                    </HStack>
                                                </Flex>
                                            ))}
                                        </VStack>
                                    ) : (
                                        <Text fontSize="sm" color="gray.500" mt={2}>No documents attached.</Text>
                                    )}
                                </VStack>
                                {/* End Attach Documents Section */}
                            
                            {saveError && <Text color="red.500" fontSize="sm" mt={2}>{saveError}</Text>}
                            </Stack>
                        
                        </Dialog.Body>

                        <Dialog.Footer gap={3}>
                            <Button
                                size="xs"
                                variant="outline"
                                onClick={handleClose}
                                disabled={isSaving || isUploading}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="xs"
                                colorPalette="teal"
                                onClick={handleSave}
                                isLoading={isSaving}
                                loadingText="Saving..."
                                disabled={isSaving || isUploading}
                            >
                                Save
                            </Button>
                        </Dialog.Footer>

                        <Dialog.CloseTrigger asChild position="absolute" top="2" right="2">
                            <CloseButton size="sm" onClick={handleClose} disabled={isSaving || isUploading} />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Theme>
            </Portal>
        </Dialog.Root>
    );
};