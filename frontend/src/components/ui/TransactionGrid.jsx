// File path: C:\Users\mamed\Meu Drive\Code\categorization_app_new\frontend\src\components\ui\TransactionGrid.jsx
// TransactionGrid.jsx
// *** CHANGES APPLIED HERE ***

import { useAtom, useAtomValue, useSetAtom } from "jotai"; // Added useAtomValue
import {
    ldbTransactionsAtom, // Still need access to the raw data atom for total balance
    selectedTransaction,
    ldbInitialBalanceAtom,
    finalRunningBalanceAtom
} from "../../context/atoms";
import { useEffect, useState, useMemo, Fragment, useRef } from "react";
import { BASE_URL } from "../../App";
import { VStack, Spinner, Text, Flex, StackSeparator, Box, Spacer, HStack } from "@chakra-ui/react";
import TransactionCard from "./TransactionCard";

// Helper functions (formatDateHeader, formatCurrency) remain the same...
// Helper function to format date string into a user-friendly format
const formatDateHeader = (dateString) => {
    // If dateString is already 'Invalid Date', return it directly
    if (dateString === "Invalid Date") return dateString;
    // Attempt to parse, assume UTC if only date is provided
    const date = new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00Z');
    if (isNaN(date.getTime())) {
        console.warn("Invalid date encountered in formatDateHeader:", dateString);
        return "Invalid Date";
    }
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC' // Use UTC for consistency since dates are stored as date only
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


export default function TransactionGrid ({
    filteredTransactions, // Receive filtered data as prop
    sortOrder // Receive sort order as prop
}) {
    // Still need raw data for total balance calculation
    const { state: transactionState, data: allTransactionsData } = useAtomValue(ldbTransactionsAtom);
    const [selectedTransac, setSelectedTransac] = useAtom(selectedTransaction);
    const [initialBalanceData] = useAtom(ldbInitialBalanceAtom);
    const setFinalBalance = useSetAtom(finalRunningBalanceAtom);
    const lastSentBalanceRef = useRef(null);

    const isLoading = transactionState === 'loading';
    const isLoadingInitialBalance = initialBalanceData.state === 'loading';
    const hasTransactionsError = transactionState === 'hasError';
    const hasInitialBalanceError = initialBalanceData.state === 'hasError';

    const handleSelectTransaction = (transactionId) => {
        setSelectedTransac((prevSelectedId) =>
            prevSelectedId === transactionId ? null : transactionId
        );
    };

    // Memoize the *chronologically sorted* full transaction list for *total balance* calculation
    const sortedAllTransactions = useMemo(() => {
        if (transactionState !== 'hasData' || !Array.isArray(allTransactionsData)) {
            return [];
        }
        // Sort ascending (oldest first) for balance calculation consistency
        return [...allTransactionsData].sort((a, b) => {
            const dateA = new Date(a.date + 'T00:00:00Z'); // Ensure consistent UTC parsing
            const dateB = new Date(b.date + 'T00:00:00Z');
            const timeA = !isNaN(dateA.getTime()) ? dateA.getTime() : 0;
            const timeB = !isNaN(dateB.getTime()) ? dateB.getTime() : 0;
            return timeA - timeB;
        });
    }, [transactionState, allTransactionsData]);

    // Memoize the chronologically grouped *full* transactions with *total running balance*
    const chronologicalGroupsWithTotalBalance = useMemo(() => {
        if (transactionState !== 'hasData' || initialBalanceData.state !== 'hasData' || !sortedAllTransactions) {
            return [];
        }

        const groups = new Map();
        sortedAllTransactions.forEach((transaction) => {
            if (!transaction.date) return;
            try {
                 // Use UTC date string directly as key
                 const dateKey = transaction.date; // Assuming it's YYYY-MM-DD
                 if (!dateKey || typeof dateKey !== 'string') {
                    console.warn("Invalid date key for transaction:", transaction.id, dateKey);
                    return;
                 }

                if (!groups.has(dateKey)) groups.set(dateKey, []);
                groups.get(dateKey).push(transaction);
            } catch (e) {
                console.error(`Error processing date for transaction ID ${transaction.id}:`, e);
            }
        });

         // Get keys (dates) and sort them chronologically (as strings 'YYYY-MM-DD' sort correctly)
         const sortedDateKeys = Array.from(groups.keys()).sort();

        let runningBalance = initialBalanceData.data;
        // Map sorted keys to groups with calculated balance
        const groupsWithBalance = sortedDateKeys.map(dateKey => {
            const txs = groups.get(dateKey);
            const groupSum = txs.reduce((sum, tx) => {
                 const amount = parseFloat(tx.amount);
                return sum + (isNaN(amount) ? 0 : amount);
            }, 0);
            const groupBalance = runningBalance + groupSum;
            runningBalance = groupBalance; // Update running balance for the next group
            return { date: dateKey, transactions: txs, groupSum, groupBalance };
        });

        return groupsWithBalance;

    }, [sortedAllTransactions, initialBalanceData.state, initialBalanceData.data, transactionState]);


    // Effect to update the final running balance in the backend (based on *all* transactions)
    useEffect(() => {
        if (
            chronologicalGroupsWithTotalBalance.length > 0 &&
            transactionState === 'hasData' &&
            initialBalanceData.state === 'hasData'
        ) {
            const finalBalance = chronologicalGroupsWithTotalBalance[chronologicalGroupsWithTotalBalance.length - 1].groupBalance;
            if (finalBalance !== lastSentBalanceRef.current) {
                 console.log(`Updating final running balance (based on ALL transactions): ${finalBalance}`);
                 setFinalBalance(finalBalance);
                 lastSentBalanceRef.current = finalBalance;
            }
        } else if (
            transactionState === 'hasData' &&
            initialBalanceData.state === 'hasData' &&
            sortedAllTransactions.length === 0
        ) {
            const finalBalance = initialBalanceData.data;
             if (finalBalance !== lastSentBalanceRef.current) {
                 console.log(`Updating final running balance (initial): ${finalBalance}`);
                 setFinalBalance(finalBalance);
                 lastSentBalanceRef.current = finalBalance;
             }
        }
         // Clear ref if data becomes unavailable, so it updates correctly next time data loads
         else if (transactionState !== 'hasData' || initialBalanceData.state !== 'hasData') {
             lastSentBalanceRef.current = null;
         }
    }, [chronologicalGroupsWithTotalBalance, transactionState, initialBalanceData.state, setFinalBalance, initialBalanceData.data, sortedAllTransactions.length]);


    // Memoize the *display* grouped transactions (based on filteredTransactions prop)
    const displayGroupedTransactions = useMemo(() => {
         // Use the filteredTransactions prop passed from parent
         if (!filteredTransactions || filteredTransactions.length === 0 || initialBalanceData.state !== 'hasData') {
            return [];
        }

        // 1. Sort the *filtered* data chronologically (ascending) for balance calculation within the filtered set
        const sortedFiltered = [...filteredTransactions].sort((a, b) => {
            const dateA = new Date(a.date + 'T00:00:00Z');
            const dateB = new Date(b.date + 'T00:00:00Z');
            const timeA = !isNaN(dateA.getTime()) ? dateA.getTime() : 0;
            const timeB = !isNaN(dateB.getTime()) ? dateB.getTime() : 0;
            return timeA - timeB;
        });

        // 2. Group the chronologically sorted *filtered* data
        const groups = new Map();
        sortedFiltered.forEach((transaction) => {
            if (!transaction.date) return;
            try {
                const dateKey = transaction.date; // Use YYYY-MM-DD directly
                 if (!dateKey || typeof dateKey !== 'string') return;
                if (!groups.has(dateKey)) groups.set(dateKey, []);
                groups.get(dateKey).push(transaction);
            } catch (e) {
                console.error(`Error processing date for filtered transaction ID ${transaction.id}:`, e);
            }
        });

        // 3. Calculate running balance *for the filtered set*
        // Need the balance *just before* the first transaction in the filtered set.
        // Find the date of the earliest transaction in the filtered set.
        const earliestFilteredDate = sortedFiltered[0]?.date;
        let startingBalanceForFiltered = initialBalanceData.data;

        if (earliestFilteredDate && chronologicalGroupsWithTotalBalance.length > 0) {
            // Find the group *before* the earliest filtered date in the *total* balance groups
            let lastBalanceBeforeFiltered = initialBalanceData.data;
            for (const group of chronologicalGroupsWithTotalBalance) {
                if (group.date < earliestFilteredDate) {
                    lastBalanceBeforeFiltered = group.groupBalance;
                } else {
                    // Stop once we reach or pass the earliest filtered date
                    break;
                }
            }
            startingBalanceForFiltered = lastBalanceBeforeFiltered;
        }


        // 4. Map sorted keys to groups with calculated *filtered* balance
        const sortedDateKeysFiltered = Array.from(groups.keys()).sort();
        let runningBalanceFiltered = startingBalanceForFiltered;
        const groupsWithFilteredBalance = sortedDateKeysFiltered.map(dateKey => {
            const txs = groups.get(dateKey);
            const groupSum = txs.reduce((sum, tx) => {
                 const amount = parseFloat(tx.amount);
                return sum + (isNaN(amount) ? 0 : amount);
            }, 0);
            // Calculate the balance *at the end of this group* within the filtered context
            const groupBalanceFiltered = runningBalanceFiltered + groupSum;
            runningBalanceFiltered = groupBalanceFiltered; // Update for the next group *in the filtered set*

            return { date: dateKey, transactions: txs, groupSum, groupBalance: groupBalanceFiltered }; // Store the filtered balance
        });


        // 5. Apply display sort order (asc/desc)
        if (sortOrder === 'desc') {
            return groupsWithFilteredBalance.reverse();
        }
        return groupsWithFilteredBalance;

    }, [filteredTransactions, sortOrder, initialBalanceData.state, initialBalanceData.data, chronologicalGroupsWithTotalBalance]); // Depend on filtered data and sort order


    // --- Render Logic ---
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
                        Please try refreshing the page or check your connection.
                    </Text>
                </Flex>
            )}

            {/* Message when data is loaded but filtered list is empty */}
             {!isLoading && !isLoadingInitialBalance && !hasTransactionsError && !hasInitialBalanceError && filteredTransactions.length === 0 && allTransactionsData?.length > 0 && (
                 <Flex justify="center" mt={8} p={6} bg="#f9f9f4" borderRadius="md">
                     <Text fontSize="sm" color="gray.500">
                         No transactions match the current filters.
                     </Text>
                 </Flex>
             )}

             {/* Message when data is loaded but there are simply no transactions at all */}
             {!isLoading && !isLoadingInitialBalance && !hasTransactionsError && !hasInitialBalanceError && allTransactionsData?.length === 0 && (
                 <Flex justify="center" mt={8} p={6} bg="#f9f9f4" borderRadius="md">
                     <Text fontSize="sm" color="gray.500">
                         No transactions found. Add or import some transactions to get started.
                     </Text>
                 </Flex>
             )}

            {/* Render the grid only if not loading, no errors, and there are display groups */}
            {!isLoading && !isLoadingInitialBalance && !hasTransactionsError && !hasInitialBalanceError && displayGroupedTransactions.length > 0 && (
                <VStack spacing={6} align="stretch" >

                     {/* Display Initial Balance - Always show if data is loaded and no errors */}
                     {/* {!hasInitialBalanceError && initialBalanceData.state === 'hasData' && (
                         <Flex justify="space-between" p={2} borderBottomWidth="1px" borderColor="gray.300" mb={4}>
                            <Text fontSize="md" fontWeight="semibold" color="gray.700">
                                Initial BalanceXX
                            </Text>
                            <Text fontSize="md" fontWeight="bold" color="teal.600">
                                {formatCurrency(initialBalanceData.data ?? 0)}
                            </Text>
                        </Flex>
                     )} */}

                    {/* Render groups based on display order (derived from filteredTransactions) */}
                    {displayGroupedTransactions.map((group) => (
                        <Fragment key={group.date}>
                             <Box
                                fontSize="sm"
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
                                     {/* Display the running balance calculated for the filtered set */}
                                     <Box 
                                        fontSize="sm" 
                                        marginRight={4}
                                    >
                                        <HStack gap={4}>
                                            <Text color="gray.600" >Balance:</Text>
                                            <Text 
                                                fontWeight="bold"
                                                color={group.groupBalance >= 0 ? 'green.600' : 'red.600'}
                                            >
                                                {formatCurrency(group.groupBalance)}
                                            </Text>
                                        </HStack>
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