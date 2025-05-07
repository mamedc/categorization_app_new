// File path: C:\Users\mamed\Meu Drive\Code\categorization_app_new\frontend\src\components\ui\TransactionGrid.jsx
// TransactionGrid.jsx

import { useAtom } from "jotai";
import {
    ldbTransactionsAtom,
    selectedTransaction,
    ldbInitialBalanceAtom // Import atom for initial balance
} from "../../context/atoms";
import { useEffect, useState, useMemo, Fragment } from "react";
import { BASE_URL } from "../../App";
import { VStack, Spinner, Text, Flex, StackSeparator, Box, Spacer } from "@chakra-ui/react"; // Added Box, Spacer
import TransactionCard from "./TransactionCard";

// Helper function to format date string into a user-friendly format
const formatDateHeader = (dateString) => {
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

// Helper function to format number as currency (e.g., BRL)
const formatCurrency = (value) => {
    // Handle potential null/undefined/NaN values before formatting
    const numericValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    return numericValue.toLocaleString('pt-BR', { // Using pt-BR locale for BRL formatting
        style: 'currency',
        currency: 'BRL',
    });
};

export default function TransactionGrid ({
    //transactions,
    //setTransactions,
    //selectedTransactionId,
    //setSelectedTransactionId,
    sortOrder
}) {

    // const [isLoading, setIsLoading] = useState(true);
    const [transactions] = useAtom(ldbTransactionsAtom);
    const [selectedTransac, setSelectedTransac] = useAtom(selectedTransaction);
    const [initialBalanceData] = useAtom(ldbInitialBalanceAtom); // Fetch initial balance state
    const isLoading = transactions.state === 'loading'

    const handleSelectTransaction = (transactionId) => {
        setSelectedTransac((prevSelectedId) =>
            prevSelectedId === transactionId ? null : transactionId
        );
    };

    // Memoize the sorted transactions array (always sorted ascending for calculation)
    const sortedTransactions = useMemo(() => {
        // Ensure transactions.data exists and is an array before sorting
        if (!Array.isArray(transactions.data)) {
            return [];
        }
        const sorted = [...transactions.data].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            const timeA = !isNaN(dateA.getTime()) ? dateA.getTime() : 0;
            const timeB = !isNaN(dateB.getTime()) ? dateB.getTime() : 0;
            // Always sort ascending (oldest first) for balance calculation logic
            return timeA - timeB;
        });
        return sorted;
    }, [transactions.data]); // Dependency is only on transaction data itself for sorting

    // Memoize the grouped transactions with running balance
    const groupedTransactions = useMemo(() => {
        // Only proceed if transactions and initial balance are loaded
        if (transactions.state !== 'hasData' || initialBalanceData.state !== 'hasData') {
            return [];
        }

        const groups = new Map(); // Using Map for potentially better performance and order preservation
        sortedTransactions.forEach((transaction) => { // Use the ascending sorted array
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

        // Convert Map to array structure [{ date: string, transactions: Transaction[], groupSum: number, groupBalance: number }]
        // The order will depend on the insertion order, which follows sortedTransactions (oldest first)
        const sortedGroups = Array.from(groups.entries()).map(([date, txs]) => ({
            date,
            transactions: txs,
        }));

        // Calculate running balance
        let runningBalance = initialBalanceData.data; // Start with fetched initial balance
        const groupsWithBalance = sortedGroups.map((group) => {
            const groupSum = group.transactions.reduce((sum, tx) => {
                const amount = parseFloat(tx.amount);
                return sum + (isNaN(amount) ? 0 : amount);
            }, 0);

            // Calculate balance *after* this group's transactions
            const groupBalance = runningBalance + groupSum;

            // Update running balance for the next group
            runningBalance = groupBalance;

            return {
                ...group,
                groupSum,
                groupBalance,
            };
        });

        // Apply display sort order *after* calculations are done
        if (sortOrder === 'desc') {
            return groupsWithBalance.reverse(); // Reverse for descending display
        }
        return groupsWithBalance; // Return as is for ascending display

    }, [sortedTransactions, initialBalanceData.state, initialBalanceData.data, transactions.state, sortOrder]); // Re-calculate when data, states, or sortOrder change

    const isLoadingInitialBalance = initialBalanceData.state === 'loading';
    const hasInitialBalanceError = initialBalanceData.state === 'hasError';
    const hasTransactionsError = transactions.state === 'hasError';

    return (
        <>
            {(isLoading || isLoadingInitialBalance) && (
                <Flex justify="center" mt={8}>
                    <Spinner size="lg" color="teal.500" thickness="3px" />
                </Flex>
            )}

            {(hasTransactionsError || hasInitialBalanceError) && (
                 <Flex justify="center" mt={8} p={6} bg="red.100" borderRadius="md">
                    <Text fontSize="sm" color="red.700">
                        {hasTransactionsError ? "Error loading transactions." : "Error loading initial balance."}
                    </Text>
                </Flex>
            )}

            {!isLoading && !isLoadingInitialBalance && !hasTransactionsError && !hasInitialBalanceError && groupedTransactions.length === 0 && (
                <Flex justify="center" mt={8} p={6} bg="#f9f9f4" borderRadius="md">
                    <Text fontSize="sm" color="gray.500">
                        {transactions.data?.length > 0 ? "Error during balance calculation." : "No transactions found."}
                    </Text>
                </Flex>
            )}

            {!isLoading && !isLoadingInitialBalance && !hasTransactionsError && !hasInitialBalanceError && groupedTransactions.length > 0 && (
                <VStack spacing={6} align="stretch" > {/* Add spacing between date groups */}

                    {/* Display Initial Balance - Always show if data is loaded */}
                    {/* Removed the sortOrder === 'asc' condition here */}
                    <Flex justify="space-between" p={2} borderBottomWidth="1px" borderColor="gray.300" mb={4}>
                        <Text fontSize="md" fontWeight="semibold" color="gray.700">
                            Initial Balance
                        </Text>
                        <Text fontSize="md" fontWeight="bold" color="teal.600">
                            {formatCurrency(initialBalanceData.data)}
                        </Text>
                    </Flex>


                    {groupedTransactions.map((group) => (
                        <Fragment key={group.date}> {/* Use Fragment to avoid extra DOM element per group */}
                             <Box // Use Box instead of Text for the header container to allow Flex layout inside
                                fontSize="md"
                                fontWeight="semibold"
                                color="gray.600"
                                pb={2} // Add some padding below the header
                                pt={2} // Add some padding below the header
                                borderBottomWidth="1px" // Keep bottom border for visual separation
                                borderColor="gray.200"
                             >
                                <Flex justify="space-between" align="center"> {/* Flex layout for header */}
                                    <Box>{formatDateHeader(group.date)}</Box> {/* Date on the left */}
                                    <Spacer /> {/* Pushes balance to the right */}
                                    <Box fontSize="md" fontWeight="bold" color="teal.600"> {/* Balance on the right */}
                                        {formatCurrency(group.groupBalance)}
                                    </Box>
                                </Flex>
                            </Box>
                            <VStack spacing={4} align="stretch"> {/* VStack for transactions within a group */}
                                {group.transactions.map((transaction) => (
                                    <TransactionCard
                                        key={transaction.id}
                                        transaction={transaction}
                                        isSelected={transaction.id === selectedTransac}
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