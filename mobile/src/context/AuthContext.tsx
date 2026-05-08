import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../api/client';

export type UserRole = 'patient' | 'doctor' | 'pharmacy';

export interface User {
  _id: string;
  email: string;
  full_name: string;
  role: UserRole;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  checkAuth: async () => {},
});

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (token: string, userData: User) => {
    try {
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
    } catch (e) {
      console.error('Login error', e);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      setUser(null);
    } catch (e) {
      console.error('Logout error', e);
    }
  };

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        // Optionally verify token with backend here
        const res = await apiClient.get('/auth/me');
        if (res.data && res.data.user) {
           setUser(res.data.user);
           await AsyncStorage.setItem('userData', JSON.stringify(res.data.user));
        } else {
           // Fallback to local data
           const userDataString = await AsyncStorage.getItem('userData');
           if (userDataString) setUser(JSON.parse(userDataString));
        }
      }
    } catch (e: any) {
      // If it's a 401, it just means the token is expired/invalid, which is fine
      if (e.response && e.response.status === 401) {
        // Token is invalid, clear it (interceptor also handles this now)
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        setUser(null);
      } else {
        console.error('Auth check error', e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
