import { Button, CloseButton, Dialog, Portal, Text, Flex, Stack,Field, Input, RadioGroup, HStack, Textarea } from "@chakra-ui/react";
import { Toaster, toaster } from "@/components/ui/toaster"
import { useState } from "react";
import { BiAddToQueue } from "react-icons/bi"
import { BASE_URL } from "../../App"

const CreateUserModal = ({ setUsers }) => {
    const [open, setOpen] = useState(false);

    const initialFormState = {
        name: '',
        role: '',
        description: '',
        gender: '',
    };
    const gender_items = [{ label: "Male", value: "male" }, { label: "Female", value: "female" },];
    const [formData, setFormData] = useState(initialFormState);

    const [isSaving, setIsSaving] = useState(false); // State for loading indicator
    const [saveError, setSaveError] = useState(''); // State for potential errors
    const [saveStatus, setSaveStatus] = useState(false);
    
    const log_flag = false; // Ligar para ver o log no HTML

    
    const handleOpen = () => {
        setOpen(true);
        setFormData(initialFormState);
        setSaveError(''); // Clear any previous error
        setSaveStatus(false); // Reset when opening
    };
    const handleClose = () => {
        setFormData(initialFormState);
        setOpen(false);
    };
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleRadioChange = (value) => {
        setFormData({ ...formData, gender: value.value });
    };

    const handleSave = async () => { 
        
        setIsSaving(true); // Start loading
        // e.preventDefault();
        // É usado para que a página nao seja recarregada ao submeter um formulário
        // No nosso caso não sei se teria esse comportamento, pois não estamos usando um formulário.
        // Fica no radar para quando precisarmos.

        try {
            // Simulate an asynchronous API call
            // In a real application, you would make an API call here
            // await yourApiService.saveData({ name: nameText });
            const res = await fetch(BASE_URL + "/friends", {
                method: "POST",
                headers: { "Content-Type": "application/json", },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if(!res.ok) { 
                throw new Error(data.error); 
            };
            // await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds

            toaster.create({
                title: "Success!",
                description: "New friend added.",
                type: "success",
                duration: 2000,
                placement: "top-center",
            })
            
            console.log(formData);

            // setFormData(initialFormState);
            // setIsSaving(false); // Stop loading
            // setSaveStatus(true)
            setSaveError(''); // Clear any previous error
            setOpen(false); // Close dialog
            // Ao salvar os dados, atualiza a lista de amigos sem precisar recarregar a página
            // Mantém os usuarios antigos e adiciona o novo
            setUsers((prevUsers) => [...prevUsers, data]);
        
        } catch (error) {
            toaster.create({
                title: "An error occurred.",
                description: error.message,
                type: "error",
                duration: 4000,
                placement: "top-center",
            })
            console.error('Error saving name:', error);
            // setIsSaving(false); // Stop loading even on error
            //setSaveError("Failed to save. Please try again."); // Set error message
            // Optionally, you might want to keep the dialog open to show the error
        
        } finally {
            setIsSaving(false);
            //setFormData(initialFormState);
            setSaveStatus(true)
        }
    }


    return (
        <Dialog.Root lazyMount open={open} onOpenChange={(e) => setOpen(e.open)}>
            
            <Dialog.Trigger asChild>
                <Button variant="outline" size="sm" onClick={handleOpen}>
                    <BiAddToQueue size={20} />
                </Button>
            </Dialog.Trigger>

            <Portal>
                <Toaster />
                <Dialog.Backdrop />
                <Dialog.Positioner>
                <Dialog.Content>
                    <Dialog.Header><Dialog.Title>My New BFF</Dialog.Title></Dialog.Header>
                    <Dialog.Body>
                        {/*<Flex alignItems={"center"} gap="4" direction="column">*/}
                        <Stack direction="column" gap="6">
                            
                            {/*<Flex alignItems={"center"} gap="4" direction="row">*/}
                            <Stack direction={{ base: "column", md: "row" }} gap="4" width="100%">
                                {/*Left: Name*/}
                                <Field.Root>
                                    <Field.Label>Full Name:</Field.Label>
                                    <Input placeholder="Enter full name"
                                        name="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={handleChange}
                                        disabled={isSaving} // Disable input during saving
                                    />
                                </Field.Root>  

                                {/*Right: Role*/}
                                <Field.Root>
                                    <Field.Label>Role:</Field.Label>
                                    <Input placeholder="Enter role"
                                        name="role"
                                        type="text"
                                        value={formData.role}
                                        onChange={handleChange}
                                        disabled={isSaving}
                                    />
                                </Field.Root> 
                            {/*</Flex>*/}
                            </Stack>

                            {/*Description*/}
                            <Field.Root>
                                <Field.Label>Description:</Field.Label>
                                <Textarea 
                                    autoresize 
                                    size="md"
                                    placeholder="Enter description"
                                    resize="none"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    disabled={isSaving}
                                />
                            </Field.Root> 

                            {/*Gender*/}
                            <Field.Root>
                                <Field.Label>Gender:</Field.Label>
                                    <RadioGroup.Root 
                                        mt={4} 
                                        size={"sm"}
                                        name="gender"
                                        value={formData.gender}
                                        onValueChange={handleRadioChange}
                                    >
                                        <HStack gap="4">   
                                            {gender_items.map((item) => (
                                                <RadioGroup.Item key={item.value} value={item.value} disabled={isSaving}>
                                                    <RadioGroup.ItemHiddenInput />
                                                    <RadioGroup.ItemIndicator />
                                                    <RadioGroup.ItemText>{item.label}</RadioGroup.ItemText>
                                                </RadioGroup.Item>
                                            ))}
                                        </HStack>
                                    </RadioGroup.Root>
                            </Field.Root>
                            
                            {/* LOG */}
                            {log_flag && (
                                <div style={{ border: '1px solid red', padding: '10px', backgroundColor: '#191970' }}>
                                    <h1>LOG:</h1>
                                    <p>Open: {open.toString()}</p>
                                    <p>name: {formData.name.toString()}</p>
                                    <p>role: {formData.role.toString()}</p>
                                    <p>description: {formData.description}</p>
                                    <p>gender: {formData.gender.toString()}</p>
                                    <p>isSaving: {isSaving.toString()}</p>
                                    <p>saveError: {saveError.toString()}</p>
                                    <p>saveStatus: {saveStatus.toString()}</p>
                                </div>
                            )}
                        {/*</Flex>*/}
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

export default CreateUserModal