// File path: C:\Users\mamed\Meu Drive\Code\categorization_app_new\frontend\src\components\ui\TransactionsManagement.jsx
// src/components/ui/TransactionsManagement.jsx
// *** FIXES APPLIED HERE for Select value display ***

import { useState, useMemo, useEffect } from "react";
import { useAtomValue } from "jotai";
import {
    Container, Flex, Button, Spacer, IconButton, Tooltip, Portal,
    Select, Input, HStack, VStack, Box, Field,
    createListCollection // Import createListCollection
} from "@chakra-ui/react";
import { LuArrowDown, LuArrowUp, LuCheck, LuChevronsUpDown } from "react-icons/lu";
import TransactionGrid from "./TransactionGrid";
import CreateTransactionModal from "./CreateTransactionModal";
import DeleteTransactionModal from "./DeleteTransactionModal";
import EditTransactionModal from "./EditTransactionModal";
import { ldbTransactionsAtom } from "../../context/atoms";

// Helper functions remain the same...
const getUniqueYears = (transactions) => {
    if (!transactions || transactions.length === 0) return [];
    const years = new Set();
    transactions.forEach(tx => {
        if (tx.date) {
            try {
                const year = new Date(tx.date).getFullYear();
                if (!isNaN(year)) {
                    years.add(year);
                }
            } catch (e) {
                console.error("Error parsing date for year extraction:", tx.date, e);
            }
        }
    });
    // Ensure numbers are sorted numerically, then convert back to objects for Select
    const sortedYears = Array.from(years).sort((a, b) => b - a);
    return sortedYears.map(year => ({ label: String(year), value: String(year) }));
};

const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
};

const getDateNDaysAgoString = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
};

// Define filter options data structure for the collection
const filterOptionsData = [
    { label: "All Time", value: "all" },
    { label: "Last 30 Days", value: "last30Days" },
    { label: "Month/Year", value: "monthYear" },
    { label: "Date Range", value: "dateRange" },
];
// Create the collection for the filter type Select
const filterOptionsCollection = createListCollection({ items: filterOptionsData });

// Define month data structure for the collection
const monthsData = [
    { value: '1', label: 'January' }, { value: '2', label: 'February' }, { value: '3', label: 'March' },
    { value: '4', label: 'April' }, { value: '5', label: 'May' }, { value: '6', label: 'June' },
    { value: '7', label: 'July' }, { value: '8', label: 'August' }, { value: '9', label: 'September' },
    { value: '10', label: 'October' }, { value: '11', label: 'November' }, { value: '12', label: 'December' }
];
// Create the collection for the months Select
const monthsCollection = createListCollection({ items: monthsData });


