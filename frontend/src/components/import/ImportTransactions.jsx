// File path: C:\Users\mamed\Meu Drive\Code\categorization_app_new\frontend\src\components\import\ImportTransactions.jsx
// src/components/import/ImportTransactions.jsx

import { useState, useEffect, useCallback, useMemo } from "react";
import {
    Container, Flex, Button, Text, Box, Spacer, Steps, Code, Stack,
    useFileUpload, Alert, CloseButton, Dialog, Portal,  // Added useToast for performImport
} from "@chakra-ui/react";
import { HiUpload } from "react-icons/hi";
import Papa from 'papaparse';

import ImportTransactionsStep1 from "./ImportTransactionsStep1";
import ImportTransactionsStep2 from "./ImportTransactionsStep2";
import ImportTransactionsStep3 from "./ImportTransactionsStep3";
import ConfirmImportDialog from "./ConfirmImportDialog";

// Define the base URL for the API.
// For development, if your frontend and backend are on different ports,
// you'll need the full URL to your backend.
// If you have a proxy setup (e.g., in package.json for CRA, or vite.config.js for Vite),
// you might be able to use a relative path like '/api'.
// The 404 error from before suggests a direct URL or correct proxy is needed.
const API_BASE_URL = 'http://localhost:5000'; // Adjusted from process.env for immediate fix

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

