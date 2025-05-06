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
    headers
}) {
    const hasData = dataToImport && dataToImport.length > 0;

    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => { if (!e.open) onClose(); }}>
            <Dialog.Backdrop />
            <Portal> {/* Ensure Portal wraps Positioner for correct stacking context */}
                <Dialog.Positioner>
                    <Dialog.Content maxW={{ base: "sm", md: "2xl", lg: "4xl" }} width="full"> {/* Responsive width */}
                        <Dialog.Header>
                            <Dialog.Title>Confirm Import</Dialog.Title>
                            <Dialog.CloseTrigger asChild>
                                <CloseButton />
                            </Dialog.CloseTrigger>
                        </Dialog.Header>
                        <Dialog.Body>
                            <Stack spacing={4}>
                                {hasData ? (
                                    <>
                                        <Text>
                                            Are you sure you want to import the following <Text as="b">{dataToImport.length}</Text> transactions?
                                        </Text>
                                        <Table.ScrollArea borderWidth="1px" rounded="md" maxHeight="300px">
                                            <Table.Root size="sm" variant="line" __css={{ tableLayout: 'auto', width: '100%' }}>
                                                <Table.Header bg="gray.50" stickyHeader>
                                                    <Table.Row>
                                                        {headers.map(header => (
                                                            <Table.ColumnHeader key={header} fontWeight="semibold" fontSize="xs" whiteSpace="nowrap">
                                                                {header}
                                                            </Table.ColumnHeader>
                                                        ))}
                                                    </Table.Row>
                                                </Table.Header>
                                                <Table.Body>
                                                    {dataToImport.map((row, rowIndex) => (
                                                        <Table.Row key={`confirm-row-${rowIndex}`}>
                                                            {headers.map(header => (
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
                                    <Text>No transactions selected for import.</Text>
                                )}
                            </Stack>
                        </Dialog.Body>
                        <Dialog.Footer gap={3}>
                            <Dialog.CloseTrigger asChild>
                                <Button variant="outline" onClick={onClose}>Cancel</Button>
                            </Dialog.CloseTrigger>
                            <Button colorScheme="cyan" onClick={onImport} disabled={!hasData}>Import</Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
}