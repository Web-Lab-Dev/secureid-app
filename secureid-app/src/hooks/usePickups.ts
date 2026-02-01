import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import type { PickupDocument } from '@/types/profile';
import { logger } from '@/lib/logger';

/**
 * PHASE 8 - HOOK PICKUPS
 *
 * Hook pour gérer les récupérateurs autorisés d'un profil
 */

export function usePickups(profileId: string | null) {
  const [pickups, setPickups] = useState<PickupDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  // Ref to prevent state updates after unmount
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    if (!profileId) {
      if (isMountedRef.current) {
        setPickups([]);
        setLoading(false);
      }
      return;
    }

    if (isMountedRef.current) {
      setLoading(true);
      setError(null);
    }

    // Créer la query pour les pickups
    const pickupsRef = collection(db, 'profiles', profileId, 'pickups');
    const pickupsQuery = query(pickupsRef, orderBy('createdAt', 'desc'));

    // Écouter les changements en temps réel
    const unsubscribe = onSnapshot(
      pickupsQuery,
      (snapshot) => {
        // Guard against updates after unmount
        if (!isMountedRef.current) return;

        const pickupsData: PickupDocument[] = [];

        snapshot.forEach((doc) => {
          pickupsData.push({
            id: doc.id,
            ...doc.data(),
          } as PickupDocument);
        });

        setPickups(pickupsData);
        setLoading(false);
      },
      (err) => {
        // Guard against updates after unmount
        if (!isMountedRef.current) return;

        logger.error('Error fetching pickups', { error: err, profileId });
        setError(err as Error);
        setLoading(false);
      }
    );

    // Cleanup
    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, [profileId]);

  return { pickups, loading, error };
}
