// Navbar.jsx

import { Box, Flex, Text } from "@chakra-ui/react"

function Navbar({ setTransactions }) {
    return (
        <Box bg="#e8e8d3" px={4} py={2}>
            <Flex h="16" alignItems="center" justifyContent="space-between">
                
                <Flex align="center" gap={6} display={{ base: "none", sm: "flex" }}>
                    <Text fontSize="md" fontWeight="medium" color="gray.800" _hover={{ color: "teal.600", cursor: "pointer" }}>
                        Transactions
                    </Text>
                    <Text fontSize="md" fontWeight="medium" color="gray.800" _hover={{ color: "teal.600", cursor: "pointer" }}>
                        Categories
                    </Text>
                </Flex>
                
                <Text fontSize="lg" fontWeight="bold" color="teal.700" display={{ base: "none", md: "block" }}>
                    BFFship
                </Text>
            
            </Flex>
        </Box>
    )
}

export default Navbar