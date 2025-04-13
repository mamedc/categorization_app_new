// TransactionCard.jsx

import {
    Box,
    Flex,
    Text,
    HStack,
    Badge,
    Checkbox,
    VStack,
    Spacer,
} from '@chakra-ui/react'

const TransactionCard = ({ transaction, setTransactions }) => {

    console.log(transaction)

    return (
        <Box
            bg="white"
            borderRadius="lg"
            p={4}
            borderLeftWidth={4}
            borderLeftColor="#d3e8e8"
            transition="all 0.2s"
            _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
        >
            <Flex
                direction={{ base: 'column', md: 'row' }}
                align={{ base: 'start', md: 'center' }}
                gap={4}
                wrap="wrap"
            >
                {/*Checkbox*/}
                <Checkbox.Root variant="outline" size="sm" colorPalette="cyan" mt={{ base: 1, md: 0 }}>
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                </Checkbox.Root>

                {/* Left: Details */}
                <VStack align="start" spacing={1} flex="1">
                    <HStack spacing={3} wrap="wrap">
                        <Text fontSize="sm" color="gray.500">
                            {transaction.id}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                            {transaction.date}
                        </Text>
                    </HStack>
                    <Text
                        fontSize="md"
                        fontWeight="medium"
                        color="gray.700"
                        noOfLines={2}
                    >
                        {transaction.description}
                    </Text>
                </VStack>

                {/* Spacer pushes the value to the end in horizontal layouts */}
                <Spacer display={{ base: 'none', md: 'block' }} />

                {/* Right: Value + Flags */}
                <VStack align="end" spacing={1}>
                    <Text
                        fontSize="md"
                        fontWeight="bold"
                        color={Number(transaction.value) >= 0 ? 'green.600' : 'red.600'}
                    >
                        R$ {transaction.value}
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
    )
}

export default TransactionCard
