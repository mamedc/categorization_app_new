import { Card, Flex, Text, HStack } from '@chakra-ui/react'
import { Toaster } from "@/components/ui/toaster"

const TransactionCard = ({ transaction }) => {
    return (
        <Card.Root bg="olive.50" borderRadius="lg" boxShadow="base">
            <Toaster />
            <Card.Body>
                <Flex direction="column" gap={2}>
                    <HStack spacing={4} wrap="wrap">
                        <Text fontSize="sm" fontWeight="medium" color="olive.800">{transaction.id}</Text>
                        <Text fontSize="sm" color="gray.700">{transaction.date}</Text>
                        <Text fontSize="sm" color="gray.700">{transaction.description}</Text>
                        <Text fontSize="sm" color="green.700">R${transaction.value}</Text>
                        <Text fontSize="xs" color="gray.500">Child: {transaction.childrenFlag ? "Yes" : "No"}</Text>
                        <Text fontSize="xs" color="gray.500">Doc: {transaction.docFlag ? "Yes" : "No"}</Text>
                    </HStack>
                </Flex>
            </Card.Body>
        </Card.Root>
    )
}

export default TransactionCard
