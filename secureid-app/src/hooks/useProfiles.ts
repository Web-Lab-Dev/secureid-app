'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
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

  const fetchProfiles = useCallback(async () => {
    if (!user) {
      setProfiles([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Query Firestore pour récupérer les profils du parent
      // OPTIMISATION: Retrait de orderBy pour éviter d'avoir besoin d'un index composite
      // Le tri se fait côté client
      const profilesRef = collection(db, 'profiles');
      const q = query(
        profilesRef,
        where('parentId', '==', user.uid),
        where('status', '==', 'ACTIVE')
      );

      const querySnapshot = await getDocs(q);

      const fetchedProfiles: ProfileDocument[] = [];
      querySnapshot.forEach((doc) => {
        fetchedProfiles.push(doc.data() as ProfileDocument);
      });

      // Trier côté client par date de création (plus récent en premier)
      fetchedProfiles.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });

      setProfiles(fetchedProfiles);
    } catch (err: unknown) {
      console.error('Erreur lors du chargement des profils:', err);
      setError('Impossible de charger les profils');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Charger les profils au montage et quand l'utilisateur change
  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return {
    profiles,
    loading,
    error,
    refetch: fetchProfiles,
  };
}
