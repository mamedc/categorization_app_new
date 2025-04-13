// TransactionGrid.jsx

import { VStack, Spinner, Text, Flex } from "@chakra-ui/react";
import TransactionCard from "./TransactionCard";
import { useEffect, useState, useMemo } from "react"; // Import useMemo
import { BASE_URL } from "../../App";

const TransactionGrid = ({
    transactions,
    setTransactions,
    selectedTransactionId, 
    setSelectedTransactionId, 
    sortOrder, // Receive sortOrder from props
}) => {
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const getTransactions = async () => {
            try {
                setIsLoading(true); 
                const res = await fetch(BASE_URL + "/transactions");
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                // Ensure fetched data is an array before setting state
                if (Array.isArray(data)) {
                    setTransactions(data);
                } else {
                    console.error("Fetched data is not an array:", data);
                    setTransactions([]); // Set to empty array if data is invalid
                }
                setSelectedTransactionId(null); 
            } catch (error) {
                console.error(error);
                setTransactions([]); // Set to empty array on error
            } finally {
                setIsLoading(false);
            }
        };
        getTransactions();
    }, [setTransactions, setSelectedTransactionId]);

    // Handler function uses the setSelectedTransactionId passed via props
    const handleSelectTransaction = (transactionId) => {
        setSelectedTransactionId((prevSelectedId) =>
            prevSelectedId === transactionId ? null : transactionId
        );
    };

    // Memoize the sorted transactions array
    const sortedTransactions = useMemo(() => {
        // Ensure transactions is an array before attempting to sort
        if (!Array.isArray(transactions)) {
            return [];
        }
        // Create a shallow copy before sorting to avoid mutating the original state
        const sorted = [...transactions].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);

            // Handle potential invalid dates
            const timeA = !isNaN(dateA.getTime()) ? dateA.getTime() : 0;
            const timeB = !isNaN(dateB.getTime()) ? dateB.getTime() : 0;

            if (sortOrder === 'asc') {
                return timeA - timeB; // Ascending order
            } else {
                return timeB - timeA; // Descending order
            }
        });
        return sorted;
    }, [transactions, sortOrder]); // Re-sort only when transactions or sortOrder changes

    return (
        <>
            <VStack spacing={4} align="stretch">
                {/* Map over the memoized sortedTransactions array */}
                {sortedTransactions.map((transaction) => (
                    <TransactionCard
                        key={transaction.id}
                        transaction={transaction}
                        setTransactions={setTransactions} 
                        isSelected={transaction.id === selectedTransactionId}
                        onSelect={() => handleSelectTransaction(transaction.id)}
                    />
                ))}
            </VStack>

            {isLoading && (
                <Flex justify="center" mt={8}>
                    <Spinner size="lg" color="teal.500" thickness="3px" />
                </Flex>
            )}

            {/* Ensure transactions is checked *after* loading is complete */}
            {!isLoading && sortedTransactions.length === 0 && (
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