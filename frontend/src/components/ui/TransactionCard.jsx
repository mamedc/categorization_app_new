// TransactionCard.jsx

import { Box, Flex, Text, HStack, Badge, Checkbox, VStack, Spacer } from '@chakra-ui/react'
import { Fragment } from "react";
import TagCard from "./TagCard";


function formatBrazilianCurrency(value) {
    const number = parseFloat(value);
  
    if (isNaN(number)) {
      return "Invalid Number"; // Or handle the error as you see fit
    }
  
    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);
  
    // Remove the currency symbol and add "R$" with a space
    const parts = formattedValue.split(' ');
    if (parts.length === 2) {
      return `- R$ ${parts[1]}`;
    } else {
      return formattedValue; // Fallback in case the format is unexpected
    }
  };


export default function TransactionCard ({ transaction, isSelected, onSelect }) {

    return (
        <Box
            bg="white"
            borderRadius="lg"
            p={4}
            borderLeftWidth={4}
            borderLeftColor={isSelected ? "teal.500" : "#bcdbdb"} // Example: change border color when selected
            //transition="all 0.1s"
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
                        <Fragment key={tag.name}>
                            <TagCard key={tag.id} tag={tag} />
                        </Fragment>
                    ))}
                </Flex>

                {/* Spacer pushes the value to the end in horizontal layouts */}
                <Spacer display={{ base: 'none', md: 'block' }} />

                {/* Right: Value + Flags */}
                <VStack align="end" spacing={1}>
                    <Text
                        fontSize="sm"
                        fontWeight="bold"
                        color={Number(transaction.amount) >= 0 ? 'green.600' : 'red.600'}
                    >
                        {formatBrazilianCurrency(transaction.amount)}
                    </Text>

                    <HStack spacing={2} wrap="wrap" justify="end">
                        {transaction.childrenFlag && (
                            <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                                Child
                            </Badge>
                        )}
                        {transaction.docFlag && (
                            <Badge colorScheme="purple" variant="subtle" fontSize="xs">
                                Doc
                            </Badge>
                        )}
                    </HStack>
                </VStack>
            </Flex>
        </Box>
    );
};