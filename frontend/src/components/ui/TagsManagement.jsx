// File path: C:\Users\mamed\Meu Drive\Code\categorization_app_new\frontend\src\components\ui\TagsManagement.jsx
// TagsManagement.jsx
// *** CHANGES APPLIED HERE ***

import { useEffect, useState } from "react";
import { BASE_URL } from "../../App";
import { Box, Flex, IconButton, Spacer, Tooltip, Portal } from "@chakra-ui/react"; // Removed Container
import { LuArrowUp } from "react-icons/lu";
import TagsGroupsGrid from "./TagsGroupsGrid";
import CreateTagsGroupModal from "./CreateTagsGroupModal";
import DeleteTagsGroupsModal from "./DeleteTagsGroupsModal";
import EditTagGroupModal from "./EditTagGroupModal";

import { useAtom } from "jotai";
import { ldbTagGroupsAtom } from "../../context/atoms";


export default function TagsManagement ({
}) {

    const [groupsData] = useAtom(ldbTagGroupsAtom);
    // Removed isLoading state as it's derived from groupsData.state
    const sortIcon = <LuArrowUp />;

    // Note: The outer Container is now handled in App.jsx
    // Removed the inner Container component
    return (
        <Box> {/* Use Box or Fragment instead of Container */}

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
                            aria-label="Toggle sort order by date" // Consider a more relevant label for tags
                            variant="outline"
                            colorPalette="teal" // Changed from teal.500
                            _hover={{ bg: "teal.500", color: "white" }} // Added color on hover
                            isDisabled // Disable sorting for now if not implemented
                        >
                            {sortIcon}
                        </IconButton>
                    </Tooltip.Trigger>
                    <Portal> {/* Ensure Tooltip content renders in the body */}
                        <Tooltip.Positioner>
                            {/* Update tooltip content */}
                            <Tooltip.Content>Sort Alphabetically</Tooltip.Content>
                        </Tooltip.Positioner>
                    </Portal>
                </Tooltip.Root>

                <Spacer />

                {/* Existing Action Buttons */}
                <CreateTagsGroupModal />

                {/* Edit Button */}
                <EditTagGroupModal>Edit</EditTagGroupModal>

                {/* Delete Button */}
                <DeleteTagsGroupsModal />
            </Flex>

            {/* Tags Groups Grid - Will scroll under the sticky Actions Bar */}
            <TagsGroupsGrid />

        </Box>
    );
};