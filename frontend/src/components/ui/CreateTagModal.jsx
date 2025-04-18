// frontend/src/components/ui/CreateTagModal.jsx

import { useState } from "react";
import { BASE_URL } from "../../App"
import { Button, CloseButton, Dialog, Portal, Text, HStack, Stack,Field, Input, ColorPicker } from "@chakra-ui/react";
import { Toaster, toaster } from "@/components/ui/toaster"


function rgbaToHex(rgbaString) {
    const match = rgbaString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return null;
  
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


export default function CreateTagModal ({ 
    groupsData,
    setGroupsData,
    selectedTagGroupId,
    selectedTagId,
    tagGroupData,
    setTagGroupData }) {
    
    const [open, setOpen] = useState(false);
    const initialTagState = {name: '', color: '', tag_group_id: tagGroupData.id};
    const [tagData, setTagData] = useState(initialTagState); // new tag to be created
    const [isSaving, setIsSaving] = useState(false); // State for loading indicator
    const [saveError, setSaveError] = useState(''); // State for potential errors
    const [color, setColor] = useState('')
    
    const handleOpen = () => {
        setOpen(true);
        setTagData(initialTagState);
        setSaveError(''); // Clear any previous error
        console.log('tagGroupData')
        console.log(tagGroupData)
        console.log('tagData')
        console.log(tagData)
        console.log('tagGroupData.id')
        console.log(tagGroupData.id)
    };
    const handleClose = () => {
        setTagData(initialTagState);
        setOpen(false);
    };
    const handleNameChange = (e) => {
        const { name, value } = e.target;
        setTagData({ ...tagData, [name]: value });
        //console.log(tagData)
    };
    const handleSave = async () => { 
        setIsSaving(true); // Start loading
        
        console.log('-----1-------')
        console.log(tagData)
        
        console.log('-----color css-------')
        const color_str = rgbaToHex(color.valueAsString)
        console.log(color_str)
        const dataToSend = { ...tagData, [color]: color_str}; // combine color into payload
        
        console.log('-----color type-------')
        console.log(typeof myVariable); // e.g., "string", "number", "object", etc.

        console.log('-----2-------')
        console.log(dataToSend)

        dataToSend.tag_group_id = tagGroupData.id
        console.log('-----3-------')
        console.log(tagGroupData.id)
        console.log(dataToSend)

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
            setOpen(false); // Close dialog
            
            // setTagGroupData((prevData) => ({
            //     ...prevData,
            //     tags: [...prevData.tags, tagData],
            //   })); 

            //setTagGroupData

            const addNewTagToGroup = (newTag) => {
                setGroupsData(prevGroups =>
                  prevGroups.map(group => {
                    if (group.id === selectedTagGroupId) {
                      return {
                        ...group,
                        tags: [...group.tags, newTag]
                      };
                    }
                    return group;
                  })
                );
            };
            addNewTagToGroup({
                tagData
            });
              
            
            
            
              // Add new tag without new rendering
        
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
                    disabled={selectedTagId}
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
                                
                                {/*Left: Date*/}
                                <Field.Root>
                                    <Field.Label>Tag Name:</Field.Label>
                                    <Input
                                        name="name"
                                        type="text"
                                        onChange={handleNameChange}
                                        disabled={isSaving} // Disable input during saving
                                    />
                                </Field.Root>  

                                {/*Right: color*/}
                                <ColorPicker.Root 
                                    open 
                                    name="color"
                                    onValueChange={(e) => setColor(e)}
                                >
                                    <ColorPicker.HiddenInput />
                                    <ColorPicker.Content animation="none" shadow="none" padding="0">
                                        <ColorPicker.Area />
                                        <HStack>
                                            <ColorPicker.EyeDropper display="none" size="sm" variant="outline" />
                                            <ColorPicker.Sliders />
                                            <ColorPicker.ValueSwatch size="xl" />
                                        </HStack>
                                    </ColorPicker.Content>
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