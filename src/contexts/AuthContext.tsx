import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMutation, useApolloClient } from '@apollo/client';
import { LOGIN_MUTATION, REGISTER_MUTATION } from '../graphql/queries/auth';

interface User {
  id: number;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('user')
      return storedUser ? JSON.parse(storedUser) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('token')
    } catch {
      return null
    }
  })
  
  const apolloClient = useApolloClient();
  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [registerMutation] = useMutation(REGISTER_MUTATION);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (storedToken) setToken(storedToken);
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch {}
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      
      const { data } = await loginMutation({
        variables: {
          username,
          password
        }
      });
      

      const { user: userData, token: newToken } = data.login;
      setUser(userData);
      setToken(newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', newToken);
      return true;
    } catch (error) {
      return false;
    }
  };

  const register = async (username: string, password: string): Promise<boolean> => {
    try {
      
      const { data } = await registerMutation({
        variables: {
          username,
          password,
          role: 'user'
        }
      });
      
      
      if (data.register) {
        const userData = data.register;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        return await login(username, password);
      }
      
      return true;
    } catch (error: any) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!(token || (typeof localStorage !== 'undefined' && localStorage.getItem('token'))),
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
