// src/components/import/ImportTransactionsStep2.jsx
import {
    Stack, Text, Box, Table, Alert, Badge, Code, Field, VStack, HStack, Input,
} from "@chakra-ui/react";
import { useState, useEffect, useMemo } from "react";

// Helper function to get column letter (A, B, C...)
const getColumnLetter = (index) => {
    return String.fromCharCode(65 + index);
};

// Helper function to get 0-based column index from letter
const getColumnIndex = (letter) => {
    if (typeof letter !== 'string' || letter.trim().length === 0) {
        return -1; // Invalid input (empty or not a string)
    }
    const normalizedLetter = letter.trim().toUpperCase();
    if (normalizedLetter.length !== 1) { // Must be a single character after trim
      return -1;
    }
    const charCode = normalizedLetter.charCodeAt(0);
    if (charCode >= 65 && charCode <= 90) { // 'A' to 'Z'
        return charCode - 65;
    }
    return -1; // Not a valid letter A-Z
};

export default function ImportTransactionsStep2({
    items,
    step,
    parsedData,
    csvHeaders = [],
    fileName
}) {

    const MAX_PREVIEW_ROWS = 9999;

    const dataToDisplay = useMemo(() => {
        return Array.isArray(parsedData) ? parsedData.slice(0, MAX_PREVIEW_ROWS) : [];
    }, [parsedData]);

    const numDisplayableRows = useMemo(() => {
        return dataToDisplay.length > 0 ? dataToDisplay.length : 1;
    }, [dataToDisplay]);

    const [firstRow, setFirstRow] = useState(1);
    const [lastRow, setLastRow] = useState(() => {
        const initialData = Array.isArray(parsedData) ? parsedData.slice(0, MAX_PREVIEW_ROWS) : [];
        return initialData.length > 0 ? initialData.length : 1;
    });

    // State for column selections
    const [dateColumnLetter, setDateColumnLetter] = useState("A");
    const [descriptionColumnLetter, setDescriptionColumnLetter] = useState("C");
    const [amountColumnLetter, setAmountColumnLetter] = useState("E");

    // Memoize selected column indices
    const selectedColumnIndices = useMemo(() => {
        const indices = new Set();
        const dateIdx = getColumnIndex(dateColumnLetter);
        const descrIdx = getColumnIndex(descriptionColumnLetter);
        const amountIdx = getColumnIndex(amountColumnLetter);

        if (dateIdx !== -1) indices.add(dateIdx);
        if (descrIdx !== -1) indices.add(descrIdx);
        if (amountIdx !== -1) indices.add(amountIdx);
        
        return indices;
    }, [dateColumnLetter, descriptionColumnLetter, amountColumnLetter]);

    useEffect(() => {
        setFirstRow(currentFirst => {
            const newFirst = Math.max(1, Math.min(currentFirst, numDisplayableRows));
            setLastRow(currentLast => {
                let newLast = Math.max(1, Math.min(currentLast, numDisplayableRows));
                if (newFirst > newLast) {
                    newLast = newFirst;
                }
                return newLast;
            });
            return newFirst;
        });
    }, [numDisplayableRows]);

    // const handleCloseAlert = () => { // This function was present but not used
    //     console.log("Close alert clicked");
    // };

    const headers = Array.isArray(csvHeaders) ? csvHeaders : [];
    // const numColumns = headers.length; // Available if needed for validation

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        let numValue;
        if (value !== "") {
            numValue = parseInt(value, 10);
        }

        if (name === "first_row") {
            if (value === "") {
                setFirstRow(1);
                return;
            }
            if (!isNaN(numValue)) {
                let newFirst = Math.max(1, numValue);
                newFirst = Math.min(newFirst, numDisplayableRows);
                setFirstRow(newFirst);
                if (newFirst > lastRow) {
                    setLastRow(newFirst);
                }
            }
        } else if (name === "last_row") {
            if (value === "") {
                setLastRow(numDisplayableRows);
                return;
            }
            if (!isNaN(numValue)) {
                let newLast = Math.min(numValue, numDisplayableRows);
                newLast = Math.max(1, newLast);
                setLastRow(newLast);
                if (newLast < firstRow) {
                    setFirstRow(newLast);
                }
            }
        } else if (name === "date_column") {
            setDateColumnLetter(value.toUpperCase());
        } else if (name === "descr_column") {
            setDescriptionColumnLetter(value.toUpperCase());
        } else if (name === "amount_column") {
            setAmountColumnLetter(value.toUpperCase());
        }
        // else if (name === "date_format") {
        //     // Handle date_format if it becomes controlled state
        // }
    };

    return (
        <Stack direction="column" spacing={6}>

            {/* Title */}
            <Text fontSize="lg" fontWeight="semibold" textAlign="center">
                {items[step].title}: {items[step].description}
            </Text>

            {/* Filename */}
            {fileName && (
                 <Text fontSize="sm" color="gray.600" textAlign="center">
                    File: <Code>{fileName}</Code>
                    Found <Badge colorScheme="green">{headers.length}</Badge> columns
                    and <Badge colorScheme="blue">{parsedData.length}</Badge> data rows.
                    Displaying <Badge colorScheme="purple">{dataToDisplay.length}</Badge> preview rows.
                 </Text>
            )}
            <Stack direction="row" spacing={6} height="570px">

                {/* Import setup */}
                <Box borderWidth="1px" borderRadius="md" p={4} bg="white" minWidth="250px"> {/* Added minWidth for better layout */}
                    <VStack gap="10" width="full">
                        {/* Rows range */}
                        <VStack gap="2" width="full" alignItems="left">
                            <Text fontSize="sm" color="black" fontWeight="semibold">Rows range (for preview):</Text>
                            <Field.Root>
                                <Field.Label>First row</Field.Label>
                                <Input 
                                    placeholder="1"
                                    value={firstRow}
                                    name="first_row"
                                    type="number"
                                    variant="outline" 
                                    onChange={handleChange}
                                    size="sm"
                                />
                            </Field.Root>
                            <Field.Root>
                                <Field.Label>Last row</Field.Label>
                                <Input 
                                    placeholder={numDisplayableRows.toString()} 
                                    value={lastRow}
                                    name="last_row" 
                                    type="number"
                                    variant="outline" 
                                    onChange={handleChange}
                                    size="sm"
                                />
                            </Field.Root>
                        </VStack>

                        {/* Date format */}
                        <Field.Root>
                            <Field.Label>Date format:</Field.Label>
                            <Input
                                placeholder="DD/MM/YYYY"
                                defaultValue={"DD/MM/YYYY"}
                                name="date_format"
                                type="string"
                                onChange={handleChange}
                                size="sm"
                            />
                        </Field.Root> 

                        {/* Columns mapping */}
                        <VStack gap="2" width="full" alignItems="left">
                            <Text fontSize="sm" color="black" fontWeight="semibold">Columns mapping:</Text>
                            <Field.Root>
                                <Field.Label>Date</Field.Label>
                                <Input 
                                    value={dateColumnLetter}
                                    name="date_column"
                                    type="string"
                                    variant="outline" 
                                    onChange={handleChange}
                                    size="sm"
                                    maxLength={1} // Basic UX for single letter column
                                    placeholder="A"
                                />
                            </Field.Root>
                            <Field.Root>
                                <Field.Label>Description</Field.Label>
                                <Input 
                                    value={descriptionColumnLetter}
                                    name="descr_column" 
                                    type="string"
                                    variant="outline" 
                                    onChange={handleChange}
                                    size="sm"
                                    maxLength={1}
                                    placeholder="C"
                                />
                            </Field.Root>
                            <Field.Root>
                                <Field.Label>Amount</Field.Label>
                                <Input 
                                    value={amountColumnLetter}
                                    name="amount_column" 
                                    type="string"
                                    variant="outline" 
                                    onChange={handleChange}
                                    size="sm"
                                    maxLength={1}
                                    placeholder="E"
                                />
                            </Field.Root>
                        </VStack>
                    </VStack>   
                </Box>
            
                {/* Data Preview Section */}
                {(!dataToDisplay || dataToDisplay.length === 0) ? (
                    <Alert status="warning" borderRadius="md" flex="1"> {/* Added flex=1 for alert to take space */}
                    No data found in the file or parsing failed.
                    </Alert>
                ) : (
                    <Box flex="1" minWidth="0"> {/* Wrapper Box for Table Scroll Area */}
                        <Table.ScrollArea borderWidth="1px" rounded="md" height="570px">
                            <Table.Root
                                size={"sm"}
                                variant={"line"}
                                __css={{ tableLayout: 'fixed', width: '100%' }}
                                stickyHeader
                            >
                                <Table.Header>
                                    <Table.Row bg="gray.200">
                                        <Table.ColumnHeader
                                            key="corner-letter"
                                            width="60px"
                                            minWidth="60px"
                                            textAlign="center" fontWeight="medium" color="gray.500"
                                            borderBottomWidth="1px" borderColor="inherit" fontSize="xs"
                                        >
                                        </Table.ColumnHeader>
                                        {headers.map((_, colIndex) => {
                                            const isColSelected = selectedColumnIndices.has(colIndex);
                                            const letterHeaderProps = isColSelected 
                                                ? { bg: "blue.400", fontWeight: "bold", color: "white" } 
                                                : {};
                                            return (
                                                <Table.ColumnHeader
                                                    key={`letter-${colIndex}`}
                                                    textAlign="left" fontWeight="medium" color="gray.600"
                                                    borderBottomWidth="1px" borderColor="inherit" py={1} fontSize="xs"
                                                    {...letterHeaderProps}
                                                >
                                                    {getColumnLetter(colIndex)}
                                                </Table.ColumnHeader>
                                            );
                                        })}
                                    </Table.Row>
                                    <Table.Row bg="gray.400">
                                        <Table.ColumnHeader
                                            key="corner-header"
                                            width="60px" minWidth="60px" textAlign="center" fontSize="xs"
                                        >
                                        </Table.ColumnHeader>
                                        {headers.map((header, colIndex) => {
                                            const isColSelected = selectedColumnIndices.has(colIndex);
                                            const actualHeaderProps = isColSelected 
                                                ? { bg: "blue.500", fontWeight: "bold", color: "white" } 
                                                : {};
                                            return (
                                                <Table.ColumnHeader
                                                    key={`${header}-${colIndex}`} // Safer key
                                                    whiteSpace="normal" wordBreak="break-word" fontWeight="semibold" fontSize="xs"
                                                    {...actualHeaderProps}
                                                >
                                                    {header}
                                                </Table.ColumnHeader>
                                            );
                                        })}
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {dataToDisplay.map((row, rowIndex) => {
                                        const currentRowNumber = rowIndex + 1;
                                        const isRowInRange = currentRowNumber >= firstRow && currentRowNumber <= lastRow;

                                        const tableRowProps = isRowInRange ? { bg: "yellow.100" } : { opacity: 0.5 };
                                        
                                        let rowNumberCellSpecificProps = {};
                                        if (isRowInRange) {
                                            rowNumberCellSpecificProps = {
                                                bg: "blue.500",
                                                color: "white",
                                                fontWeight: "bold",
                                            };
                                        }

                                        return (
                                            <Table.Row key={`row-${rowIndex}`} {...tableRowProps}>
                                                <Table.Cell
                                                    key={`rownum-${rowIndex}`}
                                                    textAlign="center"
                                                    fontWeight="medium"
                                                    color="white"
                                                    bg="gray.500"
                                                    {...rowNumberCellSpecificProps}
                                                    width="60px"
                                                    minWidth="60px"
                                                    py={2}
                                                    borderRightWidth="1px"
                                                    borderColor="inherit"
                                                    fontSize="xs"
                                                >
                                                    {rowIndex + 1}
                                                </Table.Cell>
                                                {headers.map((header, colIndex) => {
                                                    const isColumnSelected = selectedColumnIndices.has(colIndex);
                                                    const cellSpecificProps = !isColumnSelected ? { opacity: 0.75, bg: "white" } : {}; 
                                                    
                                                    return (
                                                        <Table.Cell
                                                            key={`${header}-${rowIndex}-${colIndex}`} // More robust key
                                                            whiteSpace="normal"
                                                            wordBreak="break-word"
                                                            py={2}
                                                            fontSize="xs"
                                                            {...cellSpecificProps}
                                                        >
                                                            {row[header] !== undefined && row[header] !== null ? String(row[header]) : ''}
                                                        </Table.Cell>
                                                    );
                                                })}
                                            </Table.Row>
                                        );
                                    })}
                                </Table.Body>
                            </Table.Root>
                        </Table.ScrollArea>
                    </Box>
                )}
            </Stack>
        </Stack>
    );
}