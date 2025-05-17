// File path: src/components/auth/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box, Button, Container, Field, Heading, Input, Stack, Alert, Center, Text
} from '@chakra-ui/react';
import { Toaster, toaster } from "@/components/ui/toaster"; // Assuming toaster setup

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); // Local error for inline display if needed
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
            navigate(from, { replace: true }); // Navigate to the originally intended page or home
        } catch (err) {
            // setError(err.message); // Can be used for inline alert
            toaster.create({
                title: "Login Failed",
                description: err.message,
                type: "error",
                duration: 4000,
                placement: "top-center",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container centerContent py={10} bg="#f4f4ec" minH="100vh">
            <Toaster />
            <Box
                p={8}
                mt={{base: "10vh", md: "15vh"}}
                maxWidth="400px"
                width="full"
                borderWidth={1}
                borderRadius="md"
                boxShadow="lg"
                bg="white"
            >
                <Stack as="form" onSubmit={handleSubmit} spacing={6}>
                    <Heading as="h1" size="lg" textAlign="center" mb={4} color="gray.700">
                        Application Login
                    </Heading>
                    {/* Example of inline error if preferred over toaster for some errors */}
                    {/* {error && (
                        <Alert status="error" borderRadius="md">
                            <AlertIcon />
                            {error}
                        </Alert>
                    )} */}
                    <Field.Root id="email">
                        <Field.Label fontSize="sm" color="gray.600">Email address</Field.Label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="user@example.com"
                            size="md"
                            //focusBorderColor="teal.500"
                        />
                    </Field.Root>
                    <Field.Root id="password">
                        <Field.Label fontSize="sm" color="gray.600">Password</Field.Label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="password123"
                            size="md"
                            //focusBorderColor="teal.500"
                        />
                    </Field.Root>
                    <Button
                        type="submit"
                        colorPalette="teal"
                        isLoading={isLoading}
                        width="full"
                        size="md"
                        mt={4}
                        bg="teal.500"
                        color="white"
                        _hover={{ bg: "teal.600" }}
                    >
                        Login
                    </Button>
                    <Center mt={2}>
                        <Text fontSize="xs" color="gray.500">
                            Hint: user@example.com / password123
                        </Text>
                    </Center>
                </Stack>
            </Box>
        </Container>
    );
};