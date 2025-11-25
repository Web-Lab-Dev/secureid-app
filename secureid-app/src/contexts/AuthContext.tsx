'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { useAuth } from '@/hooks/useAuth';
import type { UserDocument, SignupData, LoginData } from '@/types/user';

/**
 * PHASE 3B - CONTEXT AUTHENTIFICATION
 *
 * Provider React Context pour rendre le hook useAuth accessible
 * partout dans l'application
 */

interface AuthContextType {
  user: User | null;
  userData: UserDocument | null;
  loading: boolean;
  error: string | null;
  signUp: (data: SignupData) => Promise<User>;
  signIn: (data: LoginData) => Promise<User>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provider qui enveloppe l'application pour fournir l'authentification
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

/**
 * Hook pour accéder au contexte d'authentification
 *
 * @example
 * function MyComponent() {
 *   const { user, signIn, signOut } = useAuthContext();
 *
 *   if (!user) {
 *     return <LoginButton onClick={() => signIn(data)} />;
 *   }
 *
 *   return <button onClick={signOut}>Déconnexion</button>;
 * }
 */
export function useAuthContext() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuthContext doit être utilisé dans un AuthProvider');
  }

  return context;
}
