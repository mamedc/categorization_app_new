// TransactionGrid.jsx

import { VStack, Spinner, Text, Flex } from "@chakra-ui/react";
import TransactionCard from "./TransactionCard";
import { useEffect, useState } from "react"; // Keep useState for isLoading
import { BASE_URL } from "../../App";

// Remove TypeScript interface and React.FC type annotation
const TransactionGrid = ({
    transactions,
    setTransactions,
    selectedTransactionId, // Receive from props
    setSelectedTransactionId, // Receive from props
}) => {
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const getTransactions = async () => {
            try {
                setIsLoading(true); // Set loading true at the start of fetch
                const res = await fetch(BASE_URL + "/transactions");
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                setTransactions(data);
                setSelectedTransactionId(null); // Use the passed setter to reset selection
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        getTransactions();
        // Add setSelectedTransactionId to dependency array as it's now an external function
    }, [setTransactions, setSelectedTransactionId]);

    // Handler function uses the setSelectedTransactionId passed via props
    // Remove TypeScript type annotation : string
    const handleSelectTransaction = (transactionId) => {
        setSelectedTransactionId((prevSelectedId) =>
            prevSelectedId === transactionId ? null : transactionId
        );
    };

    return (
        <>
            <VStack spacing={4} align="stretch">
                {/* Pass selection state and handler down to each card */}
                {transactions.map((transaction) => (
                    <TransactionCard
                        key={transaction.id}
                        transaction={transaction}
                        setTransactions={setTransactions} // Keep existing props
                        // Use selectedTransactionId from props to determine if this card is selected
                        isSelected={transaction.id === selectedTransactionId}
                        // Pass the handler which now uses the setter from props
                        onSelect={() => handleSelectTransaction(transaction.id)}
                    />
                ))}
            </VStack>

            {isLoading && (
                <Flex justify="center" mt={8}>
                    <Spinner size="lg" color="teal.500" thickness="3px" />
                </Flex>
            )}

            {!isLoading && transactions.length === 0 && (
                <Flex justify="center" mt={8} p={6} bg="#f9f9f4" borderRadius="md">
                    <Text fontSize="sm" color="gray.500">
                        No transactions found.
                    </Text>
                </Flex>
            )}
        </>
    );
};

export default TransactionGrid;