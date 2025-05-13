// TagGroupCard.jsx

import { Box, Flex, Text, HStack, Badge, Checkbox, VStack, Spacer, Grid, GridItem } from '@chakra-ui/react'
import TagsGrid from "./TagsGrid";
import { useAtom } from "jotai";
import { selectedTagGroupId, isSelectedTagGroup } from "../../context/atoms";


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
        >

            <Grid
                templateColumns={{
                    base: "auto 1fr", // On small screens, checkbox then everything else
                    // md: "minmax(16px, 16px) minmax(150px, 300px) minmax(300px, 300px) minmax(200px, 200px) minmax(100px, auto)"
                    md: "repeat(20, 1fr)"
                }}
                gap={{ base: 2, md: 4 }} // Spacing between columns
                alignItems="center" // Vertically align items in each cell
                width="100%"
            >

                {/*Checkbox*/}
                <GridItem colSpan={1}>
                    <Flex
                        alignItems="center" // Vertically center the Checkbox.Root within this Flex container
                        justifyContent="center" // Horizontally center (optional, but good for completeness)
                        h="100%" // Make this Flex wrapper take the full height of its grid cell
                        // This Flex becomes the direct child of the Grid, i.e., the grid item.
                    >
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
                    </Flex>
                </GridItem>

                {/* Tag Group Name */}
                <GridItem colSpan={4}>
                    <Text 
                        fontSize="xs" 
                        color="gray.500"
                        fontWeight="medium"
                        maxW={"100px"}
                    >
                        {tGroup.name}
                    </Text>
                    </GridItem> 

                {/* Tag Badges */}
                <GridItem colSpan={15}>
                    <Flex
                        direction={{ base: 'row', md: 'row' }} // Keep as row for tags
                        alignItems="center"
                        gap={1}
                        wrap="wrap" // Allow tags to wrap
                        justifyContent={{ base: 'flex-start', md: 'flex-start' }} // Align tags to the start of their cell
                        gridColumn={{ base: "2 / -1", md: "auto" }} // Span remaining on base, auto on md
                        mt={{base: 2, md: 0}} // Add some margin top on base if description is above
                        h="100%"
                    >
                        <TagsGrid tGroupId={tGroup.id} />
                    </Flex>
                </GridItem>
            </Grid>
        </Box>
    );
};