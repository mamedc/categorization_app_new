// src/components/import/ImportTransactionsStep2.jsx
import {
    Stack, Text, Box, Table, Alert, Badge, Code, Field, VStack, HStack, Input,
} from "@chakra-ui/react";
import { useState, useEffect, useMemo } from "react"; // Added useEffect and useMemo

// Helper function remains the same
const getColumnLetter = (index) => {
    return String.fromCharCode(65 + index);
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
    }, [parsedData]); // MAX_PREVIEW_ROWS is const, so not strictly needed in deps

    const numDisplayableRows = useMemo(() => {
        return dataToDisplay.length > 0 ? dataToDisplay.length : 1;
    }, [dataToDisplay]);

    const [firstRow, setFirstRow] = useState(1);
    // Initialize lastRow based on the actual number of rows that will be displayed.
    // useState initializer runs only once. useEffect below will sync if numDisplayableRows changes later.
    const [lastRow, setLastRow] = useState(() => {
        const initialData = Array.isArray(parsedData) ? parsedData.slice(0, MAX_PREVIEW_ROWS) : [];
        return initialData.length > 0 ? initialData.length : 1;
    });

    // Effect to synchronize firstRow/lastRow if numDisplayableRows changes
    useEffect(() => {
        setFirstRow(currentFirst => {
            const newFirst = Math.max(1, Math.min(currentFirst, numDisplayableRows));
            setLastRow(currentLast => {
                let newLast = Math.max(1, Math.min(currentLast, numDisplayableRows));
                if (newFirst > newLast) { // Ensure lastRow is not less than the newFirst
                    newLast = newFirst;
                }
                return newLast;
            });
            return newFirst;
        });
    }, [numDisplayableRows]);

    const handleCloseAlert = () => {
        console.log("Close alert clicked");
    };

    const headers = Array.isArray(csvHeaders) ? csvHeaders : [];
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        let numValue;
        if (value !== "") { // Parse only if not empty to distinguish from 0
            numValue = parseInt(value, 10);
        }

        if (name === "first_row") {
            if (value === "") { // If input is cleared
                setFirstRow(1);
                // If lastRow was < 1 (not possible with current clamping), it would need adjustment.
                // No need for setLastRow here as the general (newFirst > lastRow) rule handles it.
                return;
            }
            if (!isNaN(numValue)) {
                let newFirst = Math.max(1, numValue);
                newFirst = Math.min(newFirst, numDisplayableRows);
                setFirstRow(newFirst);
                if (newFirst > lastRow) { // Use current state of lastRow for comparison
                    setLastRow(newFirst);
                }
            }
        } else if (name === "last_row") {
            if (value === "") { // If input is cleared
                setLastRow(numDisplayableRows);
                // If firstRow was > numDisplayableRows, it needs adjustment.
                // No need for setFirstRow here as general (newLast < firstRow) rule handles it.
                return;
            }
            if (!isNaN(numValue)) {
                let newLast = Math.min(numValue, numDisplayableRows);
                newLast = Math.max(1, newLast);
                setLastRow(newLast);
                if (newLast < firstRow) { // Use current state of firstRow for comparison
                    setFirstRow(newLast);
                }
            }
        } else {
            // Handle other form fields (date_format, date_column, etc.)
            // console.log(`Unhandled field: ${name}, value: ${value}`);
        }
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
                <Box borderWidth="1px" borderRadius="md" p={4} bg="white">
                    <VStack gap="10" width="full">
                        {/* Rows range */}
                        <VStack gap="2" width="full" alignItems="left">
                            <Text fontSize="sm" color="black" fontWeight="semibold">Rows range (for preview):</Text>
                            <Field.Root required>
                                <Field.Label>First row</Field.Label>
                                <Input 
                                    placeholder="1"
                                    value={firstRow} // Controlled component
                                    name="first_row"
                                    type="number"
                                    variant="outline" 
                                    onChange={handleChange}
                                    size="sm"
                                />
                            </Field.Root>
                            <Field.Root required>
                                <Field.Label>Last row</Field.Label>
                                <Input 
                                    placeholder={numDisplayableRows.toString()} 
                                    value={lastRow} // Controlled component
                                    name="last_row" 
                                    type="number"
                                    variant="outline" 
                                    onChange={handleChange}
                                    size="sm"
                                />
                            </Field.Root>
                        </VStack>

                        {/* Date format */}
                        <Field.Root required>
                            <Field.Label>Date format:</Field.Label>
                            <Input
                                placeholder="DD/MM/YYYY"
                                defaultValue={"DD/MM/YYYY"} // Using defaultValue if not fully controlled
                                name="date_format"
                                type="string"
                                onChange={handleChange} // Add to generic handleChange or make specific
                                size="sm"
                            />
                        </Field.Root> 

                        {/* Columns mapping */}
                        <VStack gap="2" width="full" alignItems="left">
                            <Text fontSize="sm" color="black" fontWeight="semibold">Columns mapping:</Text>
                            <Field.Root required>
                                <Field.Label>Date</Field.Label>
                                <Input 
                                    defaultValue={"A"}
                                    name="date_column"
                                    type="string"
                                    variant="outline" 
                                    onChange={handleChange}
                                    size="sm"
                                />
                            </Field.Root>
                            <Field.Root required>
                                <Field.Label>Description</Field.Label>
                                <Input 
                                    defaultValue={"C"}
                                    name="descr_column" 
                                    type="string"
                                    variant="outline" 
                                    onChange={handleChange}
                                    size="sm"
                                />
                            </Field.Root>
                            <Field.Root required>
                                <Field.Label>Amount</Field.Label>
                                <Input 
                                    defaultValue={"E"}
                                    name="amount_column" 
                                    type="string"
                                    variant="outline" 
                                    onChange={handleChange}
                                    size="sm"
                                />
                            </Field.Root>
                        </VStack>
                    </VStack>   
                </Box>
            
                {/* Data Preview Section */}
                {/* <Box borderWidth="1px" borderRadius="md" p={4} bg="white" flex="1" minWidth="0"> */}
                    {(!dataToDisplay || dataToDisplay.length === 0) ? (
                        <Alert status="warning" borderRadius="md">
                        No data found in the file or parsing failed.
                        </Alert>
                    ) : (
                        <>
                            {/* Table Preview */}
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
                                                width="60px" // Adjusted width for potentially larger row numbers
                                                minWidth="60px"
                                                textAlign="center" fontWeight="medium" color="gray.600"
                                                borderBottomWidth="1px" borderColor="inherit" fontSize="xs"
                                            >
                                            </Table.ColumnHeader>
                                            {headers.map((_, index) => (
                                                <Table.ColumnHeader
                                                    key={`letter-${index}`}
                                                    textAlign="left" fontWeight="medium" color="gray.600"
                                                    borderBottomWidth="1px" borderColor="inherit" py={1} fontSize="xs"
                                                >
                                                    {getColumnLetter(index)}
                                                </Table.ColumnHeader>
                                            ))}
                                        </Table.Row>
                                        <Table.Row bg="gray.400">
                                            <Table.ColumnHeader
                                                key="corner-header"
                                                width="60px" minWidth="60px" textAlign="center" fontSize="xs"
                                            >
                                            </Table.ColumnHeader>
                                            {headers.map((header) => (
                                                <Table.ColumnHeader
                                                    key={header}
                                                    whiteSpace="normal" wordBreak="break-word" fontWeight="semibold" fontSize="xs"
                                                >
                                                    {header}
                                                </Table.ColumnHeader>
                                            ))}
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {dataToDisplay.map((row, rowIndex) => {
                                            const currentRowNumber = rowIndex + 1;
                                            const isInRange = currentRowNumber >= firstRow && currentRowNumber <= lastRow;

                                            const tableRowProps = isInRange ? { bg: "yellow.100" } : { opacity: 0.5 };
                                            
                                            let rowNumberCellSpecificProps = {};
                                            if (isInRange) {
                                                rowNumberCellSpecificProps = {
                                                    bg: "blue.600",
                                                    color: "white",
                                                    fontWeight: "bold",
                                                };
                                            }
                                            // Else, default styles from JSX for row number cell will apply,
                                            // and will be affected by Table.Row's opacity if not in range.

                                            return (
                                                <Table.Row key={`row-${rowIndex}`} {...tableRowProps}>
                                                    {/* Row Number Cell */}
                                                    <Table.Cell
                                                        key={`rownum-${rowIndex}`}
                                                        textAlign="center"
                                                        fontWeight="medium" // Default, overridden by specificProps if in range
                                                        color="white"       // Default, overridden by specificProps if in range
                                                        bg="gray.500"       // Default, overridden by specificProps if in range
                                                        {...rowNumberCellSpecificProps} // Apply conditional styles
                                                        width="60px"
                                                        minWidth="60px"
                                                        py={2}
                                                        borderRightWidth="1px"
                                                        borderColor="inherit"
                                                        fontSize="xs"
                                                    >
                                                        {rowIndex + 1}
                                                    </Table.Cell>
                                                    {/* Data Cells */}
                                                    {headers.map((header) => (
                                                        <Table.Cell
                                                            key={`${header}-${rowIndex}`}
                                                            whiteSpace="normal"
                                                            wordBreak="break-word"
                                                            py={2}
                                                            fontSize="xs"
                                                        >
                                                            {row[header] !== undefined && row[header] !== null ? String(row[header]) : ''}
                                                        </Table.Cell>
                                                    ))}
                                                </Table.Row>
                                            );
                                        })}
                                    </Table.Body>
                                </Table.Root>
                            </Table.ScrollArea>
                        </>
                    )}
                {/* </Box> */}
            </Stack>
        </Stack>
    );
}