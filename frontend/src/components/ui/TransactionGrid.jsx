import { VStack, Spinner, Text, Flex } from "@chakra-ui/react"
import TransactionCard from "./TransactionCard"
import { useEffect, useState } from "react"
import { BASE_URL } from "../../App"

const TransactionGrid = ({ transactions, setTransactions }) => {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const getTransactions = async () => {
            try {
                const res = await fetch(BASE_URL + "/transactions")
                const data = await res.json()
                if (!res.ok) throw new Error(data.error)
                setTransactions(data)
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }
        getTransactions()
    }, [setTransactions])

    return (
        <>
            <VStack spacing={4} align="stretch">
                {transactions.map((transaction) => (
                    <TransactionCard key={transaction.id} transaction={transaction} setTransactions={setTransactions} />
                ))}
            </VStack>

            {isLoading && (
                <Flex justify="center" mt={4}>
                    <Spinner size="lg" color="olive.500" />
                </Flex>
            )}

            {!isLoading && transactions.length === 0 && (
                <Flex justify="center" mt={4}>
                    <Text fontSize="sm" color="gray.500">No transactions found</Text>
                </Flex>
            )}
        </>
    )
}

export default TransactionGrid
