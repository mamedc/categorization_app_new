// frontend/src/components/ui/EditTagGroupModal.jsx

import { useState, useMemo } from "react"; // Import useMemo
import { BASE_URL } from "../../App"
import { Button, Dialog, Field, ColorSwatch , Portal, Flex, Checkbox, CloseButton, Spinner, VStack, HStack, Text } from "@chakra-ui/react"
import { Toaster, toaster } from "@/components/ui/toaster"
import CreateTagModal from "./CreateTagModal";
import DeleteTagModal from "./DeleteTagModal";
import { useAtom } from "jotai";
import { ldbTagGroupsAtom, selectedTagGroupId, selectedTagId } from "../../context/atoms";


export default function EditTagGroupModal ({}) {
    const [groupsData] = useAtom(ldbTagGroupsAtom);
    const [selectedTag, setSelectedTag] = useAtom(selectedTagId);
    const [selectedGroup, setSelectedTagGroupId] = useAtom(selectedTagGroupId);

    const [open, setOpen] = useState(false);
    
    const handleSelectTag = (tagId) => {
        const newSel = tagId === selectedTag ? null : tagId;
        setSelectedTag(newSel);
    };

    // Derive the selected group data directly from the atom using useMemo
    const selectedGroupData = useMemo(() => {
        if (groupsData.state === 'hasData' && Array.isArray(groupsData.data) && selectedGroup) {
            const group = groupsData.data.find(g => g.id === selectedGroup);
            if (group) {
                // Sort tags immutably when deriving the data
                const sortedTags = [...group.tags].sort((a, b) => a.name.localeCompare(b.name)); // Use localeCompare for strings
                return { ...group, tags: sortedTags };
            }
        }
        return null; // Return null if group not found, or data is loading/error
    }, [groupsData, selectedGroup]); // Recompute only when groupsData or selectedGroup changes

    const handleOpen = () => {
        setOpen(true);
        setSelectedTag(null); // Reset selected tag when opening
        // No need to manually load/set tagGroupData state anymore
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedTag(null); // Reset selected tag on close
        setSelectedTagGroupId(null);
        // No need to reset tagGroupData state
    };

    // Determine loading/error state directly from the atom
    const isLoading = groupsData.state === 'loading';
    const hasError = groupsData.state === 'hasError';
    const noTagsFound = !isLoading && !hasError && (!selectedGroupData || selectedGroupData.tags.length === 0);
    const tagsToShow = selectedGroupData?.tags || []; // Safely access tags

    return (
        <>
            <Dialog.Root lazyMount open={open} onOpenChange={(e) => setOpen(e.open)}>
                <Toaster />
                <Button
                    size="sm"
                    colorPalette="blue"
                    rounded="sm"
                    width={20}
                    onClick={handleOpen}
                    disabled={selectedGroup === null} // Keep disabled if no group is selected initially
                >
                    Edit
                </Button>
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content>
                             {/* Use selectedGroupData safely for the title */}
                            <Dialog.Header><Dialog.Title>{selectedGroupData?.name || 'Edit Group'} group</Dialog.Title></Dialog.Header>
                            <Dialog.Body pb="4">
                                {isLoading && (
                                    <Flex justify="center" mt={8}>
                                        <Spinner size="lg" color="teal.500" thickness="3px" />
                                    </Flex>
                                )}
                                {hasError && (
                                     <Flex justify="center" mt={8} p={6} bg="red.50" borderRadius="md">
                                         <Text fontSize="sm" color="red.700">
                                             Error loading tag group data.
                                         </Text>
                                     </Flex>
                                )}
                                {noTagsFound && !hasError && (
                                    <Flex justify="center" mt={8} p={6} bg="#f9f9f4" borderRadius="md">
                                        <Text fontSize="sm" color="gray.500">
                                           {selectedGroupData ? 'No tags found.' : 'Select a group to edit.'}
                                        </Text>
                                    </Flex>
                                )}

                                {/* Render tags only if loading is done, no error, and group data exists */}
                                {!isLoading && !hasError && selectedGroupData && tagsToShow.length > 0 && (
                                    <VStack spacing={6} align="stretch" >
                                        {tagsToShow.map((tag) => (
                                            <Flex
                                                key={tag.id}
                                                direction={'row'}
                                                align={{ base: 'start', md: 'center' }}
                                                gap={4}
                                                wrap="wrap"
                                            >
                                                {/*Checkbox*/}
                                                <Checkbox.Root
                                                    variant="outline"
                                                    size="sm"
                                                    colorPalette="cyan"
                                                    mt={{ base: 1, md: 0 }}
                                                    checked={tag.id === selectedTag}
                                                    onCheckedChange={() => handleSelectTag(tag.id)}
                                                >
                                                    <Checkbox.HiddenInput />
                                                    <Checkbox.Control />
                                                </Checkbox.Root>

                                                {/* Left: Details */}
                                                <VStack align="start" spacing={1} flex="1">
                                                    <HStack spacing={3} wrap="wrap">
                                                        <Text fontSize="sm" color="gray.500">
                                                            {tag.name}
                                                        </Text>
                                                    </HStack>
                                                </VStack>

                                                {/* Right: Value + Flags */}
                                                <VStack align="end" spacing={1}>
                                                    <ColorSwatch value={tag.color} size="xs" borderRadius="xl" />
                                                </VStack>

                                            </Flex>
                                        ))}
                                    </VStack>
                                )}
                            </Dialog.Body>

                            <Dialog.Footer>
                                
                                <CreateTagModal />

                                <DeleteTagModal />

                                <Dialog.ActionTrigger asChild>
                                    <Button
                                        variant="surface"
                                        onClick={handleClose}
                                        // Disable close if loading to prevent state issues? Optional.
                                        // disabled={isLoading}
                                    >
                                        Close
                                    </Button>
                                </Dialog.ActionTrigger>

                            </Dialog.Footer>

                            <Dialog.CloseTrigger asChild>
                                {/* Disable close if loading? Optional. */}
                                <CloseButton size="sm" onClick={handleClose} /* disabled={isLoading} */ />
                            </Dialog.CloseTrigger>

                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </>
    );
};