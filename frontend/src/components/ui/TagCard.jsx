// TagCard.jsx

import { Box, Flex, Text, HStack, Badge, Checkbox, VStack, Spacer, ColorSwatch } from '@chakra-ui/react'


export default function TagGroupCard ({ 
    tag,
    //isSelectedTag,
    //onSelectTag
}) {
    return (
        <Flex
            direction={{ base: 'column', md: 'row' }}
            align={{ base: 'start', md: 'center' }}
            gap={4}
            wrap="wrap"
        >
            
            {/* Left: Details */}
            <VStack align="start" spacing={1} flex="1">
                <HStack spacing={3} wrap="wrap">
                    <Text fontSize="sm" color="gray.500">
                        {tag.name}
                    </Text>
                </HStack>
            </VStack>

            {/* Spacer pushes the value to the end in horizontal layouts */}
            <Spacer display={{ base: 'none', md: 'block' }} />

            {/* Right: Value + Flags */}
            <VStack align="end" spacing={1}>
                <ColorSwatch value={tag.color} size="xs" borderRadius="xl" />
            </VStack>
        </Flex>
    );
};