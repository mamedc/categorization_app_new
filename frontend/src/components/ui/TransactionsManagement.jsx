// File path: C:\Users\mamed\Meu Drive\Code\categorization_app_new\frontend\src\components\ui\TransactionsManagement.jsx
// src/components/ui/TransactionsManagement.jsx
// *** FIXES APPLIED HERE for Select component usage ***

import { useState, useMemo, useEffect } from "react";
import { useAtomValue } from "jotai";
import {
    Container, Flex, Button, Spacer, IconButton, Tooltip, Portal,
    Select, // Keep Select for the namespace
    Input, HStack, VStack, Box, Field
} from "@chakra-ui/react";
import { LuArrowDown, LuArrowUp, LuCheck, LuChevronsUpDown } from "react-icons/lu"; // Added icons for Select
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
    return Array.from(years).sort((a, b) => b - a);
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
    const [selectedMonth, setSelectedMonth] = useState(''); // Store value ('1'-'12')
    const [selectedYear, setSelectedYear] = useState(''); // Store value (string year)

    // Data for Select components
    const filterOptions = [
        { label: "All Time", value: "all" },
        { label: "Last 30 Days", value: "last30Days" },
        { label: "Month/Year", value: "monthYear" },
        { label: "Date Range", value: "dateRange" },
    ];

    const months = [
        { value: '1', label: 'January' }, { value: '2', label: 'February' }, { value: '3', label: 'March' },
        { value: '4', label: 'April' }, { value: '5', label: 'May' }, { value: '6', label: 'June' },
        { value: '7', label: 'July' }, { value: '8', label: 'August' }, { value: '9', label: 'September' },
        { value: '10', label: 'October' }, { value: '11', label: 'November' }, { value: '12', label: 'December' }
    ];

    const availableYears = useMemo(() => {
        if (transactionState === 'hasData') {
            return getUniqueYears(transactionsData).map(year => ({ label: String(year), value: String(year) }));
        }
        return [];
    }, [transactionState, transactionsData]);

    // Set default year
    useEffect(() => {
        if (availableYears.length > 0 && !availableYears.some(y => y.value === selectedYear)) {
             setSelectedYear(availableYears[0].value); // Default to the most recent year's value
        }
        if (availableYears.length === 0) {
             setSelectedYear('');
        }
    }, [availableYears, selectedYear]);

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
                                size="sm"
                                aria-label="Toggle sort order by date"
                                onClick={toggleSortOrder}
                                variant="outline"
                                colorPalette="teal"
                                _hover={{ bg: "teal.500", color: "white" }}
                            >
                                {sortIcon}
                            </IconButton>
                        </Tooltip.Trigger>
                        <Portal>
                             <Tooltip.Positioner><Tooltip.Content>{sortTooltipLabel}</Tooltip.Content></Tooltip.Positioner>
                        </Portal>
                    </Tooltip.Root>

                    {/* Filter Type Select - Using Chakra v3 Select */}
                    <Field.Root id="filterTypeSelect" minW="150px" flexShrink={0}>
                        <Field.Label srOnly>Filter by</Field.Label>
                        <Select.Root
                             items={filterOptions}
                            value={[filterType]} // Select expects an array for value
                             onValueChange={(details) => setFilterType(details.value[0] || 'all')}
                            size="sm"
                             variant="outline" // Apply variant here if needed
                            positioning={{ sameWidth: true, gutter: 2 }} // Adjust positioning
                        >
                            <Select.HiddenSelect /> {/* For form submission/accessibility */}
                            <Select.Control>
                                <Select.Trigger bg="white">
                                    <Select.ValueText placeholder="Filter by..." />
                                     <Select.IndicatorGroup>
                                         <Select.Indicator>
                                            <LuChevronsUpDown />
                                        </Select.Indicator>
                                    </Select.IndicatorGroup>
                                </Select.Trigger>
                            </Select.Control>
                            <Portal>
                                <Select.Positioner>
                                    <Select.Content>
                                        {filterOptions.map((option) => (
                                            <Select.Item item={option} key={option.value}>
                                                {option.label}
                                                <Select.ItemIndicator>
                                                    <LuCheck />
                                                </Select.ItemIndicator>
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
                                <Input
                                    size="sm" type="date" value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    maxW="150px" bg="white"
                                />
                             </Field.Root>
                            <Field.Root id="endDate">
                                <Field.Label srOnly>End Date</Field.Label>
                                <Input
                                    size="sm" type="date" value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    maxW="150px" bg="white" min={startDate}
                                />
                            </Field.Root>
                        </HStack>
                    )}

                    {/* Month/Year Selects (Conditional) */}
                    {filterType === 'monthYear' && (
                        <HStack spacing={2}>
                             {/* Month Select */}
                             <Field.Root id="selectMonth" minW="120px">
                                 <Field.Label srOnly>Month</Field.Label>
                                 <Select.Root
                                     items={months}
                                    value={[selectedMonth]}
                                     onValueChange={(details) => setSelectedMonth(details.value[0] || '')}
                                    size="sm" variant="outline" positioning={{ sameWidth: true, gutter: 2 }}
                                >
                                    <Select.HiddenSelect />
                                    <Select.Control>
                                        <Select.Trigger bg="white">
                                             <Select.ValueText placeholder="Month" />
                                            <Select.IndicatorGroup><Select.Indicator><LuChevronsUpDown /></Select.Indicator></Select.IndicatorGroup>
                                        </Select.Trigger>
                                    </Select.Control>
                                     <Portal>
                                        <Select.Positioner>
                                            <Select.Content>
                                                {months.map((m) => (
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
                                    items={availableYears}
                                    value={[selectedYear]}
                                    onValueChange={(details) => setSelectedYear(details.value[0] || '')}
                                    size="sm" variant="outline" positioning={{ sameWidth: true, gutter: 2 }}
                                    disabled={availableYears.length === 0}
                                >
                                     <Select.HiddenSelect />
                                     <Select.Control>
                                        <Select.Trigger bg="white">
                                             <Select.ValueText placeholder="Year" />
                                             <Select.IndicatorGroup><Select.Indicator><LuChevronsUpDown /></Select.Indicator></Select.IndicatorGroup>
                                         </Select.Trigger>
                                     </Select.Control>
                                     <Portal>
                                         <Select.Positioner>
                                             <Select.Content>
                                                 {availableYears.map((y) => (
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