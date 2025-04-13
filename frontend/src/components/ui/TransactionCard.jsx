// TransactionCard.jsx

import { Box, Flex, Text, HStack, Badge, Checkbox } from '@chakra-ui/react'

const TransactionCard = ({ transaction, setTransactions }) => {
    return (
        <Box 
            bg="white" 
            borderRadius="lg" 
            p={4} 
            borderLeft="4px solid" 
            borderLeftColor="#d3e8e8"
            transition="all 0.2s"
            _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
        >
            <Flex direction="row" gap={4} align="center">

                {/*Checkbox*/}
                <Checkbox.Root variant="outline" size="sm" colorPalette="cyan">
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                </Checkbox.Root>
                
                {/*ID*/}
                <Text fontSize="sm" color="gray.500">{transaction.id}</Text>
                
                {/*Date*/}
                <Text fontSize="sm" color="gray.500">{transaction.date}</Text>

                {/*Description*/}
                <Text fontSize="md" fontWeight="medium" color="gray.700">{transaction.description}</Text>

                {/*Value*/}
                <Text 
                    fontSize="md" 
                    fontWeight="bold" 
                    color={Number(transaction.value) >= 0 ? "green.600" : "red.600"}
                >
                    R$ {transaction.value}
                </Text>
                               
                {/*Flags*/}
                <HStack gap={4} wrap="wrap">
                    <HStack spacing={2}>
                        {transaction.childrenFlag && (
                            <Badge colorScheme="blue" variant="subtle" fontSize="xs">Child</Badge>
                        )}
                        {transaction.docFlag && (
                            <Badge colorScheme="purple" variant="subtle" fontSize="xs">Doc</Badge>
                        )}
                    </HStack>
                </HStack>

            </Flex>
        </Box>
    )
}

export default TransactionCard
