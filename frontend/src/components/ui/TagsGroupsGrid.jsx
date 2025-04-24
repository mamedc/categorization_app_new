// TagsGroupsGrid.jsx

import { useAtom } from "jotai";
import { ldbTagGroupsAtom, selectedTagGroupId } from "../../context/atoms";
import { VStack, Spinner, Text, Flex } from "@chakra-ui/react";
import TagGroupCard from "./TagGroupCard";

export default function TagsGroupsGrid ({}) {
    
    const [groupsData] = useAtom(ldbTagGroupsAtom);
    const [selectedGroup, setSelectedTagGroupId] = useAtom(selectedTagGroupId);
    const isLoading = groupsData.state === 'loading'

    const handleSelectTagGroup = (groupId) => {
        const newSel = groupId === selectedGroup ? null : groupId;
        setSelectedTagGroupId(newSel);
    };

    return (
        <>
            {isLoading && (
                <Flex justify="center" mt={8}>
                    <Spinner size="lg" color="teal.500" thickness="3px" />
                </Flex>
            )}

            {!isLoading && groupsData.data.length === 0 && (
                <Flex justify="center" mt={8} p={6} bg="#f9f9f4" borderRadius="md">
                    <Text fontSize="sm" color="gray.500">
                        No transactions found.
                    </Text>
                </Flex>
            )}

            {!isLoading && groupsData.data.length > 0 && (
                <VStack spacing={6} align="stretch" > {/* Add spacing between date groups */}
                    {groupsData.data.map((tGroup) => (
                        <TagGroupCard
                            key={tGroup.id}
                            tGroup={tGroup}
                            onSelectTagGroup={() => handleSelectTagGroup(tGroup.id)}
                        />
                    ))}
                </VStack>
            )}
        </>
    );
};