// File path: src/components/ui/Navbar.jsx
import React, { useState } from "react"; // Added useState
import { Box, Flex, Button, Spacer, Link as ChakraLink, IconButton, Theme, Portal, Tooltip } from "@chakra-ui/react";
import { NavLink as RouterNavLink, useNavigate, useMatch, useResolvedPath } from 'react-router-dom';
import Settings from './Settings';
import { useAuth } from '../../context/AuthContext';
import { useColorModeValue } from "@/components/ui/color-mode";
import { CiLogout, CiSettings } from "react-icons/ci";
import { LuArchive } from "react-icons/lu"; // Backup Icon
import { Toaster, toaster } from "@/components/ui/toaster"; // For notifications
import { BASE_URL } from "../../App"; // Import BASE_URL
import { IoCloudDownloadOutline } from "react-icons/io5";


const NavItem = ({ to, children, end = false, ...rest }) => {
    const resolved = useResolvedPath(to);
    const match = useMatch({ path: resolved.pathname, end: end });

    const activeColor = useColorModeValue("teal.600", "teal.600");
    //const activeBorderColor = useColorModeValue("teal.500", "teal.300");
    const inactiveColor = useColorModeValue("gray.500", "gray.500");
    const hoverColor = useColorModeValue("teal.600", "teal.600");
    //const hoverBorderColor = useColorModeValue("teal.200", "teal.100");

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
    const [isBackingUp, setIsBackingUp] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleBackup = async () => {
        setIsBackingUp(true);
        const toastId = toaster.create({ // Get toast ID to close it later
            title: "Backup In Progress",
            description: "Your data is being prepared for download...",
            type: "info",
            duration: null, // Persistent
        });

        try {
            const response = await fetch(`${BASE_URL}/backup/all`, {
                method: 'GET',
                // If your API requires authentication, add Authorization header here
                // headers: { 'Authorization': `Bearer ${your_auth_token}` },
            });

            if (!response.ok) {
                let errorDetail = "Backup failed. Please try again.";
                try {
                    const errorData = await response.json();
                    errorDetail = errorData.error || errorData.message || `Server error: ${response.statusText}`;
                } catch (e) {
                    // If response is not JSON, use status text or a generic message
                    errorDetail = `Backup request failed: ${response.statusText || response.status}`;
                }
                throw new Error(errorDetail);
            }

            const blob = await response.blob();
            
            const contentDisposition = response.headers.get('content-disposition');
            let filename = `categorization_backup_${new Date().toISOString().split('T')[0]}.zip`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+?)"?(;|$)/i);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1];
                }
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            
            window.URL.revokeObjectURL(url);
            a.remove();

            if (toastId) toaster.close(toastId);
            toaster.create({
                title: "Backup Successful",
                description: `Backup file "${filename}" downloaded.`,
                type: "success",
                duration: 5000,
            });

        } catch (error) {
            console.error("Backup error:", error);
            if (toastId) toaster.close(toastId);
            toaster.create({
                title: "Backup Failed",
                description: error.message || "Could not complete the backup process.",
                type: "error",
                duration: 7000,
            });
        } finally {
            setIsBackingUp(false);
        }
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
            <Toaster /> {/* Assuming Toaster is context-aware or global from Park UI/Ark UI setup */}
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
                    
                    <IconButton
                        size="sm"
                        variant="ghost"
                        onClick={handleBackup}
                        isLoading={isBackingUp}
                        aria-label="Backup Data"
                        data-cy="nav-backup"
                    >
                        <IoCloudDownloadOutline />
                    </IconButton>
                                        
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