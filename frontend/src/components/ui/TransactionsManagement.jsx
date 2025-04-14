// src/components/ui/TransactionsManagement.jsx

import { Container, Flex, Button, Spacer, IconButton, Tooltip, Portal } from "@chakra-ui/react";
import { useState, useCallback } from "react";
import TransactionGrid from "./TransactionGrid";
import CreateTransactionModal from "./CreateTransactionModal";
import DeleteTransactionModal from "./DeleteTransactionModal";
import { LuArrowDown, LuArrowUp } from "react-icons/lu";

function TransactionsManagement({ transactions, setTransactions, selectedTransactionId, setSelectedTransactionId }) {
    const [sortOrder, setSortOrder] = useState('desc');
    const toggleSortOrder = useCallback(() => {
        setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
        setSelectedTransactionId(null);
    }, []);
    const sortIcon = sortOrder === 'asc' ? <LuArrowUp /> : <LuArrowDown />;
    const sortTooltipLabel = sortOrder === 'asc' ? "Sort Descending (Newest First)" : "Sort Ascending (Oldest First)";

    return (
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
                        <Tooltip.Positioner><Tooltip.Content>{sortTooltipLabel}</Tooltip.Content></Tooltip.Positioner>
                    </Portal>
                </Tooltip.Root>

                <Spacer />

                {/* Existing Action Buttons */}
                <CreateTransactionModal
                    selectedTransactionId={selectedTransactionId}
                    setTransactions={setTransactions}
                />
                
                {/* Edit Button */}
                <Button
                    size="sm"
                    colorPalette="blue"
                    rounded="sm"
                    width={20}
                    disabled={selectedTransactionId === null}
                >
                    Edit
                </Button>
                
                {/* Delete Button */}
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
    );
}

export default TransactionsManagement;