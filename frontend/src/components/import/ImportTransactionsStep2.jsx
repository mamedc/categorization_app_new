// File path: C:\Users\mamed\Meu Drive\Code\categorization_app_new\frontend\src\components\import\ImportTransactionsStep2.jsx
// src/components/import/ImportTransactionsStep2.jsx
import {
    Stack, Text, Box, Table, Alert, Badge, Code, Field, VStack, Input,
} from "@chakra-ui/react"; // Removed HStack as it's not directly used after changes
import { useEffect, useMemo } from "react"; // Removed useState

// Helper function to get column letter (A, B, C...)
const getColumnLetter = (index) => {
    return String.fromCharCode(65 + index);
};

// Helper function to get 0-based column index from letter
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

export default function ImportTransactionsStep2({
    items,
    step,
    parsedData,
    csvHeaders = [],
    fileName,
    filterSettings,       // Received from parent
    setFilterSettings,    // Received from parent
    maxPreviewRowsInTable // Max rows for this step's preview table
}) {

    // Data for this step's preview table (can be capped)
    const csvPreviewTableData = useMemo(() => {
        return Array.isArray(parsedData) ? parsedData.slice(0, maxPreviewRowsInTable) : [];
    }, [parsedData, maxPreviewRowsInTable]);

    // Total number of rows in the original parsed data
    const numParsedRows = useMemo(() => {
        return Array.isArray(parsedData) ? parsedData.length : 0;
    }, [parsedData]);


    // Destructure from filterSettings for easier use in inputs
    const { firstRow, lastRow, dateColumnLetter, descriptionColumnLetter, amountColumnLetter, dateFormat } = filterSettings;

    // Memoize selected column indices for highlighting in Step 2's preview
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

    // Effect to adjust firstRow/lastRow if they become invalid due to parsedData changes (e.g., new file uploaded)
    // This is now primarily handled in the parent, but a local check can be useful for immediate input feedback
    // However, parent's useEffect on parsedData should be the source of truth.
    // This local effect might be redundant if parent handles it well. For now, let's rely on parent.
    /*
    useEffect(() => {
        const newFirst = Math.max(1, Math.min(firstRow, numParsedRows || 1));
        let newLast = Math.max(1, Math.min(lastRow, numParsedRows || 1));
        if (newFirst > newLast) newLast = newFirst;

        if (newFirst !== firstRow || newLast !== lastRow) {
            setFilterSettings(prev => ({...prev, firstRow: newFirst, lastRow: newLast}));
        }
    }, [numParsedRows, firstRow, lastRow, setFilterSettings]);
    */


    const headers = Array.isArray(csvHeaders) ? csvHeaders : [];

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        let numValue;
        if (value !== "") {
            numValue = parseInt(value, 10);
        }

        const newSettings = { ...filterSettings };

        if (name === "first_row") {
            if (value === "") {
                newSettings.firstRow = 1;
            } else if (!isNaN(numValue)) {
                let newFirst = Math.max(1, numValue);
                newFirst = Math.min(newFirst, numParsedRows > 0 ? numParsedRows : 1);
                newSettings.firstRow = newFirst;
                if (newFirst > newSettings.lastRow) {
                    newSettings.lastRow = newFirst;
                }
            }
        } else if (name === "last_row") {
            if (value === "") {
                newSettings.lastRow = numParsedRows > 0 ? numParsedRows : 1;
            } else if (!isNaN(numValue)) {
                let newLast = Math.min(numValue, numParsedRows > 0 ? numParsedRows : 1);
                newLast = Math.max(1, newLast);
                newSettings.lastRow = newLast;
                if (newLast < newSettings.firstRow) {
                    newSettings.firstRow = newLast;
                }
            }
        } else if (name === "date_column") {
            newSettings.dateColumnLetter = value.toUpperCase();
        } else if (name === "descr_column") {
            newSettings.descriptionColumnLetter = value.toUpperCase();
        } else if (name === "amount_column") {
            newSettings.amountColumnLetter = value.toUpperCase();
        } else if (name === "date_format") {
            newSettings.dateFormat = value;
        }
        setFilterSettings(newSettings);
    };

    return (
        <Stack direction="column" spacing={6}>
            <Text fontSize="lg" fontWeight="semibold" textAlign="center">
                {items[step].title}: {items[step].description}
            </Text>

            {fileName && (
                 <Text fontSize="sm" color="gray.600" textAlign="center">
                    File: <Code>{fileName}</Code>
                    Found <Badge colorScheme="green">{headers.length}</Badge> columns
                    and <Badge colorScheme="blue">{numParsedRows}</Badge> data rows.
                    Displaying <Badge colorScheme="purple">{csvPreviewTableData.length}</Badge> rows in this preview.
                 </Text>
            )}
            <Stack direction={{base: "column", md: "row"}} spacing={6} height="570px"> {/* Changed to column for base */}
                <Box borderWidth="1px" borderRadius="md" p={4} bg="white" minWidth={{ base: "100%", md: "250px"}}>
                    <VStack gap="10" width="full">
                        <VStack gap="2" width="full" alignItems="left">
                            <Text fontSize="sm" color="black" fontWeight="semibold">Rows range to import:</Text>
                            <Field.Root>
                                <Field.Label>First row</Field.Label>
                                <Input 
                                    placeholder="1"
                                    value={firstRow} // From filterSettings
                                    name="first_row"
                                    type="number"
                                    variant="outline" 
                                    onChange={handleChange}
                                    size="sm"
                                    min={1}
                                    max={numParsedRows > 0 ? numParsedRows : 1}
                                />
                            </Field.Root>
                            <Field.Root>
                                <Field.Label>Last row</Field.Label>
                                <Input 
                                    placeholder={(numParsedRows > 0 ? numParsedRows : 1).toString()} 
                                    value={lastRow} // From filterSettings
                                    name="last_row" 
                                    type="number"
                                    variant="outline" 
                                    onChange={handleChange}
                                    size="sm"
                                    min={1}
                                    max={numParsedRows > 0 ? numParsedRows : 1}
                                />
                            </Field.Root>
                        </VStack>

                        <Field.Root width="full">
                            <Field.Label>Date format:</Field.Label>
                            <Input
                                placeholder="DD/MM/YYYY"
                                value={dateFormat} // From filterSettings
                                name="date_format"
                                type="string"
                                onChange={handleChange}
                                size="sm"
                            />
                        </Field.Root> 

                        <VStack gap="2" width="full" alignItems="left">
                            <Text fontSize="sm" color="black" fontWeight="semibold">Columns mapping:</Text>
                            <Field.Root>
                                <Field.Label>Date</Field.Label>
                                <Input 
                                    value={dateColumnLetter} // From filterSettings
                                    name="date_column"
                                    type="string"
                                    variant="outline" 
                                    onChange={handleChange}
                                    size="sm"
                                    maxLength={1}
                                    placeholder="A"
                                />
                            </Field.Root>
                            <Field.Root>
                                <Field.Label>Description</Field.Label>
                                <Input 
                                    value={descriptionColumnLetter} // From filterSettings
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
                                    value={amountColumnLetter} // From filterSettings
                                    name="amount_column" 
                                    type="string"
                                    variant="outline" 
                                    onChange={handleChange}
                                    size="sm"
                                    maxLength={1}
                                    placeholder="F"
                                />
                            </Field.Root>
                        </VStack>
                    </VStack>   
                </Box>
            
                {(!csvPreviewTableData || csvPreviewTableData.length === 0) ? (
                    <Alert status="warning" borderRadius="md" flex="1">
                    No data found in the file or parsing failed.
                    </Alert>
                ) : (
                    <Box flex="1" minWidth="0">
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
                                            key="corner-letter" width="60px" minWidth="60px" textAlign="center" fontWeight="medium" color="gray.500"
                                            borderBottomWidth="1px" borderColor="inherit" fontSize="xs"
                                        />
                                        {headers.map((_, colIndex) => {
                                            const isColSelected = selectedColumnIndices.has(colIndex);
                                            const letterHeaderProps = isColSelected 
                                                ? { bg: "blue.400", fontWeight: "bold", color: "white" } 
                                                : {};
                                            return (
                                                <Table.ColumnHeader
                                                    key={`letter-${colIndex}`} textAlign="left" fontWeight="medium" color="gray.600"
                                                    borderBottomWidth="1px" borderColor="inherit" py={1} fontSize="xs"
                                                    {...letterHeaderProps}
                                                >
                                                    {getColumnLetter(colIndex)}
                                                </Table.ColumnHeader>
                                            );
                                        })}
                                    </Table.Row>
                                    <Table.Row bg="gray.400">
                                        <Table.ColumnHeader key="corner-header" width="60px" minWidth="60px" textAlign="center" fontSize="xs" />
                                        {headers.map((header, colIndex) => {
                                            const isColSelected = selectedColumnIndices.has(colIndex);
                                            const actualHeaderProps = isColSelected 
                                                ? { bg: "blue.500", fontWeight: "bold", color: "white" } 
                                                : {};
                                            return (
                                                <Table.ColumnHeader
                                                    key={`${header}-${colIndex}`} whiteSpace="normal" wordBreak="break-word" fontWeight="semibold" fontSize="xs"
                                                    {...actualHeaderProps}
                                                >
                                                    {header}
                                                </Table.ColumnHeader>
                                            );
                                        })}
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {csvPreviewTableData.map((row, rowIndex) => { // Iterate over csvPreviewTableData
                                        const currentRowNumberInOriginalData = rowIndex + 1; // This is row number in the preview table
                                                                                            // To check against filterSettings, need original row index if parsedData was sliced
                                                                                            // For simplicity, this example highlights based on the preview table's rows matching the filter range.
                                                                                            // If filterSettings.firstRow refers to original data, logic needs adjustment.
                                                                                            // Assuming filterSettings.firstRow/lastRow are applied to the original parsedData by parent for Step 3.
                                                                                            // Here, we highlight rows in this preview table that fall within the global filter settings.
                                        
                                        const isRowInGlobalFilterRange = currentRowNumberInOriginalData >= firstRow && currentRowNumberInOriginalData <= lastRow;
                                        const tableRowProps = isRowInGlobalFilterRange ? { bg: "yellow.100" } : { opacity: 0.5 };
                                        
                                        let rowNumberCellSpecificProps = {};
                                        if (isRowInGlobalFilterRange) {
                                            rowNumberCellSpecificProps = { bg: "blue.500", color: "white", fontWeight: "bold" };
                                        }

                                        return (
                                            <Table.Row key={`row-${rowIndex}`} {...tableRowProps}>
                                                <Table.Cell
                                                    key={`rownum-${rowIndex}`} textAlign="center" fontWeight="medium" color="white"
                                                    bg="gray.500" {...rowNumberCellSpecificProps} width="60px" minWidth="60px" py={2}
                                                    borderRightWidth="1px" borderColor="inherit" fontSize="xs"
                                                >
                                                    {rowIndex + 1} {/* Display 1-based index of preview table */}
                                                </Table.Cell>
                                                {headers.map((header, colIndex) => {
                                                    const isColumnSelected = selectedColumnIndices.has(colIndex);
                                                    const cellSpecificProps = !isColumnSelected ? { opacity: 0.75, bg: "white" } : {}; 
                                                    
                                                    return (
                                                        <Table.Cell
                                                            key={`${header}-${rowIndex}-${colIndex}`} whiteSpace="normal" wordBreak="break-word"
                                                            py={2} fontSize="xs" {...cellSpecificProps}
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