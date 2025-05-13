// frontend/src/components/ui/CreateTagModal.jsx

import { useState } from "react";
import { BASE_URL } from "../../App"
import { Button, CloseButton, Dialog, Portal, Text, HStack, Stack,Field, Input, ColorPicker, Box } from "@chakra-ui/react";
import { Toaster, toaster } from "@/components/ui/toaster"
import { useAtom, useSetAtom } from "jotai";
import { ldbTagGroupsAtom, selectedTagGroupId, selectedTagId, refreshTagGroupsAtom } from "../../context/atoms";

function rgbaToHex(rgbaString) {
    if (!rgbaString) return '#000000'; // Default or handle null/undefined input
    const match = rgbaString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return '#000000'; // Return default if regex fails

    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);

    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
};

const swatches = ["red", "green", "blue", "purple", "orange", "pink"];
 


export default function CreateTagModal ({}) {
    
    const [open, setOpen] = useState(false);
    
    const refreshTagGroups = useSetAtom(refreshTagGroupsAtom);
    const [groupsData] = useAtom(ldbTagGroupsAtom);
    const [selectedGroup, setSelectedTagGroupId] = useAtom(selectedTagGroupId);
    const [selectedTag, setSelectedTag] = useAtom(selectedTagId);

    const initialTagState = {name: '', color: '', tag_group_id: selectedTagGroupId};
    const [tagData, setTagData] = useState(initialTagState); // new tag to be created
    
    const [isSaving, setIsSaving] = useState(false); // State for loading indicator
    const [saveError, setSaveError] = useState(''); // State for potential errors
    //const [color, setColor] = useState('')
    
    // const tagGroupData = groupsData.data.find(group => group.id === selectedGroup);
    const getTagGroupData = () => {
        if (groupsData.state === 'hasData' && Array.isArray(groupsData.data)) {
            return groupsData.data.find(group => group.id === selectedGroup);
        }
        return undefined;
    };
    
    const colorGroups = {
        reds: ["#b91c1c", "#dc2626", "#ef4444", "#f87171", "#fca5a5"],
        oranges: ["#c2410c", "#ea580c", "#f97316", "#fb923c", "#fdba74"],
        yellows: ["#ca8a04", "#eab308", "#facc15", "#fde047", "#fef08a"],
        greens: ["#15803d", "#16a34a", "#22c55e", "#4ade80", "#bbf7d0"],
        blues: ["#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"],
        purples: ["#6d28d9", "#7c3aed", "#8b5cf6", "#a78bfa", "#ddd6fe"],
        browns: ["#78350f", "#92400e", "#b45309", "#d97706", "#fcd34d"],
        tealsCyans: ["#0f766e", "#0d9488", "#14b8a6", "#2dd4bf", "#a5f3fc"],
        pinks: ["#be185d", "#db2777", "#ec4899", "#f472b6", "#fbcfe8"],
        grays: ["#374151", "#6b7280", "#9ca3af", "#d1d5db", "#f3f4f6"]
    };

    const handleOpen = () => {
        setOpen(true);
        setTagData(initialTagState);
        setSaveError(''); // Clear any previous error
    };
    const handleClose = () => {
        setTagData(initialTagState);
        //setColor('');
        setOpen(false);
    };
    const handleNameChange = (e) => {
        const { name, value } = e.target;
        setTagData({ ...tagData, [name]: value });
        //console.log(tagData)
    };

    // --- New Color Change Handler ---
    const handleColorChange = (details) => {
        // Assuming details.valueAsString gives an rgba or similar string
        // Or if details.value provides a hex string directly, use that.
        // Let's stick with your rgbaToHex based on original code
        const hexColor = rgbaToHex(details.valueAsString);
        setTagData(prevData => ({ ...prevData, color: hexColor }));
        // console.log("Updated Tag Data with Color:", { ...tagData, color: hexColor }); // For debugging
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
                    //disabled={selectedTagId !== null}
                    disabled={selectedTag !== null}
                >
                    Add
                </Button>
            </Dialog.Trigger>

            <Portal>
                <Toaster />
                <Dialog.Backdrop />
                <Dialog.Positioner>
                <Dialog.Content>
                    <Dialog.Header><Dialog.Title>New Tag</Dialog.Title></Dialog.Header>
                    <Dialog.Body>
                        <Stack direction="column" gap="6">
                            <Stack direction={{ base: "column", md: "row" }} gap="4" width="100%">
                                
                                {/*Left: Name*/}
                                <Field.Root maxW="150px">
                                    <Field.Label>Tag Name:</Field.Label>
                                    <Input
                                        name="name"
                                        type="text"
                                        onChange={handleNameChange}
                                        disabled={isSaving} // Disable input during saving
                                    />
                                </Field.Root>  

                                <ColorPicker.Root alignItems="flex-start" name="color" onValueChange={handleColorChange}>
                                    <ColorPicker.HiddenInput />
                                    {/* <ColorPicker.Label></ColorPicker.Label> */}
                                    <ColorPicker.SwatchGroup>
                                        <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(24px, 1fr))" gap="2" maxW="180px">
                                            {Object.values(colorGroups).flat().map((color) => (
                                                <ColorPicker.SwatchTrigger key={color} value={color}>
                                                <ColorPicker.Swatch value={color}>
                                                    <ColorPicker.SwatchIndicator boxSize="3" bg="white" />
                                                </ColorPicker.Swatch>
                                                </ColorPicker.SwatchTrigger>
                                            ))}
                                        </Box>
                                    </ColorPicker.SwatchGroup>
                                </ColorPicker.Root>
                            
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