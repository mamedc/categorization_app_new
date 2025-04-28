// frontend/src/components/ui/EditTransactionTagsModal.jsx

import { useState } from "react";
import { BASE_URL } from "../../App"
import { Button, CloseButton, Dialog, Portal, Text, HStack, Stack, Flex, Spinner, VStack, Box, Checkbox, Spacer, ColorSwatch } from "@chakra-ui/react";
import { Toaster, toaster } from "@/components/ui/toaster"
import { useAtom, useSetAtom } from "jotai";
import { ldbTagGroupsAtom, selectedTagGroupId, selectedTagId, refreshTagGroupsAtom } from "../../context/atoms";


export default function EditTransactionTagsModal ({
    transacData,
    setTransacData,
    existingTags,
}) {
    
    const [open, setOpen] = useState(false);
    const [groupsData] = useAtom(ldbTagGroupsAtom);
    const isLoading = groupsData.state === 'loading'
    
    const refreshTagGroups = useSetAtom(refreshTagGroupsAtom);
    const [selectedGroup, setSelectedTagGroupId] = useAtom(selectedTagGroupId);
    const [selectedTag, setSelectedTag] = useAtom(selectedTagId);

    const initialTagState = {name: '', color: '', tag_group_id: selectedTagGroupId};
    const [tagData, setTagData] = useState(initialTagState); // new tag to be created
    
    const [isSaving, setIsSaving] = useState(false); // State for loading indicator
    const [saveError, setSaveError] = useState(''); // State for potential errors
    
    console.log(existingTags)
    
    const getTagGroupData = () => {
        if (groupsData.state === 'hasData' && Array.isArray(groupsData.data)) {
            return groupsData.data.find(group => group.id === selectedGroup);
        }
        return undefined;
    };
    const handleOpen = () => {
        setOpen(true);
        //setTagData(initialTagState);
        setSaveError(''); // Clear any previous error
    };
    const handleSelectTag = (tagId) => {
        const newSel = tagId === selectedTag ? null : tagId;
        setSelectedTag(newSel);
    };
    const handleClose = () => {
        setTagData(initialTagState);
        //setColor('');
        setOpen(false);
    };
    const handleSave = async () => { 
        setIsSaving(true); // Start loading
        setSaveError(''); // Clear any previous error
        const tagGroupData = getTagGroupData();
        const dataToSend = { ...tagData };
        //const color_str = rgbaToHex(color.valueAsString)
        dataToSend.tag_group_id = tagGroupData.id
        
        try {
            const res = await fetch(BASE_URL + "/tags", {
                method: "POST",
                headers: { "Content-Type": "application/json", },
                body: JSON.stringify(dataToSend),
            });
            const data = await res.json();
            if(!res.ok) { 
                throw new Error(data.error); 
            };
            toaster.create({
                title: "Success!",
                description: "New tag added.",
                type: "success",
                duration: 2000,
                placement: "top-center",
            })
            console.log(dataToSend);
            setSaveError(''); // Clear any previous error
            handleClose();
            refreshTagGroups((prev) => prev + 1); // This triggers a refresh

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
                    size="sm" 
                    colorPalette="cyan" 
                    rounded="sm" 
                    width={20} 
                    onClick={handleOpen}
                    disabled={selectedTag !== null}
                >
                    Edit
                </Button>
            </Dialog.Trigger>

            <Portal>
                <Toaster />
                <Dialog.Backdrop />
                <Dialog.Positioner>
                <Dialog.Content>
                    <Dialog.Header><Dialog.Title>Edit Tag</Dialog.Title></Dialog.Header>
                    <Dialog.Body>
                        <Stack direction="column" gap="6">
                            <Stack gap="4" width="100%">
                                
                                {isLoading && (
                                    <Flex justify="center" mt={8}>
                                        <Spinner size="lg" color="teal.500" thickness="3px" />
                                    </Flex>
                                )}
                    
                                {!isLoading && groupsData.data.length === 0 && (
                                    <Flex justify="center" mt={8} p={6} bg="#f9f9f4" borderRadius="md">
                                        <Text fontSize="sm" color="gray.500">
                                            No transactions found.
                                        </Text>
                                    </Flex>
                                )}
                    
                                {!isLoading && groupsData.data.length > 0 && (
                                    <VStack spacing={6} align="stretch" > {/* Add spacing between date groups */}
                                        {groupsData.data.map((tGroup) => (
                                            <Box
                                                key={tGroup.id}
                                                bg="white"
                                                borderRadius="lg"
                                                p={4}
                                                borderWidth={1} // Use standard border
                                                borderColor="gray.200" 
                                                borderLeftWidth={4}
                                                borderLeftColor={selectedGroup === tGroup.id ? "teal.500" : "#bcdbdb"}
                                                _hover={{ outline: '1px solid', outlineColor: '#bcdbdb' }}
                                                outline={selectedGroup === tGroup.id ? '1px solid' : 'none'}
                                                outlineColor={selectedGroup === tGroup.id ? 'teal.500' : 'transparent'}
                                            >
                                                <Flex
                                                    direction={'row'}
                                                    align={'start'}
                                                    gap={4}
                                                >
                                                    {/* Group Header */}
                                                    <HStack spacing={3} wrap="wrap">
                                                        <Text fontSize="sm" color="gray.500">{tGroup.id}</Text>
                                                        <Text fontSize="sm" color="gray.500">{tGroup.name}</Text>
                                                    </HStack>
                                                    
                                                    {/* Tags within the group */}
                                                    <VStack pl={2} pt={2} spacing={3} align="stretch" width="100%"> {/* Indent tags slightly */}
                                                        {tGroup.tags.map((tag) => {

                                                            // Check if *this specific tag* is already in the existingTags array passed to the modal
                                                            const isAssociated = existingTags?.some(existingTag => existingTag.id === tag.id) ?? false; // Added optional chaining and nullish coalescing for safety

                                                            // Determine if the current tag is the one globally selected for adding
                                                            const isCurrentlySelected = selectedTag === tag.id;
                                                            
                                                            return (
                                                                <Flex
                                                                    key={tag.id}
                                                                    // Removed tag prop, not needed
                                                                    direction={'row'}
                                                                    align={'center'} // Vertically center items in the row
                                                                    gap={3} // Adjust gap
                                                                    wrap="nowrap" // Prevent wrapping within a tag row
                                                                    p={2} // Padding for each tag row
                                                                    borderRadius="md"
                                                                    _hover={{ bg: 'gray.50' }} // Hover effect for tag row
                                                                    bg={isCurrentlySelected ? 'cyan.50' : 'transparent'} // Highlight if selected
                                                                    onClick={() => !isAssociated && handleSelectTag(tag.id)} // Select tag on click if not associated
                                                                    cursor={isAssociated ? 'not-allowed' : 'pointer'} // Change cursor based on state
                                                                >
    
                                                                    {/* Using a Radio button style check if only one can be added, or Checkbox if multiple */}
                                                                    {/* This uses the global `selectedTag`, implying only one selection */}
                                                                    <Checkbox.Root // Or RadioGroup.Item if only one selection allowed
                                                                        variant="outline"
                                                                        size="sm"
                                                                        colorPalette="cyan"
                                                                        // mt={{ base: 1, md: 0 }} // Removed, align center handles it
                                                                        disabled={isAssociated} // Disable if already associated
                                                                        // Use isCurrentlySelected to show the checkmark based on the global state
                                                                        checked={isCurrentlySelected && !isAssociated}
                                                                        // onCheckedChange handles the click via Flex onClick
                                                                        // onClick={(e) => e.stopPropagation()} // Prevent Flex onClick if needed
                                                                        aria-label={`Select tag ${tag.name}`}
                                                                    >
                                                                        <Checkbox.HiddenInput />
                                                                        <Checkbox.Control />
                                                                        {/* Label is implicit via surrounding text or aria-label */}
                                                                    </Checkbox.Root>
    
    
                                                                    {/* Tag Name */}
                                                                    <Text
                                                                        fontSize="sm"
                                                                        color={isAssociated ? "gray.400" : "gray.700"} // Dim if associated
                                                                        flex="1" // Allow text to take available space
                                                                        isTruncated // Prevent long names breaking layout
                                                                    >
                                                                        {tag.name}
                                                                        {isAssociated && <Text as="span" fontSize="xs" color="gray.400"> (Already Added)</Text>}
                                                                    </Text>
    
                                                                    {/* Color Swatch */}
                                                                    <ColorSwatch value={tag.color || '#cccccc'} size="xs" borderRadius="sm" />
    
                                                                </Flex>
                                                            ); // End return
                                                        })}
                                                    </VStack>
                                                </Flex>
                                            </Box>

                                        ))}
                                    </VStack>
                                )}
                            
                            </Stack>
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
            </Portal>
    </Dialog.Root>
    );
};




--- a/frontend/src/components/ui/EditTransactionTagsModal.jsx
+++ b/frontend/src/components/ui/EditTransactionTagsModal.jsx
@@ -155,7 +155,12 @@
 
                                                     {/* Tags within the group */}
                                                     <VStack pl={2} pt={1} spacing={2} align="stretch" width="100%">
-                                                        {tGroup.tags.map((tag) => {
+                                                        {/*
+                                                          Ensure tGroup.tags exists, is an array, and filter out any null/undefined tags
+                                                          before mapping to prevent "Cannot read property 'name' of undefined" error.
+                                                        */}
+                                                        {tGroup.tags && Array.isArray(tGroup.tags) && tGroup.tags
+                                                          .filter(tag => tag != null) // Add this filter
+                                                          .map((tag) => {
                                                             // Check if this tag is currently selected in the modal's state
                                                             const isChecked = selectedTagIds.has(tag.id);
 
@@ -177,7 +182,7 @@
                                                                         checked={isChecked}
                                                                         // Update selection state when checkbox changes
                                                                         onCheckedChange={(e) => handleTagSelectionChange(tag.id, e.checked)}
-                                                                        aria-label={`Select tag ${tag.name}`}
+                                                                        aria-label={`Select tag ${tag.name ?? 'Unnamed Tag'}`} // Defensive fallback
                                                                         disabled={isSaving} // Disable during save
                                                                     >
                                                                         <Checkbox.HiddenInput />
@@ -193,7 +198,7 @@
                                                                         isTruncated
                                                                         cursor="pointer" // Indicate label is clickable
                                                                     >
-                                                                        {tag.name}
+                                                                        {tag.name ?? 'Unnamed Tag'} {/* Defensive fallback */}
                                                                         {/* Removed "(Already Added)" text */}
                                                                     </Text>
 