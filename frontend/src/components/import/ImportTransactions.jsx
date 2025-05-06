// File path: C:\Users\mamed\Meu Drive\Code\categorization_app_new\frontend\src\components\import\ImportTransactions.jsx
// src/components/import/ImportTransactions.jsx

import { useState, useEffect, useCallback, useMemo } from "react";
import {
    Container, Flex, Button, Text, Box, Spacer, Steps, Code, Stack,
    useFileUpload, Alert, CloseButton, Dialog, Portal
} from "@chakra-ui/react"; // Added Dialog, Portal
import { HiUpload } from "react-icons/hi";
import Papa from 'papaparse';

import ImportTransactionsStep1 from "./ImportTransactionsStep1";
import ImportTransactionsStep2 from "./ImportTransactionsStep2";
import ImportTransactionsStep3 from "./ImportTransactionsStep3";
import ConfirmImportDialog from "./ConfirmImportDialog"; // Assuming we create this for dialog content

const items = [
    { title: "Step 1", description: "Upload File" },
    { title: "Step 2", description: "Map Columns & Preview" },
    { title: "Step 3", description: "Review & Import" },
];

const getColumnIndex = (letter) => {
    if (typeof letter !== 'string' || letter.trim().length === 0) {
        return -1;
    }
    const normalizedLetter = letter.trim().toUpperCase();
    if (normalizedLetter.length !== 1) {
      return -1;
    }
    const charCode = normalizedLetter.charCodeAt(0);
    if (charCode >= 65 && charCode <= 90) {
        return charCode - 65;
    }
    return -1;
};

const MAX_PREVIEW_ROWS_IN_STEP2_TABLE = 1000;

