'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '@/types';
import { api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string, role: Role, organizationName?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapBackendUser(bUser: any): User {
  let role: Role = 'user';
  if (bUser.role === 'platform_admin') {
    role = 'admin';
  } else if (bUser.role === 'admin' || bUser.role === 'staff') {
    role = 'agency';
  }

  return {
    _id: bUser.id || bUser._id || bUser.sub,
    name: `${bUser.firstName || ''} ${bUser.lastName || ''}`.trim() || bUser.email?.split('@')?.[0] || 'User',
    email: bUser.email,
    role,
    organization_id: bUser.organizationId,
    createdAt: bUser.createdAt || new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    api.get('/auth/me')
      .then(res => {
        const u = res?.user || res;
        if (u && (u.id || u._id || u.sub)) {
          setUser(mapBackendUser(u));
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        // User session invalid or unauthenticated
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const token = res?.access_token || res?.token;
      if (token && typeof window !== 'undefined') {
        localStorage.setItem('voynex_token', token);
      }
      const u = res?.user || res;
      const mapped = mapBackendUser(u);
      setUser(mapped);
      setLoading(false);
      return mapped;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const signup = async (name: string, email: string, password: string, role: Role, organizationName?: string) => {
    setLoading(true);
    try {
      const nameParts = name.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      let backendRole = 'user';
      if (role === 'admin') backendRole = 'platform_admin';
      else if (role === 'agency') backendRole = 'admin'; // admin of their org

      // Register the user
      await api.post('/users/register', {
        email,
        password,
        firstName,
        lastName,
        role: backendRole,
        organizationName,
      });

      // Log in automatically after registration
      const loginRes = await api.post('/auth/login', { email, password });
      const token = loginRes?.access_token || loginRes?.token;
      if (token && typeof window !== 'undefined') {
        localStorage.setItem('voynex_token', token);
      }
      setUser(mapBackendUser(loginRes?.user || loginRes));
      setLoading(false);
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('voynex_token');
    }
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
