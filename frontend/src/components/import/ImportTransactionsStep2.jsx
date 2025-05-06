// src/components/import/ImportTransactionsStep2.jsx
import {
    Stack, Text, Box, Table, Alert, Badge, Code, Field, VStack, HStack, Input,
} from "@chakra-ui/react";
import { useState } from "react"

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
    const [firstRow, setFirstRow] = useState(1);
    const [lastRow, setLastRow] = useState(parsedData.length);


    const handleCloseAlert = () => {
        console.log("Close alert clicked");
    };

    const headers = Array.isArray(csvHeaders) ? csvHeaders : [];
    const dataToDisplay = Array.isArray(parsedData) ? parsedData.slice(0, MAX_PREVIEW_ROWS) : [];
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(name, value);
        //setFormData({ ...formData, [name]: value });
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
                 </Text>
            )}
            {/* Found columns/rows text */}
            <Text mb={4} fontSize="sm" color="gray.700" textAlign="center">
                Found <Badge colorScheme="green">{headers.length}</Badge> columns
                and <Badge colorScheme="blue">{parsedData.length}</Badge> data rows.
            </Text>

            <Stack direction="row" spacing={6}>

                {/* Import setup */}
                <Box borderWidth="1px" borderRadius="md" p={4} bg="white">

                    <VStack gap="10" width="full">
                        
                        {/* Rows range */}
                        <VStack gap="2" width="full" alignItems="left">
                            <Text fontSize="sm" color="black" fontWeight="semibold">Rows range:</Text>
                            <Field.Root required>
                                <Field.Label>First row</Field.Label>
                                <Input 
                                    //placeholder="1"
                                    value={firstRow}
                                    name="first_row"
                                    type="number"
                                    variant="outline" 
                                    onChange={handleChange}
                                />
                            </Field.Root>
                            <Field.Root required>
                                <Field.Label>Last row</Field.Label>
                                <Input 
                                    //placeholder={parsedData.length} 
                                    value={lastRow}
                                    name="last_row" 
                                    type="number"
                                    variant="outline" 
                                    onChange={handleChange}
                                />
                            </Field.Root>
                        </VStack>

                        {/* Date format */}
                        <Field.Root required>
                            <Field.Label>Date format:</Field.Label>
                            <Input
                                placeholder="DD/MM/YYYY"
                                value={"DD/MM/YYYY"}
                                name="date_format"
                                type="string"
                                //value={formData.date}
                                onChange={handleChange}
                                //disabled={isSaving}
                            />
                        </Field.Root> 

                        {/* Columns mapping */}
                        <VStack gap="2" width="full" alignItems="left">
                            <Text fontSize="sm" color="black" fontWeight="semibold">Columns mapping:</Text>
                            <Field.Root required>
                                <Field.Label>Date</Field.Label>
                                <Input 
                                    //placeholder="1"
                                    value={"A"}
                                    name="date_column"
                                    type="string"
                                    variant="outline" 
                                    onChange={handleChange}
                                />
                            </Field.Root>
                            <Field.Root required>
                                <Field.Label>Description</Field.Label>
                                <Input 
                                    //placeholder={parsedData.length} 
                                    value={"C"}
                                    name="descr_column" 
                                    type="string"
                                    variant="outline" 
                                    onChange={handleChange}
                                />
                            </Field.Root>
                            <Field.Root required>
                                <Field.Label>Amount</Field.Label>
                                <Input 
                                    //placeholder={parsedData.length} 
                                    value={"E"}
                                    name="amount_column" 
                                    type="string"
                                    variant="outline" 
                                    onChange={handleChange}
                                />
                            </Field.Root>
                        </VStack>

                    </VStack>   

                </Box>
            
                {/* Data Preview Section */}
                <Box borderWidth="1px" borderRadius="md" p={4} bg="white">

                    {(!dataToDisplay || dataToDisplay.length === 0) ? (
                        <Alert status="warning" borderRadius="md">
                        No data found in the file or parsing failed.
                        </Alert>
                    ) : (
                        <>
                            {/* Table Preview */}
                            <Table.ScrollArea borderWidth="1px" rounded="md" height="525px">
                                <Table.Root
                                    size={"sm"}
                                    variant={"line"}
                                    __css={{ tableLayout: 'fixed', width: '100%' }}
                                    stickyHeader
                                >
                                    {/* --- HEADER SECTION --- */}
                                    {/* REMOVE manual sx sticky styles */}
                                    <Table.Header /* sx={{ zIndex: 1 }} // Add this ONLY if content scrolls OVER the header */ >

                                        {/* Row for Column Letters (A, B, C...) */}
                                        {/* KEEP background ON THE ROW */}
                                        <Table.Row bg="gray.200">
                                            {/* Empty Top-Left Corner Cell */}
                                            <Table.ColumnHeader
                                                key="corner-letter"
                                                width="50px"
                                                minWidth="50px"
                                                textAlign="center"
                                                fontWeight="medium"
                                                color="gray.600"
                                                borderBottomWidth="1px"
                                                borderColor="inherit"
                                                // sx={{ position: 'sticky', left: 0, zIndex: 2 }} // If making first col sticky
                                            >
                                                {/* Empty */}
                                            </Table.ColumnHeader>

                                            {/* Letter Headers */}
                                            {headers.map((_, index) => (
                                                <Table.ColumnHeader
                                                    key={`letter-${index}`}
                                                    textAlign="left"
                                                    fontWeight="medium"
                                                    color="gray.600"
                                                    borderBottomWidth="1px"
                                                    borderColor="inherit"
                                                    py={1}
                                                >
                                                    {getColumnLetter(index)}
                                                </Table.ColumnHeader>
                                            ))}
                                        </Table.Row>

                                        {/* Row for Actual CSV Headers */}
                                        {/* KEEP background ON THE ROW */}
                                        <Table.Row bg="gray.400">
                                            {/* Empty Cell above Row Numbers */}
                                            <Table.ColumnHeader
                                                key="corner-header"
                                                width="50px"
                                                minWidth="50px"
                                                textAlign="center"
                                                // sx={{ position: 'sticky', left: 0, zIndex: 2 }} // If making first col sticky
                                            >
                                                {/* Empty */}
                                            </Table.ColumnHeader>

                                            {/* CSV Headers */}
                                            {headers.map((header) => (
                                                <Table.ColumnHeader
                                                    key={header}
                                                    whiteSpace="normal"
                                                    wordBreak="break-word"
                                                    fontWeight="semibold"
                                                >
                                                    {header}
                                                </Table.ColumnHeader>
                                            ))}
                                        </Table.Row>
                                    </Table.Header>
                                    {/* --- END HEADER SECTION --- */}


                                    {/* --- BODY SECTION --- */}
                                    <Table.Body>
                                        {dataToDisplay.map((row, rowIndex) => (
                                            <Table.Row key={`row-${rowIndex}`}>
                                                {/* Row Number Cell */}
                                                <Table.Cell
                                                    key={`rownum-${rowIndex}`}
                                                    textAlign="center"
                                                    fontWeight="medium"
                                                    color="white"
                                                    bg="gray.500"
                                                    width="50px"
                                                    minWidth="50px"
                                                    py={2}
                                                    borderRightWidth="1px"
                                                    borderColor="inherit"
                                                    // sx={{ position: 'sticky', left: 0, zIndex: 0 }} // If making first col sticky
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
                                                    >
                                                        {row[header] !== undefined && row[header] !== null ? String(row[header]) : ''}
                                                    </Table.Cell>
                                                ))}
                                            </Table.Row>
                                        ))}
                                    </Table.Body>
                                    {/* --- END BODY SECTION --- */}
                                </Table.Root>
                            </Table.ScrollArea>
                        </>
                    )}
                </Box>
            </Stack>
        </Stack>
    );
}