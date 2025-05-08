// File path: frontend/src/components/ui/TransactionGrid.jsx
// TransactionGrid.jsx

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
    ldbTransactionsAtom,
    selectedTransaction as selectedTransactionAtom, // Rename imported atom
    ldbInitialBalanceAtom,
    finalRunningBalanceAtom
} from "../../context/atoms";
import { useEffect, useState, useMemo, Fragment, useRef } from "react";
import { BASE_URL } from "../../App";
import { VStack, Spinner, Text, Flex, StackSeparator, Box, Spacer, HStack } from "@chakra-ui/react";
import TransactionCard from "./TransactionCard";

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
    // Handle potential string values passed down after adjustment
    const numericValue = typeof value === 'number' ? value : parseFloat(value);
    return (isNaN(numericValue) ? 0 : numericValue).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
};


export default function TransactionGrid ({
    filteredTransactions, // Receive filtered data as prop
    sortOrder // Receive sort order as prop
}) {
    // Still need raw data for total balance calculation AND parent amount adjustment
    const { state: transactionState, data: allTransactionsData } = useAtomValue(ldbTransactionsAtom);
    const [selectedTransac, setSelectedTransac] = useAtom(selectedTransactionAtom); // Use the renamed atom for state management
    const [initialBalanceData] = useAtom(ldbInitialBalanceAtom);
    const setFinalBalance = useSetAtom(finalRunningBalanceAtom);
    const lastSentBalanceRef = useRef(null);

    const isLoading = transactionState === 'loading';
    const isLoadingInitialBalance = initialBalanceData.state === 'loading';
    const hasTransactionsError = transactionState === 'hasError';
    const hasInitialBalanceError = initialBalanceData.state === 'hasError';

    const handleSelectTransaction = (transactionId) => {
        // Find the full transaction object from the raw data using the ID
        const transactionObject = allTransactionsData?.find(tx => tx.id === transactionId);
        setSelectedTransac((prevSelectedId) =>
            prevSelectedId?.id === transactionId ? null : transactionObject // Store the object or null
        ); // Ensure comparison is based on ID if prevSelectedId is an object
    };


    // Memoize the chronologically sorted *full* transaction list for *total balance* calculation
    // Also needed for parent amount calculation
    const chronologicallySortedAllTransactions = useMemo(() => {
        if (transactionState !== 'hasData' || !Array.isArray(allTransactionsData)) {
            return [];
        }
        // Sort ascending (oldest first) for balance calculation consistency and parent-child grouping
        // This sort includes the parent/child logic needed for chronological balance calculation too
        return [...allTransactionsData].sort((a, b) => {
            const dateA = new Date(a.date + 'T00:00:00Z').getTime(); // Ensure consistent UTC parsing
            const dateB = new Date(b.date + 'T00:00:00Z').getTime();
             if (dateA !== dateB) return dateA - dateB; // Primary: date ASC

            // Secondary: Group parent and children together
            const parentCoalesceIdA = a.parent_id ?? a.id;
            const parentCoalesceIdB = b.parent_id ?? b.id;
            if (parentCoalesceIdA !== parentCoalesceIdB) {
                 // Use string comparison if IDs are not guaranteed numbers, or handle potential non-numeric IDs
                return String(parentCoalesceIdA).localeCompare(String(parentCoalesceIdB));
            }

            // Tertiary: Sort parent before children
            const isChildSortA = a.parent_id ? 1 : 0;
            const isChildSortB = b.parent_id ? 1 : 0;
            if (isChildSortA !== isChildSortB) {
                return isChildSortA - isChildSortB;
            }

            // Quaternary: Consistent order for siblings/children (using ID)
             // Use string comparison if IDs are not guaranteed numbers
             return String(a.id).localeCompare(String(b.id));
        });
    }, [transactionState, allTransactionsData]);


    // Memoize the chronologically grouped *full* transactions with *total running balance*
    // This now uses the adjusted parent amounts for balance calculation.
    const chronologicalGroupsWithTotalBalance = useMemo(() => {
        if (initialBalanceData.state !== 'hasData' || !chronologicallySortedAllTransactions) {
            return [];
        }

        // Adjust parent amounts first before grouping and balance calculation
        const transactionsWithAdjustedAmounts = chronologicallySortedAllTransactions.map(tx => {
            if (tx.children_flag && allTransactionsData) {
                const children = allTransactionsData.filter(childTx => childTx.parent_id === tx.id);
                const sumOfChildrenAmounts = children.reduce((sum, child) => {
                    const childAmount = parseFloat(child.amount);
                    return sum + (isNaN(childAmount) ? 0 : childAmount);
                }, 0);
                const originalAmount = parseFloat(tx.amount);
                const effectiveAmount = isNaN(originalAmount) ? 0 : originalAmount - sumOfChildrenAmounts;

                return {
                    ...tx,
                    // Use the *effective* amount for balance calculations
                    effective_amount_for_balance: effectiveAmount,
                    // Keep original amount if needed elsewhere, or adjust 'amount' only for display later
                    original_amount: originalAmount,
                };
            }
            // Non-parents use their amount directly for balance calculation
            const amount = parseFloat(tx.amount);
            return {
                 ...tx,
                 effective_amount_for_balance: isNaN(amount) ? 0 : amount,
                 original_amount: isNaN(amount) ? 0 : amount,
            };
        });


        const groups = new Map();
        transactionsWithAdjustedAmounts.forEach((transaction) => {
            if (!transaction.date) return;
            try {
                 const dateKey = transaction.date;
                 if (!dateKey || typeof dateKey !== 'string') {
                    console.warn("Invalid date key for transaction:", transaction.id, dateKey);
                    return;
                 }

                if (!groups.has(dateKey)) groups.set(dateKey, []);
                groups.get(dateKey).push(transaction); // Push the transaction with adjusted amount info
            } catch (e) {
                console.error(`Error processing date for transaction ID ${transaction.id}:`, e);
            }
        });

        const sortedDateKeys = Array.from(groups.keys()).sort();

        let runningBalance = initialBalanceData.data;
        const groupsWithBalance = sortedDateKeys.map(dateKey => {
            const txs = groups.get(dateKey);
            // Sum based on the *effective* amount for balance
            const groupSum = txs.reduce((sum, tx) => sum + tx.effective_amount_for_balance, 0);
            const groupBalance = runningBalance + groupSum;
            runningBalance = groupBalance;
            return { date: dateKey, transactions: txs, groupSum, groupBalance };
        });

        return groupsWithBalance;

    }, [chronologicallySortedAllTransactions, initialBalanceData.state, initialBalanceData.data, allTransactionsData]); // Added allTransactionsData dependency for children finding


    // Effect to update the final running balance in the backend (based on *all* transactions using effective amounts)
    useEffect(() => {
        if (
            chronologicalGroupsWithTotalBalance.length > 0 &&
            initialBalanceData.state === 'hasData'
        ) {
            // Use the balance calculated with effective amounts
            const finalBalance = chronologicalGroupsWithTotalBalance[chronologicalGroupsWithTotalBalance.length - 1].groupBalance;
            if (finalBalance !== lastSentBalanceRef.current) {
                 console.log(`Updating final running balance (based on ALL transactions, effective amounts): ${finalBalance}`);
                 setFinalBalance(finalBalance);
                 lastSentBalanceRef.current = finalBalance;
            }
        } else if (
            transactionState === 'hasData' && // Check transaction state too
            initialBalanceData.state === 'hasData' &&
            chronologicallySortedAllTransactions.length === 0 // Check based on sorted all transactions
        ) {
            const finalBalance = initialBalanceData.data;
             if (finalBalance !== lastSentBalanceRef.current) {
                 console.log(`Updating final running balance (initial): ${finalBalance}`);
                 setFinalBalance(finalBalance);
                 lastSentBalanceRef.current = finalBalance;
             }
        }
         // Clear ref if data becomes unavailable
         else if (transactionState !== 'hasData' || initialBalanceData.state !== 'hasData') {
             lastSentBalanceRef.current = null;
         }
         // Removed sortedAllTransactions.length from dependency array as it's derived from allTransactionsData
    }, [chronologicalGroupsWithTotalBalance, transactionState, initialBalanceData.state, initialBalanceData.data, setFinalBalance, chronologicallySortedAllTransactions]);


    // Memoize the *display* grouped transactions (based on filteredTransactions prop and sortOrder)
    const displayGroupedTransactions = useMemo(() => {
         // Use the filteredTransactions prop passed from parent
         if (!filteredTransactions || filteredTransactions.length === 0 || initialBalanceData.state !== 'hasData') {
            return [];
        }

        // 1. Sort the *filtered* data based on display preferences and parent/child constraints
        const sortedFiltered = [...filteredTransactions].sort((a, b) => {
            // Primary: Date sort based on sortOrder
            const dateA = new Date(a.date + 'T00:00:00Z').getTime();
            const dateB = new Date(b.date + 'T00:00:00Z').getTime();
            const dateComparison = sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            if (dateComparison !== 0) return dateComparison;

            // Secondary: Group parent and children together
            const parentCoalesceIdA = a.parent_id ?? a.id;
            const parentCoalesceIdB = b.parent_id ?? b.id;
            if (parentCoalesceIdA !== parentCoalesceIdB) {
                return String(parentCoalesceIdA).localeCompare(String(parentCoalesceIdB));
            }

            // Tertiary: Sort parent before children
            const isChildSortA = a.parent_id ? 1 : 0;
            const isChildSortB = b.parent_id ? 1 : 0;
            if (isChildSortA !== isChildSortB) {
                return isChildSortA - isChildSortB;
            }

            // Quaternary: Consistent order for siblings/children (using ID)
            return String(a.id).localeCompare(String(b.id));
        });

        // 2. Group the sorted filtered data
        const groups = new Map();
        sortedFiltered.forEach((transaction) => {
            if (!transaction.date) return;
            try {
                const dateKey = transaction.date;
                 if (!dateKey || typeof dateKey !== 'string') return;
                if (!groups.has(dateKey)) groups.set(dateKey, []);
                groups.get(dateKey).push(transaction); // Push original transaction object for now
            } catch (e) {
                console.error(`Error processing date for filtered transaction ID ${transaction.id}:`, e);
            }
        });

        // 3. Create display-ready groups with adjusted amounts and running balance for the filtered set
        const sortedDateKeys = Array.from(groups.keys()).sort((a, b) => {
             // Sort keys based on date, respecting sortOrder
             const dateA = new Date(a + 'T00:00:00Z').getTime();
             const dateB = new Date(b + 'T00:00:00Z').getTime();
             return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });

        // Find starting balance for the filtered set based on chronological order
        const earliestFilteredDate = [...filteredTransactions].sort((a,b) => new Date(a.date + 'T00:00:00Z').getTime() - new Date(b.date + 'T00:00:00Z').getTime())[0]?.date;
        let runningBalanceFiltered = initialBalanceData.data;

        if (earliestFilteredDate && chronologicalGroupsWithTotalBalance.length > 0) {
            let lastBalanceBeforeFiltered = initialBalanceData.data;
            // Find the group *just before* the earliest filtered date in the *total* balance groups (which are sorted ASC)
            const chronologicalTotalGroups = chronologicalGroupsWithTotalBalance.sort((a,b) => new Date(a.date + 'T00:00:00Z').getTime() - new Date(b.date + 'T00:00:00Z').getTime());

            for (const group of chronologicalTotalGroups) {
                // Date comparison needs to be careful with string dates 'YYYY-MM-DD'
                if (group.date < earliestFilteredDate) {
                    lastBalanceBeforeFiltered = group.groupBalance;
                } else {
                    break; // Stop once we reach or pass the earliest filtered date
                }
            }
             runningBalanceFiltered = lastBalanceBeforeFiltered;
        }

        // Calculate running balance for the filtered set using adjusted amounts
        const groupsWithFilteredBalance = sortedDateKeys.map(dateKey => {
            const originalTxs = groups.get(dateKey);

            // Process transactions for this group: adjust parent amounts
            const processedTxs = originalTxs.map(tx => {
                if (tx.children_flag && allTransactionsData) {
                    const children = allTransactionsData.filter(childTx => childTx.parent_id === tx.id);
                    const sumOfChildrenAmounts = children.reduce((sum, child) => {
                        const childAmount = parseFloat(child.amount);
                        return sum + (isNaN(childAmount) ? 0 : childAmount);
                    }, 0);
                    const originalAmount = parseFloat(tx.amount);
                    const effectiveAmount = isNaN(originalAmount) ? 0 : originalAmount - sumOfChildrenAmounts;
                    return {
                        ...tx,
                        amount: effectiveAmount.toFixed(2), // Adjusted amount for display
                        _effectiveAmountForBalance: effectiveAmount // Keep effective amount for balance calc
                    };
                }
                const amount = parseFloat(tx.amount);
                return {
                     ...tx,
                     _effectiveAmountForBalance: isNaN(amount) ? 0 : amount // Use original amount for balance if not parent
                 };
            });

            // Calculate group sum based on effective amounts for balance
            const groupSum = processedTxs.reduce((sum, tx) => sum + tx._effectiveAmountForBalance, 0);
            const groupBalanceFiltered = runningBalanceFiltered + groupSum;
            runningBalanceFiltered = groupBalanceFiltered; // Update for the next group *in the filtered set*

            return { date: dateKey, transactions: processedTxs, groupSum, groupBalance: groupBalanceFiltered }; // Store the filtered balance and processed transactions
        });

        // No need to reverse again, sortedDateKeys already respects sortOrder
        return groupsWithFilteredBalance;

    // Dependencies now include sortOrder and allTransactionsData
    }, [filteredTransactions, sortOrder, initialBalanceData.state, initialBalanceData.data, allTransactionsData, chronologicalGroupsWithTotalBalance]);


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
                                        transaction={transaction} // Pass the potentially modified transaction object
                                        isSelected={transaction.id === selectedTransac?.id} // Compare IDs for selection highlight
                                        onSelect={() => handleSelectTransaction(transaction.id)}
                                        // Pass parent/child flags
                                        isParent={transaction.children_flag}
                                        isChild={!!transaction.parent_id}
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