import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const { data } = await api.get('/auth/me');
                    setUser(data);
                } catch (error) {
                    console.error('Failed to load user', error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    const login = async (phone, password) => {
        const { data } = await api.post('/auth/login', { phone, password });
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return data.user;
    };

    const register = async (userData) => {
        // Check if userData is FormData (for file upload)
        const config = userData instanceof FormData
            ? { headers: { 'Content-Type': 'multipart/form-data' } }
            : {};
        await api.post('/auth/register', userData, config);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
