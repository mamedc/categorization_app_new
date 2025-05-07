// File path: C:\Users\mamed\Meu Drive\Code\categorization_app_new\frontend\src\components\ui\TransactionGrid.jsx
// TransactionGrid.jsx

import { useAtom, useSetAtom } from "jotai"; // Import useSetAtom
import {
    ldbTransactionsAtom,
    selectedTransaction,
    ldbInitialBalanceAtom,
    finalRunningBalanceAtom // Import the new atom's setter trigger
} from "../../context/atoms";
import { useEffect, useState, useMemo, Fragment, useRef } from "react"; // Added useRef
import { BASE_URL } from "../../App";
import { VStack, Spinner, Text, Flex, StackSeparator, Box, Spacer } from "@chakra-ui/react";
import TransactionCard from "./TransactionCard";

// Helper function to format date string into a user-friendly format
const formatDateHeader = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    if (isNaN(date.getTime())) {
        return "Invalid Date";
    }
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC'
    }).format(date);
};

// Helper function to format number as currency (e.g., BRL)
const formatCurrency = (value) => {
    const numericValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    return numericValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
};

export default function TransactionGrid ({ sortOrder }) {
    const [transactions] = useAtom(ldbTransactionsAtom);
    const [selectedTransac, setSelectedTransac] = useAtom(selectedTransaction);
    const [initialBalanceData] = useAtom(ldbInitialBalanceAtom);
    const setFinalBalance = useSetAtom(finalRunningBalanceAtom); // Get the setter function
    const lastSentBalanceRef = useRef(null); // Ref to store the last sent balance

    const isLoading = transactions.state === 'loading';
    const isLoadingInitialBalance = initialBalanceData.state === 'loading';
    const hasTransactionsError = transactions.state === 'hasError';
    const hasInitialBalanceError = initialBalanceData.state === 'hasError';

    const handleSelectTransaction = (transactionId) => {
        setSelectedTransac((prevSelectedId) =>
            prevSelectedId === transactionId ? null : transactionId
        );
    };

    // Memoize the sorted transactions array (always sorted ascending for calculation)
    const sortedTransactions = useMemo(() => {
        if (transactions.state !== 'hasData' || !Array.isArray(transactions.data)) {
            return [];
        }
        const sorted = [...transactions.data].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            const timeA = !isNaN(dateA.getTime()) ? dateA.getTime() : 0;
            const timeB = !isNaN(dateB.getTime()) ? dateB.getTime() : 0;
            return timeA - timeB; // Ascending (oldest first)
        });
        return sorted;
    }, [transactions.state, transactions.data]); // Depend on state and data

    // Memoize the chronologically grouped transactions (for balance calculation)
    const chronologicalGroupsWithBalance = useMemo(() => {
        if (transactions.state !== 'hasData' || initialBalanceData.state !== 'hasData') {
            return [];
        }

        const groups = new Map();
        sortedTransactions.forEach((transaction) => {
            if (!transaction.date) return;
            try {
                const dateKey = new Date(transaction.date).toISOString().split('T')[0];
                if (!groups.has(dateKey)) groups.set(dateKey, []);
                groups.get(dateKey).push(transaction);
            } catch (e) {
                console.error(`Error processing date for transaction ID ${transaction.id}:`, e);
            }
        });

        const sortedGroups = Array.from(groups.entries()).map(([date, txs]) => ({
            date,
            transactions: txs,
        }));

        let runningBalance = initialBalanceData.data;
        const groupsWithBalance = sortedGroups.map((group) => {
            const groupSum = group.transactions.reduce((sum, tx) => {
                const amount = parseFloat(tx.amount);
                return sum + (isNaN(amount) ? 0 : amount);
            }, 0);
            const groupBalance = runningBalance + groupSum;
            runningBalance = groupBalance;
            return { ...group, groupSum, groupBalance };
        });

        return groupsWithBalance; // Return chronological groups with calculated balance

    }, [sortedTransactions, initialBalanceData.state, initialBalanceData.data, transactions.state]);

    // Effect to update the final running balance in the backend
    useEffect(() => {
        // Only proceed if data is loaded and there are groups
        if (
            chronologicalGroupsWithBalance.length > 0 &&
            transactions.state === 'hasData' &&
            initialBalanceData.state === 'hasData'
        ) {
            // The final balance is the balance of the last group in the chronological list
            const finalBalance = chronologicalGroupsWithBalance[chronologicalGroupsWithBalance.length - 1].groupBalance;

            // Check if the calculated balance is different from the last sent balance
            if (finalBalance !== lastSentBalanceRef.current) {
                 console.log(`Updating final running balance: ${finalBalance}`);
                 setFinalBalance(finalBalance); // Call the atom's setter function
                 lastSentBalanceRef.current = finalBalance; // Update the ref with the new balance
            }
        } else if (
            transactions.state === 'hasData' &&
            initialBalanceData.state === 'hasData' &&
            sortedTransactions.length === 0 // Handle case with initial balance but no transactions
        ) {
            const finalBalance = initialBalanceData.data; // Final balance is just the initial balance
             if (finalBalance !== lastSentBalanceRef.current) {
                 console.log(`Updating final running balance (initial): ${finalBalance}`);
                 setFinalBalance(finalBalance);
                 lastSentBalanceRef.current = finalBalance;
             }
        }
    }, [chronologicalGroupsWithBalance, transactions.state, initialBalanceData.state, setFinalBalance, initialBalanceData.data, sortedTransactions.length]); // Add dependencies


    // Memoize the *display* grouped transactions (applies sortOrder)
    const displayGroupedTransactions = useMemo(() => {
        if (sortOrder === 'desc') {
            // Create a reversed copy for descending display
            return [...chronologicalGroupsWithBalance].reverse();
        }
        // Return the chronological groups directly for ascending display
        return chronologicalGroupsWithBalance;
    }, [chronologicalGroupsWithBalance, sortOrder]);


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

            {!isLoading && !isLoadingInitialBalance && !hasTransactionsError && !hasInitialBalanceError && displayGroupedTransactions.length === 0 && (
                <Flex justify="center" mt={8} p={6} bg="#f9f9f4" borderRadius="md">
                    <Text fontSize="sm" color="gray.500">
                        {transactions.data?.length > 0 ? "Error during balance calculation." : "No transactions found."}
                    </Text>
                </Flex>
            )}

            {!isLoading && !isLoadingInitialBalance && !hasTransactionsError && !hasInitialBalanceError && displayGroupedTransactions.length > 0 && (
                <VStack spacing={6} align="stretch" >

                    {/* Display Initial Balance - Always show if data is loaded */}
                    <Flex justify="space-between" p={2} borderBottomWidth="1px" borderColor="gray.300" mb={4}>
                        <Text fontSize="md" fontWeight="semibold" color="gray.700">
                            Initial Balance
                        </Text>
                        <Text fontSize="md" fontWeight="bold" color="teal.600">
                            {/* Ensure initialBalanceData.data is accessed safely */}
                            {formatCurrency(initialBalanceData.data ?? 0)}
                        </Text>
                    </Flex>

                    {/* Render groups based on display order */}
                    {displayGroupedTransactions.map((group) => (
                        <Fragment key={group.date}>
                             <Box
                                fontSize="md"
                                fontWeight="semibold"
                                color="gray.600"
                                pb={2}
                                pt={2}
                                borderBottomWidth="1px"
                                borderColor="gray.200"
                             >
                                <Flex justify="space-between" align="center">
                                    <Box>{formatDateHeader(group.date)}</Box>
                                    <Spacer />
                                    <Box fontSize="md" fontWeight="bold" color="teal.600">
                                        {formatCurrency(group.groupBalance)}
                                    </Box>
                                </Flex>
                            </Box>
                            <VStack spacing={4} align="stretch">
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