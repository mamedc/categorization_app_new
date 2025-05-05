// src/components/import/ImportTransactionsStep3.jsx

import { Stack, Text, Box, Alert } from "@chakra-ui/react";

export default function ImportTransactionsStep3({
    items,
    step,
    parsedData,
    csvHeaders
}) {
    return (
        <Stack direction="column" spacing={6}>
            <Text fontSize="lg" fontWeight="semibold" textAlign="center">
                {items[step].title}: {items[step].description}
            </Text>

            <Box borderWidth="1px" borderRadius="md" p={4} bg="white">
                 <Text fontSize="md" fontWeight="medium" mb={4}>Final Review</Text>
                 {(!parsedData || parsedData.length === 0) ? (
                    <Alert.Root status="error" title="This is the alert title">
                        <Alert.Content>
                            <Alert.Title>No data processed. Cannot proceed.</Alert.Title>
                            <Alert.Description>No data processed. Cannot proceed.</Alert.Description>
                        </Alert.Content>
                        <CloseButton pos="relative" top="-2" insetEnd="-2" onClick={() => setParsingError(null)} />
                    </Alert.Root>
                 ) : (
                    <Text>
                        Ready to import {parsedData.length} records based on the mapped columns (mapping logic not implemented yet).
                        {/* TODO: Display final review details, mapped data summary, and Import button */}
                    </Text>
                 )}
            </Box>
        </Stack>
    );
}