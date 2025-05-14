// ./frontend/src/components/ui/TransactionCard.jsx

import { Box, Flex, Text, HStack, Badge, Checkbox, VStack, Grid, Portal, HoverCard, GridItem, IconButton } from '@chakra-ui/react' // Changed Spacer to Grid
import { Fragment } from "react";
import TagCard from "./TagCard";
import { SlPencil } from "react-icons/sl";
import { TiFlowChildren } from "react-icons/ti";
import { FaChildDress } from "react-icons/fa6";
import { IoIosAttach } from "react-icons/io";
// Removed useState as hoverOpen was not used in the final return for HoverCard logic

// Helper function to format number as currency (e.g., BRL)
const formatBrazilianCurrency = (value) => {
    const number = parseFloat(value);
    if (isNaN(number)) {
      return "Invalid Number";
    }
    return number.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
  };


export default function TransactionCard ({
    transaction,
    isSelected,
    onSelect,
    isParent,
    isChild
}) {

    const baseColor = parseFloat(transaction.amount) >= 0 ? 'green.600' : 'red.600';
    let finalColor;
    if (isParent && parseFloat(transaction.amount) === 0) {
        finalColor = "gray.300";
    } else if (isParent && parseFloat(transaction.amount) !== 0) {
        finalColor = `${baseColor}/50`;
    } else {
        finalColor = baseColor;
    }

    return (
        <Box
            bg={isParent ? "gray.100" : "white"} //#f1eee5
            borderRadius="sm"
            p={4}
            ml={isChild ? 2 : 0}
            borderLeftWidth={4}
            borderLeftColor={isSelected ? "gray.500" : (isParent ? "red.300" : "gray.300")} //"#bcdbdb"
            _hover={{ outline: '1px solid', outlineColor: 'gray.300' }} //#bcdbdb
            outline={isSelected ? '1px solid' : 'none'}
            outlineColor={isSelected ? 'gray.500' : 'transparent'}
        >
            <Grid
                templateColumns={{
                    base: "auto 1fr", // On small screens, checkbox then everything else
                    // md: "minmax(16px, 16px) minmax(150px, 300px) minmax(300px, 300px) minmax(200px, 200px) minmax(100px, auto)"
                    md: "repeat(50, 1fr)"
                }}
                gap={{ base: 2, md: 4 }} // Spacing between columns
                alignItems="center" // Vertically align items in each cell
                width="100%"
            >

                {/* 1. Checkbox */}
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
                            colorPalette="gray"
                            isChecked={isSelected} // Correct prop for Ark UI Checkbox
                            onCheckedChange={onSelect}
                        >
                            <Checkbox.Control />
                            <Checkbox.HiddenInput />
                        </Checkbox.Root>
                    </Flex>
                </GridItem>


                {/* 2. Description */}
                <GridItem colSpan={20}>
                    <Text
                        fontSize="xs"
                        fontWeight="medium"
                        color="gray.500"
                        opacity={isParent ? 0.5 : 1}
                        noOfLines={2}
                        maxW={"400px"}
                        title={transaction.description} // Good for accessibility if text is truncated
                    >
                        {transaction.description}
                    </Text>
                </GridItem>


                {/* 3. Badges */}
                <GridItem colSpan={22}>
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
                        {/* Parent, child, Document, Note */}
                        <Grid
                            templateColumns={{base: "auto 1fr", md: "repeat(12, 1fr)"}}
                            gap={{ base: 2, md: 2 }} // Spacing between columns
                            alignItems="center" // Vertically align items in each cell
                            width="100%"
                        >
                            <GridItem mr={1} colSpan={3}>
                                
                                {/* Is Parent */}
                                {isParent && (
                                    <HoverCard.Root openDelay={200} closeDelay={100} size="sm">
                                        <HoverCard.Trigger asChild>
                                            <IconButton 
                                                size="2xs"
                                                colorPalette="gray"
                                                variant={"ghost"}
                                            >
                                                <TiFlowChildren />
                                            </IconButton>
                                        </HoverCard.Trigger>
                                        <Portal>
                                            <HoverCard.Positioner>
                                                <HoverCard.Content maxWidth="240px">
                                                    <HoverCard.Arrow />
                                                    <Box p={2} fontSize="xs">Split</Box>
                                                </HoverCard.Content>
                                            </HoverCard.Positioner>
                                        </Portal>
                                    </HoverCard.Root>
                                )}
                            
                                {/* Is Child (Split) */}
                                {isChild && (
                                    <HoverCard.Root openDelay={200} closeDelay={100} size="sm">
                                        <HoverCard.Trigger asChild>
                                            <IconButton 
                                                size="2xs"
                                                colorPalette="gray"
                                                variant={"ghost"}
                                            >
                                                <FaChildDress />
                                            </IconButton>
                                        </HoverCard.Trigger>
                                        <Portal>
                                            <HoverCard.Positioner>
                                                <HoverCard.Content maxWidth="240px">
                                                    <HoverCard.Arrow />
                                                    <Box p={2} fontSize="xs">Child</Box>
                                                </HoverCard.Content>
                                            </HoverCard.Positioner>
                                        </Portal>
                                    </HoverCard.Root>
                                )}

                                {/* Document */}
                                {transaction.doc_flag && (
                                    <HoverCard.Root openDelay={200} closeDelay={100} size="sm">
                                        <HoverCard.Trigger asChild>
                                            <IconButton 
                                                size="2xs"
                                                colorPalette="gray"
                                                variant={"ghost"}
                                            >
                                                <IoIosAttach />
                                            </IconButton>
                                        </HoverCard.Trigger>
                                        <Portal>
                                            <HoverCard.Positioner>
                                                <HoverCard.Content maxWidth="240px">
                                                    <HoverCard.Arrow />
                                                    <Box p={2} fontSize="xs">Document</Box>
                                                </HoverCard.Content>
                                            </HoverCard.Positioner>
                                        </Portal>
                                    </HoverCard.Root>
                                )}

                                {/* Note */}
                                {transaction.note && (
                                    <HoverCard.Root openDelay={200} closeDelay={100} size="sm">
                                        <HoverCard.Trigger asChild>
                                            <IconButton 
                                                size="2xs"
                                                colorPalette="gray"
                                                variant={"ghost"}
                                            >
                                                <SlPencil />
                                            </IconButton>
                                        </HoverCard.Trigger>
                                        <Portal>
                                            <HoverCard.Positioner>
                                                <HoverCard.Content maxWidth="240px">
                                                    <HoverCard.Arrow />
                                                    <Box p={2} fontSize="xs">{transaction.note}</Box>
                                                </HoverCard.Content>
                                            </HoverCard.Positioner>
                                        </Portal>
                                    </HoverCard.Root>
                                )}
                            </GridItem>
                        
                            {/* Tags */}
                            <GridItem colSpan={9}>
                                <Flex
                                    direction="row"
                                    alignItems="center"
                                    gap={1}
                                    wrap="wrap" // Allow tags to wrap
                                    justifyContent="flex-start" // Align tags to the start of their cell
                                    //gridColumn={{ base: "2 / -1", md: "auto" }} // Span remaining on base, auto on md
                                    mt={{base: 2, md: 0}} // Add some margin top on base if description is above
                                    h="100%"
                                >
                                {transaction.tags.map((tag) => (
                                    <Fragment key={tag.id}><TagCard tag={tag} /></Fragment>
                                ))}
                                </Flex>
                            </GridItem>
                        
                        </Grid>
                    </Flex>
                </GridItem>

                
                
                {/* 5. Amount */}
                <GridItem colSpan={7}>
                    <HStack
                        justifySelf={{ base: 'flex-start', md: 'flex-end' }} // Align this cell's content to the end on md
                        gridColumn={{ base: "2 / -1", md: "auto" }} // Align with description on base, auto on md
                        mt={{base: 1, md: 0}}
                    >
                        <Text
                            fontSize="xs"
                            fontWeight="bold"
                            color={finalColor}
                        >
                            {formatBrazilianCurrency(transaction.amount)}
                        </Text>
                    </HStack>
                </GridItem>
            </Grid>
        </Box>
    );
};