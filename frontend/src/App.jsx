import { Container, Stack, Text, Box } from "@chakra-ui/react"
import Navbar from "./components/ui/Navbar"
import TransactionGrid from "./components/ui/TransactionGrid"
import { useState } from "react"

export const BASE_URL = "http://127.0.0.1:5000/api"

function App() {
    const [transactions, setTransactions] = useState([])

    return (
        <Stack minH="100vh" bg="#fefcf9" spacing={0}>
            <Navbar setTransactions={setTransactions} />
            <Container maxW="container.lg" pt={4}>
                <Text 
                    fontSize="2xl"
                    fontWeight="semibold"
                    textAlign="center"
                    mb={6}
                    color="gray.700"
                >
                    Selected Records
                </Text>
                <TransactionGrid transactions={transactions} setTransactions={setTransactions} />
            </Container>
        </Stack>
    )
}

export default App
