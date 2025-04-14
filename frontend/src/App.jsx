// App.jsx

import { Container, Stack, Text, Flex, Button, Spacer, IconButton, Tooltip, Portal } from "@chakra-ui/react";
import Navbar from "./components/ui/Navbar";
import TransactionGrid from "./components/ui/TransactionGrid";
import CreateTransactionModal from "./components/ui/CreateTransactionModal";
import DeleteTransactionModal from "./components/ui/DeleteTransactionModal";
import { useState, useCallback } from "react"; // Keep useState, add useCallback
import { LuArrowDown, LuArrowUp } from "react-icons/lu"; // Import sorting icons

export const BASE_URL = "http://127.0.0.1:5000/api";

function App() {
    const [transactions, setTransactions] = useState([]);
    const [selectedTransactionId, setSelectedTransactionId] = useState(null);
    // Add state for sorting order, default to descending (newest first)
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

    // Callback to toggle sort order
    const toggleSortOrder = useCallback(() => {
        setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
        // Deselect transaction when sorting changes to avoid confusion
        setSelectedTransactionId(null);
    }, []);

    // Determine the icon and tooltip based on the current sort order
    const sortIcon = sortOrder === 'asc' ? <LuArrowUp /> : <LuArrowDown />;
    const sortTooltipLabel = sortOrder === 'asc' ? "Sort Descending (Newest First)" : "Sort Ascending (Oldest First)";

    return (
        <Stack minH="100vh" bg="#f9f9f4" spacing={0}>
            <Navbar setTransactions={setTransactions} />
            <Container maxW="container.lg" pt={6} pb={8}>
                
                {/* Actions Bar */}
                <Flex
                    direction={{ base: 'column', md: 'row' }}
                    align={{ base: 'start', md: 'center' }}
                    gap={4} // Adjusted gap slightly for better spacing with new button
                    wrap="wrap"
                    minH="60px" 
                    bg="#bcdbdb"
                    mb={6} 
                    p={4} 
                    borderRadius="md" 
                >
                    {/* Sorting Control */}
                    <Tooltip.Root positioning={{ placement: "bottom" }} openDelay={200} closeDelay={100}>
                        <Tooltip.Trigger asChild>
                            <IconButton
                                //bg="teal.500"
                                size="sm"
                                aria-label="Toggle sort order by date"
                                onClick={toggleSortOrder}
                                variant="outline"
                                colorPalette="teal.500"
                                _hover={{ bg: "teal.500" }}
                            >
                                {sortIcon}
                            </IconButton>
                        </Tooltip.Trigger>
                        <Portal> {/* Ensure Tooltip content renders in the body */}
                            <Tooltip.Positioner>
                                <Tooltip.Content>{sortTooltipLabel}</Tooltip.Content>
                            </Tooltip.Positioner>
                        </Portal>
                    </Tooltip.Root>

                    {/* Spacer pushes the remaining items to the right */}
                    <Spacer /> 
                    
                    {/* Existing Action Buttons */}
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
                        setSelectedTransactionId={setSelectedTransactionId} 
                    />
                    
                </Flex>

                <TransactionGrid
                    transactions={transactions}
                    setTransactions={setTransactions}
                    selectedTransactionId={selectedTransactionId} 
                    setSelectedTransactionId={setSelectedTransactionId} 
                    sortOrder={sortOrder} // Pass sort order down
                />
            </Container>
        </Stack>
    );
}

export default App;