// Navbar.jsx

import { Box, Flex, Text } from "@chakra-ui/react"

function Navbar({ setTransactions }) {
    return (
        <Box bg="olive.100" px={4} py={2} boxShadow="sm">
            <Flex h="16" alignItems="center" justifyContent="space-between">
                <Flex align="center" gap={6} display={{ base: "none", sm: "flex" }}>
                    <Text fontSize="md" fontWeight="medium" color="gray.800">Transactions</Text>
                    <Text fontSize="md" fontWeight="medium" color="gray.800">Categories</Text>
                </Flex>
                <Text fontSize="md" fontWeight="bold" color="olive.700" display={{ base: "none", md: "block" }}>
                    BFFship
                </Text>
            </Flex>
        </Box>
    )
}

export default Navbar
