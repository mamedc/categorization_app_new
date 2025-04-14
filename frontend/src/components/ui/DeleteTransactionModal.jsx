import { Button, CloseButton, Dialog, Portal, Text, Flex, Stack,Field, Input, Icon, RadioGroup, HStack, Textarea } from "@chakra-ui/react";
import { Toaster, toaster } from "@/components/ui/toaster"
import { useState } from "react";
import { BASE_URL } from "../../App"
import { FiAlertTriangle } from 'react-icons/fi';

const DeleteTransactionModal = ({ selectedTransactionId, setTransactions }) => {
    const [open, setOpen] = useState(false);
    // const initialFormState = {
    //     value: '',
    //     date: '',
    //     description: '',
    // };
    //const [formData, setFormData] = useState(initialFormState);
    const [isSaving, setIsSaving] = useState(false); // State for loading indicator
    const [saveError, setSaveError] = useState(''); // State for potential errors
    const [saveStatus, setSaveStatus] = useState(false);
    
    const log_flag = true; // Ligar para ver o log no HTML
    
    const handleOpen = () => {
        setOpen(true);
        //setFormData(initialFormState);
        setSaveError(''); // Clear any previous error
        setSaveStatus(false); // Reset when opening
    };
    const handleClose = () => {
        //setFormData(initialFormState);
        setOpen(false);
    };

    const handleDeleteTransaction = async () => {
        try {
            console.log("Delete transaction?");
            const res = await fetch(BASE_URL + "/transactions/" + selectedTransactionId, {
                method: "DELETE",
            });
            const data = await res.json();
            if(!res.ok) { 
                throw new Error(data.error); 
            };
            setOpen(false); // Close dialog
            //setSelectedTransactionId(null);
            setTransactions((prevTrans) => prevTrans.filter((u) => u.id !== selectedTransactionId));
            toaster.create({
                title: "Success!",
                description: "Transaction deleted.",
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
                    disabled={selectedTransactionId === null}
                >
                    Delete
                </Button>

            </Dialog.Trigger>

            <Portal>
                <Toaster />
                <Dialog.Backdrop />
                <Dialog.Positioner>
                <Dialog.Content>
                    <Dialog.Header>
                        
                    </Dialog.Header>
                    <Dialog.Body>
                        <HStack spacing={6} gap={4} justify="center" w="100%">
                            <Icon as={FiAlertTriangle} color="red.500" boxSize={5} />
                            <Text color="red.500" textAlign="center" fontSize="lg">Delete this transaction?</Text>
                        </HStack>
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
                            onClick={handleDeleteTransaction} 
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
            </Portal>
    </Dialog.Root>
    );
};

export default DeleteTransactionModal