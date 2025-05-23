// File path: C:\Users\mamed\Meu Drive\Code\categorization_app_new\frontend\src\components\ui\TagsManagement.jsx
// TagsManagement.jsx
// *** CHANGES APPLIED HERE ***

import { useEffect, useState } from "react";
import { BASE_URL } from "../../App";
import { Box, Flex, IconButton, Spacer, Tooltip, Portal, Container, HStack } from "@chakra-ui/react"; // Removed Container
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
        <Container 
            pt={0}
            pb={6}
            maxW={{ base: "100%", md: "100%", xl: "1400px" }} // Controls Transaction Card width behaviour
            mx="auto"
        >

            {/* Actions Bar - Made Sticky */}
            <Flex
                direction={'row'}
                align={'center'}
                h="80px"
                gap={4}
                mt={"45px"}
                wrap="wrap"
                minH="60px"
                bg="white"
                mb={4}
                pt={4}
                pb={4}
                pl={{ base: "16px", md: "32px", xl: "calc(80px + (100vw - 1512px) / 2)" }} 
                pr={{ base: "16px", md: "32px", xl: "calc(80px + (100vw - 1512px) / 2)" }} 
                position="fixed"
                top={17}
                left={0}
                right={0}
                zIndex={10}
                borderBottomWidth="1px"
                borderColor="gray.200"
            >
                

                <Spacer />

                {/* --- Action Buttons --- */}
                <HStack spacing={2} mt={{ base: 4, md: 0 }} width={{ base: "100%", md: "auto"}} justifyContent={{ base: "flex-end", md: "initial"}}>
                
                    {/* Existing Action Buttons */}
                    <CreateTagsGroupModal />

                    {/* Edit Button */}
                    <EditTagGroupModal>Edit</EditTagGroupModal>

                    {/* Delete Button */}
                    <DeleteTagsGroupsModal />

                </HStack>
            </Flex>

            {/* Tags Groups Grid - Will scroll under the sticky Actions Bar */}
            <TagsGroupsGrid />

        </Container>
    );
};