// App.jsx

import { Container, Stack, Text, Flex, Button, Spacer } from "@chakra-ui/react";
import Navbar from "./components/ui/Navbar";
import TransactionGrid from "./components/ui/TransactionGrid";
import { useState } from "react"; // Keep useState
import CreateTransactionModal from "./components/ui/CreateTransactionModal"

export const BASE_URL = "http://127.0.0.1:5000/api";

function App() {
    const [transactions, setTransactions] = useState([]);
    const [selectedTransactionId, setSelectedTransactionId] = useState(null);

    return (
        <Stack minH="100vh" bg="#f9f9f4" spacing={0}>
            <Navbar setTransactions={setTransactions} />
            <Container maxW="container.lg" pt={6} pb={8}>
                
                <Flex
                    direction={{ base: 'column', md: 'row' }}
                    align={{ base: 'start', md: 'center' }}
                    gap={6}
                    wrap="wrap"
                    minH="60px" // Add some min height for visual consistency
                    //alignItems="center" // Center vertically
                    //justifyContent="center" // Center horizontally
                    bg="#bcdbdb"
                    mb={6} // Keep margin bottom
                    p={4} // Add some padding
                    borderRadius="md" // Add rounded corners
                    //boxShadow="sm" // Add a subtle shadow
                    
                >
                    {/* <Text
                        fontSize="xl" // Adjusted font size for better visibility
                        fontWeight="semibold"
                        color="gray.700"
                        textAlign="center" // Ensure text is centered if it wraps
                    >
                        Selected Transaction: {selectedTransactionId ? selectedTransactionId : "None"}
                    </Text> */}

                    {/* Spacer pushes the value to the end in horizontal layouts */}
                    <Spacer display={{ base: 'none', md: 'block' }} />

                    {/* <Button 
                        size="sm" 
                        colorPalette="cyan" 
                        rounded="sm" 
                        width={20} 
                        disabled={selectedTransactionId !== null}>
                            Add
                    </Button> */}
                    <CreateTransactionModal selectedTransactionId={selectedTransactionId} setTransactions={setTransactions} />

                    <Button 
                        size="sm" 
                        colorPalette="blue" 
                        rounded="sm" 
                        width={20} 
                        disabled={selectedTransactionId === null}>
                            Edit
                    </Button>

                    <Button 
                    size="sm" 
                    colorPalette="red" 
                    rounded="sm" 
                    width={20} 
                    disabled={selectedTransactionId === null}>
                        Delete
                    </Button>

                </Flex>

                <TransactionGrid
                    transactions={transactions}
                    setTransactions={setTransactions}
                    selectedTransactionId={selectedTransactionId} // Pass state down
                    setSelectedTransactionId={setSelectedTransactionId} // Pass setter down
                />
            </Container>
        </Stack>
    );
}

export default App;