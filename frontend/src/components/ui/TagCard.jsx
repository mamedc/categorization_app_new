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
            wrap="wrap"
        >
            <Badge>
                <ColorSwatch value={tag.color} boxSize="0.82em" />
                {tag.name}
            </Badge>

        </Flex>
    );
};