'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { generateEmailFromPhone, normalizePhoneNumber } from '@/lib/auth-helpers';
import { logger } from '@/lib/logger';
import type { UserDocument, SignupData, LoginData } from '@/types/user';
import type { FirestoreTimestamp } from '@/types/firebase';
import { isFirebaseError } from '@/types/error';

/**
 * PHASE 3A - HOOK AUTHENTIFICATION
 *
 * Hook React personnalisé pour gérer l'authentification Firebase
 * avec système de "magic email" (numéro → email généré)
 */

interface UseAuthReturn {
  /** Utilisateur Firebase Auth (null si non connecté) */
  user: User | null;

  /** Données utilisateur Firestore (null si non connecté) */
  userData: UserDocument | null;

  /** État de chargement initial */
  loading: boolean;

  /** Erreur d'authentification */
  error: string | null;

  /** Fonction de création de compte */
  signUp: (data: SignupData) => Promise<User>;

  /** Fonction de connexion */
  signIn: (data: LoginData) => Promise<User>;

  /** Fonction de déconnexion */
  signOut: () => Promise<void>;

  /** Recharger les données utilisateur depuis Firestore */
  refreshUserData: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Charger les données utilisateur depuis Firestore
   */
  const loadUserData = useCallback(async (uid: string): Promise<void> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));

      if (userDoc.exists()) {
        setUserData(userDoc.data() as UserDocument);
      } else {
        setUserData(null);
      }
    } catch (err) {
      logger.error('Error loading user data', { error: err, uid });
      setUserData(null);
    }
  }, []);

  // Écouter les changements d'état d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Charger les données utilisateur depuis Firestore
        await loadUserData(firebaseUser.uid);
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [loadUserData]);

  /**
   * Créer un nouveau compte utilisateur
   */
  const signUp = useCallback(async (data: SignupData): Promise<User> => {
    try {
      setError(null);
      setLoading(true);

      // Normaliser le numéro et générer l'email
      const normalizedPhone = normalizePhoneNumber(data.phoneNumber);
      const generatedEmail = generateEmailFromPhone(normalizedPhone);

      // Créer le compte Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        generatedEmail,
        data.password
      );

      const firebaseUser = userCredential.user;

      // Mettre à jour le displayName dans Firebase Auth
      await updateProfile(firebaseUser, {
        displayName: data.displayName,
      });

      // Créer le document utilisateur dans Firestore
      const userDocument: Omit<UserDocument, 'createdAt' | 'lastLoginAt'> & {
        createdAt: FirestoreTimestamp;
        lastLoginAt: FirestoreTimestamp;
      } = {
        uid: firebaseUser.uid,
        phoneNumber: normalizedPhone,
        generatedEmail: generatedEmail,
        displayName: data.displayName,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        profileCount: 0,
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userDocument);

      // Recharger les données
      await loadUserData(firebaseUser.uid);

      return firebaseUser;
    } catch (err: unknown) {
      logger.error('Error during signup', { error: err, phone: data.phone });

      // Messages d'erreur en français
      if (isFirebaseError(err)) {
        if (err.code === 'auth/email-already-in-use') {
          throw new Error('Ce numéro de téléphone est déjà utilisé');
        } else if (err.code === 'auth/weak-password') {
          throw new Error('Le mot de passe est trop faible');
        } else if (err.code === 'auth/invalid-email') {
          throw new Error('Numéro de téléphone invalide');
        }
        throw new Error('Erreur lors de la création du compte: ' + err.message);
      }
      throw new Error('Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  }, [loadUserData]);

  /**
   * Connexion avec numéro + mot de passe
   */
  const signIn = useCallback(async (data: LoginData): Promise<User> => {
    try {
      setError(null);
      setLoading(true);

      // Normaliser le numéro et générer l'email
      const normalizedPhone = normalizePhoneNumber(data.phoneNumber);
      const generatedEmail = generateEmailFromPhone(normalizedPhone);

      // Se connecter avec l'email généré
      const userCredential = await signInWithEmailAndPassword(
        auth,
        generatedEmail,
        data.password
      );

      const firebaseUser = userCredential.user;

      // Mettre à jour lastLoginAt
      await setDoc(
        doc(db, 'users', firebaseUser.uid),
        {
          lastLoginAt: serverTimestamp(),
        },
        { merge: true }
      );

      // Recharger les données
      await loadUserData(firebaseUser.uid);

      return firebaseUser;
    } catch (err: unknown) {
      logger.error('Error during signin', { error: err, phone: data.phone });

      // Messages d'erreur en français
      if (isFirebaseError(err)) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
          throw new Error('Numéro ou mot de passe incorrect');
        } else if (err.code === 'auth/invalid-email') {
          throw new Error('Numéro de téléphone invalide');
        } else if (err.code === 'auth/too-many-requests') {
          throw new Error('Trop de tentatives. Réessayez plus tard');
        }
        throw new Error('Erreur lors de la connexion: ' + err.message);
      }
      throw new Error('Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  }, [loadUserData]);

  /**
   * Déconnexion
   */
  const signOut = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      await firebaseSignOut(auth);
      setUser(null);
      setUserData(null);
    } catch (err: unknown) {
      logger.error('Error during signout', { error: err });
      throw new Error('Erreur lors de la déconnexion');
    }
  }, []);

  /**
   * Recharger les données utilisateur
   */
  const refreshUserData = useCallback(async (): Promise<void> => {
    if (user) {
      await loadUserData(user.uid);
    }
  }, [user, loadUserData]);

  return {
    user,
    userData,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    refreshUserData,
  };
}
