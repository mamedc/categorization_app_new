// src/components/ui/ImportTransactions.jsx

import { useState, useCallback } from "react";
import { Container, Flex, Button, Text, Box, FileUpload, useFileUpload, Spacer, Steps, Code, Stack, useSteps } from "@chakra-ui/react";
import { LuArrowDown, LuArrowUp } from "react-icons/lu";
import { HiUpload } from "react-icons/hi"
// import TransactionGrid from "./TransactionGrid";


const items = [
  {
    title: "Step 1",
    description: "Step 1 description",
  },
  {
    title: "Step 2",
    description: "Step 2 description",
  },
  {
    title: "Step 3",
    description: "Step 3 description",
  },
]


export default function ImportTransactions({
}) {

    const [step, setStep] = useState(0)
    const [firstStep, setFirstStep] = useState(true)
    const [lastStep, setLastStep] = useState(false)

    const nextStep = () => {
        const updatedStep = step+1
        setStep(updatedStep);
        if (updatedStep+1 === items.length) {
            setLastStep(true)
        } else {
            setFirstStep(false)  
        }
    };
    const prevStep = () => {
        const updatedStep = step-1
        setStep(updatedStep);
        if (updatedStep+1 === 1) {
            setFirstStep(true)
        } else {
            setLastStep(false)    
        }
    };

    const fileUpload = useFileUpload({
        maxFiles: 1,
        maxFileSize: 5242880,
      })

    const accepted = fileUpload.acceptedFiles.map((file) => file.name)
    const rejected = fileUpload.rejectedFiles.map((e) => e.file.name)

    

    return (
        // Container provides max-width and padding
        <Container maxW="container.lg" pt={6} pb={8}>

            {/* Actions Bar - Made Sticky */}
            <Flex
                direction="row"
                align="center"
                justify="space-between"
                gap={4}
                wrap="wrap"
                minH="60px"
                bg="rgba(249, 249, 244, 0.85)" // Use page background to hide content scrolling under
                backdropFilter="auto"
                backdropBlur="8px"   
                mb={6}
                p={4}
                borderRadius="md"
                position="sticky" // <<< Make the actions bar sticky
                top={0}           // <<< Stick to the top of its scroll container
                zIndex="sticky"   // <<< Ensure it stays above scrolling content
                borderBottomWidth="1px" // Optional: Add subtle separator
                borderColor="gray.200" // Optional: Separator color
            >
                <Steps.Root
                    step={step}
                    // onStepChange={(e) => setStep(e.step)}
                    count={items.length}
                    width="300px"
                >
                    <Steps.List>
                        {items.map((step, index) => (
                            <Steps.Item key={index} index={index} title={step.title}>
                                <Steps.Indicator />
                                <Steps.Separator />
                            </Steps.Item>
                        ))}
                    </Steps.List>
                </Steps.Root>
                
                <Spacer />
                <Button 
                    size="sm" 
                    colorPalette="cyan" 
                    rounded="sm" 
                    width={20} 
                    onClick={prevStep}
                    disabled={firstStep}
                >
                        Prev
                    </Button>
                <Button 
                    size="sm" 
                    colorPalette="cyan" 
                    rounded="sm" 
                    width={20} 
                    onClick={nextStep} 
                    disabled={lastStep}
                >
                    Next
                </Button>
            
            </Flex>

            {/* Transaction Grid - Will scroll under the sticky Actions Bar 
            <TransactionGrid
                //transactions={transactions}
                //setTransactions={setTransactions}
                //selectedTransactionId={selectedTransactionId}
                //setSelectedTransactionId={setSelectedTransactionId}
                sortOrder={sortOrder}
            />*/}
            
            <Code>current step: {step+1}</Code>
            
            {step+1 === 1 && (
                <Flex
                    direction={'row'}
                    align={{ base: 'start', md: 'center' }}
                    gap={4}
                    wrap="wrap"
                    minH="60px"
                    bg="rgba(249, 249, 244, 0.85)" // Use page background to hide content scrolling under
                    backdropFilter="auto"
                    backdropBlur="8px"   
                    mb={6}
                    p={4}
                    borderRadius="md"
                    position="sticky" // <<< Make the actions bar sticky
                    top={0}           // <<< Stick to the top of its scroll container
                    zIndex="sticky"   // <<< Ensure it stays above scrolling content
                    borderBottomWidth="1px" // Optional: Add subtle separator
                    borderColor="gray.200" // Optional: Separator color
                >
                    {/* <Box  p="4" bg="White" width="200px" height="100%" borderWidth="1px" text-align="center"> */}
                    <Stack align="flex-start">
                        
                        <Code colorPalette="green">accepted: {accepted.join(", ")}</Code>
                        <Code colorPalette="red">rejected: {rejected.join(", ")}</Code>
                        {/* <Code colorPalette="blue">fileUpload: {fileUpload.acceptedFiles}</Code> */}

                        <FileUpload.RootProvider value={fileUpload}>
                            <FileUpload.HiddenInput />
                            <FileUpload.Trigger asChild>
                                <Button variant="solid" colorPalette="cyan" size="sm">
                                <HiUpload /> Upload file
                                </Button>
                            </FileUpload.Trigger>
                            {/* <FileUpload.List /> */}
                        </FileUpload.RootProvider>
                    {/* </Box> */}
                    
                        <Text>{fileUpload.acceptedFiles.map((file) => file.name)}</Text>
                    
                    </Stack>
                    
                    <Box>
                        <Text>IMPORTS ANTERIORES</Text>
                    </Box>
                </Flex>
            )}


            {step+1 === 2 && (
                    <Container maxW="container.lg" pt={6} pb={8}>
                        <Text>STEP 2</Text>
                    </Container>
            )}


            {step+1 === 3 && (
                    <Container maxW="container.lg" pt={6} pb={8}>
                        <Text>STEP 3</Text>
                    </Container>
            )}


        </Container>
    );
};