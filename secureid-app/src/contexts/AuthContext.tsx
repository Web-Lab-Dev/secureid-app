'use client';

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
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

  // Mémoiser la valeur du context pour éviter les re-renders inutiles
  // Ne re-créer l'objet que si les valeurs réellement utilisées changent
  const value = useMemo(
    () => ({
      user: auth.user,
      userData: auth.userData,
      loading: auth.loading,
      error: auth.error,
      signUp: auth.signUp,
      signIn: auth.signIn,
      signOut: auth.signOut,
      refreshUserData: auth.refreshUserData,
    }),
    [
      auth.user,
      auth.userData,
      auth.loading,
      auth.error,
      auth.signUp,
      auth.signIn,
      auth.signOut,
      auth.refreshUserData,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
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

  // En SSR, retourner un contexte vide au lieu de throw
  // Le composant client va se re-rendre côté client avec le bon contexte
  // FIX: Messages d'erreur plus clairs pour éviter confusion
  if (typeof window === 'undefined') {
    return {
      user: null,
      userData: null,
      loading: true,
      error: null,
      signUp: async () => {
        console.warn('[AuthContext] Authentication called during server-side rendering');
        throw new Error('Authentication not available during server-side rendering');
      },
      signIn: async () => {
        console.warn('[AuthContext] Authentication called during server-side rendering');
        throw new Error('Authentication not available during server-side rendering');
      },
      signOut: async () => {
        console.warn('[AuthContext] Sign out called during SSR - ignoring');
      },
      refreshUserData: async () => {
        console.warn('[AuthContext] Refresh user data called during SSR - ignoring');
      },
    } as AuthContextType;
  }

  if (context === undefined) {
    throw new Error('useAuthContext doit être utilisé dans un AuthProvider');
  }

  return context;
}
