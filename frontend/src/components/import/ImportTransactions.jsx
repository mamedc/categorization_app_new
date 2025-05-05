// src/components/import/ImportTransactions.jsx

import { useState, useEffect, useCallback } from "react";
import Papa from 'papaparse';
import { Container, Flex, Button, Text, Box, useFileUpload, Spacer, Steps, Code, Stack } from "@chakra-ui/react";
import { HiUpload } from "react-icons/hi"
import ImportTransactionsStep1 from "./ImportTransactionsStep1";
import ImportTransactionsStep2 from "./ImportTransactionsStep2";
import ImportTransactionsStep3 from "./ImportTransactionsStep3";

const items = [
  {title: "Step 1", description: "Upload File"},
  {title: "Step 2", description: "Map Columns"},
  {title: "Step 3", description: "Review & Import"},
]


export default function ImportTransactions({ }) {
    const [step, setStep] = useState(0);
    const [validFile, setValidFile] = useState(false);

    const isFirstStep = step === 0;
    const isLastStep = step === items.length - 1;

    const fileUpload = useFileUpload({
        accept: ".csv",
        maxFiles: 1,
        maxFileSize: 5242880, // Uncomment if needed
    });

    // Use useCallback for functions passed to useEffect dependencies if they don't change often
    const handleFileChange = useCallback((files) => {
        const file = files[0];

        // Check specifically for the 'text/csv' MIME type or '.csv' extension
        if (file && (file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv'))) {
            console.log('Valid CSV file:', file.name);
            setValidFile(true);
            // Optional: Store file info if needed later
            // setFileInfo({ name: file.name, size: file.size });
        } else {
            console.warn('Invalid file type. Please upload a CSV file.');
            // Reset if an invalid file is selected after a valid one
            setValidFile(false);
            // Clear the invalid file from the upload hook if desired
            // fileUpload.removeFile(file); // Might need adjustment based on hook version
            alert('Invalid file type. Please upload a CSV file.'); // User feedback
        }
    }, []); // Empty dependency array as handleFileChange itself doesn't depend on component state/props


    useEffect(() => {
        if (fileUpload.acceptedFiles.length > 0) {
            handleFileChange(fileUpload.acceptedFiles);
        } else {
            // If all files are removed, reset validFile state
            setValidFile(false);
        }
        // fileUpload.acceptedFiles changes, so it's the correct dependency
        // handleFileChange is stable due to useCallback
    }, [fileUpload.acceptedFiles, handleFileChange]);


    const nextStep = () => {
        // Prevent going beyond the last step
        if (!isLastStep) {
            setStep((prevStep) => prevStep + 1);
        }
    };

    const prevStep = () => {
        // Prevent going before the first step
        if (!isFirstStep) {
             setStep((prevStep) => prevStep - 1);
        }
    };

    // Simplify getting file names
    const acceptedFileNames = fileUpload.acceptedFiles.map((file) => file.name).join(", ");
    const rejectedFileNames = fileUpload.rejectedFiles.map((e) => e.file.name).join(", ");


    return (
        <Container maxW="container.lg" pt={6} pb={8}>

            {/* Actions Bar */}
            <Flex
                direction="row"
                align="center"
                justify="space-between"
                gap={4}
                wrap="wrap"
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
                {/* Steps */}
                <Steps.Root
                    step={step}
                    count={items.length}
                    width={{ base: "50%", md: "50%" }} // Responsive width
                    mb={{ base: 4, md: 0 }} // Margin bottom on small screens
                >
                    <Steps.List>
                        {items.map((item, index) => ( // Use 'item' instead of 'step' to avoid naming conflict
                            <Steps.Item key={index} index={index} title={item.title}>
                                <Steps.Indicator />
                                <Steps.Separator />
                            </Steps.Item>
                        ))}
                    </Steps.List>
                </Steps.Root>

                <Spacer display={{ base: "none", md: "block" }} /> {/* Hide spacer on small screens if steps take full width */}

                {/* Group buttons */}
                <Flex gap={2}> 
                    <Button
                        size="sm"
                        colorPalette="cyan" // Note: colorPalette is not a standard prop, use colorScheme="cyan"
                        colorScheme="gray" // Use gray for prev/cancel actions
                        variant="subtle"
                        rounded="sm"
                        width={20}
                        onClick={prevStep}
                        disabled={isFirstStep} // Use derived state
                    >
                        Prev
                    </Button>
                    <Button
                        size="sm"
                        colorScheme="cyan" // Use colorScheme
                        rounded="sm"
                        width={20}
                        onClick={nextStep}
                        disabled={isLastStep || (isFirstStep && !validFile)} // Disable if last step OR (first step AND file not valid)
                    >
                        Next
                    </Button>
                </Flex>

            </Flex>

            {/* Content Area */}
            <Box>
                
                {/* Step 1 Content */}
                {step === 0 && (
                    <ImportTransactionsStep1 
                        items={items}
                        step={step}
                        fileUpload={fileUpload}
                    />
                )}
                
                {/* Step 2 Content */}
                {step === 1 && (
                    <ImportTransactionsStep2 
                        items={items}
                        step={step}
                        validFile={validFile}
                        acceptedFileNames={acceptedFileNames}
                    />
                )}

                {/* Step 3 Content */}
                {step === 2 && (
                    <ImportTransactionsStep2 
                        items={items}
                        step={step}
                        validFile={validFile}
                        acceptedFileNames={acceptedFileNames}
                    />
                )}
            </Box>

            {/* Removed TransactionGrid placeholder */}

        </Container>
    );
};