// frontend/src/components/ui/EditTagGroupModal.jsx

import { useState } from "react";
import { BASE_URL } from "../../App"
import { Button, Dialog, Field, ColorSwatch , Portal, Flex, Checkbox, CloseButton, Spinner, VStack, HStack, Text } from "@chakra-ui/react"
import { Toaster, toaster } from "@/components/ui/toaster"
import CreateTagModal from "./CreateTagModal";
import { useAtom } from "jotai";
import { ldbTagGroupsAtom, selectedTagGroupId, selectedTagId } from "../../context/atoms";


export default function EditTagGroupModal ({ 
    //groupsData,
    //setGroupsData,
    //electedTagGroupId,
    //setSelectedTagGroupId
}) {
    const [groupsData] = useAtom(ldbTagGroupsAtom);
    const [selectedTag, setSelectedTag] = useAtom(selectedTagId);
    const [selectedGroup, setSelectedTagGroupId] = useAtom(selectedTagGroupId);

    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [tagGroupData, setTagGroupData] = useState({ name: '', tags: [] });
    const [isSelectedTag, setIsSelectedTag] = useState(false);
    
    const handleSelectTag = (tagId) => {
        const newSel = tagId === selectedTag ? null : tagId;
        setSelectedTag(newSel);
    };

    // Load Tag Group Data
    const handleInitialTagGroupState = async () => {
        if (!Array.isArray(groupsData.data)) return;
        const group = groupsData.data.find(group => group.id === selectedGroup);
        if (!group) return;
        const sortedTags = [...group.tags].sort((a, b) => a.name - b.name); // Sort the tags by their `name`
        const sortedGroup = { // Create a new group object with sorted tags
            ...group,
            tags: sortedTags
        };
        setTagGroupData(sortedGroup);
    };
        
    const handleOpen = () => {
        // console.log('groupsData')
        // console.log(groupsData)
        // console.log('selectedTagGroupId')
        // console.log(selectedTagGroupId)
        setOpen(true);
        handleInitialTagGroupState();
        setIsSelectedTag(false);
        setSelectedTag(null);
    };
    const handleClose = () => {
        setOpen(false);
        setIsSelectedTag(false);
        setSelectedTag(null);
        setTagGroupData({ name: '', tags: [] });
        
    };
   
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
                    disabled={selectedGroup === null}
                >
                    Edit
                </Button>
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content>
                            <Dialog.Header><Dialog.Title>{tagGroupData.name} group</Dialog.Title></Dialog.Header>
                            <Dialog.Body pb="4">
                                {isLoading && (
                                    <Flex justify="center" mt={8}>
                                        <Spinner size="lg" color="teal.500" thickness="3px" />
                                    </Flex>
                                )}

                                {!isLoading && tagGroupData.tags.length === 0 && (
                                    <Flex justify="center" mt={8} p={6} bg="#f9f9f4" borderRadius="md">
                                        <Text fontSize="sm" color="gray.500">
                                            No tags found.
                                        </Text>
                                    </Flex>
                                )}

                                {!isLoading && tagGroupData.tags.length > 0 && (
                                    <VStack spacing={6} align="stretch" > {/* Add spacing between date groups */}
                                        {tagGroupData.tags.map((tag) => (
                                            <Flex
                                                key={tag.id}
                                                direction={'row'}
                                                align={{ base: 'start', md: 'center' }}
                                                gap={4}
                                                wrap="wrap"
                                            >
                                                {/*Checkbox*/}
                                                {/* Control the checked state and handle changes */}
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
                                


                                {/* Add Button */}
                                <CreateTagModal />
                                                                
                                <Dialog.ActionTrigger asChild>
                                    <Button 
                                        variant="surface" 
                                        onClick={handleClose} 
                                        disabled={isLoading}
                                    >
                                        Close
                                    </Button>
                                </Dialog.ActionTrigger>
                                
                            </Dialog.Footer>

                            <Dialog.CloseTrigger asChild>
                                <CloseButton size="sm" onClick={handleClose} disabled={isLoading} />
                            </Dialog.CloseTrigger>

                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>

        </>
    );
};