export default function ImportTransactions({ }) {
    const [step, setStep] = useState(0);
    const [validFile, setValidFile] = useState(false);
    const [parsedData, setParsedData] = useState([]);
    const [csvHeaders, setCsvHeaders] = useState([]);
    const [parsingError, setParsingError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false); // Dialog state

    const [filterSettings, setFilterSettings] = useState({
        firstRow: 1,
        lastRow: 1,
        dateColumnLetter: "A",
        descriptionColumnLetter: "C",
        amountColumnLetter: "F", // Default to "F" as per subsequent request
        dateFormat: "DD/MM/YYYY",
    });

    const isFirstStep = step === 0;
    // isLastStep now refers to the last step in the visual Steps component (index 2)
    const isLastDescriptiveStep = step === items.length - 1;


    const fileUpload = useFileUpload({
        accept: ".csv, text/csv",
        maxFiles: 1,
        maxFileSize: 5242880,
        onFileChange: (details) => {
            console.log("File selection changed:", details.acceptedFiles);
            setValidFile(false);
            setParsedData([]);
            setCsvHeaders([]);
            setParsingError(null);
            setFilterSettings({
                firstRow: 1,
                lastRow: 1,
                dateColumnLetter: "A",
                descriptionColumnLetter: "C",
                amountColumnLetter: "F", // Default to "F"
                dateFormat: "DD/MM/YYYY",
            });
            if (details.acceptedFiles.length > 0) {
                handleParseFile(details.acceptedFiles[0]);
            }
            if (details.rejectedFiles.length > 0) {
                 setParsingError(`File rejected: ${details.rejectedFiles[0].file.name}. Ensure it's a CSV and within size limits.`);
            }
        },
    });

    const handleParseFile = useCallback((file) => {
        if (!file) {
            setValidFile(false); setParsedData([]); setCsvHeaders([]); setParsingError(null); return;
        }
        const isValidType = file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv');
        if (!isValidType) {
            setParsingError('Invalid file type. Please upload a CSV file.');
            setValidFile(false); setParsedData([]); setCsvHeaders([]); return;
        }
        setIsLoading(true); setParsingError(null);
        Papa.parse(file, {
            header: true, skipEmptyLines: true, encoding: "Windows-1252",
            complete: (results) => {
                setIsLoading(false);
                if (results.errors.length > 0) {
                    setParsingError(`Error parsing CSV: ${results.errors[0].message}`);
                    setValidFile(false); setParsedData([]); setCsvHeaders([]);
                } else if (!results.data || results.data.length === 0) {
                    setParsingError("CSV file is empty or contains only headers.");
                    setValidFile(false); setParsedData([]); setCsvHeaders([]);
                } else {
                    setParsedData(results.data);
                    setCsvHeaders(results.meta.fields || Object.keys(results.data[0]) || []);
                    setValidFile(true); setParsingError(null);
                }
            },
            error: (error) => {
                setIsLoading(false); setParsingError(`Fatal error reading file: ${error.message}`);
                setValidFile(false); setParsedData([]); setCsvHeaders([]);
            },
        });
    }, []);

    useEffect(() => {
        const numParsedRows = parsedData.length;
        if (numParsedRows > 0) {
            setFilterSettings(prev => {
                const newFirstRow = Math.max(1, Math.min(prev.firstRow, numParsedRows));
                let newLastRow = prev.lastRow === 1 && numParsedRows > 1 ? numParsedRows : prev.lastRow;
                newLastRow = Math.max(1, Math.min(newLastRow, numParsedRows));
                if (newFirstRow > newLastRow) newLastRow = newFirstRow;
                return { ...prev, firstRow: newFirstRow, lastRow: newLastRow };
            });
        } else {
            setFilterSettings(prev => ({ ...prev, firstRow: 1, lastRow: 1 }));
        }
    }, [parsedData]);

    const dataForStep3 = useMemo(() => {
        if (!parsedData || parsedData.length === 0 || !csvHeaders || csvHeaders.length === 0) {
            return { data: [], headers: [] };
        }
        const firstRowIndex = Math.max(0, (filterSettings.firstRow || 1) - 1);
        const lastRowIndex = Math.min(parsedData.length, filterSettings.lastRow || parsedData.length);
        const rowFilteredData = parsedData.slice(firstRowIndex, lastRowIndex);

        const step3HeadersConfig = [];
        const dateColIdx = getColumnIndex(filterSettings.dateColumnLetter);
        const descColIdx = getColumnIndex(filterSettings.descriptionColumnLetter);
        const amountColIdx = getColumnIndex(filterSettings.amountColumnLetter);
        const mappedIndices = new Set();

        if (dateColIdx !== -1 && csvHeaders[dateColIdx]) {
            step3HeadersConfig.push({ originalHeader: csvHeaders[dateColIdx], standardHeader: "Date" });
            mappedIndices.add(dateColIdx);
        }
        if (descColIdx !== -1 && csvHeaders[descColIdx]) {
            if (!mappedIndices.has(descColIdx)) {
                step3HeadersConfig.push({ originalHeader: csvHeaders[descColIdx], standardHeader: "Description" });
                mappedIndices.add(descColIdx);
            }
        }
        if (amountColIdx !== -1 && csvHeaders[amountColIdx]) {
            if (!mappedIndices.has(amountColIdx)) {
                 step3HeadersConfig.push({ originalHeader: csvHeaders[amountColIdx], standardHeader: "Amount" });
                 mappedIndices.add(amountColIdx);
            }
        }
        if (step3HeadersConfig.length === 0) return { data: [], headers: [] };

        const transformedData = rowFilteredData.map(originalRow => {
            const newRow = {};
            step3HeadersConfig.forEach(config => {
                newRow[config.standardHeader] = originalRow[config.originalHeader] !== undefined && originalRow[config.originalHeader] !== null ? String(originalRow[config.originalHeader]) : '';
            });
            return newRow;
        });
        const finalHeaders = step3HeadersConfig.map(config => config.standardHeader);
        return { data: transformedData, headers: finalHeaders };
    }, [parsedData, csvHeaders, filterSettings]);

    const advanceToNextStep = () => {
        if (step < items.length - 1) {
            setStep((prevStep) => prevStep + 1);
        }
    };

    const prevStep = () => {
        if (!isFirstStep) {
            setStep((prevStep) => prevStep - 1);
        }
    };

    const handleProceedToImport = () => {
        if (dataForStep3.data && dataForStep3.data.length > 0) {
            setIsConfirmDialogOpen(true);
        }
    };

    const performImport = () => {
        console.log("Importing data:", dataForStep3.data);
        // Placeholder for actual import logic (e.g., API call)
        // toast.success({ title: "Import Successful", description: `${dataForStep3.data.length} records imported.` });
        setIsConfirmDialogOpen(false);
        // Optionally reset to step 1 or clear data after import
        // setStep(0);
        // fileUpload.removeFile(fileUpload.acceptedFiles[0]); // Or a reset method if available
        // setParsedData([]); 
        // setCsvHeaders([]);
        // setValidFile(false);
    };

    const mainButtonAction = step === 2 ? handleProceedToImport : advanceToNextStep;
    const mainButtonLabel = step === 2 ? "Proceed to Import" : "Next";

    let isMainButtonDisabled = isLoading;
    if (step === 0) {
        isMainButtonDisabled = isMainButtonDisabled || !validFile;
    } else if (step === 1) {
        isMainButtonDisabled = isMainButtonDisabled || 
                               !parsedData || parsedData.length === 0 || 
                               (dataForStep3.data.length === 0 && parsedData.length > 0 && (
                                getColumnIndex(filterSettings.dateColumnLetter) !== -1 ||
                                getColumnIndex(filterSettings.descriptionColumnLetter) !== -1 ||
                                getColumnIndex(filterSettings.amountColumnLetter) !== -1
                               )); // Disable if columns are mapped but result in no data
    } else if (step === 2) {
        isMainButtonDisabled = isMainButtonDisabled || !dataForStep3.data || dataForStep3.data.length === 0;
    }


    return (
        <Container maxW="container.lg" pt={6} pb={8}>
            <Flex
                minH="60px" bg="rgba(249, 249, 244, 0.85)" backdropFilter="auto" backdropBlur="8px"
                mb={6} p={4} borderRadius="md" position="sticky" top={0} zIndex="sticky"
                borderBottomWidth="1px" borderColor="gray.200"
            >
                <Steps.Root step={step} count={items.length} width={{ base: "100%", md: "50%" }} mb={{ base: 4, md: 0 }}>
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
                <Flex gap={2} width={{ base: "100%", md: "auto"}} justifyContent={{ base: "space-between", md: "flex-end"}}>
                    <Button size="sm" colorScheme="gray" variant="outline" rounded="sm" minW="80px" onClick={prevStep} disabled={isFirstStep || isLoading}>
                        Prev
                    </Button>
                    <Button
                        size="sm" colorScheme="cyan" variant="solid" rounded="sm" minW="80px"
                        onClick={mainButtonAction}
                        disabled={isMainButtonDisabled}
                        isLoading={isLoading && isFirstStep}
                        loadingText="Parsing"
                    >
                        {mainButtonLabel}
                    </Button>
                </Flex>
            </Flex>

            {parsingError && (
                 <Alert.Root status="error">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Title>{parsingError}</Alert.Title>
                    </Alert.Content>
                    <CloseButton pos="relative" top="-2" insetEnd="-2" onClick={() => setParsingError(null)} />
                </Alert.Root>
            )}

            <Box>
                {step === 0 && (
                    <ImportTransactionsStep1 items={items} step={step} fileUpload={fileUpload} isLoading={isLoading} />
                )}
                {step === 1 && (
                    <ImportTransactionsStep2
                        items={items} step={step} parsedData={parsedData} csvHeaders={csvHeaders}
                        fileName={fileUpload.acceptedFiles[0]?.name}
                        filterSettings={filterSettings} setFilterSettings={setFilterSettings}
                        maxPreviewRowsInTable={MAX_PREVIEW_ROWS_IN_STEP2_TABLE}
                    />
                )}
                {step === 2 && (
                    <ImportTransactionsStep3
                        items={items} step={step}
                        reviewData={dataForStep3.data} reviewHeaders={dataForStep3.headers}
                    />
                )}
            </Box>

            <ConfirmImportDialog
                isOpen={isConfirmDialogOpen}
                onClose={() => setIsConfirmDialogOpen(false)}
                onImport={performImport}
                dataToImport={dataForStep3.data}
                headers={dataForStep3.headers}
            />
        </Container>
    );
}