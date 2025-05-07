// File path: C:\Users\mamed\Meu Drive\Code\categorization_app_new\frontend\src\components\import\ImportTransactionsStep3.jsx
// src/components/import/ImportTransactionsStep3.jsx

import { useState } from "react";
import { Stack, Text, Box, Alert, Table, CloseButton, Badge } from "@chakra-ui/react"; // Added Badge

export default function ImportTransactionsStep3({
    items,
    step,
    reviewData,     // Expect reviewData rows to have an 'isDuplicate' boolean property
    reviewHeaders   // Expect reviewHeaders to include "Duplicated"
}) {
    const hasReviewData = reviewData && reviewData.length > 0;

    // State for the local alert in this component (if it's meant to be dismissible locally)
    const [isAlertOpen, setIsAlertOpen] = useState(true);

    return (
        <Stack direction="column" spacing={6}>
            <Text fontSize="lg" fontWeight="semibold" textAlign="center">
                {items[step].title}: {items[step].description}
            </Text>

            <Box borderWidth="1px" borderRadius="md" p={4} bg="white">
                 <Text fontSize="md" fontWeight="medium" mb={4}>Final Review</Text>
                 {!hasReviewData && isAlertOpen ? ( // Check isAlertOpen for local dismissal
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
                                                textAlign={header.toLowerCase() === "duplicated" ? "center" : undefined}
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
                                                    textAlign={header.toLowerCase() === "duplicated" ? "center" : undefined}
                                                >
                                                    {header.toLowerCase() === "duplicated" ? (
                                                        row.isDuplicate !== undefined ? (
                                                            <Badge colorPalette={row.isDuplicate ? "red" : "green"} variant="subtle" size="sm">
                                                                {row.isDuplicate ? "Yes" : "No"}
                                                            </Badge>
                                                        ) : (
                                                            <Badge colorPalette="gray" variant="subtle" size="sm">-</Badge> 
                                                        )
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
                        <Text fontSize="sm" color="gray.500" mt={2}>
                            Click "Proceed to Import" above to confirm and import these transactions.
                        </Text>
                    </Stack>
                 ) : (
                    <Text color="gray.500">No data to review.</Text> // Message if alert was dismissed
                 )}
            </Box>
        </Stack>
    );
}