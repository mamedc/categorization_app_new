// .\frontend\src\components\import\ImportTransactionsStep1.jsx

import { Stack, Text, Flex, Button, Box, FileUpload } from "@chakra-ui/react";
import { HiUpload } from "react-icons/hi";

export default function ImportTransactionsStep1({
    items,
    step,
    fileUpload, // Receive the hook instance as a prop
    isLoading // Receive loading state (optional)
}) {
    return (
        <Stack direction="column" spacing={6} gap={4} mt={"50px"}>
            <Text fontSize="md" fontWeight="semibold" textAlign="center">
                {items[step].title}: {items[step].description}
            </Text>

            <Stack direction={{ base: "column", md: "row" }} spacing={4}> {/* Responsive direction */}

                {/* File selection area */}
                <Stack
                    spacing={4}
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    bg="white"
                    borderColor="gray.200"
                    flex={1} // Allow this stack to grow
                >
                    <FileUpload.RootProvider value={fileUpload}>
                        <FileUpload.HiddenInput />
                        <Flex direction="row" align="center" h={"60px"} gap="30px" mx="auto">
                            
                            {/* Disable button while parent is parsing */}
                            <FileUpload.Trigger asChild disabled={isLoading}>
                                <Button variant="solid" colorScheme="cyan" size="xs" >
                                    <HiUpload style={{ marginRight: '8px' }} /> Select CSV File
                                </Button>
                            </FileUpload.Trigger>
                            
                            {/* Display selected/rejected files */}
                            <FileUpload.ItemGroup mt={2}>
                                {fileUpload.acceptedFiles.map((file) => (
                                     <FileUpload.Item key={file.name} file={file}>
                                        <FileUpload.ItemPreview  size="xs" />
                                        <FileUpload.ItemName  size="xs"/>
                                        <FileUpload.ItemSizeText  size="xs"/>
                                        <FileUpload.ItemDeleteTrigger  size="xs"/>
                                    </FileUpload.Item>
                                ))}
                                {fileUpload.rejectedFiles.map((rejectedFile) => (
                                     <Box key={rejectedFile.file.name} color="red.500" fontSize="sm">
                                         Rejected: {rejectedFile.file.name} ({rejectedFile.reason})
                                     </Box>
                                ))}
                            </FileUpload.ItemGroup>
                        
                        </Flex>
                    </FileUpload.RootProvider>
                </Stack>

                {/* Placeholder for "Previous Imports" - styled slightly better */}
                {/* <Box
                    bg="gray.50" // Lighter background
                    width={{ base: "100%", md: "auto"}} // Responsive width
                    minW={{ md: "300px"}} // Minimum width on larger screens
                    p={4}
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor="gray.200"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Text color="gray.500" fontWeight="medium">PREVIOUS IMPORTS AREA</Text>
                </Box> */}

            </Stack>
        </Stack>
    );
}