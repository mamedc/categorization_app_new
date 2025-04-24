// TagGroupCard.jsx

import { Box, Flex, Text, HStack, Badge, Checkbox, VStack, Spacer } from '@chakra-ui/react'
import TagsGrid from "./TagsGrid";

import { useAtom } from "jotai";
import { selectedTagGroupId, isSelectedTagGroup } from "../../context/atoms";


// Receive isSelectedTagGroup and onSelectTagGroup props
export default function TagGroupCard ({ 
    tGroup,
    onSelectTagGroup,
    }) {

    const [isSelected] = useAtom(isSelectedTagGroup);
    const [selectedGroup, _] = useAtom(selectedTagGroupId);

    return (
        <Box
            bg="white"
            borderRadius="lg"
            p={4}
            borderLeftWidth={4}
            borderLeftColor={selectedGroup === tGroup.id ? "teal.500" : "#bcdbdb"} // Example: change border color when selected
            _hover={{ outline: '1px solid', outlineColor: '#bcdbdb' }}
            outline={selectedGroup === tGroup.id ? '1px solid' : 'none'}
            outlineColor={selectedGroup === tGroup.id ? 'teal.500' : 'transparent'}
            // transition="all 0.1s"
            // _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
            // boxShadow={isSelectedTagGroup ? 'outline' : 'sm'} // Example: add outline shadow when selected
        >
            <Flex
                //direction={{ base: 'column', md: 'row' }}
                direction={'row'}
                //align={{ base: 'start', md: 'center' }}
                align={'start'}
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
                    checked={selectedGroup === tGroup.id}
                    onCheckedChange={onSelectTagGroup}
                >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                </Checkbox.Root>

                {/* Left: Details */}
                <VStack align="start" spacing={1} flex="1">
                    <HStack spacing={3} wrap="wrap">
                        <Text fontSize="sm" color="gray.500">{tGroup.id}</Text>
                        <Text fontSize="sm" color="gray.500">{tGroup.name}</Text>
                    </HStack>
                    
                </VStack>

                {/* Spacer pushes the value to the end in horizontal layouts */}
                <Spacer display={{ base: 'none', md: 'block' }} />

                {/* Right: Value + Flags */}
                <VStack align="end" spacing={1}>
                    <TagsGrid tGroupId={tGroup.id} />
                </VStack>
            </Flex>
        </Box>
    );
};