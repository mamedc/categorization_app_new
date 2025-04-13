// TransactionGrid.jsx
// We need to manage the selection state here.

import { VStack, Spinner, Text, Flex } from "@chakra-ui/react"
import TransactionCard from "./TransactionCard"
import { useEffect, useState } from "react"
import { BASE_URL } from "../../App"

const TransactionGrid = ({ transactions, setTransactions }) => {
    const [isLoading, setIsLoading] = useState(true)
    // State to track the ID of the currently selected transaction
    // Initialize with null, meaning no transaction is selected initially.
    const [selectedTransactionId, setSelectedTransactionId] = useState(null)

    useEffect(() => {
        const getTransactions = async () => {
            try {
                setIsLoading(true) // Set loading true at the start of fetch
                const res = await fetch(BASE_URL + "/transactions")
                const data = await res.json()
                if (!res.ok) throw new Error(data.error)
                setTransactions(data)
                setSelectedTransactionId(null); // Reset selection when new data is fetched
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }
        getTransactions()
    }, [setTransactions]) // Dependency array remains the same

    // Handler function to update the selected transaction ID
    const handleSelectTransaction = (transactionId) => {
        // Check if the clicked transaction is the one currently selected
        setSelectedTransactionId(prevSelectedId =>
            // If the previous selected ID is the same as the clicked ID, set to null (deselect)
            // Otherwise, set to the clicked ID (select)
            prevSelectedId === transactionId ? null : transactionId
        );
    }


    return (
        <>
            <VStack spacing={4} align="stretch">
                {/* Pass selection state and handler down to each card */}
                {transactions.map((transaction) => (
                    <TransactionCard
                        key={transaction.id}
                        transaction={transaction}
                        setTransactions={setTransactions} // Keep existing props
                        isSelected={transaction.id === selectedTransactionId} // Check if this card is the selected one
                        onSelect={() => handleSelectTransaction(transaction.id)} // Pass handler to update selection
                    />
                ))}
            </VStack>

            {isLoading && (
                <Flex justify="center" mt={8}>
                    <Spinner size="lg" color="teal.500" thickness="3px" />
                </Flex>
            )}

            {!isLoading && transactions.length === 0 && (
                <Flex justify="center" mt={8} p={6} bg="gray.50" borderRadius="md">
                    <Text fontSize="sm" color="gray.500">No transactions found</Text>
                </Flex>
            )}
        </>
    )
}

export default TransactionGrid