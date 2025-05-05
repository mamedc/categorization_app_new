// src/components/import/ImportTransactionsStep1.jsx

import { useState, useEffect, useCallback } from "react";
import { Container, Flex, Button, Text, Box, FileUpload, useFileUpload, Spacer, Steps, Code, Stack } from "@chakra-ui/react";
import { HiUpload } from "react-icons/hi"


export default function ImportTransactionsStep1({
    items,
    step,
    fileUpload
}) {
    
    return (
        <Stack direction="row" spacing={4}>
            <Stack spacing={4} p={4} borderWidth="1px" borderRadius="md" bg="white" borderColor="gray.200">

                <Text fontSize="lg" fontWeight="semibold">{items[step].title}: {items[step].description}</Text>
                
                <FileUpload.RootProvider value={fileUpload}>
                    <FileUpload.HiddenInput />
                    <Flex direction="column" gap={3} align="start">
                        <FileUpload.Trigger asChild>
                            <Button variant="solid" colorScheme="cyan" size="sm">
                                <HiUpload style={{ marginRight: '8px' }}/> Select CSV File
                            </Button>
                        </FileUpload.Trigger>

                        {/* {acceptedFileNames && (
                            <Text fontSize="sm" color="green.600">Accepted: {acceptedFileNames}</Text>
                        )}
                        {rejectedFileNames && (
                            <Text fontSize="sm" color="red.600">Rejected: {rejectedFileNames}</Text>
                        )} */}
                        <FileUpload.List width="100%"/>
                    </Flex>
                </FileUpload.RootProvider>
                
            </Stack>
            <Box bg="gray" width="100%"><Text>IMPORTS ANTERIORES</Text></Box>
        </Stack>
    );
};