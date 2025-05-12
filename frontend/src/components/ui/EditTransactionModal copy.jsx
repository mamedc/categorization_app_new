// File path: C:\Users\mamed\Meu Drive\Code\categorization_app_new\frontend\src\components\ui\EditTransactionModal.jsx
// File path: frontend/src/components/ui/EditTransactionModal.jsx
// EditTransactionModal.jsx

import { useState, useCallback, useEffect, useMemo } from "react";
import {
    Button, CloseButton, Dialog, Portal, Text, VStack, Stack, Field, Input, FileUpload,
    Flex, Textarea, HStack, Box, Spinner, Link, IconButton, Heading, Tooltip
} from "@chakra-ui/react";
import { Fragment } from "react";
import { Toaster, toaster } from "@/components/ui/toaster";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { selectedTransaction, refreshTransactionsAtom, ldbTransactionsAtom } from "../../context/atoms";
import EditTransactionTagsModal from "./EditTransactionTagsModal";
import TagCard from "./TagCard";
import { BASE_URL } from "../../App";
import { formatBrazilianCurrency } from "../../utils/currency";
import { LuDownload, LuEye, LuTrash2, LuUploadCloud, LuFileText } from "react-icons/lu";


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
            toaster.create({
                title: "Error",
                description: "No transaction selected for editing.",
                type: "error",
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
                description: "Transaction ID is missing.", 
                type: "error" 
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
            const updateRes = await fetch(BASE_URL + "/transactions/update/" + transactionIdToUpdate, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", },
                body: JSON.stringify(updatePayload),
            });
            const updateData = await updateRes.json();
            if (!updateRes.ok) {
                throw new Error(updateData.error || updateData.description || `Failed to update transaction`);
            }
            
            // --- 2. Add New Tags ---
            if (addedTags && addedTags.length > 0) {
                for (const tagIdToAdd of addedTags) {
                    if (typeof tagIdToAdd !== 'number' || tagIdToAdd === null || typeof tagIdToAdd === 'undefined') continue;
                    const addTagRes = await fetch(`${BASE_URL}/transactions/${transactionIdToUpdate}/tags`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", },
                        body: JSON.stringify({ tag_id: tagIdToAdd }),
                    });
                    const addTagData = await addTagRes.json();
                    if (!addTagRes.ok && addTagRes.status !== 409 && !(addTagData.message || addTagData.error || '').includes("already associated")) {
                         throw new Error(addTagData.error || addTagData.description || `Failed to add tag ID ${tagIdToAdd}`);
                    }
                }
                successMessage = "Transaction and tags updated successfully.";
            }

            // --- 3. Remove Tags ---
            if (removedTags && removedTags.length > 0) {
                for (const tagIdToRemove of removedTags) {
                    if (typeof tagIdToRemove !== 'number' || tagIdToRemove === null || typeof tagIdToRemove === 'undefined') continue;
                    const removeTagRes = await fetch(`${BASE_URL}/transactions/${transactionIdToUpdate}/tags/${tagIdToRemove}`, { method: "DELETE" });
                    if (!removeTagRes.ok && removeTagRes.status !== 404) { // Allow 404 if tag was already removed
                        let errorData = {};
                        try { errorData = await removeTagRes.json(); } catch (e) { /* Ignore JSON parse error on non-JSON response */ }
                        throw new Error(errorData.error || errorData.description || `Failed to remove tag ID ${tagIdToRemove} (status ${removeTagRes.status})`);
                    }
                }
                 successMessage = "Transaction and tags updated successfully.";
            }

            toaster.create({ title: "Success!", description: successMessage, type: "success" });
            refreshTransactions((prev) => prev + 1);
            // It's important to get the LATEST state of the transaction after ALL saves
            await refreshTransactionDocuments(); // This will update formData and selectedTransacAtom
            handleClose();
        } catch (error) {
            toaster.create({ title: "An error occurred.", description: error.message, type: "error" });
            setSaveError(error.message);
        } finally {
            setIsSaving(false);
        }
    }, [formData, addedTags, removedTags, refreshTransactions, handleClose, setSelectedTransacAtom]);

    const handleFileUpload = async (fileDetails) => {
        if (!fileDetails.acceptedFiles || fileDetails.acceptedFiles.length === 0) return;
        const file = fileDetails.acceptedFiles[0];
        if (!formData.id) {
            toaster.create({ title: "Error", description: "Transaction not selected.", type: "error"});
            return;
        }
        setIsUploading(true);
        try {
            await uploadDocumentAPI(formData.id, file);
            toaster.create({ title: "Document Uploaded", description: `${file.name} attached.`, type: "success"});
            refreshTransactions((prev) => prev + 1); // Global refresh for grid badge
            await refreshTransactionDocuments(); // Local refresh for modal list
        } catch (error) {
            toaster.create({ title: "Upload Failed", description: error.message || "Could not upload.", type: "error"});
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
            toaster.create({ title: "Document Deleted", type: "success"});
            refreshTransactions((prev) => prev + 1); // Global refresh
            await refreshTransactionDocuments(); // Local refresh
        } catch (error) {
            toaster.create({ title: "Delete Failed", description: error.message, type: "error"});
        } finally {
            setDeletingDocId(null); // Reset deleting state for this document
        }
    };

    const isParentTransaction = formData.children_flag === true;

    return (
        <Dialog.Root lazyMount open={open} onOpenChange={(e) => { if (!e.open) handleClose() }}>
            <Dialog.Trigger asChild>
                <Button size="sm" colorPalette="yellow" variant="outline" rounded="sm" width={20} onClick={handleOpen} disabled={!selectedTransacAtomValue}>
                    Edit
                </Button>
            </Dialog.Trigger>
            <Portal>
                <Toaster />
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content maxW="2xl"> 
                        <Dialog.Header><Dialog.Title>Edit Transaction</Dialog.Title></Dialog.Header>
                        <Dialog.Body>
                            <VStack spacing={4} align="stretch"> 
                                <HStack justify="space-between" textStyle="xs" fontWeight="semibold">
                                    <Text>Created: {formData.created_at ? new Date(formData.created_at).toLocaleDateString("pt-BR") : 'N/A'}</Text>
                                    <Text>Updated: {formData.updated_at ? new Date(formData.updated_at).toLocaleDateString("pt-BR") : 'N/A'}</Text>
                                </HStack>

                                <HStack spacing={3}>
                                    <Field.Root flex="1">
                                        <Field.Label>Date:</Field.Label>
                                        <Input name="date" type="date" value={formData.date} onChange={handleChange} disabled={isSaving || isParentTransaction}/>
                                        {isParentTransaction && <Field.HelperText>Date cannot be changed for parent transactions.</Field.HelperText>}
                                    </Field.Root>
                                    <Field.Root flex="1">
                                        <Field.Label>Amount:</Field.Label>
                                        <Input placeholder="R$ 0.00" name="amount" type="number" step="0.01" value={formData.amount} onChange={handleChange} disabled={isSaving || isParentTransaction}/>
                                        {isParentTransaction && (transactionState === 'loading' ? <Spinner size="xs" /> : <Field.HelperText>Original: {formatBrazilianCurrency(formData.amount)}. Effective: {calculatedEffectiveAmount !== null ? formatBrazilianCurrency(calculatedEffectiveAmount) : 'Calculating...'}</Field.HelperText>)}
                                    </Field.Root>
                                </HStack>

                                <Field.Root>
                                    <Field.Label>Description:</Field.Label>
                                    <Textarea autoresize placeholder="Enter description" name="description" value={formData.description} onChange={handleChange} disabled={isSaving || isParentTransaction}/>
                                    {isParentTransaction && <Field.HelperText>Description cannot be changed for parent transactions.</Field.HelperText>}
                                </Field.Root>
                                <Field.Root>
                                    <Field.Label>Note:</Field.Label>
                                    <Textarea autoresize placeholder="Enter note" name="note" value={formData.note} onChange={handleChange} disabled={isSaving}/>
                                </Field.Root>

                                <Field.Root>
                                    <Field.Label>Tags:</Field.Label>
                                    <HStack spacing={3} align="flex-start">
                                        <EditTransactionTagsModal setTransacData={setFormData} existingTags={formData.tags} selectedTagIds={selectedTagIds} setSelectedTagIds={setSelectedTagIds} addedTags={addedTags} setAddedTags={setAddedTags} removedTags={removedTags} setRemovedTags={setRemovedTags} isDisabled={isSaving || isParentTransaction}/>
                                        <Box borderWidth="1px" p="2" borderRadius="md" flexGrow={1} minH="50px">
                                            {formData.tags.length > 0 ? (<Flex wrap="wrap" gap={1.5}>{formData.tags.map((tag) => (<TagCard key={tag.id} tag={tag} />))}</Flex>) : (<Text fontSize="sm" color="gray.500">No tags.</Text>)}
                                        </Box>
                                    </HStack>
                                    {isParentTransaction && <Field.HelperText>Tags cannot be changed for parent transactions.</Field.HelperText>}
                                </Field.Root>

                                {/* Attach Documents Section */}
                                <VStack spacing={2} align="stretch" pt={2}>
                                    <Heading size="xs" fontWeight="medium" color="fg.muted">Attach Documents</Heading>
                                    <FileUpload.Root 
                                        onFileChange={handleFileUpload} 
                                        maxFiles={1} 
                                        disabled={isUploading || isSaving || !!deletingDocId} // Also disable if any doc is deleting
                                    >
                                        <FileUpload.HiddenInput />
                                        <FileUpload.Trigger asChild>
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                leftIcon={<LuUploadCloud />} 
                                                isLoading={isUploading} 
                                                loadingText="Uploading..." 
                                                disabled={isUploading || isSaving || !!deletingDocId}
                                            >
                                                Add Document
                                            </Button>
                                        </FileUpload.Trigger>
                                    </FileUpload.Root>

                                    {formData.documents && formData.documents.length > 0 ? (
                                        <VStack spacing={1.5} align="stretch" mt={1} borderWidth="1px" borderRadius="md" p={2} maxH="150px" overflowY="auto">
                                            {formData.documents.map(doc => (
                                                <Flex key={doc.id} justify="space-between" align="center" p={1} _hover={{bg: "gray.50"}} borderRadius="sm">
                                                    <HStack spacing={1.5}>
                                                        <LuFileText size="1em" color="gray.500" />
                                                        <Text fontSize="sm" noOfLines={1} title={doc.original_filename} maxWidth="280px">
                                                            {doc.original_filename}
                                                        </Text>
                                                    </HStack>
                                                    <HStack spacing={0.5}>
                                                        <Tooltip.Root content="View">
                                                            <Tooltip.Trigger asChild>
                                                                <IconButton
                                                                    as="a"
                                                                    href={`${BASE_URL}/documents/${doc.id}/view`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    icon={<LuEye />}
                                                                    size="xs"
                                                                    variant="ghost"
                                                                    aria-label="View document"
                                                                    disabled={!!deletingDocId} // Disable if any doc is deleting
                                                                />
                                                            </Tooltip.Trigger>
                                                            <Portal><Tooltip.Positioner><Tooltip.Content>View</Tooltip.Content></Tooltip.Positioner></Portal>
                                                        </Tooltip.Root>
                                                        <Tooltip.Root content="Download">
                                                            <Tooltip.Trigger asChild>
                                                                 <IconButton
                                                                    as="a" 
                                                                    href={`${BASE_URL}/documents/${doc.id}/download`}
                                                                    icon={<LuDownload />}
                                                                    size="xs"
                                                                    variant="ghost"
                                                                    aria-label="Download document"
                                                                    disabled={!!deletingDocId} // Disable if any doc is deleting
                                                                />
                                                            </Tooltip.Trigger>
                                                            <Portal><Tooltip.Positioner><Tooltip.Content>Download</Tooltip.Content></Tooltip.Positioner></Portal>
                                                        </Tooltip.Root>
                                                        <Tooltip.Root content="Delete">
                                                            <Tooltip.Trigger asChild>
                                                                <IconButton 
                                                                    icon={<LuTrash2 />} 
                                                                    size="xs" 
                                                                    variant="ghost" 
                                                                    colorPalette="red" 
                                                                    aria-label="Delete document" 
                                                                    onClick={() => handleDeleteDocument(doc.id)} 
                                                                    isLoading={deletingDocId === doc.id} // Show spinner if this doc is deleting
                                                                    disabled={isUploading || isSaving || (!!deletingDocId && deletingDocId !== doc.id)} // Disable if global op, or another doc is deleting
                                                                />
                                                            </Tooltip.Trigger>
                                                            <Portal><Tooltip.Positioner><Tooltip.Content>Delete</Tooltip.Content></Tooltip.Positioner></Portal>
                                                        </Tooltip.Root>
                                                    </HStack>
                                                </Flex>
                                            ))}
                                        </VStack>
                                    ) : (
                                        <Text fontSize="sm" color="gray.500" mt={1}>No documents attached.</Text>
                                    )}
                                </VStack>
                                {/* End Attach Documents Section */}

                                {saveError && <Text color="red.500" fontSize="sm" mt={2}>{saveError}</Text>}
                            </VStack>
                        </Dialog.Body>

                        <Dialog.Footer gap={3}>
                            <Button variant="outline" onClick={handleClose} disabled={isSaving || isUploading || !!deletingDocId}>Cancel</Button>
                            <Button colorPalette="teal" onClick={handleSave} isLoading={isSaving} loadingText="Saving..." disabled={isSaving || isUploading || !!deletingDocId}>Save Changes</Button>
                        </Dialog.Footer>
                        <Dialog.CloseTrigger asChild position="absolute" top="2" right="2">
                            <CloseButton size="sm" onClick={handleClose} disabled={isSaving || isUploading || !!deletingDocId} />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};