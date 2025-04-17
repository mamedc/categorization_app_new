// TagGroupCard.jsx

import { Box, Flex, Text, HStack, Badge, Checkbox, VStack, Spacer } from '@chakra-ui/react'
import TagsGrid from "./TagsGrid";


// Receive isSelectedTagGroup and onSelectTagGroup props
export default function TagGroupCard ({ 
    tGroup,
    isSelectedTagGroup,
    onSelectTagGroup,
    //selectedTagId,
    //setSelectedTagId 
}) {

    return (
        <Box
            bg="white"
            borderRadius="lg"
            p={4}
            borderLeftWidth={4}
            // Optionally change style based on selection
            borderLeftColor={isSelectedTagGroup ? "teal.500" : "#bcdbdb"} // Example: change border color when selected
            // transition="all 0.1s"
            // _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
            _hover={{ outline: '1px solid', outlineColor: '#bcdbdb' }}
            // Optionally add more visual feedback for selection
            // boxShadow={isSelectedTagGroup ? 'outline' : 'sm'} // Example: add outline shadow when selected
            outline={isSelectedTagGroup ? '1px solid' : 'none'}
            outlineColor={isSelectedTagGroup ? 'teal.500' : 'transparent'}
        >
            <Flex
                direction={{ base: 'column', md: 'row' }}
                align={{ base: 'start', md: 'center' }}
                gap={4}
                wrap="wrap"
            >
                {/*Checkbox*/}
                {/* Control the checked state and handle changes */}
                <Checkbox.Root
                    variant="outline"
                    size="sm"
                    colorPalette="cyan"
                    mt={{ base: 1, md: 0 }}
                    checked={isSelectedTagGroup} // Set checked based on isSelectedTagGroup prop
                    onCheckedChange={onSelectTagGroup} // Call the onSelectTagGroup handler passed from parent on change
                >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                </Checkbox.Root>

                {/* Left: Details */}
                <VStack align="start" spacing={1} flex="1">
                    <HStack spacing={3} wrap="wrap">
                        <Text fontSize="sm" color="gray.500">
                            {tGroup.id}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                            {tGroup.name}
                        </Text>
                    </HStack>
                    <Text
                        fontSize="md"
                        fontWeight="medium"
                        color="gray.700"
                        noOfLines={2}
                    >
                        QWERT
                    </Text>
                </VStack>

                {/* Spacer pushes the value to the end in horizontal layouts */}
                <Spacer display={{ base: 'none', md: 'block' }} />

                {/* Right: Value + Flags */}
                <VStack align="end" spacing={1}>
                    <TagsGrid 
                        tGroupId={tGroup.id}
                    />
                </VStack>
            </Flex>
        </Box>
    );
};