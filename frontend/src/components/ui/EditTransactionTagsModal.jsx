// frontend/src/components/ui/EditTransactionTagsModal.jsx

import { useState, useEffect } from "react"; // Added useEffect
import { BASE_URL } from "../../App"
import { Button, CloseButton, Dialog, Portal, Text, HStack, Stack, Flex, Spinner, VStack, Box, Checkbox, IconButton, ColorSwatch } from "@chakra-ui/react";
import { Toaster, toaster } from "@/components/ui/toaster"
import { useAtom, useSetAtom } from "jotai";
import { CiEdit } from "react-icons/ci";
import { ldbTagGroupsAtom, selectedTagGroupId, refreshTagGroupsAtom } from "../../context/atoms";


export default function EditTransactionTagsModal ({
    setTransacData,   // Function to update the transaction object in parent state
    existingTags,     // Array of tag objects currently associated: [{id, name, color, ...}, ...]
    selectedTagIds,
    setSelectedTagIds,
    addedTags,
    setAddedTags,
    removedTags,
    setRemovedTags,
    isDisabled
}) {

    const [open, setOpen] = useState(false);
    const [groupsData] = useAtom(ldbTagGroupsAtom);
    const isLoading = groupsData.state === 'loading';

    const refreshTagGroups = useSetAtom(refreshTagGroupsAtom);
    // selectedGroup might still be useful for UI highlighting, keeping it for now
    const [selectedGroup, setSelectedTagGroupId] = useAtom(selectedTagGroupId);

    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    // Helper function to get all tag objects from the groupsData structure
    const getAllTagsFromGroups = (groups) => {
        if (!groups || groups.state !== 'hasData' || !Array.isArray(groups.data)) {
            return [];
        }
        return groups.data.flatMap(group => group.tags);
    };

    const handleOpen = () => {
        // Initialize the selection based on the tags already associated with the transaction
        const initialIds = new Set(existingTags?.map(tag => tag.id) ?? []);
        setSelectedTagIds(initialIds);
        setOpen(true);
        setSaveError(''); // Clear any previous error
    };

    const handleClose = () => {
        setOpen(false);
        //console.log('transacData')
        //console.log(transacData)
        // No need to reset selectedTagIds here, handleOpen will re-initialize on next open
    };

    const handleTagSelectionChange = (tagId, isChecked) => {

        // 1. Update the overall set of currently selected tags
        setSelectedTagIds(prevIds => {
            const newIds = new Set(prevIds); // Create a mutable copy
            if (isChecked) {
                newIds.add(tagId);
            } else {
                newIds.delete(tagId);
            }
            return newIds; // Return the new Set to update state
        });
    
        // 2. Update the lists tracking added and removed tags during the session
        if (isChecked) {
            // --- Handle ADDING a tag ---
            
            // Remove from 'removedTags' first (if it was previously removed)
            setRemovedTags(prevRemovedTags =>
                prevRemovedTags.filter(id => id !== tagId)
            );
            
            // Add to 'addedTags' (avoiding duplicates)
            if (!removedTags.includes(tagId)) {
                setAddedTags(prevAddedTags => {
                    if (prevAddedTags.includes(tagId)) {
                        return prevAddedTags; // Already marked as added
                    }
                    return [...prevAddedTags, tagId]; // Add the new tag ID
                });
            };
    
        } else {
            // --- Handle REMOVING a tag ---
            
            // Add to 'removedTags' (avoiding duplicates)
            if (!addedTags.includes(tagId)) {
                setRemovedTags(prevRemovedTags => {
                
                    if (prevRemovedTags.includes(tagId)) {
                        return prevRemovedTags; // Already marked as removed
                    }
                    return [...prevRemovedTags, tagId]; // Add the new tag ID
                });
            };

            // Remove from 'addedTags' first (if it was previously added)
            setAddedTags(prevAddedTags =>
                prevAddedTags.filter(id => id !== tagId)
            );
            
        }
    };
    
    
    const handleUpdateParent = async () => {
        setIsSaving(true);
        setSaveError('');
        const finalTagIds = Array.from(selectedTagIds);

        try {
            // --- Update Parent State ---

            // Get all groups data
            const allGroups = groupsData.data ?? [];

            // Map the selected tag IDs back to full tag objects *including* the nested group info
            const updatedFullTags = finalTagIds.map(selectedId => {
                let foundTag = null;
                let foundGroup = null;

                // Find the tag and its group within the groupsData structure
                for (const group of allGroups) {
                    // Make sure group.tags exists and is an array before searching
                    const tag = group.tags?.find(t => t?.id === selectedId);
                    if (tag) {
                        foundTag = tag;
                        foundGroup = group;
                        break; // Found the tag, no need to search other groups
                    }
                }

                if (foundTag && foundGroup) {
                    // Construct the tag object with the nested group info as expected by EditTransactionModal
                    return {
                        ...foundTag, // Include all original tag properties (id, name, color, etc.)
                        tag_group: {
                            id: foundGroup.id,
                            name: foundGroup.name
                            // Include other group properties if EditTransactionModal needs them
                        }
                    };
                }
                // If a selected ID doesn't correspond to a found tag (shouldn't normally happen), return null
                console.warn(`Could not find full tag data for selected ID: ${selectedId}`);
                return null;
            }).filter(tag => tag !== null); // Filter out any nulls just in case

            // Update the transacData in the parent component's state with the correctly structured tags
            setTransacData(prevTransac => ({
                ...prevTransac,
                tags: updatedFullTags, // Use the newly constructed array
            }));

            handleClose();

        } catch (error) {
            console.error('Error saving transaction tags:', error);
            setSaveError(error.message);
             toaster.create({
                title: "An error occurred.",
                description: error.message,
                type: "error",
                duration: 4000,
                placement: "top-center",
            })
        } finally {
            setIsSaving(false);
        }
    };

    // Render Logic
    return (
        <Dialog.Root lazyMount open={open} onOpenChange={(e) => setOpen(e.open)}>
            <Dialog.Trigger asChild>

                <IconButton 
                    size="xs"
                    colorPalette="cyan"
                    variant={"ghost"}
                    onClick={handleOpen}
                    disabled={isDisabled}
                >
                    <CiEdit />
                </IconButton>

            </Dialog.Trigger>

            <Portal>
                <Toaster />
                <Dialog.Backdrop />
                <Dialog.Positioner>
                <Dialog.Content>
                    <Dialog.Header><Dialog.Title>Edit Transaction Tags</Dialog.Title></Dialog.Header>
                    <Dialog.Body>
                        <Stack direction="column" gap="6">
                            <Stack gap="4" width="100%">

                                {isLoading && (
                                    <Flex justify="center" mt={8}><Spinner size="lg" color="teal.500" thickness="3px" /></Flex>
                                )}

                                {!isLoading && (!groupsData.data || groupsData.data.length === 0) && (
                                    <Flex justify="center" mt={8} p={6} bg="#f9f9f4" borderRadius="md">
                                        <Text fontSize="sm" color="gray.500">No tags found.</Text>
                                    </Flex>
                                )}

                                {!isLoading && groupsData.data && groupsData.data.length > 0 && (
                                    <VStack spacing={6} align="stretch" maxHeight="400px" overflowY="auto" pr={2}> {/* Added scroll */}
                                        {groupsData.data.map((tGroup) => (
                                            <Box
                                                key={tGroup.id}
                                                bg="white"
                                                borderRadius="lg"
                                                p={4}
                                                borderWidth={1}
                                                borderColor="gray.200"
                                            >
                                                <Flex direction={'row'} align={'start'} gap={0}>
                                                    {/* Group Header */}
                                                    <HStack spacing={3} wrap="wrap" minWidth="100px"> {/* Ensure group name doesn't squash */}
                                                        <Text fontSize="xs" fontWeight="medium" color="gray.600">{tGroup.name}</Text>
                                                    </HStack>

                                                    {/* Tags within the group */}
                                                    <VStack pl={2} pt={1} spacing={2} align="stretch" width="100%">
                                                        {tGroup.tags && Array.isArray(tGroup.tags) && tGroup.tags
                                                            .filter(tag => tag != null) // Add this filter
                                                            .map((tag) => {
                                                            
                                                            // Check if this tag is currently selected in the modal's state
                                                            const isChecked = selectedTagIds.has(tag.id);

                                                            return (
                                                                <Flex
                                                                    key={tag.id}
                                                                    direction={'row'}
                                                                    align={'center'}
                                                                    gap={2}
                                                                    wrap="nowrap"
                                                                    p={0} // Reduced padding a bit
                                                                    borderRadius="md"
                                                                    // Removed hover effects and background tied to single selection
                                                                    // Removed onClick from Flex - handled by Checkbox now
                                                                >
                                                                    {/* Checkbox controlled by modal's selection state */}
                                                                    <Checkbox.Root
                                                                        variant="outline"
                                                                        size="sm"
                                                                        colorPalette="cyan"
                                                                        id={`tag-checkbox-${tag.id}`} // Added id for label association
                                                                        checked={isChecked}
                                                                        onCheckedChange={(e) => handleTagSelectionChange(tag.id, e.checked)}
                                                                        aria-label={`Select tag ${tag.name ?? 'Unnamed Tag'}`} // Defensive fallback
                                                                        disabled={isSaving} // Disable during save
                                                                    >
                                                                        <Checkbox.HiddenInput />
                                                                        <Checkbox.Control />
                                                                    </Checkbox.Root>

                                                                    {/* Tag Name - Use label for accessibility */}
                                                                    <Text
                                                                        as="label" // Associate label with checkbox
                                                                        htmlFor={`tag-checkbox-${tag.id}`} // Match checkbox id
                                                                        fontSize="xs"
                                                                        color="gray.700" // Normal color
                                                                        flex="1"
                                                                        isTruncated
                                                                        cursor="pointer" // Indicate label is clickable
                                                                    >
                                                                        {tag.name ?? 'Unnamed Tag'} {/* Defensive fallback */}
                                                                    </Text>

                                                                    {/* Color Swatch */}
                                                                    <ColorSwatch value={tag.color || '#cccccc'} size="xs" borderRadius="lg"/>
                                                                </Flex>
                                                            ); // End return tag
                                                        })}
                                                    </VStack>
                                                </Flex>
                                            </Box>
                                        ))}
                                    </VStack>
                                )}
                            </Stack>
                            {saveError && <Text color="red.500" fontSize="sm" mt={2}>{saveError}</Text>}
                        </Stack>
                    </Dialog.Body>

                    {/* Footer Buttons */}
                    <Dialog.Footer>
                        <Button
                            size="xs"
                            variant="outline" // Changed variant
                            onClick={handleClose}
                            disabled={isSaving}
                            size="sm" // Standardized size
                        >
                            Cancel
                        </Button>
                        <Button
                            size="xs"
                            onClick={handleUpdateParent}
                            isLoading={isSaving} // Use isLoading prop
                            loadingText="Saving..."
                            colorPalette="cyan" // Consistent palette
                            size="sm" // Standardized size
                        >
                            Ok {/* More specific text */}
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