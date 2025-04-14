// TagsGroupsGrid.jsx

import { VStack, Spinner, Text, Flex, StackSeparator } from "@chakra-ui/react";
import TransactionCard from "./TransactionCard";
import { useEffect, useState, useMemo, Fragment } from "react"; // Added Fragment
import { BASE_URL } from "../../App";

// Helper function to format date string into a user-friendly format
const formatDateHeader = (dateString) => {
    // Ensure the date string is parsed correctly regardless of timezone
    // Appending 'T00:00:00' assumes the date string is YYYY-MM-DD and treats it as local time start of day
    const date = new Date(dateString + 'T00:00:00');
    if (isNaN(date.getTime())) {
        return "Invalid Date"; // Fallback for invalid dates
    }
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC' // Use UTC to avoid timezone shifts affecting the date display
    }).format(date);
};

const TransactionGrid = ({
    transactions,
    setTransactions,
    selectedTransactionId,
    setSelectedTransactionId,
    sortOrder,
}) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getTransactions = async () => {
            try {
                setIsLoading(true);
                const res = await fetch(BASE_URL + "/transactions");
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                if (Array.isArray(data)) {
                    setTransactions(data);
                } else {
                    console.error("Fetched data is not an array:", data);
                    setTransactions([]);
                }
                setSelectedTransactionId(null);
            } catch (error) {
                console.error(error);
                setTransactions([]);
            } finally {
                setIsLoading(false);
            }
        };
        getTransactions();
    }, [setTransactions, setSelectedTransactionId]);

    const handleSelectTransaction = (transactionId) => {
        setSelectedTransactionId((prevSelectedId) =>
            prevSelectedId === transactionId ? null : transactionId
        );
    };

    // Memoize the sorted transactions array
    const sortedTransactions = useMemo(() => {
        if (!Array.isArray(transactions)) {
            return [];
        }
        const sorted = [...transactions].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            const timeA = !isNaN(dateA.getTime()) ? dateA.getTime() : 0;
            const timeB = !isNaN(dateB.getTime()) ? dateB.getTime() : 0;

            return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
        });
        return sorted;
    }, [transactions, sortOrder]);

    // Memoize the grouped transactions
    const groupedTransactions = useMemo(() => {
        const groups = new Map(); // Using Map for potentially better performance and order preservation

        sortedTransactions.forEach((transaction) => {
            // Ensure date exists and is valid before processing
            if (!transaction.date) {
                console.warn(`Transaction ID ${transaction.id} has missing or invalid date.`);
                return; // Skip this transaction
            }
            try {
                // Extract date part only (YYYY-MM-DD) to group consistently
                const dateKey = new Date(transaction.date).toISOString().split('T')[0];

                if (!groups.has(dateKey)) {
                    groups.set(dateKey, []);
                }
                groups.get(dateKey).push(transaction);
            } catch (e) {
                console.error(`Error processing date for transaction ID ${transaction.id}:`, e);
                // Optionally group invalid dates under a specific key like 'Invalid Date'
            }
        });

        // Convert Map to array structure [{ date: string, transactions: Transaction[] }]
        // The order will depend on the insertion order, which follows sortedTransactions
        return Array.from(groups.entries()).map(([date, transactions]) => ({
            date,
            transactions,
        }));

    }, [sortedTransactions]); // Re-group only when sortedTransactions changes

    return (
        <>
            {isLoading && (
                <Flex justify="center" mt={8}>
                    <Spinner size="lg" color="teal.500" thickness="3px" />
                </Flex>
            )}

            {!isLoading && groupedTransactions.length === 0 && (
                <Flex justify="center" mt={8} p={6} bg="#f9f9f4" borderRadius="md">
                    <Text fontSize="sm" color="gray.500">
                        No transactions found.
                    </Text>
                </Flex>
            )}

            {!isLoading && groupedTransactions.length > 0 && (
                <VStack spacing={6} align="stretch" > {/* Add spacing between date groups */}
                    {groupedTransactions.map((group) => (
                        <Fragment key={group.date}> {/* Use Fragment to avoid extra DOM element per group */}
                            <Text
                                fontSize="md"
                                fontWeight="semibold"
                                color="gray.600"
                                //mt={index > 0 ? 6 : 0} // Add top margin to separate date groups, except the first one
                                pb={2} // Add some padding below the header
                                pt={2} // Add some padding below the header
                                borderBottomWidth="1px"
                                borderColor="gray.200"
                            >
                                {formatDateHeader(group.date)}
                            </Text>
                            <VStack spacing={4} align="stretch"> {/* VStack for transactions within a group */}
                                {group.transactions.map((transaction) => (
                                    <TransactionCard
                                        key={transaction.id}
                                        transaction={transaction}
                                        // setTransactions prop might not be needed in Card if Delete/Edit is handled elsewhere, but keeping for now
                                        setTransactions={setTransactions}
                                        isSelected={transaction.id === selectedTransactionId}
                                        onSelect={() => handleSelectTransaction(transaction.id)}
                                    />
                                ))}
                            </VStack>
                        </Fragment>
                    ))}
                </VStack>
            )}
        </>
    );
};

export default TransactionGrid;