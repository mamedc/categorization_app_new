// TagsGroupsGrid.jsx

import { useEffect, useState, useMemo, Fragment } from "react"; // Added Fragment
import { BASE_URL } from "../../App";
import { VStack, Spinner, Text, Flex, StackSeparator } from "@chakra-ui/react";
import TagGroupCard from "./TagGroupCard";


export default function TagsGroupsGrid ({
    tagGroups,
    setTagGroups,
    selectedTagGroupId,
    setSelectedTagGroupId,
}) {
    
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getTagGroups = async () => {
            try {
                setIsLoading(true);
                const res = await fetch(BASE_URL + "/tag-groups");
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                if (Array.isArray(data)) {
                    const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
                    setTagGroups(sorted);
                } else {
                    console.error("Fetched data is not an array:", data);
                    setTagGroups([]);
                }
                setSelectedTagGroupId(null);
            } catch (error) {
                console.error(error);
                setTagGroups([]);
            } finally {
                setIsLoading(false);
            }
        };
        getTagGroups();
    }, []);

    const handleSelectTagGroup = (groupId) => {
        setSelectedTagGroupId((prevSelectedId) =>
            prevSelectedId === groupId ? null : groupId
        );
    };

    return (
        <>
            {isLoading && (
                <Flex justify="center" mt={8}>
                    <Spinner size="lg" color="teal.500" thickness="3px" />
                </Flex>
            )}

            {!isLoading && tagGroups.length === 0 && (
                <Flex justify="center" mt={8} p={6} bg="#f9f9f4" borderRadius="md">
                    <Text fontSize="sm" color="gray.500">
                        No transactions found.
                    </Text>
                </Flex>
            )}

            {!isLoading && tagGroups.length > 0 && (
                <VStack spacing={6} align="stretch" > {/* Add spacing between date groups */}
                    {tagGroups.map((tGroup) => (
                        <TagGroupCard
                            key={tGroup.id}
                            tGroup={tGroup}
                            isSelectedTagGroup={tGroup.id === selectedTagGroupId}
                            onSelectTagGroup={() => handleSelectTagGroup(tGroup.id)}
                        />
                    ))}
                </VStack>
            )}
        </>
    );
};