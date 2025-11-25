'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthContext } from '@/contexts/AuthContext';
import type { ProfileDocument } from '@/types/profile';

/**
 * PHASE 3C - HOOK PROFILS
 *
 * Hook React personnalisé pour gérer les profils enfants d'un parent
 */

interface UseProfilesReturn {
  /** Liste des profils enfants du parent connecté */
  profiles: ProfileDocument[];

  /** État de chargement */
  loading: boolean;

  /** Erreur lors du chargement */
  error: string | null;

  /** Recharger les profils */
  refetch: () => Promise<void>;
}

export function useProfiles(): UseProfilesReturn {
  const { user } = useAuthContext();
  const [profiles, setProfiles] = useState<ProfileDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = async () => {
    if (!user) {
      setProfiles([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Query Firestore pour récupérer les profils du parent
      const profilesRef = collection(db, 'profiles');
      const q = query(
        profilesRef,
        where('parentId', '==', user.uid),
        where('status', '==', 'ACTIVE'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);

      const fetchedProfiles: ProfileDocument[] = [];
      querySnapshot.forEach((doc) => {
        fetchedProfiles.push(doc.data() as ProfileDocument);
      });

      setProfiles(fetchedProfiles);
    } catch (err: any) {
      console.error('Erreur lors du chargement des profils:', err);
      setError('Impossible de charger les profils');
    } finally {
      setLoading(false);
    }
  };

  // Charger les profils au montage et quand l'utilisateur change
  useEffect(() => {
    fetchProfiles();
  }, [user]);

  return {
    profiles,
    loading,
    error,
    refetch: fetchProfiles,
  };
}
