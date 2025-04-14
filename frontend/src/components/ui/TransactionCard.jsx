// TransactionCard.jsx
// We need to use the passed props to control the Checkbox state.

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

// Receive isSelected and onSelect props
const TransactionCard = ({ transaction, setTransactions, isSelected, onSelect }) => {

    return (
        <Box
            bg="white"
            borderRadius="lg"
            p={4}
            borderLeftWidth={4}
            // Optionally change style based on selection
            borderLeftColor={isSelected ? "teal.500" : "#bcdbdb"} // Example: change border color when selected
            // transition="all 0.1s"
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
                {/* Control the checked state and handle changes */}
                <Checkbox.Root
                    variant="outline"
                    size="sm"
                    colorPalette="cyan"
                    mt={{ base: 1, md: 0 }}
                    checked={isSelected} // Set checked based on isSelected prop
                    onCheckedChange={onSelect} // Call the onSelect handler passed from parent on change
                >
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
                            {new Date(transaction.date).toISOString().split('T')[0]}
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
                        color={Number(transaction.amount) >= 0 ? 'green.600' : 'red.600'}
                    >
                        R$ {transaction.amount}
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