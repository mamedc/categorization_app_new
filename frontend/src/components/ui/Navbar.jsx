// Navbar.jsx

import { Box, Flex, Text } from "@chakra-ui/react"
//import CreateUserModal from "./CreateUserModal"


function Navbar({ setTransactions }) {
    return (
        <Box px={4} bg={"gray"}>
            <Flex h="16" alignItems={"center"} justifyContent={"space-between"}>

                {/* Left side */}
                <Flex alignItems={"center"} justifyContent={"space-between"} gap={6} display={{base:"none", sm:"flex"}}>
                    {/*{base:"none", sm:"flex"} = smaller screen and above it will be flex but below that is gona be none*/}
                    <Text fontSize={"20px"}>Transactions</Text>
                    <Text fontSize={"20px"}>Categories</Text>
                </Flex>

                {/* Right side */}
                <Flex gap={6} alignItems={"center"}>
                    <Text fontSize={"20px"} fontWeight={500} display={{base: "none", md: "block"}}>
                    {/*{base:"none", md:"block"} = we see the text "BFFship" only for wider screen*/}
                        BFFship
                    </Text>
                </Flex>
            
            </Flex>
        </Box>
        
    )
}

export default Navbar