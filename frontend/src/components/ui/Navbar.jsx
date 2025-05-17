// File path: src/components/ui/Navbar.jsx
import React from "react";
import { Box, Flex, Button, Spacer, Link as ChakraLink, IconButton } from "@chakra-ui/react";
import { NavLink as RouterNavLink, useNavigate, useMatch, useResolvedPath } from 'react-router-dom';
import Settings from './Settings';
import { useAuth } from '../../context/AuthContext';
import { useColorModeValue } from "@/components/ui/color-mode";
import { CiLogout } from "react-icons/ci";

const NavItem = ({ to, children, end = false, ...rest }) => {
    const resolved = useResolvedPath(to);
    const match = useMatch({ path: resolved.pathname, end: end });

    const activeColor = useColorModeValue("teal.600", "teal.300");
    const activeBorderColor = useColorModeValue("teal.500", "teal.300");
    const inactiveColor = useColorModeValue("gray.700", "gray.300");
    const hoverColor = useColorModeValue("teal.600", "teal.300");
    const hoverBorderColor = useColorModeValue("teal.200", "teal.100");

    const isActive = !!match;

    return (
        <ChakraLink
            as={RouterNavLink}
            to={to}
            end={end} // Pass end prop to RouterNavLink for its internal active logic
            fontSize="sm"
            fontWeight="medium"
            pb={1}
            borderBottomWidth="2px"
            borderBottomStyle="solid"
            color={isActive ? activeColor : inactiveColor}
            borderColor={isActive ? activeBorderColor : "transparent"}
            transition="all 0.2s"
            _hover={{
                color: hoverColor,
                borderColor: hoverBorderColor,
                textDecoration: 'none',
            }}
            // Remove default focus outline/boxShadow for these NavItems
            _focus={{
                boxShadow: 'none', // Chakra UI often uses boxShadow for focus rings
                outline: 'none',   // Standard browser outline
            }}
            _focusVisible={{       // Important for keyboard navigation focus states too
                boxShadow: 'none',
                outline: 'none',
            }}
            {...rest}
        >
            {children}
        </ChakraLink>
    );
};

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Box
            bg={useColorModeValue("white", "gray.800")}
            px={4}
            py={2}
            position="fixed"
            top={0}
            left={0}
            right={0}
            as="nav"
            zIndex="1100" 
            //borderBottomWidth="1px"
            //borderColor={useColorModeValue("gray.200", "gray.700")}
            //boxShadow="sm"
        >
            <Flex h="56px" alignItems="center" justifyContent="space-between" maxW="container.xl" mx="auto">
                <Flex align="center" gap={6}>
                    <NavItem to="/transactions" end={true} data-cy="nav-transactions">
                        Transactions
                    </NavItem>
                    <NavItem to="/tags" end={true} data-cy="nav-tags">
                        Tags
                    </NavItem>
                    <NavItem to="/import" end={true} data-cy="nav-import">
                        Import
                    </NavItem>
                </Flex>

                <Spacer />

                <Flex alignItems="center" gap={0}>
                    <Settings data-cy="nav-settings" />
                    {user && (
                        // <Button
                        //     size="sm"
                        //     variant="ghost"
                        //     colorScheme="teal"
                        //     onClick={handleLogout}
                        //     data-cy="nav-logout"
                        // >
                        //     Logout
                        // </Button>

                        <IconButton size="md" variant="ghost" onClick={handleLogout}>
                            <CiLogout />
                        </IconButton>
                    )}
                </Flex>
            </Flex>
        </Box>
    );
}