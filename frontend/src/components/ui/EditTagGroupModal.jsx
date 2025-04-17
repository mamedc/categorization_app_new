// frontend/src/components/ui/EditTagGroupModal.jsx

import { useState } from "react";
import { BASE_URL } from "../../App"
import { Button, Dialog, Field, ColorSwatch , Portal, Flex, Checkbox, CloseButton, Spinner, VStack, HStack, Text } from "@chakra-ui/react"
import { Toaster, toaster } from "@/components/ui/toaster"


export default function EditTagGroupModal ({ 
    selectedTagGroupId,
    setSelectedTagGroupId
}) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [formData, setFormData] = useState({ name: '', tags: [] });
    const [isSelectedTag, setIsSelectedTag] = useState(false);
    const [selectedTagId, setSelectedTagId] = useState(null);
    
    const handleSelectTag = (tagId) => {
        setSelectedTagId((prevSelectedId) =>
            prevSelectedId === tagId ? null : tagId
        );
    };

    const handleInitialTagGroupState = async () => {
        setIsLoading(true); // Start loading
        try {
            // Load Group infos
            const res = await fetch(BASE_URL + "/tag-groups/" + selectedTagGroupId, { 
                method: "GET",
            });
            const data = await res.json();
            if(!res.ok) { 
                throw new Error(data.error); 
            };
            setLoadError(''); // Clear any previous error
            setOpen(true); // Close dialog
            setSelectedTagGroupId(null);
            setFormData({ 
                name: data.name, 
                //tags: data.tags 
                tags: [...data.tags].sort((a, b) => a.name.localeCompare(b.name)),
            });
        } catch (error) {
            console.error(error);
            toaster.create({
                title: "Load tagGroup: An error occurred.",
                description: error.message,
                status: "error",
                duration: 4000,
                placement: "top-center",
            })
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleOpen = () => {
        setOpen(true);
        setIsSelectedTag(false);
        setSelectedTagId(null);
        handleInitialTagGroupState();
    };
    const handleClose = () => {
        setOpen(false);
        setIsSelectedTag(false);
        setSelectedTagId(null);
        setFormData({ name: '', tags: [] });
        
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
                    disabled={selectedTagGroupId == null}
                >
                    Edit
                </Button>
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content>
                            <Dialog.Header><Dialog.Title>{formData.name} group</Dialog.Title></Dialog.Header>
                            <Dialog.Body pb="4">
                                {isLoading && (
                                    <Flex justify="center" mt={8}>
                                        <Spinner size="lg" color="teal.500" thickness="3px" />
                                    </Flex>
                                )}

                                {!isLoading && formData.tags.length === 0 && (
                                    <Flex justify="center" mt={8} p={6} bg="#f9f9f4" borderRadius="md">
                                        <Text fontSize="sm" color="gray.500">
                                            No tags found.
                                        </Text>
                                    </Flex>
                                )}

                                {!isLoading && formData.tags.length > 0 && (
                                    <VStack spacing={6} align="stretch" > {/* Add spacing between date groups */}
                                        {formData.tags.map((tag) => (
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
                                                    checked={tag.id === selectedTagId}
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
                                <Dialog.ActionTrigger asChild>
                                    <Button 
                                        variant="surface" 
                                        onClick={handleClose} 
                                        disabled={isLoading}
                                    >
                                        Cancel
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