// File path: C:\Users\mamed\Meu Drive\Code\categorization_app_new\frontend\src\components\ui\TransactionsManagement.jsx
// src/components/ui/TransactionsManagement.jsx
// *** CHANGES APPLIED HERE ***

import { useState, useCallback } from "react";
import { Container, Flex, Button, Spacer, IconButton, Tooltip, Portal } from "@chakra-ui/react";
import { LuArrowDown, LuArrowUp } from "react-icons/lu";
import TransactionGrid from "./TransactionGrid";
import CreateTransactionModal from "./CreateTransactionModal";
import DeleteTransactionModal from "./DeleteTransactionModal";
import EditTransactionModal from "./EditTransactionModal";


export default function TransactionsManagement({
    transactions,
    setTransactions,
    selectedTransactionId,
    setSelectedTransactionId }) {

    const [sortOrder, setSortOrder] = useState('desc');
    const toggleSortOrder = () => { //  Flips the sorting state between 'asc' and 'desc'
        setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
        // Reset selection when sorting changes to avoid confusion
        // setSelectedTransactionId(null); // Assuming this is handled elsewhere if needed
    };
    const sortIcon = sortOrder === 'desc' ? <LuArrowUp /> : <LuArrowDown />;
    const sortTooltipLabel = sortOrder === 'desc' ? "Sort Descending (Newest First)" : "Sort Ascending (Oldest First)";

    return (
        // Container provides max-width and padding
        <Container maxW="container.lg" pt={6} pb={8}>

            {/* Actions Bar - Made Sticky */}
            <Flex
                direction={{ base: 'column', md: 'row' }}
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

                {/* Add Button */}
                <CreateTransactionModal
                    //setTransactions={setTransactions} // To include the new transaction to "transactions"
                    //selectedTransactionId={selectedTransactionId} // To enable/disable the 'Add' button
                />

                {/* Edit Button */}
                <EditTransactionModal />

                {/* Delete Button */}
                <DeleteTransactionModal
                    //selectedTransactionId={selectedTransactionId}
                    //setTransactions={setTransactions}
                    //setSelectedTransactionId={setSelectedTransactionId}
                />
            </Flex>

            {/* Transaction Grid - Will scroll under the sticky Actions Bar */}
            <TransactionGrid
                //transactions={transactions}
                //setTransactions={setTransactions}
                //selectedTransactionId={selectedTransactionId}
                //setSelectedTransactionId={setSelectedTransactionId}
                sortOrder={sortOrder}
            />

        </Container>
    );
};