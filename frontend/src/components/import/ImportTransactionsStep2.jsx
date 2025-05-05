// src/components/import/ImportTransactionsStep2.jsx

import { Stack, Text, Box, Table, Alert, Badge, Code } from "@chakra-ui/react";

// Simple component to display a preview of the data
export default function ImportTransactionsStep2({
    items,
    step,
    parsedData,   // Receive parsed data array
    csvHeaders,   // Receive array of headers
    fileName      // Receive original file name
}) {

    const MAX_PREVIEW_ROWS = 10; // Limit how many rows to show in preview

    return (
        <Stack direction="column" spacing={6}>
            
            {/* Title */}
            <Text fontSize="lg" fontWeight="semibold" textAlign="center">
                {items[step].title}: {items[step].description}
            </Text>

            {/* Filename */}
            {fileName && (
                 <Text fontSize="sm" color="gray.600" textAlign="center">
                     File: <Code>{fileName}</Code>
                 </Text>
            )}

            {/* Data Preview Section */}
            <Box borderWidth="1px" borderRadius="md" p={4} bg="white" maxH="600px">
                <Text fontSize="md" fontWeight="medium" mb={4}>Data Preview & Column Mapping</Text>

                {/* No data alert */}
                {(!parsedData || parsedData.length === 0) ? (
                    <Alert.Root status="error" title="This is the alert title">
                        <Alert.Content>
                            <Alert.Title>QWERT</Alert.Title>
                            <Alert.Description>No data available to display. Please go back and upload a valid CSV file.</Alert.Description>
                        </Alert.Content>
                        <CloseButton pos="relative" top="-2" insetEnd="-2" onClick={() => setParsingError(null)} />
                    </Alert.Root>
                ) : (
                    <>
                        {/* TODO: Add Column Mapping UI here */}
                        <Text mb={4} fontSize="sm" color="gray.700">
                            Found <Badge colorScheme="green">{csvHeaders.length}</Badge> columns
                            and <Badge colorScheme="blue">{parsedData.length}</Badge> data rows.
                        </Text>

                        {/* Simple Table Preview */}
                        <Table.ScrollArea borderWidth="1px" rounded="md" height="490px" >
                            <Table.Root size={"sm"} variant={"line"} stickyHeader>
                                
                                <Table.ColumnGroup>
                                    {csvHeaders.map((header) => (
                                        <Table.Column key={header} htmlWidth="10%" />
                                    ))}
                                </Table.ColumnGroup>

                                <Table.Header bg="gray.50">
                                    <Table.Row>
                                        {csvHeaders.map((header) => (
                                            <Table.ColumnHeader key={header}>{header}</Table.ColumnHeader>
                                        ))}
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {parsedData.map((row, rowIndex) => (
                                        <Table.Row key={`row-${rowIndex}`}>
                                            {csvHeaders.map((header) => (
                                                <Table.Cell key={`${header}-${rowIndex}`}>
                                                    {row[header] !== undefined && row[header] !== null ? String(row[header]) : ''}
                                                </Table.Cell>
                                            ))}
                                        </Table.Row>
                                    ))}

                                </Table.Body>
                            </Table.Root>
                        </Table.ScrollArea>



                        
                    </>
                )}
            </Box>
        </Stack>
    );
}