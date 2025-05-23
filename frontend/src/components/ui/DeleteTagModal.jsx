// DeleteTagModal.jsx

import { useState } from "react";
import { BASE_URL } from "../../App"
import { Button, CloseButton, Dialog, Portal, Text, Flex, Stack,Field, Input, Icon, RadioGroup, HStack, Textarea, Theme } from "@chakra-ui/react";
import { Toaster, toaster } from "@/components/ui/toaster"
import { FiAlertTriangle } from 'react-icons/fi';
import { useAtom, useSetAtom } from "jotai";
import { ldbTagGroupsAtom, selectedTagGroupId, selectedTagId, refreshTagGroupsAtom } from "../../context/atoms";


export default function DeleteTagModal ({ 
}) {

    const refreshTagGroups = useSetAtom(refreshTagGroupsAtom);
    const [selectedGroup, setSelectedTagGroupId] = useAtom(selectedTagGroupId);
    const [open, setOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false); // State for loading indicator
    const [saveError, setSaveError] = useState(''); // State for potential errors

    const [groupsData] = useAtom(ldbTagGroupsAtom);
    const [selectedTag, setSelectedTag] = useAtom(selectedTagId);
        
    const handleOpen = () => {
        setOpen(true);
        setSaveError(''); // Clear any previous error
    };
    const handleClose = () => {
        setOpen(false);
    };

    const handleDeleteTag = async () => {
        setIsSaving(true); // Start loading
        try {
            console.log("Delete Tag?");
            const res = await fetch(BASE_URL + "/tags/" + selectedTag, { 
                method: "DELETE",
            });
            const data = await res.json();
            if(!res.ok) { 
                throw new Error(data.error); 
            };
            setSaveError(''); // Clear any previous error
            setOpen(false); // Close dialog
            setSelectedTag(null);
            refreshTagGroups((prev) => prev + 1); // This triggers a refresh
            toaster.create({
                title: "Success!",
                description: "Tag Group deleted.",
                type: "success",
                duration: 2000,
                placement: "top-center",
            })
        } catch (error) {
            console.error(error);
            toaster.create({
                title: "An error occurred.",
                description: error.message,
                status: "error",
                duration: 4000,
                placement: "top-center",
            })
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog.Root lazyMount open={open} onOpenChange={(e) => setOpen(e.open)}>
            
            <Dialog.Trigger asChild>
                <Button 
                    size="sm" 
                    colorPalette="red" 
                    rounded="sm" 
                    width={20} 
                    onClick={handleOpen}
                    disabled={selectedTag === null}
                >
                    Delete
                </Button>

            </Dialog.Trigger>

            <Portal>
            <Theme appearance="light">
                <Toaster />
                <Dialog.Backdrop />
                <Dialog.Positioner>
                <Dialog.Content>
                    <Dialog.Header>
                        
                    </Dialog.Header>
                    <Dialog.Body>
                        <HStack spacing={6} gap={4} justify="center" w="100%">
                            <Icon as={FiAlertTriangle} color="red.500" boxSize={5} />
                            <Text color="red.500" textAlign="center" fontSize="lg">Delete this tag?</Text>
                            <Text color="red.500" textAlign="center" fontSize="lg">O que acontece com as transações com esses tags?</Text>
                        </HStack>
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
                            onClick={handleDeleteTag} 
                            disabled={isSaving}
                            colorPalette="red"
                        >
                            Delete
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