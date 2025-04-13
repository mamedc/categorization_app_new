// App.jsx

import { Container, Stack, Text, Flex, Box } from "@chakra-ui/react";
import Navbar from "./components/ui/Navbar";
import TransactionGrid from "./components/ui/TransactionGrid";
import { useState } from "react"; // Keep useState

export const BASE_URL = "http://127.0.0.1:5000/api";

function App() {
    // Remove TypeScript type annotation <any[]>
    const [transactions, setTransactions] = useState([]);
    // Remove TypeScript type annotation <string | null>
    const [selectedTransactionId, setSelectedTransactionId] = useState(null);

    return (
        <Stack minH="100vh" bg="#f9f9f4" spacing={0}>
            <Navbar setTransactions={setTransactions} />
            <Container maxW="container.lg" pt={6} pb={8}>
                {/* Selected Transaction Box - Modified */}
                <Flex
                    minH="60px" // Add some min height for visual consistency
                    alignItems="center" // Center vertically
                    justifyContent="center" // Center horizontally
                    background="#D1E2C4"
                    mb={6} // Keep margin bottom
                    p={4} // Add some padding
                    borderRadius="md" // Add rounded corners
                    boxShadow="sm" // Add a subtle shadow
                >
                    <Text
                        fontSize="xl" // Adjusted font size for better visibility
                        fontWeight="semibold"
                        color="gray.700"
                        textAlign="center" // Ensure text is centered if it wraps
                    >
                        {/* Display selected transaction ID or "None" */}
                        Selected Transaction: {selectedTransactionId ? selectedTransactionId : "None"}
                    </Text>
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