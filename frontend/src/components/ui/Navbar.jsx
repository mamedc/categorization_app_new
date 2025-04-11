// 'rafce' to create react snippet (shortcut of ES7 Extension)
import { Box, Container, Flex, Text } from "@chakra-ui/react"
import { useColorMode, useColorModeValue } from "@/components/ui/color-mode"
import { IoMoon } from "react-icons/io5"
import { LuSun } from "react-icons/lu"
import CreateUserModal from "./CreateUserModal"


function Navbar({ setUsers }) {
    const { colorMode, toggleColorMode } = useColorMode();
    return (
        <Container maxW="900px">
            <Box px={4} my={4} borderRadius={5} bg={useColorModeValue("gray.200", "gray.700")}>
                <Flex h="16" alignItems={"center"} justifyContent={"space-between"}>

                    {/* Left side */}
                    <Flex alignItems={"center"} justifyContent={"space-between"} gap={3} display={{base:"none", sm:"flex"}}>
                        {/*{base:"none", sm:"flex"} = smaller screen and above it will be flex but below that is gona be none*/}
                        <img src="/react.png" alt="React logo" width={50} height={50} />
                        <Text fontSize={"40px"}>+</Text>
                        <img src="/python.png" alt="Python logo" width={50} height={40} />
                        <Text fontSize={"40px"}>=</Text>
                        <img src="/explode.png" alt="Explode head" width={45} height={45} />
                    </Flex>

                    {/* Right side */}
                    <Flex gap={3} alignItems={"center"}>
                        <Text fontSize={"lg"} fontWeight={500} display={{base: "none", md: "block"}}>
                        {/*{base:"none", md:"block"} = we see the text "BFFship" only for wider screen*/}
                            BFFship 🔥
                        </Text>
                        <button onClick={toggleColorMode}>
                            {colorMode === "light" ? <IoMoon /> : <LuSun size={20} />}
                            {/*if colorMode is equal to Light, then we shoe the icon "IoMoon", else (darkmode) we show "LuSun"*/}
                        </button>
                        <CreateUserModal setUsers={setUsers} />
                    </Flex>
                </Flex>
            </Box>
        </Container>
    )
}

export default Navbar