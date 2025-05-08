// File path: frontend/src/components/ui/TransactionCard.jsx
// TransactionCard.jsx

import { Box, Flex, Text, HStack, Badge, Checkbox, VStack, Spacer } from '@chakra-ui/react'
import { Fragment } from "react";
import TagCard from "./TagCard";

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
    // Apply 50% opacity if it's a parent transaction
    const finalColor = isParent ? `${baseColor}/50` : baseColor;

    return (
        <Box
            bg="white"
            bg={isParent ? "#f1eee5" : "white"}
            borderRadius="lg"
            p={4}
            borderLeftWidth={4}
            borderLeftColor={isSelected ? "teal.500" : (isParent ? "gray.300" : "#bcdbdb")} // Example: gray border for children
            //transition="all 0.1s"
            //opacity={isParent ? 0.75 : 1} // Slightly fade children? Optional.
            // pl={isChild ? 6 : 4} // Indent children slightly? Optional.
            // _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
            _hover={{ outline: '1px solid', outlineColor: '#bcdbdb' }}
            // Optionally add more visual feedback for selection
            // boxShadow={isSelected ? 'outline' : 'sm'} // Example: add outline shadow when selected
            outline={isSelected ? '1px solid' : 'none'}
            outlineColor={isSelected ? 'teal.500' : 'transparent'}
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
                        fontSize="sm"
                        fontWeight="medium"
                        color="gray.700"
                        opacity={isParent ? 0.5 : 1} // Slightly fade children? Optional.
                        noOfLines={2}
                    >
                        {transaction.description}
                    </Text>
                </VStack>

                {/* Tags */}
                <Flex
                    direction={{ base: 'column', md: 'row' }}
                    align="start"
                    gap={2}
                    wrap="wrap"
                    flex="3"
                >
                    {transaction.tags.map((tag) => (
                        <Fragment key={tag.id}> {/* Use tag.id for key */}
                            <TagCard tag={tag} />
                        </Fragment>
                    ))}
                </Flex>

                {/* Spacer pushes the value to the end in horizontal layouts */}
                <Spacer display={{ base: 'none', md: 'block' }} />

                {/* Right: Value + Flags */}
                <HStack align="end" spacing={1}>
                    
                    {/* --- Badges Section --- */}
                    <HStack spacing={2} wrap="wrap" justify="end">
                        {/* Parent Badge */}
                        {isParent && (
                            <Badge colorScheme="purple" variant="outline" fontSize="xs">
                                Split
                            </Badge>
                        )}
                        {/* Child Badge */}
                        {isChild && (
                            <Badge colorScheme="gray" variant="outline" fontSize="xs">
                                Sub-item
                            </Badge>
                        )}
                        {/* Existing Doc Flag Badge */}
                        {transaction.doc_flag && (
                            <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                                Doc
                            </Badge>
                        )}
                        {/* Remove the old childrenFlag badge if it existed */}
                        {/* {transaction.childrenFlag && ( ... )} */}
                    </HStack>
                    {/* --- End Badges Section --- */}

                    <Text
                        fontSize="sm"
                        fontWeight="bold"
                        // Use parseFloat for comparison as amount might be string "0.00"
                        //color={parseFloat(transaction.amount) >= 0 ? 'green.600' : 'red.600'}
                        color={finalColor}
                    >
                        {formatBrazilianCurrency(transaction.amount)}
                    </Text>
                    
                </HStack>
            </Flex>
        </Box>
    );
};