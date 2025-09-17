'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser } from '../../domain/entities/User';
import { SignInUseCase } from '../../domain/usecases/SignInUseCase';
import { SignOutUseCase } from '../../domain/usecases/SignOutUseCase';
import { GetCurrentUserUseCase } from '../../domain/usecases/GetCurrentUserUseCase';
import { FirebaseAuthRepository } from '../../data/repositories/FirebaseAuthRepository';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
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
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize use cases
  const authRepository = new FirebaseAuthRepository();
  const signInUseCase = new SignInUseCase(authRepository);
  const signOutUseCase = new SignOutUseCase(authRepository);

  useEffect(() => {
    const unsubscribe = authRepository.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, [authRepository]);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      await signInUseCase.execute({ email, password });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };


  const logout = async () => {
    try {
      setError(null);
      await signOutUseCase.execute();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    logout,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