const parseDateToYYYYMMDD = (dateString, format) => {
    if (!dateString || !format) return dateString;
    try {
        const F = format.toUpperCase();
        const D = String(dateString);
        let day, month, year;

        if (F === "DD/MM/YYYY") { [day, month, year] = D.split('/'); }
        else if (F === "MM/DD/YYYY") { [month, day, year] = D.split('/'); }
        else if (F === "YYYY-MM-DD") { [year, month, day] = D.split('-'); }
        else if (F === "DD-MM-YYYY") { [day, month, year] = D.split('-'); }
        else if (F === "MM-DD-YYYY") { [month, day, year] = D.split('-'); }
        else {
            const parsed = new Date(D);
            if (!isNaN(parsed.getTime())) {
                year = parsed.getFullYear(); month = parsed.getMonth() + 1; day = parsed.getDate();
            } else { return dateString; }
        }
        if (day && month && year && String(year).length === 4) {
             return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
    } catch (e) {
        console.warn(`Failed to parse date string "${dateString}" with format "${format}"`, e);
    }
    return dateString;
};

const standardizeAmountString = (rawValue) => {
    let amountStr = String(rawValue || "0").replace(/\s/g, '');
    const lastComma = amountStr.lastIndexOf(',');
    const lastDot = amountStr.lastIndexOf('.');

    if (lastComma > -1 && lastDot > -1) {
        if (lastComma > lastDot) {
            amountStr = amountStr.replace(/\./g, '').replace(',', '.');
        } else {
            amountStr = amountStr.replace(/,/g, '');
        }
    } else if (lastComma > -1) {
        amountStr = amountStr.replace(',', '.');
    }
    return amountStr.replace(/[^0-9.-]/g, '');
};


const MAX_PREVIEW_ROWS_IN_STEP2_TABLE = 1000;

export default function ImportTransactions({ }) {
    const [step, setStep] = useState(0);
    const [validFile, setValidFile] = useState(false);
    const [parsedData, setParsedData] = useState([]);
    const [csvHeaders, setCsvHeaders] = useState([]);
    const [parsingError, setParsingError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    //const toast = useToast(); // Initialize toast

    const [filterSettings, setFilterSettings] = useState({
        firstRow: 1,
        lastRow: 1,
        dateColumnLetter: "A",
        descriptionColumnLetter: "C",
        amountColumnLetter: "F",
        dateFormat: "DD/MM/YYYY",
    });

    const [duplicateFlags, setDuplicateFlags] = useState([]);
    const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);

    const isFirstStep = step === 0;

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
            setDuplicateFlags([]);
            setFilterSettings({
                firstRow: 1,
                lastRow: 1,
                dateColumnLetter: "A",
                descriptionColumnLetter: "C",
                amountColumnLetter: "F",
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
            setValidFile(false); setParsedData([]); setCsvHeaders([]); setParsingError(null); setDuplicateFlags([]); return;
        }
        const isValidType = file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv');
        if (!isValidType) {
            setParsingError('Invalid file type. Please upload a CSV file.');
            setValidFile(false); setParsedData([]); setCsvHeaders([]); setDuplicateFlags([]); return;
        }
        setIsLoading(true); setParsingError(null); setDuplicateFlags([]);
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

    const intermediateDataForReview = useMemo(() => {
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
        
        const finalHeaders = step3HeadersConfig.map(config => config.standardHeader);
        if (finalHeaders.length === 0 && (dateColIdx !== -1 || descColIdx !== -1 || amountColIdx !== -1)) {
            return { data: [], headers: ["Date", "Description", "Amount"] }; 
        }
        if (finalHeaders.length === 0) {
             return { data: [], headers: ["Date", "Description", "Amount"] };
        }

        const transformedData = rowFilteredData.map(originalRow => {
            const newRow = {};
            step3HeadersConfig.forEach(config => {
                const rawValue = originalRow[config.originalHeader];
                let processedValue = rawValue !== undefined && rawValue !== null ? String(rawValue) : '';
                
                if (config.standardHeader === "Date") {
                    newRow[config.standardHeader] = parseDateToYYYYMMDD(processedValue, filterSettings.dateFormat);
                } else if (config.standardHeader === "Amount") {
                    newRow[config.standardHeader] = standardizeAmountString(processedValue);
                }
                else {
                    newRow[config.standardHeader] = processedValue;
                }
            });
            return newRow;
        });
        
        return { data: transformedData, headers: finalHeaders };
    }, [parsedData, csvHeaders, filterSettings]);

    useEffect(() => {
        const checkDataForDuplicates = async () => {
            if (intermediateDataForReview.data && intermediateDataForReview.data.length > 0) {
                setIsCheckingDuplicates(true);
                setParsingError(null); 
                try {
                    const payload = intermediateDataForReview.data.map(row => ({
                        Date: row.Date, 
                        Amount: row.Amount,
                        Description: row.Description || ""
                    }));
                    
                    const response = await fetch(`${API_BASE_URL}/api/transactions/check-duplicates-bulk`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (!response.ok) {
                        let errorDetailMessage = `Server error: ${response.status} ${response.statusText}`;
                        try {
                            const errorData = await response.json(); // This might fail if response is not JSON (e.g. HTML 404 page)
                            errorDetailMessage = errorData.error || errorData.message || JSON.stringify(errorData);
                        } catch (jsonError) {
                            // If parsing as JSON failed, try to get the response as text
                            try {
                                const textError = await response.text();
                                if (textError) { errorDetailMessage = textError; } // Use text if available
                            } catch (textParseError) {
                                // Log both errors if text parsing also fails
                                console.error("Failed to parse error response as JSON or text", jsonError, textParseError);
                            }
                        }
                        console.error("Duplicate check API error:", response.status, errorDetailMessage);
                        const displayError = errorDetailMessage.length > 200 ? errorDetailMessage.substring(0, 200) + "..." : errorDetailMessage;
                        setParsingError(`Duplicate check failed: ${displayError}`);
                        setDuplicateFlags(new Array(intermediateDataForReview.data.length).fill(false)); 
                        return;
                    }
                    const results = await response.json();
                    setDuplicateFlags(results);
                } catch (error) {
                    console.error("Error checking duplicates:", error);
                    setParsingError(`Client-side error occurred while checking for duplicates: ${error.message}`);
                    setDuplicateFlags(new Array(intermediateDataForReview.data.length).fill(false));
                } finally {
                    setIsCheckingDuplicates(false);
                }
            } else {
                setDuplicateFlags([]);
            }
        };

        if (step >= 1) {
             checkDataForDuplicates();
        } else {
            setDuplicateFlags([]);
        }
    }, [intermediateDataForReview.data, step]);

    const dataForStep3 = useMemo(() => {
        const augmentedData = intermediateDataForReview.data.map((row, index) => ({
            ...row,
            isDuplicate: duplicateFlags[index] !== undefined ? duplicateFlags[index] : false,
        }));
        
        const baseHeaders = intermediateDataForReview.headers;
        const augmentedHeaders = baseHeaders.length > 0 
            ? [...baseHeaders, "Duplicated"] 
            : (parsedData.length > 0 ? ["Date", "Description", "Amount", "Duplicated"] : []);

        return {
            data: augmentedData,
            headers: augmentedHeaders
        };
    }, [intermediateDataForReview, duplicateFlags, parsedData]);


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

    const performImport = async () => {
        const transactionsToImport = dataForStep3.data.filter(tx => !tx.isDuplicate);
        if (transactionsToImport.length === 0) {
            console.log("All transactions to import are duplicates or there's no data.")
            // toast({ 
            //     title: "No New Transactions", 
            //     description: "All transactions to import are duplicates or there's no data.",
            //     status: "warning",
            //     duration: 5000,
            //     isClosable: true,
            // });
            setIsConfirmDialogOpen(false);
            return;
        }

        setIsLoading(true); // Use general isLoading for import process
        let successCount = 0;
        let errorCount = 0;

        for (const tx of transactionsToImport) {
            try {
                const payload = {
                    date: tx.Date, // Assumes YYYY-MM-DD from parseDateToYYYYMMDD
                    amount: tx.Amount, // Assumes standardized string "xxxx.xx"
                    description: tx.Description,
                    // tag_ids: [] // Add tag_ids if you implement tagging at import
                };
                const response = await fetch(`${API_BASE_URL}/api/transactions/new`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (response.ok) {
                    successCount++;
                } else {
                    errorCount++;
                    const errorData = await response.json();
                    console.error(`Failed to import transaction: ${tx.Description}`, errorData.error);
                    // Optionally show a toast for each error or a summary
                }
            } catch (e) {
                errorCount++;
                console.error(`Client error importing transaction: ${tx.Description}`, e);
            }
        }
        setIsLoading(false);
        setIsConfirmDialogOpen(false);

        if (successCount > 0) {
            console.log(`${successCount} new records imported. ${errorCount > 0 ? `${errorCount} failed.` : ''}`)
            // toast({
            //     title: "Import Complete",
            //     description: `${successCount} new records imported. ${errorCount > 0 ? `${errorCount} failed.` : ''}`,
            //     status: errorCount > 0 ? "warning" : "success",
            //     duration: 5000,
            //     isClosable: true,
            // });
            
        } else if (errorCount > 0) {
            console.log(`All ${errorCount} selected new transactions failed to import. Check console for details.`)
            //  toast({
            //     title: "Import Failed",
            //     description: `All ${errorCount} selected new transactions failed to import. Check console for details.`,
            //     status: "error",
            //     duration: 5000,
            //     isClosable: true,
            // });
        }
        // Optionally reset after import:
        // setStep(0); fileUpload.removeFile(fileUpload.acceptedFiles[0]); setParsedData([]); setCsvHeaders([]); setValidFile(false); setDuplicateFlags([]);
    };

    const mainButtonAction = step === 2 ? handleProceedToImport : advanceToNextStep;
    const mainButtonLabel = step === 2 ? "Proceed to Import" : "Next";

    let isMainButtonDisabled = isLoading || (step >=1 && isCheckingDuplicates);

    if (step === 0) {
        isMainButtonDisabled = isMainButtonDisabled || !validFile;
    } else if (step === 1) {
        isMainButtonDisabled = isMainButtonDisabled || 
                               !intermediateDataForReview.data || 
                               (intermediateDataForReview.data.length === 0 && parsedData.length > 0 && (
                                getColumnIndex(filterSettings.dateColumnLetter) !== -1 ||
                                getColumnIndex(filterSettings.descriptionColumnLetter) !== -1 ||
                                getColumnIndex(filterSettings.amountColumnLetter) !== -1
                               )) || isCheckingDuplicates;
    } else if (step === 2) {
        const nonDuplicateCount = dataForStep3.data.filter(tx => !tx.isDuplicate).length;
        isMainButtonDisabled = isMainButtonDisabled || !dataForStep3.data || dataForStep3.data.length === 0 || nonDuplicateCount === 0 || isCheckingDuplicates;
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
                    <Button size="sm" colorScheme="gray" variant="outline" rounded="sm" minW="80px" onClick={prevStep} disabled={isFirstStep || isLoading || isCheckingDuplicates}>
                        Prev
                    </Button>
                    <Button
                        size="sm" colorScheme="cyan" variant="solid" rounded="sm" minW="80px"
                        onClick={mainButtonAction}
                        disabled={isMainButtonDisabled}
                        isLoading={(isLoading && (isFirstStep || step === 2)) || (isCheckingDuplicates && step >= 1)} // Show loading for actual import too
                        loadingText={
                            (isCheckingDuplicates && step >= 1) ? "Checking..." : 
                            (isLoading && step === 2) ? "Importing..." :
                            (isLoading && isFirstStep) ? "Parsing..." : 
                            mainButtonLabel
                        }
                    >
                        {mainButtonLabel}
                    </Button>
                </Flex>
            </Flex>

            {parsingError && (
                 <Alert.Root status="error" mb={4}>
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Title>{parsingError}</Alert.Title>
                    </Alert.Content>
                    <CloseButton pos="relative" top="-2" insetEnd="-2" onClick={() => setParsingError(null)} />
                </Alert.Root>
            )}

            <Box>
                {step === 0 && (
                    <ImportTransactionsStep1 items={items} step={step} fileUpload={fileUpload} isLoading={isLoading && isFirstStep} />
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
                        reviewData={dataForStep3.data}
                        reviewHeaders={dataForStep3.headers}
                    />
                )}
            </Box>

            <ConfirmImportDialog
                isOpen={isConfirmDialogOpen}
                onClose={() => setIsConfirmDialogOpen(false)}
                onImport={performImport}
                dataToImport={dataForStep3.data} 
                headers={dataForStep3.headers}
                isLoading={isLoading && step === 2} // Pass loading state to disable import button in dialog
            />
        </Container>
    );
}