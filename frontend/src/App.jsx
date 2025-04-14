// App.jsx

import { Container, Stack, Text, Flex, Button, Spacer, IconButton, Tooltip, Portal } from "@chakra-ui/react";
import Navbar from "./components/ui/Navbar";
import TransactionGrid from "./components/ui/TransactionGrid";
import CreateTransactionModal from "./components/ui/CreateTransactionModal";
import DeleteTransactionModal from "./components/ui/DeleteTransactionModal";
import TagsPlaceholder from "./components/ui/TagsPlaceholder"; // Import the new placeholder
import { useState, useCallback } from "react";
import { LuArrowDown, LuArrowUp } from "react-icons/lu";

export const BASE_URL = "http://127.0.0.1:5000/api";

function App() {
    const [activeView, setActiveView] = useState('transactions'); // State for active view
    const [transactions, setTransactions] = useState([]);
    const [selectedTransactionId, setSelectedTransactionId] = useState(null);
    const [sortOrder, setSortOrder] = useState('desc');

    const toggleSortOrder = useCallback(() => {
        setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
        setSelectedTransactionId(null);
    }, []);

    const sortIcon = sortOrder === 'asc' ? <LuArrowUp /> : <LuArrowDown />;
    const sortTooltipLabel = sortOrder === 'asc' ? "Sort Descending (Newest First)" : "Sort Ascending (Oldest First)";

    return (
        <Stack minH="100vh" bg="#f9f9f4" spacing={0}>
            {/* Pass activeView and setActiveView to Navbar */}
            <Navbar
                activeView={activeView}
                setActiveView={setActiveView}
                setTransactions={setTransactions}
            />

            {/* Conditional Rendering based on activeView */}
            {activeView === 'transactions' && (
                <Container maxW="container.lg" pt={6} pb={8}>
                    {/* Actions Bar */}
                    <Flex
                        direction={{ base: 'column', md: 'row' }}
                        align={{ base: 'start', md: 'center' }}
                        gap={4}
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
                                    size="sm"
                                    aria-label="Toggle sort order by date"
                                    onClick={toggleSortOrder}
                                    variant="outline"
                                    colorPalette="teal" // Changed from teal.500
                                    _hover={{ bg: "teal.500", color: "white" }} // Added color on hover
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
                            disabled={selectedTransactionId === null}
                        >
                            Edit
                        </Button>
                        <DeleteTransactionModal
                            selectedTransactionId={selectedTransactionId}
                            setTransactions={setTransactions}
                            setSelectedTransactionId={setSelectedTransactionId}
                        />
                    </Flex>

                    {/* Transaction Grid */}
                    <TransactionGrid
                        transactions={transactions}
                        setTransactions={setTransactions}
                        selectedTransactionId={selectedTransactionId}
                        setSelectedTransactionId={setSelectedTransactionId}
                        sortOrder={sortOrder}
                    />
                </Container>
            )}

            {/* Render Tags Placeholder when activeView is 'tags' */}
            {activeView === 'tags' && (
                 <Container maxW="container.lg" pt={6} pb={8}>
                    <TagsPlaceholder />
                 </Container>
            )}
        </Stack>
    );
}

export default App;