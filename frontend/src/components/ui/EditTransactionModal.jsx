import { Button, Dialog, Field, Input, Portal, Flex, Textarea, CloseButton } from "@chakra-ui/react"
import { Toaster, toaster } from "@/components/ui/toaster"
import { useState } from "react";
import { CiEdit } from "react-icons/ci"
import { BASE_URL } from "../../App"


const EditModal = ({ usuario, setUsuarios }) => {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const initialInputState = {
        name: usuario.name,
        role: usuario.role,
        description: usuario.description,
    };
    const [inputs, setInputs] = useState(initialInputState);
    
    const handleOpen = () => {
        setOpen(true);
        setInputs(initialInputState);
        setIsLoading(false); // Reset when opening
    };
    const handleClose = () => {
        setInputs(initialInputState);
        setOpen(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInputs({ ...inputs, [name]: value });
    };

    const handleEditUser = async (e) => {
        // e.preventDefault();
        
        try {
            console.log(inputs);
            console.log(JSON.stringify(inputs));
            const res = await fetch(BASE_URL + "/friends/" + usuario.id, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", },
                body: JSON.stringify(inputs),
            });
            const data = await res.json();
            if(!res.ok) { 
                throw new Error(data.error);
            };
            setUsuarios((prevUsers) => prevUsers.map((u) => u.id === usuario.id ? data : u)); // Update the user profile
            
            toaster.create({
                title: "Success!",
                description: "Friend edited!",
                type: "success",
                duration: 2000,
                placement: "top-center",
            })

            setOpen(false);
        
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
            setIsLoading(false);
        }
    }
    
    return (
        <>
            {/* initialFocusEl={() => ref.current } */}
            <Dialog.Root lazyMount open={open} onOpenChange={(e) => setOpen(e.open)}>
                <Toaster />
                <Dialog.Trigger asChild>
                    <Button size='sm' variant="ghost" colorPalette='blue' aria-label="See menu" onClick={handleOpen}>
                        <CiEdit />
                    </Button>
                </Dialog.Trigger>
                
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content>
                            
                            <Dialog.Header><Dialog.Title>My new BFF</Dialog.Title></Dialog.Header>
                            
                            <Dialog.Body pb="4">
                                <Flex alignItems={"center"} gap="4">
                                    <Field.Root>
                                        <Field.Label>Full Name</Field.Label>
                                        <Input 
                                            placeholder="First Name" 
                                            name="name"
                                            type="text"
                                            value={inputs.name}
                                            onChange={handleChange}
                                            disabled={isLoading}
                                        />
                                    </Field.Root>                             
                                    <Field.Root>
                                        <Field.Label>Role</Field.Label>
                                        <Input 
                                            placeholder="Focus First" 
                                            name="role"
                                            type="text"
                                            value={inputs.role}
                                            onChange={handleChange}
                                            disabled={isLoading}
                                        />
                                    </Field.Root>                            
                                </Flex>

                                <Field.Root mt={4}>
                                    <Field.Label>Description</Field.Label>
                                    <Textarea
                                        resize={"none"}
                                        overflowY={"hidden"}
                                        placeholder="He's a software engineer who loves to code and build things."
                                        name="description"
                                        value={inputs.description}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                    />
                                </Field.Root>

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
                                
                                <Button
                                    onClick={handleEditUser} 
                                    disabled={isLoading}
                                >
                                    Update
                                </Button>
                            </Dialog.Footer>

                            <Dialog.CloseTrigger asChild>
                                <CloseButton size="sm" onClick={handleClose} disabled={isLoading} />
                            </Dialog.CloseTrigger>

                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>

        </>
    )
}

export default EditModal