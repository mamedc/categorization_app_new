// File path: src/App.jsx
import React from "react"; // Removed useState as it's no longer needed here for activeView
import { Container, Stack, Spinner, Center, Box, Theme } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from "./components/ui/Navbar";
import TransactionsManagement from "./components/ui/TransactionsManagement";
import TagsManagement from "./components/ui/TagsManagement";
import ImportTransactions from "./components/import/ImportTransactions";
// Settings component is a modal, triggered from Navbar, so it does not need a dedicated route.

import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/auth/Login';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

export const BASE_URL = import.meta.env.MODE === "development" ? "http://127.0.0.1:5000/api" : "/api";

// Layout for protected routes that includes Navbar
const ProtectedLayout = () => {
    // Navbar is self-contained for its logic now.
    // It uses useAuth internally if needed for user display or logout.
    return (
        <Theme appearance="light">
        <Stack minH="100vh" bg="#f4f4ec" spacing={0}>
            <Navbar />
            {/* Outlet will render the matched child route component (Transactions, Tags, Import) */}
            {/* Add paddingTop to account for the fixed Navbar height */}
            <Box pt="72px" flexGrow={1}> {/* Navbar height is 72px */}
                <Outlet />
            </Box>
        </Stack>
        </Theme>
    );
};

const AppRoutes = () => {
    const { isLoadingAuth, isAuthenticated } = useAuth();

    if (isLoadingAuth) {
        return (
            <Center h="100vh" bg="#f4f4ec">
                <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="teal.500" size="xl" />
            </Center>
        );
    }
    
    return (
        <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/transactions" replace /> : <Login />} />
            <Route 
                path="/"
                element={
                    <ProtectedRoute>
                        <ProtectedLayout />
                    </ProtectedRoute>
                }
            >
                {/* Default route inside protected layout */}
                <Route index element={<Navigate to="/transactions" replace />} />
                
                {/* TransactionsManagement now manages its own state via Jotai, no props needed */}
                <Route 
                    path="transactions" 
                    element={
                        // Container for consistent padding and max-width
                        <Container maxW="container.xl" py={6} px={{ base: 2, md: 4 }} mt={0}>
                            <TransactionsManagement />
                        </Container>
                    } 
                />
                <Route 
                    path="tags" 
                    element={
                        <Container maxW="container.lg" py={6} px={{ base: 2, md: 4 }}>
                            <TagsManagement />
                        </Container>
                    } 
                />
                <Route 
                    path="import" 
                    element={
                         // ImportTransactions original pt was 90px, if keeping that specific padding:
                         // <Container maxW="container.lg" pt={"90px"} pb={8} px={{ base: 2, md: 4}}> 
                         // For now, using consistent py={6}
                        <Container maxW="container.lg" py={6} px={{ base: 2, md: 4 }}>
                            <ImportTransactions />
                        </Container>
                    } 
                />
                {/* Settings is a modal triggered from Navbar, no dedicated route needed here */}
            </Route>
            {/* Fallback for any other route */}
            <Route path="*" element={<Navigate to="/" replace />} />
            
        </Routes>
    );
};

export default function App() {
    return (
        <Router>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </Router>
    );
}
