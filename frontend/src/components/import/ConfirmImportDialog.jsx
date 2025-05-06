// File path: C:\Users\mamed\Meu Drive\Code\categorization_app_new\frontend\src\components\import\ConfirmImportDialog.jsx
// src/components/import/ConfirmImportDialog.jsx

import {
    Button, Dialog, Portal, Stack, Text, Table, CloseButton
} from "@chakra-ui/react";

export default function ConfirmImportDialog({
    isOpen,
    onClose,
    onImport,
    dataToImport,
    headers,
    isLoading // Added isLoading prop
}) {
    // Filter out duplicates for the preview in the dialog
    const displayData = dataToImport ? dataToImport.filter(tx => !tx.isDuplicate) : [];
    const hasDataToImport = displayData && displayData.length > 0;
    const duplicateCount = dataToImport ? dataToImport.length - displayData.length : 0;

    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => { if (!e.open) onClose(); }}>
            <Dialog.Backdrop />
            <Portal>
                <Dialog.Positioner>
                    <Dialog.Content maxW={{ base: "sm", md: "2xl", lg: "4xl" }} width="full">
                        <Dialog.Header>
                            <Dialog.Title>Confirm Import</Dialog.Title>
                            <Dialog.CloseTrigger asChild>
                                <CloseButton />
                            </Dialog.CloseTrigger>
                        </Dialog.Header>
                        <Dialog.Body>
                            <Stack spacing={4}>
                                {hasDataToImport ? (
                                    <>
                                        <Text>
                                            Are you sure you want to import the following <Text as="b">{displayData.length}</Text> transactions?
                                            {duplicateCount > 0 && (
                                                <Text as="span" fontSize="sm" color="gray.500"> ({duplicateCount} duplicate(s) will be skipped).</Text>
                                            )}
                                        </Text>
                                        <Table.ScrollArea borderWidth="1px" rounded="md" maxHeight="300px">
                                            {/* Only show non-duplicate items in this preview */}
                                            <Table.Root size="sm" variant="line" __css={{ tableLayout: 'auto', width: '100%' }}>
                                                <Table.Header bg="gray.50" stickyHeader>
                                                    <Table.Row>
                                                        {headers.filter(h => h.toLowerCase() !== 'duplicated').map(header => ( // Don't show "Duplicated" column here
                                                            <Table.ColumnHeader key={header} fontWeight="semibold" fontSize="xs" whiteSpace="nowrap">
                                                                {header}
                                                            </Table.ColumnHeader>
                                                        ))}
                                                    </Table.Row>
                                                </Table.Header>
                                                <Table.Body>
                                                    {displayData.map((row, rowIndex) => (
                                                        <Table.Row key={`confirm-row-${rowIndex}`}>
                                                            {headers.filter(h => h.toLowerCase() !== 'duplicated').map(header => (
                                                                <Table.Cell key={`confirm-cell-${header}-${rowIndex}`} fontSize="xs" whiteSpace="normal" wordBreak="break-word">
                                                                    {row[header]}
                                                                </Table.Cell>
                                                            ))}
                                                        </Table.Row>
                                                    ))}
                                                </Table.Body>
                                            </Table.Root>
                                        </Table.ScrollArea>
                                    </>
                                ) : (
                                    <Text>
                                        {dataToImport && dataToImport.length > 0 && duplicateCount === dataToImport.length
                                            ? "All selected transactions are duplicates and will be skipped."
                                            : "No new transactions selected for import."
                                        }
                                    </Text>
                                )}
                            </Stack>
                        </Dialog.Body>
                        <Dialog.Footer gap={3}>
                            <Dialog.CloseTrigger asChild>
                                <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                            </Dialog.CloseTrigger>
                            <Button 
                                colorScheme="cyan" 
                                onClick={onImport} 
                                disabled={!hasDataToImport || isLoading}
                                isLoading={isLoading} // Show loading spinner on import button
                                loadingText="Importing"
                            >
                                Import
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
}