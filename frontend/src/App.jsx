// App.jsx

import { Container, Stack, Text, Flex, Box } from "@chakra-ui/react"
import Navbar from "./components/ui/Navbar"
import TransactionGrid from "./components/ui/TransactionGrid"
import { useState } from "react"

export const BASE_URL = "http://127.0.0.1:5000/api"

function App() {
    const [transactions, setTransactions] = useState([])

    return (
        <Stack minH="100vh" bg="#f9f9f4" spacing={0}>
            <Navbar setTransactions={setTransactions} />
            <Container maxW="container.lg" pt={6} pb={8}>
                
                {/* Transaction Actions Here */}
                <Flex background="#D1E2C4">
                    <Text 
                        fontSize="2xl"
                        fontWeight="semibold"
                        textAlign="center"
                        mb={6}
                        color="gray.700"
                    >
                        Transaction Actions Here
                    </Text>
                </Flex>

                <TransactionGrid transactions={transactions} setTransactions={setTransactions} />
            </Container>
        </Stack>
    )
}

export default App