// TagsManagement.jsx

import { useEffect, useState } from "react";
import { BASE_URL } from "../../App";
import { Container, Flex, IconButton, Spacer, Tooltip, Portal } from "@chakra-ui/react";
import { LuArrowUp } from "react-icons/lu";
import TagsGroupsGrid from "./TagsGroupsGrid";
import CreateTagsGroupModal from "./CreateTagsGroupModal";
import DeleteTagsGroupsModal from "./DeleteTagsGroupsModal";
import EditTagGroupModal from "./EditTagGroupModal";


export default function TagsManagement ({
    tagGroups,
    setTagGroups,
    selectedTagGroupId,
    setSelectedTagGroupId,
}) {

    const [isLoading, setIsLoading] = useState(true);
    const [groupsData, setGroupsData] = useState([]);
    const sortIcon = <LuArrowUp />;
    // Get tagGroups and respective tags
    useEffect(() => {
        const getGroupsData = async () => {
            try {
                setIsLoading(true);
                const res = await fetch(BASE_URL + "/tag-groups", { method: "GET" });
                const data = await res.json();
    
                if (!res.ok) {
                    throw new Error(data.error || "Failed to fetch tag groups");
                }
    
                if (!Array.isArray(data)) {
                    console.error("Fetched data is not an array:", data);
                    setGroupsData([]); // Use setGroupsData, not getGroupsData
                    return;
                }
    
                const sortedData = [...data].sort((a, b) => a.name.localeCompare(b.name));
                setGroupsData(sortedData);
    
            } catch (error) {
                console.error("Error fetching tag groups:", error);
                setGroupsData([]); // fallback
            } finally {
                setIsLoading(false);
            }
        };
        getGroupsData();
    }, []);
    
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
                <CreateTagsGroupModal
                    selectedTagGroupId={selectedTagGroupId} // enable/disable
                    setTagGroups={setTagGroups}
                />
                
                {/* Edit Button */}
                <EditTagGroupModal
                    groupsData={groupsData}
                    setGroupsData={setGroupsData}
                    selectedTagGroupId={selectedTagGroupId}
                    setSelectedTagGroupId={setSelectedTagGroupId}
                >
                    Edit
                </EditTagGroupModal>
                
                {/* Delete Button */}
                <DeleteTagsGroupsModal
                    selectedTagGroupId={selectedTagGroupId}
                    setTagGroups={setTagGroups}
                    setSelectedTagGroupId={setSelectedTagGroupId}
                />
            </Flex>

            {/* Transaction Grid */}
            <TagsGroupsGrid
                groupsData={groupsData}
                setGroupsData={groupsData}
                isLoading={isLoading}
                tagGroups={tagGroups}
                setTagGroups={setTagGroups}
                selectedTagGroupId={selectedTagGroupId}
                setSelectedTagGroupId={setSelectedTagGroupId}
            />

        </Container>
    );
};