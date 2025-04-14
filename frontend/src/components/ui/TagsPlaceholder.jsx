// src/components/ui/TagsPlaceholder.jsx

import { Box, Center, Text } from "@chakra-ui/react";

/**
 * Placeholder component for the Tags screen.
 */
function TagsPlaceholder() {
    return (
        <Center h="calc(100vh - 160px)"> {/* Adjust height based on Navbar and padding */}
            <Box
                p={8}
                borderWidth="1px"
                borderRadius="lg"
                bg="white"
                shadow="base"
                textAlign="center"
            >
                <Text fontSize="xl" color="gray.600" fontWeight="medium">
                    🏷️ Tags Screen Coming Soon!
                </Text>
                <Text mt={2} color="gray.500" fontSize="md">
                    This section will allow managing transaction tags.
                </Text>
            </Box>
        </Center>
    );
}

export default TagsPlaceholder;