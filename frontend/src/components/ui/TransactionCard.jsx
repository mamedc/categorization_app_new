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
            <Flex direction="column" gap={3}>
                <Flex justify="space-between" align="center">
                    <HStack spacing={3}>
                        
                        <Checkbox.Root variant="outline" size="sm" colorPalette="cyan">
                            <Checkbox.HiddenInput />
                            <Checkbox.Control />
                            <Checkbox.Label>Accept terms and conditions</Checkbox.Label>
                        </Checkbox.Root>



                        <Text fontSize="md" fontWeight="medium" color="gray.700">
                            {transaction.description}
                        </Text>
                    </HStack>
                    <Text 
                        fontSize="md" 
                        fontWeight="bold" 
                        color={Number(transaction.value) >= 0 ? "green.600" : "red.600"}
                    >
                        R$ {transaction.value}
                    </Text>
                </Flex>
                
                <HStack spacing={4} wrap="wrap">
                    <Text fontSize="sm" color="gray.500">ID: {transaction.id}</Text>
                    <Text fontSize="sm" color="gray.500">{transaction.date}</Text>
                    
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
