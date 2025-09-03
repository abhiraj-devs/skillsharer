'use client';
import { createContext, useContext } from 'react';
import type { User } from '@/lib/auth';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string, recaptchaToken: string) => Promise<User>;
  logout: () => void;
  register: (email: string, password: string, recaptchaToken: string) => Promise<User>;
  updateUser: (data: Partial<User>) => Promise<User>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
