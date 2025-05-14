// .\frontend\src\components\ui\TransactionGrid.jsx

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
    return new Intl.DateTimeFormat('en-GB', {
        year: 'numeric',
        month: 'short',
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
        if (initialBalanceData.state !== 'hasData' || !chronologicallySortedAllTransactions || !allTransactionsData) {
             // Added check for allTransactionsData
            return [];
        }

        // Create a map for quick lookup of children by parent ID
        const childrenMap = new Map();
        allTransactionsData.forEach(tx => {
            if (tx.parent_id !== null) {
                if (!childrenMap.has(tx.parent_id)) {
                    childrenMap.set(tx.parent_id, []);
                }
                childrenMap.get(tx.parent_id).push(tx);
            }
        });

        // Adjust parent amounts first before grouping and balance calculation
        const transactionsWithAdjustedAmounts = chronologicallySortedAllTransactions.map(tx => {
            let effectiveAmount = 0;
            const originalAmount = parseFloat(tx.amount || '0'); // Ensure parsing

            if (tx.children_flag && tx.parent_id === null) { // Explicitly check parent_id is null
                const children = childrenMap.get(tx.id) || [];
                const sumOfChildrenAmounts = children.reduce((sum, child) => {
                    const childAmount = parseFloat(child.amount || '0'); // Ensure parsing
                    return sum + (isNaN(childAmount) ? 0 : childAmount);
                }, 0);

                effectiveAmount = isNaN(originalAmount) ? 0 : originalAmount - sumOfChildrenAmounts;
            } else {
                // Non-parents or children use their amount directly for balance calculation
                effectiveAmount = isNaN(originalAmount) ? 0 : originalAmount;
            }

            return {
                ...tx,
                // Use the *effective* amount for balance calculations
                _effectiveAmountForBalance: effectiveAmount,
                // Keep original amount if needed elsewhere
                _originalAmount: isNaN(originalAmount) ? 0 : originalAmount,
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

        // Sort by date ASC
        const sortedDateKeys = Array.from(groups.keys()).sort((a, b) => new Date(a + 'T00:00:00Z').getTime() - new Date(b + 'T00:00:00Z').getTime());

        let runningBalance = initialBalanceData.data;
        const groupsWithBalance = sortedDateKeys.map(dateKey => {
            const txs = groups.get(dateKey);
            // Sum based on the *effective* amount for balance
            const groupSum = txs.reduce((sum, tx) => sum + tx._effectiveAmountForBalance, 0);
            const groupBalance = runningBalance + groupSum;
            runningBalance = groupBalance; // Update running balance for the next group
            return { date: dateKey, transactions: txs, groupSum, groupBalance };
        });

        return groupsWithBalance;

    // Added allTransactionsData dependency for children finding and effective amount calc
    }, [chronologicallySortedAllTransactions, initialBalanceData.state, initialBalanceData.data, allTransactionsData]);


    // Effect to update the final running balance in the backend (based on *all* transactions using effective amounts)
    useEffect(() => {
        if (
            chronologicalGroupsWithTotalBalance.length > 0 &&
            initialBalanceData.state === 'hasData'
        ) {
            // Use the balance calculated with effective amounts
            const finalBalance = chronologicalGroupsWithTotalBalance[chronologicalGroupsWithTotalBalance.length - 1].groupBalance;
            // Only update if the value is different to avoid unnecessary writes
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
            // If there are no transactions, the final balance is just the initial balance
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
         // chronologicallySortedAllTransactions depends on allTransactionsData, so it's covered
    }, [chronologicalGroupsWithTotalBalance, transactionState, initialBalanceData.state, initialBalanceData.data, setFinalBalance]);


    // Memoize the *display* grouped transactions (based on filteredTransactions prop and sortOrder)
    const displayGroupedTransactions = useMemo(() => {
         // Use the filteredTransactions prop passed from parent
         // Also needs initialBalanceData and allTransactionsData
         if (!filteredTransactions || initialBalanceData.state !== 'hasData' || !allTransactionsData) {
             return [];
         }

         // Return early if filtered list is empty, avoids unnecessary calculations
         if (filteredTransactions.length === 0) {
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

         // 2. Group the sorted filtered data by date
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

         // 3. Sort the date keys according to the overall sortOrder
         const sortedDateKeys = Array.from(groups.keys()).sort((a, b) => {
             const dateA = new Date(a + 'T00:00:00Z').getTime();
             const dateB = new Date(b + 'T00:00:00Z').getTime();
             return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
         });

         // 4. Calculate running balance for the *filtered set* using effective amounts
         // Find starting balance for the filtered set based on chronological order
         const earliestFilteredDate = [...sortedFiltered].sort((a,b) => new Date(a.date + 'T00:00:00Z').getTime() - new Date(b.date + 'T00:00:00Z').getTime())[0]?.date;
         let runningBalanceFiltered = initialBalanceData.data; // Start with initial balance

         // Get the chronologically sorted groups (always ASC date order)
         const chronologicalTotalGroupsAsc = chronologicalGroupsWithTotalBalance; //.sort((a,b) => new Date(a.date + 'T00:00:00Z').getTime() - new Date(b.date + 'T00:00:00Z').getTime());

         if (earliestFilteredDate && chronologicalTotalGroupsAsc.length > 0) {
             let lastBalanceBeforeFiltered = initialBalanceData.data;
             // Find the balance of the group *just before* the earliest filtered date
             for (const group of chronologicalTotalGroupsAsc) {
                 if (group.date < earliestFilteredDate) {
                     lastBalanceBeforeFiltered = group.groupBalance;
                 } else {
                     // We've reached or passed the earliest date in the filtered set
                     break;
                 }
             }
             runningBalanceFiltered = lastBalanceBeforeFiltered;
         }

         // Prepare children map for quick lookup
         const childrenMap = new Map();
         allTransactionsData.forEach(tx => {
             if (tx.parent_id !== null) {
                 if (!childrenMap.has(tx.parent_id)) {
                     childrenMap.set(tx.parent_id, []);
                 }
                 childrenMap.get(tx.parent_id).push(tx);
             }
         });

         // Process groups according to display sort order
         const groupsWithFilteredBalance = sortedDateKeys.map(dateKey => {
             const originalTxs = groups.get(dateKey); // Transactions for this date in sortedFiltered

             // Process transactions within the group to adjust parent amounts for display and calculate effective sum
             const processedTxs = originalTxs.map(tx => {
                 let displayAmount = 0;
                 let effectiveAmountForBalance = 0;
                 const originalAmount = parseFloat(tx.amount || '0');

                 if (tx.children_flag && tx.parent_id === null) { // It's a parent
                     const children = childrenMap.get(tx.id) || [];
                     const sumOfChildrenAmounts = children.reduce((sum, child) => {
                         const childAmount = parseFloat(child.amount || '0');
                         return sum + (isNaN(childAmount) ? 0 : childAmount);
                     }, 0);
                     effectiveAmountForBalance = isNaN(originalAmount) ? 0 : originalAmount - sumOfChildrenAmounts;
                     displayAmount = effectiveAmountForBalance; // Parent displays its remaining amount
                 } else { // It's a child or a non-split transaction
                     effectiveAmountForBalance = isNaN(originalAmount) ? 0 : originalAmount;
                     displayAmount = effectiveAmountForBalance; // Child/Non-split displays its own amount
                 }

                 return {
                     ...tx,
                     amount: displayAmount.toFixed(2), // Update amount for TransactionCard display
                     _effectiveAmountForBalance: effectiveAmountForBalance // Internal use for balance sum
                 };
             });

             // Calculate group sum using effective amounts
             const groupSum = processedTxs.reduce((sum, tx) => sum + tx._effectiveAmountForBalance, 0);

             // Calculate running balance for the filtered set
             // Note: If sorting DESC, the running balance calculation needs care.
             // It's usually calculated chronologically (ASC). The display here needs to show the balance *at the end* of that day.
             // We'll find the balance from the chronological calculation for this dateKey.
             const chronoGroup = chronologicalTotalGroupsAsc.find(g => g.date === dateKey);
             const groupBalance = chronoGroup ? chronoGroup.groupBalance : runningBalanceFiltered; // Use chronological balance if found

             // Update the running balance *if* sorting ASC for the next iteration (though this isn't strictly needed as we fetch from chronoGroup)
             if (sortOrder === 'asc') {
                 runningBalanceFiltered += groupSum;
             }
             // If sorting DESC, the concept of "running balance" for the next displayed group is complex.
             // Displaying the balance *at the end of the day* (from chronological calc) is consistent.

             return {
                 date: dateKey,
                 transactions: processedTxs, // Transactions with adjusted display amount for parents
                 groupSum, // Sum of effective amounts for this group
                 groupBalance // Chronological balance at the end of this day
             };
         });

         return groupsWithFilteredBalance;

    // Dependencies updated to include all necessary data sources for calculations
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
                 <Flex justify="center" mt={28} p={6} bg="red.100" borderRadius="md">
                    <Text fontSize="sm" color="red.700">
                        {hasTransactionsError ? "Error loading transactions." : "Error loading initial balance."}
                        Please try refreshing the page or check your connection.
                    </Text>
                </Flex>
            )}

            {/* Message when data is loaded but filtered list is empty */}
             {!isLoading && !isLoadingInitialBalance && !hasTransactionsError && !hasInitialBalanceError && filteredTransactions.length === 0 && allTransactionsData?.length > 0 && (
                 <Flex justify="center" mt={28} p={6} bg="#f9f9f4" borderRadius="md">
                     <Text fontSize="sm" color="gray.500">
                         No transactions match the current filters.
                     </Text>
                 </Flex>
             )}

             {/* Message when data is loaded but there are simply no transactions at all */}
             {!isLoading && !isLoadingInitialBalance && !hasTransactionsError && !hasInitialBalanceError && allTransactionsData?.length === 0 && (
                 <Flex justify="center" mt={28} p={6} bg="#f9f9f4" borderRadius="md">
                     <Text fontSize="sm" color="gray.500">
                         No transactions found. Add or import some transactions to get started.
                     </Text>
                 </Flex>
             )}

            {/* Render the grid only if not loading, no errors, and there are display groups */}
            {!isLoading && !isLoadingInitialBalance && !hasTransactionsError && !hasInitialBalanceError && displayGroupedTransactions.length > 0 && (
                <VStack 
                    spacing={6} 
                    align="stretch" 
                    pt="100px"
                >
                    {displayGroupedTransactions.map((group) => (
                        <Fragment key={group.date}>
                             <Box
                                //bg="rgb(179, 179, 179)"
                                fontSize="sm"
                                fontWeight="semibold"
                                color="gray.500"
                                pb={1}
                                pt={4}
                                pl={2}
                                //mb={0}
                                borderBottomWidth="1px"
                                borderColor="gray.200"
                             >
                                {/* Balance */}
                                <Flex justify="space-between" align="center">
                                    <Box>{formatDateHeader(group.date)}</Box>
                                    <Spacer />
                                     
                                     {/* Display the running balance calculated for the end of this day */}
                                     <Box
                                        fontSize="xs"
                                        marginRight={4}
                                    >
                                        <HStack gap={1}>
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
                            <VStack spacing={4} align="stretch" gap={"2px"}>
                                {group.transactions.map((transaction) => (
                                    <TransactionCard
                                        key={transaction.id}
                                        transaction={transaction} // Pass the potentially modified transaction object
                                        isSelected={transaction.id === selectedTransac?.id} // Compare IDs for selection highlight
                                        onSelect={() => handleSelectTransaction(transaction.id)}
                                        // Pass parent/child flags
                                        isParent={transaction.children_flag && transaction.parent_id === null} // Ensure it's actually a parent
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