// App.jsx

import { Container, Stack, Text, Flex, Button, Spacer } from "@chakra-ui/react";
import Navbar from "./components/ui/Navbar";
import TransactionGrid from "./components/ui/TransactionGrid";
import CreateTransactionModal from "./components/ui/CreateTransactionModal"
import DeleteTransactionModal from "./components/ui/DeleteTransactionModal"
import { useState } from "react"; // Keep useState

export const BASE_URL = "http://127.0.0.1:5000/api";

function App() {
    const [transactions, setTransactions] = useState([]);
    const [selectedTransactionId, setSelectedTransactionId] = useState(null);

    // console.log('------');
    // console.log(selectedTransactionId);
    // console.log(setSelectedTransactionId);

    return (
        <Stack minH="100vh" bg="#f9f9f4" spacing={0}>
            <Navbar setTransactions={setTransactions} />
            <Container maxW="container.lg" pt={6} pb={8}>
                
                {/*Actions Bar*/}
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
                    {/* Spacer pushes the value to the end in horizontal layouts */}
                    <Spacer display={{ base: 'none', md: 'block' }} />
                    
                    <CreateTransactionModal 
                        selectedTransactionId={selectedTransactionId} 
                        setTransactions={setTransactions} 
                    />

                    <Button 
                        size="sm" 
                        colorPalette="blue" 
                        rounded="sm" 
                        width={20} 
                        disabled={selectedTransactionId === null}>
                            Edit
                    </Button>

                    <DeleteTransactionModal 
                        selectedTransactionId={selectedTransactionId} 
                        setTransactions={setTransactions} 
                    />
                    
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