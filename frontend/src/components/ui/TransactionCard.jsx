// ./frontend/src/components/ui/TransactionCard.jsx

import { Box, Flex, Text, HStack, Badge, Checkbox, VStack, Spacer, HoverCard, Portal } from '@chakra-ui/react'
import { Fragment } from "react";
import TagCard from "./TagCard";
import { IoDocumentsOutline } from "react-icons/io5";
import { SlPencil } from "react-icons/sl";
import { useState } from "react"

// Helper function to format number as currency (e.g., BRL)
const formatBrazilianCurrency = (value) => {
    // Value might be a string (e.g., "0.00") or a number
    const number = parseFloat(value);

    if (isNaN(number)) {
      return "Invalid Number"; // Or handle the error as you see fit
    }

    // Always display with 2 decimal places
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
    isParent, // <-- New prop
    isChild   // <-- New prop
}) {

    // Determine the base color based on the amount
    const baseColor = parseFloat(transaction.amount) >= 0 ? 'green.600' : 'red.600';
    // const finalColor = isParent ? `${baseColor}/50` : baseColor; // Apply 50% opacity if it's a parent transaction

    const [hoverOpen, setHoverOpen] = useState(false)

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
            //bg="white"
            bg={isParent ? "#f1eee5" : "white"}
            borderRadius="lg"
            p={4}
            ml={isChild ? 2 : 0}  // Adds left margin
            borderLeftWidth={4}
            borderLeftColor={isSelected ? "teal.500" : (isParent ? "gray.300" : "#bcdbdb")} // Example: gray border for children
            //transition="all 0.1s"
            //opacity={isParent ? 0.75 : 1} // Slightly fade children? Optional.
            //pl={isChild ? 16 : 4} // Indent children slightly? Optional.
            // _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
            _hover={{ outline: '1px solid', outlineColor: '#bcdbdb' }}
            // Optionally add more visual feedback for selection
            // boxShadow={isSelected ? 'outline' : 'sm'} // Example: add outline shadow when selected
            outline={isSelected ? '1px solid' : 'none'}
            outlineColor={isSelected ? 'teal.500' : 'transparent'}

            //maxW={{ base: "100%", md: "100%", xl: "100%" }}
            //mx="auto"
        >
            <Flex
                direction={{ base: 'column', md: 'row' }}
                align={{ base: 'start', md: 'center' }}
                gap={4}
                wrap="wrap"
            >
                {/*Checkbox*/}
                <Checkbox.Root
                    variant="outline"
                    size="sm"
                    colorPalette="cyan"
                    mt={{ base: 1, md: 0 }}
                    checked={isSelected}
                    onCheckedChange={onSelect}
                >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                </Checkbox.Root>

                {/* Left: Details */}
                <VStack align="start" spacing={1} flex="2">
                    <Text
                        fontSize="xs"
                        fontWeight="medium"
                        color="gray.500"
                        opacity={isParent ? 0.5 : 1} // Slightly fade children? Optional.
                        noOfLines={2}
                    >
                        {transaction.description}
                    </Text>
                </VStack>

                {/* Tags */}
                <Spacer display={{ base: 'none', md: 'block' }} />
                <Flex
                    direction={{ base: 'column', md: 'row' }}
                    align="center"
                    gap={1}
                    wrap="wrap"
                    flex="1"
                >
                    {transaction.tags.map((tag) => (
                        <Fragment key={tag.id}> {/* Use tag.id for key */}
                            <TagCard tag={tag} />
                        </Fragment>
                    ))}
                </Flex>

                {/* Right: Flags */}
                <Spacer display={{ base: 'none', md: 'block' }} />
                <HStack align="center" spacing={1}>
                    
                    {/* Parent Badge */}
                    {isParent && (
                        <Badge 
                            colorPalette={"gray"}
                            variant="subtle"
                            fontSize="xs"
                            w={50}
                            h={3}
                            alignItems="center"    // Vertically centers the content
                            justifyContent="center" // Horizontally centers the content
                        >
                            Split
                        </Badge>
                        )}
                    
                    {/* Child Badge */}
                    {isChild && (
                        <Badge 
                            colorPalette="gray"
                            variant="subtle"
                            fontSize="xs"
                            alignItems="center"    // Vertically centers the content
                            justifyContent="center" // Horizontally centers the content
                        >
                            Sub-item
                        </Badge>
                    )}
                    
                    {/* Doc Flag Badge */}
                    {transaction.doc_flag && (
                        <Badge
                            colorPalette="gray"
                            variant="subtle"
                            fontSize="xs"
                            alignItems="center"    // Vertically centers the content
                            justifyContent="center" // Horizontally centers the content
                        >
                            <IoDocumentsOutline />
                        </Badge>
                    )}

                    {/* Note Badge */}
                    {transaction.note && (
                        <HoverCard.Root size="sm">
                            <HoverCard.Trigger asChild>
                                <Badge
                                    colorPalette="gray"
                                    variant="subtle"
                                    fontSize="xs"
                                    alignItems="center"    // Vertically centers the content
                                    justifyContent="center" // Horizontally centers the content
                                >
                                    <SlPencil />
                                </Badge>
                            </HoverCard.Trigger>
                            <Portal>
                                <HoverCard.Positioner>
                                    <HoverCard.Content maxWidth="240px">
                                        <HoverCard.Arrow />
                                        <Box>
                                            {transaction.note}
                                        </Box>
                                    </HoverCard.Content>
                                </HoverCard.Positioner>
                            </Portal>
                        </HoverCard.Root>
                    )}

                </HStack>

                {/* Right: amount */}
                <Spacer display={{ base: 'none', md: 'block' }} />
                <HStack align="end" spacing={1}>
                    <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color={finalColor}
                    >
                        {formatBrazilianCurrency(transaction.amount)}
                    </Text>
                </HStack>
            </Flex>
        </Box>
    );
};