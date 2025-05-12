// .\frontend\src\components\ui\Navbar.jsx

import { Box, Flex, Text } from "@chakra-ui/react"
import Settings from './Settings'; // Import the new Settings component

export default function Navbar({ activeView, setActiveView }) {
    return (
        <Box 
            bg="white"
            px={4}
            py={2}
            position="sticky"
            top={0}
            as="nav"
            zIndex="sticky"
        >

            <Flex h="12" alignItems="center" justifyContent="space-between">

                <Flex align="center" gap={6} display={{ base: "none", sm: "flex" }}>

                    {/* Transactions Navigation Item */}
                    <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color={activeView === 'transactions' ? "teal.600" : "gray.700"} // Adjusted colors slightly
                        borderBottom={activeView === 'transactions' ? "2px solid" : "2px solid"}
                        borderColor={activeView === 'transactions' ? "teal.500" : "transparent"}
                        pb={1}
                        transition="all 0.2s"
                        _hover={{ color: "teal.600", cursor: "pointer", borderColor: "teal.200" }}
                        onClick={() => setActiveView('transactions')}
                        data-cy="nav-transactions"
                    >
                        Transactions
                    </Text>

                    {/* Tags Navigation Item */}
                    <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color={activeView === 'tags' ? "teal.600" : "gray.700"} // Adjusted colors slightly
                        borderBottom={activeView === 'tags' ? "2px solid" : "2px solid"}
                        borderColor={activeView === 'tags' ? "teal.500" : "transparent"}
                        pb={1}
                        transition="all 0.2s"
                        _hover={{ color: "teal.600", cursor: "pointer", borderColor: "teal.200" }}
                        onClick={() => setActiveView('tags')}
                        data-cy="nav-tags"
                    >
                        Tags
                    </Text>
                    {/* Import Transactions Navigation Item */}
                    <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color={activeView === 'import' ? "teal.600" : "gray.700"} // Adjusted colors slightly
                        borderBottom={activeView === 'tags' ? "2px solid" : "2px solid"}
                        borderColor={activeView === 'import' ? "teal.500" : "transparent"}
                        pb={1}
                        transition="all 0.2s"
                        _hover={{ color: "teal.600", cursor: "pointer", borderColor: "teal.200" }}
                        onClick={() => setActiveView('import')}
                        data-cy="nav-import"
                    >
                        Import
                    </Text>
                </Flex>

                {/* Render the Settings component which includes its trigger */}
                <Settings data-cy="nav-settings" />

            </Flex>
        </Box>
    );
};