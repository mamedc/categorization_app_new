// File path: C:\Users\mamed\Meu Drive\Code\categorization_app_new\frontend\src\components\import\ImportTransactionsStep3.jsx
// src/components/import/ImportTransactionsStep3.jsx

import { useState, useMemo } from "react"; // Added useMemo
import { Stack, Text, Box, Alert, Table, CloseButton, Badge, Spinner, Flex } from "@chakra-ui/react"; // Added Badge, Spinner, Flex
import { useAtom } from "jotai"; // Import useAtom
import { ldbFinalRunningBalanceAtom } from "../../context/atoms"; // Import loadable atom for final balance

// Helper function to format number as currency (e.g., BRL) - Consider moving to utils.js
const formatCurrency = (value) => {
    const numericValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    return numericValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
};


export default function ImportTransactionsStep3({
    items,
    step,
    reviewData,     // Expect reviewData rows to have an 'isDuplicate' boolean property and 'Amount' string
    reviewHeaders   // Expect reviewHeaders to include "Duplicated"
}) {
    const [finalBalanceData] = useAtom(ldbFinalRunningBalanceAtom); // Use loadable atom
    const hasReviewData = reviewData && reviewData.length > 0;

    // State for the local alert in this component (if it's meant to be dismissible locally)
    const [isAlertOpen, setIsAlertOpen] = useState(true);

    // Calculate the total amount of transactions to be imported (non-duplicates)
    const importAmountTotal = useMemo(() => {
        if (!hasReviewData) return 0;

        return reviewData.reduce((sum, row) => {
            if (!row.isDuplicate) {
                // Amount is expected to be a standardized string "xxxx.xx"
                const amount = parseFloat(row.Amount);
                return sum + (isNaN(amount) ? 0 : amount);
            }
            return sum;
        }, 0);
    }, [reviewData, hasReviewData]); // Recalculate only when reviewData changes

    // Calculate the projected balance after import
    const projectedBalanceAfterImport = useMemo(() => {
        if (finalBalanceData.state !== 'hasData') return null; // Can't calculate if current balance isn't loaded
        return finalBalanceData.data + importAmountTotal;
    }, [finalBalanceData.state, finalBalanceData.data, importAmountTotal]); // Recalculate when balance or import total changes


    const isLoadingBalance = finalBalanceData.state === 'loading';
    const hasBalanceError = finalBalanceData.state === 'hasError';

    return (
        <Stack direction="column" spacing={6}>
            <Text fontSize="lg" fontWeight="semibold" textAlign="center">
                {items[step].title}: {items[step].description}
            </Text>

            {/* --- Display Current and Projected Balances --- */}
            <Box borderWidth="1px" borderRadius="md" p={4} bg="white">
                 <Text fontSize="md" fontWeight="medium" mb={4}>Balance Overview</Text>
                 {isLoadingBalance ? (
                     <Flex justify="center"><Spinner size="sm" /></Flex>
                 ) : hasBalanceError ? (
                    <Text color="red.500" fontSize="sm">Error loading current balance.</Text>
                 ) : (
                    <Stack direction={{ base: "column", md: "row" }} spacing={6} justify="space-around">
                        <Box textAlign="center">
                            <Text fontSize="sm" color="gray.500" mb={1}>Final Running Balance</Text>
                            <Text fontSize="xl" fontWeight="bold" color="teal.600">
                                {formatCurrency(finalBalanceData.data ?? 0)}
                            </Text>
                        </Box>
                        <Box textAlign="center">
                            <Text fontSize="sm" color="gray.500" mb={1}>Projected Balance After Import</Text>
                            <Text fontSize="xl" fontWeight="bold" color={projectedBalanceAfterImport >= 0 ? "green.600" : "red.600"}>
                                {formatCurrency(projectedBalanceAfterImport ?? 0)}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                                (Based on {reviewData.filter(r => !r.isDuplicate).length} new transaction(s))
                             </Text>
                        </Box>
                    </Stack>
                 )}
            </Box>
            {/* --- End Balance Display --- */}


            <Box borderWidth="1px" borderRadius="md" p={4} bg="white">
                 <Text fontSize="md" fontWeight="medium" mb={4}>Final Review</Text>
                 {!hasReviewData && isAlertOpen ? (
                    <Alert.Root status="warning">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Title>No data to review.</Alert.Title>
                            <Alert.Description>
                                No transactions match the filter criteria from Step 2, or the source file was empty/invalid. Please go back to adjust settings or upload a valid file.
                            </Alert.Description>
                        </Alert.Content>
                        <CloseButton pos="relative" top="-2" insetEnd="-2" onClick={() => setIsAlertOpen(false)} />
                    </Alert.Root>
                 ) : hasReviewData ? (
                    <Stack spacing={4}>
                        <Text>
                            Displaying <Text as="b">{reviewData.length}</Text> records based on your selections in Step 2.
                             Transactions marked as duplicates will be <Text as="b" color="red.600">skipped</Text> during import.
                        </Text>
                        <Table.ScrollArea borderWidth="1px" rounded="md" maxHeight="500px">
                            <Table.Root size="sm" variant="line" __css={{ tableLayout: 'auto', width: '100%' }}>
                                <Table.Header bg="gray.100" stickyHeader>
                                    <Table.Row>
                                        {reviewHeaders.map(header => (
                                            <Table.ColumnHeader
                                                key={header}
                                                fontWeight="semibold"
                                                fontSize="xs"
                                                textTransform="capitalize"
                                                whiteSpace="nowrap"
                                                textAlign={header.toLowerCase() === "duplicated" ? "center" :
                                                           header.toLowerCase() === "amount" ? "right" : undefined} // Align Amount right
                                                pr={header.toLowerCase() === "amount" ? 4 : undefined} // Padding for Amount
                                            >
                                                {header}
                                            </Table.ColumnHeader>
                                        ))}
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {reviewData.map((row, rowIndex) => (
                                        <Table.Row
                                            key={`review-row-${rowIndex}`}
                                            _hover={{ bg: "gray.50" }}
                                            bg={row.isDuplicate ? "red.50" : undefined} // Highlight duplicate rows
                                        >
                                            {reviewHeaders.map(header => (
                                                <Table.Cell
                                                    key={`${header}-${rowIndex}`}
                                                    fontSize="xs"
                                                    whiteSpace="normal"
                                                    wordBreak="break-word"
                                                    textAlign={header.toLowerCase() === "duplicated" ? "center" :
                                                               header.toLowerCase() === "amount" ? "right" : undefined} // Align Amount right
                                                     pr={header.toLowerCase() === "amount" ? 4 : undefined} // Padding for Amount
                                                     color={row.isDuplicate && header.toLowerCase() !== 'duplicated' ? "gray.400" : undefined} // Dim text for duplicates
                                                >
                                                    {header.toLowerCase() === "duplicated" ? (
                                                        row.isDuplicate !== undefined ? (
                                                            <Badge colorPalette={row.isDuplicate ? "red" : "green"} variant="subtle" size="sm">
                                                                {row.isDuplicate ? "Yes" : "No"}
                                                            </Badge>
                                                        ) : (
                                                            <Badge colorPalette="gray" variant="subtle" size="sm">-</Badge>
                                                        )
                                                    ) : header.toLowerCase() === "amount" && !row.isDuplicate ? (
                                                        // Format amount only for non-duplicates for clarity
                                                        formatCurrency(parseFloat(row[header] || '0'))
                                                     ) : (
                                                        row[header] // Display raw value for other columns or duplicates
                                                    )}
                                                </Table.Cell>
                                            ))}
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table.Root>
                        </Table.ScrollArea>
                        <Text fontSize="sm" color="gray.500" mt={2}>
                            Click "Proceed to Import" above to confirm and import the non-duplicate transactions.
                        </Text>
                    </Stack>
                 ) : (
                    <Text color="gray.500">No data to review.</Text> // Message if alert was dismissed
                 )}
            </Box>
        </Stack>
    );
}