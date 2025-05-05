// src/components/import/ImportTransactionsStep2.jsx

import { useState, useEffect, useCallback } from "react";
import { Container, Flex, Button, Text, Box, FileUpload, useFileUpload, Spacer, Steps, Code, Stack } from "@chakra-ui/react";
import { HiUpload } from "react-icons/hi"


export default function ImportTransactionsStep2({
    items,
    step,
    validFile,
    acceptedFileNames
}) {
    
    return (
        <Stack direction="column" spacing={4}>
            <Text fontSize="lg" fontWeight="semibold" textAlign="center">{items[step].title}: {items[step].description}</Text>
            
            <Stack spacing={4} p={4} borderWidth="1px" borderRadius="md" borderColor="gray.200">
                
                {/* Add Step 2 components here (e.g., column mapping) */}
                <Text>Content for Step 2 goes here.</Text>
                
                {/* Example: Display uploaded file name */}
                {validFile && acceptedFileNames && <Text>Mapping columns for: {acceptedFileNames}</Text>}
            </Stack>
        </Stack>
    );
};