import React, { useState } from 'react';
import AuthContext from './auth-context';
import { loginUser } from '../api/authService';
import { jwtDecode } from 'jwt-decode';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const login = async (username, password) => {
        try {
            const data = await loginUser(username, password);
            // Adjust based on your actual API response
            const userData = data.user || data;

            if (data.token) {
                userData.token = data.token;
                try {
                    const decoded = jwtDecode(data.token);
                    userData.roles = decoded.roles || decoded.authorities || [];
                    userData.role = decoded.role || (userData.roles.length > 0 ? userData.roles[0] : 'User');
                } catch (e) {
                    console.error("Failed to decode token", e);
                    userData.role = 'User'; // Default fallback
                }
            }

            console.log("Logged in user:", userData); // Debugging

            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return true;
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.clear(); // Clear entire cache/storage as requested
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
