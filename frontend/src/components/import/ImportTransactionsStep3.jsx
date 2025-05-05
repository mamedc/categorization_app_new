// src/components/import/ImportTransactionsStep3.jsx

import { useState, useEffect, useCallback } from "react";
import { Container, Flex, Button, Text, Box, FileUpload, useFileUpload, Spacer, Steps, Code, Stack } from "@chakra-ui/react";
import { HiUpload } from "react-icons/hi"


export default function ImportTransactionsStep3({
    items,
    step,
    validFile,
    acceptedFileNames
}) {
    
    return (
        <Stack spacing={4} p={4} borderWidth="1px" borderRadius="md" borderColor="gray.200">
            <Text fontSize="lg" fontWeight="semibold">{items[step].title}: {items[step].description}</Text>
            
            {/* Add Step 3 components here (e.g., review grid, import button) */}
            <Text>Content for Step 3 goes here.</Text>
            
            {validFile && acceptedFileNames && <Text>Ready to import: {acceptedFileNames}</Text>}
        
        {/* You might have a final "Import" button here instead of using the "Next" button */}
   </Stack>
    );
};