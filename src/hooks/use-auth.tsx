'use client';

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        if (router.pathname === '/auth') {
            router.push('/');
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleAuthError = (err: any) => {
    console.error(err);
    // Firebase provides user-friendly error messages
    // but we can customize them if needed.
    setError(err.message || 'An unexpected error occurred.');
    setLoading(false);
  };
  
  const clearError = () => setError(null);

  const signInWithGoogle = async () => {
    setLoading(true);
    clearError();
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle the rest
      router.push('/');
    } catch (err) {
      handleAuthError(err);
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    clearError();
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged will handle the rest
      router.push('/');
    } catch (err) {
      handleAuthError(err);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    clearError();
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged will handle the rest
      router.push('/');
    } catch (err) {
      handleAuthError(err);
    }
  };

  const signOut = async () => {
    setLoading(true);
    clearError();
    try {
      await firebaseSignOut(auth);
      router.push('/auth');
    } catch (err) {
      handleAuthError(err);
    } finally {
        setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
