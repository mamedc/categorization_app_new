// File path: src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const HARDCODED_EMAIL = "imob.caki@gmail.com";
const HARDCODED_PASSWORD = "elvis";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // To handle initial auth check

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('authUser');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to parse authUser from localStorage", error);
            localStorage.removeItem('authUser'); // Clear corrupted data
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        if (email === HARDCODED_EMAIL && password === HARDCODED_PASSWORD) {
            const userData = { email };
            setUser(userData);
            localStorage.setItem('authUser', JSON.stringify(userData));
            return userData;
        } else {
            throw new Error("Invalid email or password");
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('authUser');
        // Navigation to /login will be handled by ProtectedRoute or an effect where logout is called
    };

    if (loading) {
        // Optionally return a global loading spinner or null
        // For a full-page app, this might be brief, so null is often fine
        // or a styled full-screen loader if preferred.
        return null; 
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoadingAuth: loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};