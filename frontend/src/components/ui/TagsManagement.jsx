// TagsManagement.jsx

import { useState } from "react";
import { Container, Flex, IconButton, Spacer, Tooltip, Portal } from "@chakra-ui/react";
import { LuArrowUp } from "react-icons/lu";
import TagsGroupsGrid from "./TagsGroupsGrid";


export default function TagsManagement ({
    tagGroups,
    setTagGroups,
    selectedTagGroupId,
    setSelectedTagGroupId,
    //selectedTagId,
    //setSelectedTagId 
}) {

    //const [selectedTagGroupId, setSelectedTagGroupId] = useState(null);
    const sortIcon = <LuArrowUp />;

    return (
        <Container>
        
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
                            //onClick={toggleSortOrder}
                            variant="outline"
                            colorPalette="teal" // Changed from teal.500
                            _hover={{ bg: "teal.500", color: "white" }} // Added color on hover
                        >
                            {sortIcon}
                        </IconButton>
                    </Tooltip.Trigger>
                    <Portal> {/* Ensure Tooltip content renders in the body */}
                        <Tooltip.Positioner>
                            <Tooltip.Content>Aaaaaaaaaa</Tooltip.Content>
                        </Tooltip.Positioner>
                    </Portal>
                </Tooltip.Root>

                <Spacer />

                {/* Existing Action Buttons */}
                {/* <CreateTransactionModal
                    selectedTransactionId={selectedTransactionId}
                    setTransactions={setTransactions}
                /> */}
                
                {/* Edit Button */}
                {/* <Button
                    size="sm"
                    colorPalette="blue"
                    rounded="sm"
                    width={20}
                    disabled={selectedTransactionId === null}
                >
                    Edit
                </Button> */}
                
                {/* Delete Button */}
                {/* <DeleteTransactionModal
                    selectedTransactionId={selectedTransactionId}
                    setTransactions={setTransactions}
                    setSelectedTransactionId={setSelectedTransactionId}
                /> */}
            </Flex>

            {/* Transaction Grid */}
            <TagsGroupsGrid
                tagGroups={tagGroups}
                setTagGroups={setTagGroups}
                selectedTagGroupId={selectedTagGroupId}
                setSelectedTagGroupId={setSelectedTagGroupId}
                //selectedTagId={selectedTagId}
                //setSelectedTagId={setSelectedTagId}
                
                //transactions={transactions}
                //setTransactions={setTransactions}
                //selectedTransactionId={selectedTransactionId}
                //setSelectedTransactionId={setSelectedTransactionId}
                //sortOrder={sortOrder}
            />

        </Container>
    );
};