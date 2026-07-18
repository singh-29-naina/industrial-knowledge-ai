import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 1. On load, check if the user is already logged in (token in localStorage)
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Failed to parse stored user session", error);
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    // 2. Handle Login (Save user details + JWT to state and localStorage)
    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    // 3. Handle Logout
    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Custom hook to easily use auth anywhere in your frontend
export const useAuth = () => {
    return useContext(AuthContext);
};