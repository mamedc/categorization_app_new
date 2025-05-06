// File path: C:\Users\mamed\Meu Drive\Code\categorization_app_new\frontend\src\components\import\ImportTransactionsStep3.jsx
// src/components/import/ImportTransactionsStep3.jsx

import { Stack, Text, Box, Alert, Table } from "@chakra-ui/react"; // Added Table
// Removed CloseButton as it's not used for the specific alert here.

export default function ImportTransactionsStep3({
    items,
    step,
    reviewData,     // Renamed from parsedData, this is the filtered & mapped data
    reviewHeaders   // Headers for the reviewData, e.g., ["Date", "Description", "Amount"]
}) {
    const hasReviewData = reviewData && reviewData.length > 0;

    return (
        <Stack direction="column" spacing={6}>
            <Text fontSize="lg" fontWeight="semibold" textAlign="center">
                {items[step].title}: {items[step].description}
            </Text>

            <Box borderWidth="1px" borderRadius="md" p={4} bg="white">
                 <Text fontSize="md" fontWeight="medium" mb={4}>Final Review & Import</Text>
                 {!hasReviewData ? (
                    <Alert.Root status="warning"> {/* Changed to warning, not necessarily an error */}
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Title>No data to review.</Alert.Title>
                            <Alert.Description>
                                No transactions match the filter criteria from Step 2, or the source file was empty. Please go back to adjust settings or upload a valid file.
                            </Alert.Description>
                        </Alert.Content>
                        {/* Removed CloseButton that called setParsingError */}
                    </Alert.Root>
                 ) : (
                    <Stack spacing={4}>
                        <Text>
                            Ready to import <Text as="b">{reviewData.length}</Text> records. Please review the data below.
                        </Text>
                        <Table.ScrollArea borderWidth="1px" rounded="md" maxHeight="500px"> {/* Added ScrollArea */}
                            <Table.Root size="sm" variant="line">
                                <Table.Header bg="gray.100">
                                    <Table.Row>
                                        {reviewHeaders.map(header => (
                                            <Table.ColumnHeader key={header} fontWeight="semibold" fontSize="xs" textTransform="capitalize">
                                                {header}
                                            </Table.ColumnHeader>
                                        ))}
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {reviewData.map((row, rowIndex) => (
                                        <Table.Row key={`review-row-${rowIndex}`} _hover={{ bg: "gray.50" }}>
                                            {reviewHeaders.map(header => (
                                                <Table.Cell key={`${header}-${rowIndex}`} fontSize="xs" whiteSpace="normal" wordBreak="break-word">
                                                    {row[header]}
                                                </Table.Cell>
                                            ))}
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table.Root>
                        </Table.ScrollArea>
                        {/* TODO: Add Import button and logic here */}
                        <Text fontSize="sm" color="gray.500" mt={2}>
                            (Import functionality is not yet implemented.)
                        </Text>
                    </Stack>
                 )}
            </Box>
        </Stack>
    );
}