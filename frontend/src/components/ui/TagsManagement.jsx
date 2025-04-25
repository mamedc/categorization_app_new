// TagsManagement.jsx

import { useEffect, useState } from "react";
import { BASE_URL } from "../../App";
import { Container, Flex, IconButton, Spacer, Tooltip, Portal } from "@chakra-ui/react";
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
    const [isLoading, setIsLoading] = useState(true);
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
                <CreateTagsGroupModal />
                
                {/* Edit Button */}
                <EditTagGroupModal>Edit</EditTagGroupModal>
                
                {/* Delete Button */}
                <DeleteTagsGroupsModal />
            </Flex>

            {/* Transaction Grid */}
            <TagsGroupsGrid />

        </Container>
    );
};