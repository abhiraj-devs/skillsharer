'use client';
import {
  AuthContext,
  type User,
  login as loginService,
  register as registerService,
  updateUser as updateUserService,
  getMe,
} from '@/lib/auth';
import { useRouter } from 'next/navigation';
import {
  useState,
  useEffect,
  type ReactNode,
  useCallback,
  useMemo,
} from 'react';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const router = useRouter();

  const handleAuthRedirect = useCallback(
    (path: string) => {
      router.push(path);
    },
    [router]
  );

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const loggedInUser = await loginService(email, password);
      setUser(loggedInUser);
      handleAuthRedirect('/');
      return loggedInUser;
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    skills: string
  ): Promise<User> => {
    setLoading(true);
    try {
      const registeredUser = await registerService(email, password, name, skills);
      setUser(registeredUser);
      handleAuthRedirect('/');
      return registeredUser;
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const updateUser = async (data: Partial<User>): Promise<User> => {
    try {
      const updatedUser = await updateUserService(data);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      // Potentially handle error state in UI
      console.error('Failed to update user', error);
      throw error;
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    handleAuthRedirect('/auth');
  }, [handleAuthRedirect]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getMe()
        .then((userData) => {
          if (userData) {
            setUser(userData);
          } else {
            logout();
          }
        })
        .catch(() => {
          logout(); // Also logout on error
        })
        .finally(() => {
          setLoading(false);
          setInitialLoad(false);
        });
    } else {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [logout]);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      register,
      updateUser,
      loading,
      isAuthenticated: !!user,
    }),
    [user, loading, register]
  );

  return (
    <AuthContext.Provider value={value}>
      {initialLoad ? (
        <div className="flex h-screen w-full items-center justify-center">
          {/* You might want a spinner here */}
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
