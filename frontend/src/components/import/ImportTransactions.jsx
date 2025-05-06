// src/components/import/ImportTransactions.jsx

import { useState, useEffect, useCallback } from "react";
import {
    Container, Flex, Button, Text, Box, Spacer, Steps, Code, Stack,
    useFileUpload, Alert, CloseButton
} from "@chakra-ui/react";
// Removed FileUpload from here as it's used in Step1
import { HiUpload } from "react-icons/hi";
import Papa from 'papaparse'; // Import PapaParse

import ImportTransactionsStep1 from "./ImportTransactionsStep1";
import ImportTransactionsStep2 from "./ImportTransactionsStep2";
import ImportTransactionsStep3 from "./ImportTransactionsStep3"; // Assuming you have this

const items = [
    { title: "Step 1", description: "Upload File" },
    { title: "Step 2", description: "Map Columns & Preview" }, // Updated description
    { title: "Step 3", description: "Review & Import" },
];

export default function ImportTransactions({ }) {
    const [step, setStep] = useState(0);
    // validFile now means "parsed successfully" or "ready to parse"
    const [validFile, setValidFile] = useState(false);
    const [parsedData, setParsedData] = useState([]); // State for parsed rows
    const [csvHeaders, setCsvHeaders] = useState([]); // State for CSV headers
    const [parsingError, setParsingError] = useState(null); // State for parsing errors
    const [isLoading, setIsLoading] = useState(false); // State for loading during parse

    const isFirstStep = step === 0;
    const isLastStep = step === items.length - 1;

    const fileUpload = useFileUpload({
        accept: ".csv, text/csv",
        maxFiles: 1,
        maxFileSize: 5242880,
        onFileChange: (details) => {
            // Reset state when file selection changes *before* validation/parsing
            console.log("File selection changed:", details.acceptedFiles);
            setValidFile(false);
            setParsedData([]);
            setCsvHeaders([]);
            setParsingError(null);
            // If a file is selected (even if later rejected by type), trigger parsing attempt
            if (details.acceptedFiles.length > 0) {
                handleParseFile(details.acceptedFiles[0]);
            }
            // Handle rejection (optional: show different message)
            if (details.rejectedFiles.length > 0) {
                 setParsingError(`File rejected: ${details.rejectedFiles[0].file.name}. Ensure it's a CSV and within size limits.`);
            }
        },
    });

    // Use useCallback for the parsing function
    const handleParseFile = useCallback((file) => {
        if (!file) {
            setValidFile(false);
            setParsedData([]);
            setCsvHeaders([]);
            setParsingError(null);
            return;
        }

        // Double-check type (although useFileUpload should handle 'accept')
        const isValidType = file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv');
        if (!isValidType) {
            setParsingError('Invalid file type. Please upload a CSV file.');
            setValidFile(false);
            setParsedData([]);
            setCsvHeaders([]);
             // Optionally remove the invalid file from the hook's state
             // fileUpload.removeFile(file); // Check Ark UI docs for exact method if needed
            return;
        }

        setIsLoading(true); // Start loading indicator
        setParsingError(null); // Clear previous errors

        Papa.parse(file, {
            header: true, // Treat first row as headers
            skipEmptyLines: true,
            // Fix: Specify the encoding. 'Windows-1252' is common for CSVs from Excel on Windows
            // that contain characters like 'ç', 'á', 'é', 'õ', etc.
            // Other possibilities include 'ISO-8859-1' (Latin-1).
            // If your files are guaranteed to be UTF-8, you can use 'UTF-8'.
            encoding: "Windows-1252",
            complete: (results) => {
                console.log("Parsing complete:", results);
                setIsLoading(false); // Stop loading

                if (results.errors.length > 0) {
                    // Check if the error is related to encoding, though PapaParse might not always specify this.
                    // For now, we'll show the generic Papaparse error.
                    console.error("Parsing errors:", results.errors);
                    setParsingError(`Error parsing CSV: ${results.errors[0].message}`);
                    setValidFile(false);
                    setParsedData([]);
                    setCsvHeaders([]);
                } else if (!results.data || results.data.length === 0) {
                    setParsingError("CSV file is empty or contains only headers.");
                    setValidFile(false);
                    setParsedData([]);
                    setCsvHeaders([]);
                } else {
                    // Successfully parsed!
                    setParsedData(results.data);
                    setCsvHeaders(results.meta.fields || Object.keys(results.data[0]) || []); // Get headers reliably
                    setValidFile(true); // File is valid and parsed
                    setParsingError(null); // Clear any previous error
                }
            },
            error: (error) => {
                console.error("Fatal parsing error:", error);
                setIsLoading(false); // Stop loading
                setParsingError(`Fatal error reading file: ${error.message}`);
                setValidFile(false);
                setParsedData([]);
                setCsvHeaders([]);
            },
        });
    }, []); // No external dependencies needed for the core logic


    // We don't need the separate useEffect anymore if using onFileChange
    // useEffect(() => { ... }, [fileUpload.acceptedFiles, handleParseFile]);


    const nextStep = () => {
        if (!isLastStep) {
            setStep((prevStep) => prevStep + 1);
        }
    };

    const prevStep = () => {
        if (!isFirstStep) {
            setStep((prevStep) => prevStep - 1);
        }
    };

    return (
        <Container maxW="container.lg" pt={6} pb={8}>
            {/* Actions Bar - (Keep as is, but update button logic) */}
            <Flex
                /* ... existing styles ... */
                minH="60px"
                bg="rgba(249, 249, 244, 0.85)"
                backdropFilter="auto"
                backdropBlur="8px"
                mb={6}
                p={4}
                borderRadius="md"
                position="sticky"
                top={0}
                zIndex="sticky"
                borderBottomWidth="1px"
                borderColor="gray.200"
            >
                <Steps.Root
                    step={step}
                    count={items.length}
                    width={{ base: "100%", md: "50%" }} // Adjust width
                    mb={{ base: 4, md: 0 }}
                >
                     <Steps.List>
                        {items.map((item, index) => (
                            <Steps.Item key={index} index={index} title={item.title}>
                                <Steps.Indicator />
                                <Steps.Separator />
                            </Steps.Item>
                        ))}
                    </Steps.List>
                </Steps.Root>

                <Spacer display={{ base: "none", md: "block" }} />

                <Flex gap={2} width={{ base: "100%", md: "auto"}} justifyContent={{ base: "space-between", md: "flex-end"}}> {/* Adjust spacing */}
                    <Button
                        size="sm"
                        colorScheme="gray"
                        variant="outline" // Changed variant for contrast
                        rounded="sm"
                        minW="80px" // Ensure minimum width
                        onClick={prevStep}
                        disabled={isFirstStep || isLoading} // Disable while parsing
                    >
                        Prev
                    </Button>
                    <Button
                        size="sm"
                        colorScheme="cyan"
                        variant="solid" // Changed variant for primary action
                        rounded="sm"
                        minW="80px" // Ensure minimum width
                        onClick={nextStep}
                        // Disable if: last step OR (first step AND file not valid/parsed) OR currently parsing
                        disabled={isLastStep || (isFirstStep && !validFile) || isLoading}
                        isLoading={isLoading && isFirstStep} // Show loading spinner on Next button only during parse on step 1
                        loadingText="Parsing"
                    >
                        Next
                    </Button>
                </Flex>
            </Flex>

            {/* Display Parsing Errors */}
            {parsingError && (
                <Alert.Root status="error" title="This is the alert title"> {/* Note: `title` prop here might be overridden or not visible */}
                    <Alert.Content>
                        <Alert.Title>{parsingError}</Alert.Title>
                        {/* <Alert.Description>{parsingError}</Alert.Description> */} {/* Often Title is enough, or provide more context here */}
                    </Alert.Content>
                    <CloseButton pos="relative" top="-2" insetEnd="-2" onClick={() => setParsingError(null)} />
                </Alert.Root>
            )}

            {/* Content Area */}
            <Box>
                {step === 0 && (
                    <ImportTransactionsStep1
                        items={items}
                        step={step}
                        fileUpload={fileUpload} // Pass the hook instance
                        isLoading={isLoading} // Pass loading state if needed in Step 1 UI
                    />
                )}

                {step === 1 && (
                    <ImportTransactionsStep2
                        items={items}
                        step={step}
                        // Pass the necessary parsed data and headers
                        parsedData={parsedData}
                        csvHeaders={csvHeaders}
                        // Pass original file info if needed for display
                        fileName={fileUpload.acceptedFiles[0]?.name}
                    />
                )}

                {step === 2 && (
                     // Pass data needed for the final review/import step
                    <ImportTransactionsStep3
                        items={items}
                        step={step}
                        parsedData={parsedData}
                        csvHeaders={csvHeaders}
                    />
                )}
            </Box>
        </Container>
    );
}