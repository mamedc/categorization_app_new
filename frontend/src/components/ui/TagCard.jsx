// TagCard.jsx

import { Box, Flex, Text, HStack, Badge, Checkbox, VStack, Spacer, ColorSwatch } from '@chakra-ui/react'


export default function TagCard ({ 
    tag,
}) {
    return (
        <Flex
            direction={'row'}
            align={{ base: 'start', md: 'center' }}
            gap={4}
        >
            <Badge 
                variant="solid" 
                size="xs"
                bg={tag.color}
                w={50}
                h={3}
                alignItems="center"    // Vertically centers the content
                justifyContent="center" // Horizontally centers the content
            >
                {tag.name}
            </Badge>
        </Flex>
    );
};