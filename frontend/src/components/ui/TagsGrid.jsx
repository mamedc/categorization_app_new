// TagsGrid.jsx

import { useEffect, useState, useMemo, Fragment } from "react"; // Added Fragment
import { BASE_URL } from "../../App";
import { VStack, Spinner, Text, Flex, StackSeparator } from "@chakra-ui/react";
import TagCard from "./TagCard";


export default function TagsGroupsGrid ({
    tGroupId,
    //isSelectedTag,
    //onSelectTag
    // tagGroups,
    // setTagGroups,
    // selectedTagGroupId,
    // setSelectedTagGroupId 
    }) {
    
    const [isLoading, setIsLoading] = useState(true);
    const [groupTags, setGroupTags] = useState([]);
    
    useEffect(() => {
        const getGroupTags = async () => {
            try {
                setIsLoading(true);
                const res = await fetch(BASE_URL + "/tag-groups/" + tGroupId, {
                    method: "GET",
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                const tags = data.tags
                if (Array.isArray(tags)) {
                    const sorted = [...tags].sort((a, b) => a.name.localeCompare(b.name));
                    setGroupTags(sorted);
                } else {
                    console.error("Fetched data is not an array:", data);
                    setGroupTags([]);
                }
                //setSelectedTagGroupId(null);
            } catch (error) {
                console.error(error);
                setGroupTags([]);
            } finally {
                setIsLoading(false);
            }
        };
        getGroupTags();
    }, []);

    // const handleSelectTagGroup = (groupId) => {
    //     setSelectedTagGroupId((prevSelectedId) =>
    //         prevSelectedId === groupId ? null : groupId
    //     );
    // };

    return (
        <>
            {isLoading && (
                <Flex justify="center" mt={8}>
                    <Spinner size="lg" color="teal.500" thickness="3px" />
                </Flex>
            )}

            {!isLoading && groupTags.length === 0 && (
                <Flex justify="center" mt={8} p={6} bg="#f9f9f4" borderRadius="md">
                    <Text fontSize="sm" color="gray.500">
                        No tags found.
                    </Text>
                </Flex>
            )}

            {!isLoading && groupTags.length > 0 && (
                <VStack spacing={6} align="stretch" > {/* Add spacing between date groups */}
                    {groupTags.map((tag) => (
                        <TagCard 
                            key={tag.id}
                            tag={tag}
                            //isSelectedTag={isSelectedTag}
                            //onSelectTag={onSelectTag}
                        />
                    ))}
                </VStack>
            )}
        </>
    );
};