// Navbar.jsx

import { Box, Flex, Text } from "@chakra-ui/react"

// Accept activeView and setActiveView props
function Navbar({ activeView, setActiveView, setTransactions }) {
    return (
        <Box bg="white" px={4} py={2} shadow="sm"> {/* Added subtle shadow */}
            <Flex h="16" alignItems="center" justifyContent="space-between">

                <Flex align="center" gap={6} display={{ base: "none", sm: "flex" }}>
                    {/* Transactions Navigation Item */}
                    <Text
                        fontSize="md"
                        fontWeight={activeView === 'transactions' ? "bold" : "medium"}
                        color={activeView === 'transactions' ? "teal.600" : "gray.700"} // Adjusted colors slightly
                        //borderBottom={activeView === 'transactions' ? "2px solid" : "2px solid"}
                        borderColor={activeView === 'transactions' ? "teal.500" : "transparent"}
                        pb={1}
                        transition="all 0.2s"
                        _hover={{ color: "teal.600", cursor: "pointer", borderColor: "teal.200" }}
                        onClick={() => setActiveView('transactions')}
                    >
                        Transactions
                    </Text>

                    {/* Tags Navigation Item */}
                    <Text
                        fontSize="md"
                        fontWeight={activeView === 'tags' ? "bold" : "medium"}
                        color={activeView === 'tags' ? "teal.600" : "gray.700"} // Adjusted colors slightly
                        //borderBottom={activeView === 'tags' ? "2px solid" : "2px solid"}
                        borderColor={activeView === 'tags' ? "teal.500" : "transparent"}
                        pb={1}
                        transition="all 0.2s"
                        _hover={{ color: "teal.600", cursor: "pointer", borderColor: "teal.200" }}
                        onClick={() => setActiveView('tags')}
                    >
                        Tags
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