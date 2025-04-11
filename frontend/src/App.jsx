import { Container, Stack, Text, Box } from "@chakra-ui/react"
import Navbar from "./components/ui/Navbar"
// import UserGrid from "./components/ui/UserGrid"
import TransactionGrid from "./components/ui/TransactionGrid"
import { useState } from "react"


export const BASE_URL = "http://127.0.0.1:5000/api"



function App() {
    
    // The only reason we are creating this state in App.jsx and not in UserGrid.jsx
    // is that we would like to pass 'setUsers' to the NavBar component
    // setUsers is a function that will be used to update the users array
    const [transactions, setTransactions] = useState([])
    
    return (

            <Stack minH="100vh" gap={1}>
                {/* <Navbar setUsers={setUsers} /> setUsers={setUsers} pass setUsers to the NavBar */}
                <Navbar setUsers={setTransactions} />
                
                <Container maxW="100%" height="90vh" bg={"gray"}>
                    
                    <Text 
                        fontSize={{ base: "3xl", md: "50" }}
                        fontWeight={"bold"}
                        letterSpacing={"2px"}
                        textTransform={"uppercase"}
                        textAlign={"center"}
                        mb={8}
                        bg={"red"}
                        my={2}
                    >
                        <Text
                            as={"span"} 
                            bgGradient="to-r" gradientFrom="cyan.400" gradientTo="blue.500"
                            bgClip="text"
                        >
                            My Besties
                        </Text>
                        🐧
                    </Text>

                    <TransactionGrid transactions={transactions} setTransactions={setTransactions} /> {/*users={users} Pass users to the UserGrid  */}
                </Container>
            </Stack>
    )
}

export default App