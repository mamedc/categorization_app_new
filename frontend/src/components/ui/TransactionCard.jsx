// TransactionCard.jsx

import { Box, Flex, Text, HStack, Badge } from '@chakra-ui/react'

const TransactionCard = ({ transaction, setTransactions }) => {
    return (
        <Box 
            bg="white" 
            borderRadius="lg" 
            boxShadow="sm" 
            p={4} 
            borderLeft="4px solid" 
            borderLeftColor="teal.400"
            transition="all 0.2s"
            _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
        >
            <Flex direction="column" gap={3}>
                <Flex justify="space-between" align="center">
                    <Text fontSize="md" fontWeight="medium" color="gray.700">
                        {transaction.description}
                    </Text>
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