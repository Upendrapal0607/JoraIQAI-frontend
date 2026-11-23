'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, Role } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string, role?: Role) => Promise<void>;
  register: (data: { email: string; password: string; name: string; role: Role }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function loadUserFromStorage() {
      const storedToken = localStorage.getItem('joraiq_token');
      const storedUser = localStorage.getItem('joraiq_user');

      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
        } catch {
          localStorage.removeItem('joraiq_user');
        }
      }

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      setToken(storedToken);
      try {
        const profile = await api.get<User>('/auth/me');
        setUser(profile);
        localStorage.setItem('joraiq_user', JSON.stringify(profile));
      } catch (err) {
        console.warn('Session expired or invalid token:', err);
        localStorage.removeItem('joraiq_token');
        localStorage.removeItem('joraiq_user');
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserFromStorage();
  }, []);

  // Global Route Guard: If user is logged in, redirect away from landing & auth pages to their dashboard
  useEffect(() => {
    if (!isLoading && user) {
      const isPublicLandingOrAuthPage =
        pathname === '/' || pathname === '/login' || pathname === '/register';

      if (isPublicLandingOrAuthPage) {
        if (user.role === 'TEACHER') {
          router.replace('/teacher/dashboard');
        } else {
          router.replace('/student/dashboard');
        }
      }
    }
  }, [user, isLoading, pathname, router]);

  const handleAuthSuccess = (userData: User, accessToken: string) => {
    localStorage.setItem('joraiq_token', accessToken);
    localStorage.setItem('joraiq_user', JSON.stringify(userData));
    setUser(userData);
    setToken(accessToken);

    if (userData.role === 'TEACHER') {
      router.push('/teacher/dashboard');
    } else {
      router.push('/student/dashboard');
    }
  };

  const login = async (email: string, password: string, role?: Role) => {
    setIsLoading(true);
    try {
      const res = await api.post<{ user: User; accessToken: string }>('/auth/login', {
        email,
        password,
        role,
      });

      handleAuthSuccess(res.user, res.accessToken);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    name: string;
    role: Role;
  }) => {
    setIsLoading(true);
    try {
      const res = await api.post<{ user: User; accessToken: string }>('/auth/register', data);
      handleAuthSuccess(res.user, res.accessToken);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('joraiq_token');
    localStorage.removeItem('joraiq_user');
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
