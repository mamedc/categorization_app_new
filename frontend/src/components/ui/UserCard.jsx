import { Card, Flex, Avatar, Box, Heading, Text, IconButton } from '@chakra-ui/react'
import { BiTrash } from "react-icons/bi"
import { Toaster, toaster } from "@/components/ui/toaster"
import EditModal from "./EditModal"
import { BASE_URL } from "../../App"

const UserCard = ({ usuario, setUsuarios }) => {
    
    const handleDeleteUser = async () => {
        try {
            console.log("Delete user");
            const res = await fetch(BASE_URL + "/friends/" + usuario.id, {
                method: "DELETE",
            });
            const data = await res.json();
            if(!res.ok) { 
                throw new Error(data.error); 
            };
            setUsuarios((prevUsers) => prevUsers.filter((u) => u.id !== usuario.id));
            toaster.create({
                title: "Success!",
                description: "Friend deleted.",
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
        <Card.Root width="320px">
            <Toaster />
            <Card.Body gap="2">
                <Flex gap={"1"}>
                    
                    <Flex flex={"1"} gap={"4"} alignItems={"center"}> 
                        <Avatar.Root>
                            <Avatar.Fallback name="Sssss" />
                            <Avatar.Image src={usuario.imgUrl} />
                        </Avatar.Root>

                        <Box>
                            <Heading size='sm'>{usuario.name}</Heading>
                            <Text>{usuario.role}</Text>
                        </Box>
                    </Flex>
                
                    <Flex>
                        <EditModal usuario={usuario} setUsuarios={setUsuarios} />

                        <IconButton 
                            variant='ghost' 
                            colorPalette='red' 
                            size='sm' 
                            aria-label="See menu"
                            onClick={handleDeleteUser}
                        >
                            <BiTrash />
                        </IconButton>
                    </Flex>

                </Flex>
            </Card.Body>
            
            <Card.Footer>
                <Text textStyle="sm" fontWeight="light">{usuario.description}</Text>
            </Card.Footer>

        </Card.Root>
    )
}

export default UserCard