// File path: C:\Users\mamed\Meu Drive\Code\categorization_app_new\frontend\src\components\import\ConfirmImportDialog.jsx
// src/components/import/ConfirmImportDialog.jsx

import { useMemo } from "react";
import {
    Button, Dialog, Portal, Stack, Text, Table, CloseButton, Box, Spinner, Flex, Theme
} from "@chakra-ui/react";
import { useAtom } from "jotai";
import { ldbFinalRunningBalanceAtom } from "../../context/atoms";

// Helper function to format number as currency (e.g., BRL)
const formatCurrency = (value) => {
    const numericValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    return numericValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
};

export default function ConfirmImportDialog({
    isOpen,
    onClose,
    onImport,
    dataToImport,
    headers,
    isLoading
}) {
    const [finalBalanceData] = useAtom(ldbFinalRunningBalanceAtom);
    const isLoadingBalance = finalBalanceData.state === 'loading';
    const hasBalanceError = finalBalanceData.state === 'hasError';

    const transactionsToImport = useMemo(() => {
        return dataToImport ? dataToImport.filter(tx => !tx.isDuplicate) : [];
    }, [dataToImport]);

    const hasDataToImport = transactionsToImport.length > 0;
    const duplicateCount = dataToImport ? dataToImport.length - transactionsToImport.length : 0;

    const importAmountTotal = useMemo(() => {
        return transactionsToImport.reduce((sum, row) => {
            const amount = parseFloat(row.Amount);
            return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
    }, [transactionsToImport]);

    const projectedBalanceAfterImport = useMemo(() => {
        if (finalBalanceData.state !== 'hasData') return null;
        return finalBalanceData.data + importAmountTotal;
    }, [finalBalanceData.state, finalBalanceData.data, importAmountTotal]);

    const balanceDif = useMemo(() => {
        if (finalBalanceData.state !== 'hasData' || projectedBalanceAfterImport === null) return null;
        return projectedBalanceAfterImport - finalBalanceData.data;
    }, [finalBalanceData.state, finalBalanceData.data, projectedBalanceAfterImport]);

    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => { if (!e.open) onClose(); }}>
            <Dialog.Backdrop />
            <Portal>
            <Theme appearance="light">
                <Dialog.Positioner>
                    <Dialog.Content maxW={{ base: "sm", md: "2xl", lg: "4xl" }} width="full">
                        <Dialog.Header>
                            {/* Keep only the title here */}
                            <Dialog.Title>Confirm Import</Dialog.Title>
                        </Dialog.Header>

                         {/* Move the Close Trigger here and position it */}
                         <Dialog.CloseTrigger asChild position="absolute" top="2" right="2">
                            <CloseButton size="sm" disabled={isLoading}/>
                         </Dialog.CloseTrigger>

                        <Dialog.Body>
                            <Stack spacing={6}>
                                {isLoadingBalance ? (
                                    <Flex justify="center" py={4}><Spinner size="md" /></Flex>
                                ) : hasBalanceError ? (
                                    <Text color="red.500" fontSize="sm" textAlign="center" py={4}>
                                        Error loading current balance information. Cannot calculate projected balance.
                                    </Text>
                                ) : (
                                     <Box borderWidth="1px" borderRadius="md" p={3} bg="gray.50">
                                         <Stack direction={{ base: "column", sm: "row" }} spacing={4} justify="space-around" align="center">
                                             <Box textAlign="center">
                                                 <Text fontSize="xs" color="gray.500" mb={1}>Current Final Balance:</Text>
                                                 <Text fontSize="md" fontWeight="bold" color="teal.600">
                                                     {formatCurrency(finalBalanceData.data ?? 0)}
                                                 </Text>
                                             </Box>
                                             <Box textAlign="center">
                                                 <Text fontSize="xs" color="gray.500" mb={1}>Projected Balance After Import:</Text>
                                                 <Text fontSize="md" fontWeight="bold" color={projectedBalanceAfterImport >= 0 ? "green.600" : "red.600"}>
                                                     {formatCurrency(projectedBalanceAfterImport ?? 0)}
                                                 </Text>
                                             </Box>
                                             <Box textAlign="center">
                                                <Text fontSize="xs" color="gray.500" mb={1}>Difference:</Text>
                                                <Text fontSize="md" fontWeight="bold" color={balanceDif >= 0 ? "green.600" : "red.600"}>
                                                    {formatCurrency(balanceDif ?? 0)}
                                                </Text> 
                                            </Box>
                                         </Stack>
                                     </Box>
                                )}

                                {hasDataToImport ? (
                                    <>
                                        <Text mt={"20px"} mb={"20px"}>
                                            Import the following <Text as="b">{transactionsToImport.length}</Text> transactions?
                                            {duplicateCount > 0 && (
                                                <Text as="span" fontSize="sm" color="gray.500"> ({duplicateCount} duplicate(s) will be skipped).</Text>
                                            )}
                                        </Text>
                                        <Table.ScrollArea borderWidth="1px" rounded="md" maxHeight="300px">
                                            <Table.Root size="sm" variant="line" __css={{ tableLayout: 'auto', width: '100%' }}>
                                                <Table.Header bg="gray.50" stickyHeader>
                                                    <Table.Row>
                                                        {headers.filter(h => h.toLowerCase() !== 'duplicated').map(header => (
                                                            <Table.ColumnHeader
                                                                key={header}
                                                                fontWeight="semibold"
                                                                fontSize="xs"
                                                                whiteSpace="nowrap"
                                                                textAlign={header.toLowerCase() === "amount" ? "right" : undefined}
                                                                pr={header.toLowerCase() === "amount" ? 4 : undefined}
                                                            >
                                                                {header}
                                                            </Table.ColumnHeader>
                                                        ))}
                                                    </Table.Row>
                                                </Table.Header>
                                                <Table.Body>
                                                    {transactionsToImport.map((row, rowIndex) => (
                                                        <Table.Row key={`confirm-row-${rowIndex}`}>
                                                            {headers.filter(h => h.toLowerCase() !== 'duplicated').map(header => (
                                                                <Table.Cell
                                                                    key={`confirm-cell-${header}-${rowIndex}`}
                                                                    fontSize="xs"
                                                                    whiteSpace="normal"
                                                                    wordBreak="break-word"
                                                                    textAlign={header.toLowerCase() === "amount" ? "right" : undefined}
                                                                    pr={header.toLowerCase() === "amount" ? 4 : undefined}
                                                                >
                                                                     {header.toLowerCase() === "amount" ? (
                                                                         formatCurrency(parseFloat(row[header] || '0'))
                                                                    ) : (
                                                                        row[header]
                                                                    )}
                                                                </Table.Cell>
                                                            ))}
                                                        </Table.Row>
                                                    ))}
                                                </Table.Body>
                                            </Table.Root>
                                        </Table.ScrollArea>
                                    </>
                                ) : (
                                    <Text textAlign="center" color="gray.600" py={4}>
                                        {dataToImport && dataToImport.length > 0 && duplicateCount === dataToImport.length
                                            ? "All selected transactions are duplicates and will be skipped."
                                            : "No new transactions selected for import."
                                        }
                                    </Text>
                                )}
                            </Stack>
                        </Dialog.Body>
                        <Dialog.Footer gap={3}>
                            
                            <Dialog.CloseTrigger asChild position="absolute" top="2" right="2">
                                <CloseButton size="sm" onClick={onClose} disabled={isLoading} />
                            </Dialog.CloseTrigger>
                            
                            <Button
                                size="xs"
                                variant="outline"
                                onClick={onClose}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            
                            <Button
                                size="xs"
                                colorScheme="cyan"
                                onClick={onImport}
                                disabled={!hasDataToImport || isLoading || isLoadingBalance || hasBalanceError}
                                isLoading={isLoading}
                                loadingText="Importing"
                            >
                                Import
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Theme>
            </Portal>
        </Dialog.Root>
    );
}