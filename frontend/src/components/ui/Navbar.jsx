// File path: src/components/ui/Navbar.jsx
import React from "react";
import { Box, Flex, Button, Spacer, Link as ChakraLink, IconButton, Theme, Portal } from "@chakra-ui/react";
import { NavLink as RouterNavLink, useNavigate, useMatch, useResolvedPath } from 'react-router-dom';
import Settings from './Settings';
import { useAuth } from '../../context/AuthContext';
import { useColorModeValue } from "@/components/ui/color-mode";
import { CiLogout } from "react-icons/ci";

const NavItem = ({ to, children, end = false, ...rest }) => {
    const resolved = useResolvedPath(to);
    const match = useMatch({ path: resolved.pathname, end: end });

    const activeColor = useColorModeValue("teal.600", "teal.600");
    const activeBorderColor = useColorModeValue("teal.500", "teal.300");
    const inactiveColor = useColorModeValue("gray.500", "gray.500");
    const hoverColor = useColorModeValue("teal.600", "teal.600");
    const hoverBorderColor = useColorModeValue("teal.200", "teal.100");

    const isActive = !!match;

    return (
        //<Theme appearance="light">
        <ChakraLink
            as={RouterNavLink}
            to={to}
            end={end} // Pass end prop to RouterNavLink for its internal active logic
            fontSize="sm"
            fontWeight="medium"
            pb={1}
            //borderBottomWidth="2px"
            //borderBottomStyle="solid"
            color={isActive ? activeColor : inactiveColor}
            //borderColor={isActive ? activeBorderColor : "transparent"}
            transition="all 0.2s"
            _hover={{
                color: hoverColor,
                //borderColor: hoverBorderColor,
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
        //</Theme>
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
        
        // <Theme appearance="light">
        <Box
            bg={useColorModeValue("white", "gray.800")}
            px={0}
            py={0}
            position="fixed"
            top={0}
            left={0}
            right={0}
            as="nav"
            zIndex="1100" 
            mb={0}
            h={"65px"}
            //borderBottomWidth="1px"
            //borderColor={useColorModeValue("gray.500", "gray.700")}
            //boxShadow="sm"
        >
            <Theme appearance="light">
            <Flex h="65px" alignItems="center" justifyContent="space-between" maxW="container.xl" mx="auto">
                <Flex align="center" gap={6}>
                    <NavItem to="/transactions" end={true} data-cy="nav-transactions" ml={4}>
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
                        <IconButton size="md" variant="ghost" onClick={handleLogout} mr={4}>
                            <CiLogout />
                        </IconButton>
                    )}
                </Flex>
            </Flex>
            </Theme>
        </Box>
        // </Theme>
        
    );
}