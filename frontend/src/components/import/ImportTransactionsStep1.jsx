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
        <Stack direction="column" spacing={4}>
            <Text fontSize="lg" fontWeight="semibold" textAlign="center">{items[step].title}: {items[step].description}</Text>
            
            <Stack direction="row" spacing={4}>
                
                {/* File selection */}
                <Stack spacing={4} p={4} borderWidth="1px" borderRadius="md" bg="white" borderColor="gray.200">
                    <FileUpload.RootProvider value={fileUpload}>
                        <FileUpload.HiddenInput />
                        <Flex direction="column" gap={3} align="start">
                            <FileUpload.Trigger asChild>
                                <Button variant="solid" colorScheme="cyan" size="sm">
                                    <HiUpload style={{ marginRight: '8px' }}/> Select CSV File
                                </Button>
                            </FileUpload.Trigger>
                            <FileUpload.List width="100%"/>
                        </Flex>
                    </FileUpload.RootProvider>
                </Stack>
                
                {/* Box Imports placeholder */}
                <Box bg="gray" width="100%"><Text>IMPORTS ANTERIORES</Text></Box>
            
            </Stack>
        </Stack>
    );
};