export default function TransactionsManagement({
    selectedTransactionId,
    setSelectedTransactionId
}) {

    const { state: transactionState, data: transactionsData } = useAtomValue(ldbTransactionsAtom);

    // --- Sorting State ---
    const [sortOrder, setSortOrder] = useState('desc');
    const toggleSortOrder = () => {
        setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
    };
    const sortIcon = sortOrder === 'desc' ? <LuArrowUp /> : <LuArrowDown />;
    const sortTooltipLabel = sortOrder === 'desc' ? "Sort Descending (Newest First)" : "Sort Ascending (Oldest First)";

    // --- Filtering State ---
    const [filterType, setFilterType] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');

    // --- Dynamic Year Options (now returns collection) ---
     const availableYearsCollection = useMemo(() => {
         if (transactionState === 'hasData') {
             // getUniqueYears now returns the correct format [{label, value}, ...]
             return createListCollection({ items: getUniqueYears(transactionsData) });
         }
         return createListCollection({ items: [] }); // Return empty collection
     }, [transactionState, transactionsData]);

    // Set default year
    useEffect(() => {
        // Check against collection.items
        if (availableYearsCollection.items.length > 0 && !availableYearsCollection.items.some(y => y.value === selectedYear)) {
            setSelectedYear(availableYearsCollection.items[0].value); // Default to the most recent year's value
        }
        if (availableYearsCollection.items.length === 0) {
            setSelectedYear('');
        }
    }, [availableYearsCollection, selectedYear]);

    // --- Filtering Logic (remains the same) ---
     const filteredTransactions = useMemo(() => {
         if (transactionState !== 'hasData' || !transactionsData) {
             return [];
         }
         const originalTransactions = [...transactionsData];
         switch (filterType) {
             case 'dateRange':
                 if (!startDate || !endDate) return originalTransactions;
                 try {
                     const start = new Date(startDate + 'T00:00:00Z');
                     const end = new Date(endDate + 'T23:59:59Z');
                     if (isNaN(start.getTime()) || isNaN(end.getTime())) return originalTransactions;
                     return originalTransactions.filter(tx => {
                         if (!tx.date) return false;
                         try {
                             const txDate = new Date(tx.date + 'T00:00:00Z');
                             if (isNaN(txDate.getTime())) return false;
                             return txDate >= start && txDate <= end;
                         } catch { return false; }
                     });
                 } catch {
                     return originalTransactions;
                 }
             case 'last30Days':
                 try {
                     const thirtyDaysAgo = new Date(getDateNDaysAgoString(30) + 'T00:00:00Z');
                     const todayEnd = new Date(getTodayDateString() + 'T23:59:59Z');
                     if (isNaN(thirtyDaysAgo.getTime()) || isNaN(todayEnd.getTime())) return originalTransactions;
                     return originalTransactions.filter(tx => {
                         if (!tx.date) return false;
                         try {
                             const txDate = new Date(tx.date + 'T00:00:00Z');
                              if (isNaN(txDate.getTime())) return false;
                             return txDate >= thirtyDaysAgo && txDate <= todayEnd;
                         } catch { return false; }
                     });
                 } catch {
                     return originalTransactions;
                 }
             case 'monthYear':
                 if (!selectedMonth || !selectedYear) return originalTransactions;
                 const monthNum = parseInt(selectedMonth);
                 const yearNum = parseInt(selectedYear);
                  if (isNaN(monthNum) || isNaN(yearNum)) return originalTransactions;
                 return originalTransactions.filter(tx => {
                     if (!tx.date) return false;
                     try {
                         const txDate = new Date(tx.date + 'T00:00:00Z');
                          if (isNaN(txDate.getTime())) return false;
                         return txDate.getUTCFullYear() === yearNum && (txDate.getUTCMonth() + 1) === monthNum;
                     } catch { return false; }
                 });
             case 'all':
             default:
                 return originalTransactions;
         }
     }, [transactionState, transactionsData, filterType, startDate, endDate, selectedMonth, selectedYear]);


    return (
        <Container maxW="container.lg" pt={6} pb={8}>
            {/* --- Actions Bar - Sticky --- */}
            <Flex
                direction={{ base: 'column', md: 'row' }}
                align={{ base: 'stretch', md: 'center' }}
                gap={4}
                wrap="wrap"
                minH="60px"
                bg="rgba(249, 249, 244, 0.85)"
                backdropFilter="auto"
                backdropBlur="8px"
                mb={6}
                p={4}
                borderRadius="md"
                position="sticky"
                top={0}
                zIndex="sticky"
                borderBottomWidth="1px"
                borderColor="gray.200"
            >
                {/* --- Filter Controls --- */}
                <Flex wrap="wrap" gap={4} align="center" flexGrow={{ base: 1, md: 0 }}>
                    {/* Sorting Control */}
                    <Tooltip.Root positioning={{ placement: "bottom" }} openDelay={200} closeDelay={100}>
                        <Tooltip.Trigger asChild>
                            <IconButton
                                size="sm" aria-label="Toggle sort order by date" onClick={toggleSortOrder}
                                variant="outline" colorPalette="teal" _hover={{ bg: "teal.500", color: "white" }}
                            >
                                {sortIcon}
                            </IconButton>
                        </Tooltip.Trigger>
                        <Portal><Tooltip.Positioner><Tooltip.Content>{sortTooltipLabel}</Tooltip.Content></Tooltip.Positioner></Portal>
                    </Tooltip.Root>

                    {/* Filter Type Select - Using Collection */}
                    <Field.Root id="filterTypeSelect" minW="150px" flexShrink={0}>
                        <Field.Label srOnly>Filter by</Field.Label>
                        <Select.Root
                            // Use the collection prop with the created collection
                            collection={filterOptionsCollection}
                            value={[filterType]}
                            onValueChange={(details) => setFilterType(details.value[0] || 'all')}
                            size="sm"
                            positioning={{ sameWidth: true, gutter: 2 }}
                        >
                            <Select.HiddenSelect />
                            <Select.Control>
                                <Select.Trigger bg="white" variant="outline">
                                    {/* ValueText will now display the label of the selected item */}
                                    <Select.ValueText placeholder="Filter by..." />
                                    <Select.IndicatorGroup><Select.Indicator><LuChevronsUpDown /></Select.Indicator></Select.IndicatorGroup>
                                </Select.Trigger>
                            </Select.Control>
                            <Portal>
                                <Select.Positioner>
                                    <Select.Content>
                                        {/* Iterate over collection items */}
                                        {filterOptionsCollection.items.map((option) => (
                                            <Select.Item item={option} key={option.value}>
                                                {option.label}
                                                <Select.ItemIndicator><LuCheck /></Select.ItemIndicator>
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select.Positioner>
                            </Portal>
                        </Select.Root>
                    </Field.Root>

                    {/* Date Range Inputs (Conditional) */}
                    {filterType === 'dateRange' && (
                        <HStack spacing={2}>
                             <Field.Root id="startDate">
                                <Field.Label srOnly>Start Date</Field.Label>
                                <Input size="sm" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} maxW="150px" bg="white" />
                             </Field.Root>
                             <Field.Root id="endDate">
                                <Field.Label srOnly>End Date</Field.Label>
                                <Input size="sm" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} maxW="150px" bg="white" min={startDate} />
                            </Field.Root>
                        </HStack>
                    )}

                    {/* Month/Year Selects (Conditional) - Using Collections */}
                    {filterType === 'monthYear' && (
                        <HStack spacing={2}>
                             {/* Month Select */}
                             <Field.Root id="selectMonth" minW="120px">
                                 <Field.Label srOnly>Month</Field.Label>
                                 <Select.Root
                                     collection={monthsCollection} // Use month collection
                                     value={[selectedMonth]}
                                     onValueChange={(details) => setSelectedMonth(details.value[0] || '')}
                                     size="sm" positioning={{ sameWidth: true, gutter: 2 }}
                                >
                                    <Select.HiddenSelect />
                                    <Select.Control>
                                        <Select.Trigger bg="white" variant="outline">
                                             <Select.ValueText placeholder="Month" />
                                             <Select.IndicatorGroup><Select.Indicator><LuChevronsUpDown /></Select.Indicator></Select.IndicatorGroup>
                                        </Select.Trigger>
                                    </Select.Control>
                                     <Portal>
                                        <Select.Positioner>
                                            <Select.Content>
                                                {monthsCollection.items.map((m) => ( // Iterate collection
                                                     <Select.Item item={m} key={m.value}>
                                                        {m.label}
                                                        <Select.ItemIndicator><LuCheck /></Select.ItemIndicator>
                                                    </Select.Item>
                                                ))}
                                            </Select.Content>
                                         </Select.Positioner>
                                     </Portal>
                                </Select.Root>
                             </Field.Root>

                            {/* Year Select */}
                            <Field.Root id="selectYear" minW="100px">
                                <Field.Label srOnly>Year</Field.Label>
                                <Select.Root
                                    collection={availableYearsCollection} // Use year collection
                                    value={[selectedYear]}
                                    onValueChange={(details) => setSelectedYear(details.value[0] || '')}
                                    size="sm" positioning={{ sameWidth: true, gutter: 2 }}
                                    disabled={availableYearsCollection.items.length === 0}
                                >
                                     <Select.HiddenSelect />
                                     <Select.Control>
                                        <Select.Trigger bg="white" variant="outline">
                                             <Select.ValueText placeholder="Year" />
                                             <Select.IndicatorGroup><Select.Indicator><LuChevronsUpDown /></Select.Indicator></Select.IndicatorGroup>
                                         </Select.Trigger>
                                     </Select.Control>
                                     <Portal>
                                         <Select.Positioner>
                                             <Select.Content>
                                                 {availableYearsCollection.items.map((y) => ( // Iterate collection
                                                     <Select.Item item={y} key={y.value}>
                                                         {y.label}
                                                         <Select.ItemIndicator><LuCheck /></Select.ItemIndicator>
                                                     </Select.Item>
                                                 ))}
                                             </Select.Content>
                                         </Select.Positioner>
                                     </Portal>
                                </Select.Root>
                            </Field.Root>
                        </HStack>
                    )}
                </Flex>

                <Spacer display={{ base: 'none', md: 'block' }}/>

                {/* --- Action Buttons --- */}
                 <HStack spacing={2} mt={{ base: 4, md: 0 }} width={{ base: "100%", md: "auto"}} justifyContent={{ base: "flex-end", md: "initial"}}>
                    <CreateTransactionModal />
                    <EditTransactionModal />
                    <DeleteTransactionModal />
                </HStack>

            </Flex>

            {/* --- Transaction Grid --- */}
            <TransactionGrid
                filteredTransactions={filteredTransactions}
                sortOrder={sortOrder}
            />

        </Container>
    );
};