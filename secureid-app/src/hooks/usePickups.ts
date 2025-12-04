import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (!profileId) {
      setPickups([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Créer la query pour les pickups
    const pickupsRef = collection(db, 'profiles', profileId, 'pickups');
    const pickupsQuery = query(pickupsRef, orderBy('createdAt', 'desc'));

    // Écouter les changements en temps réel
    const unsubscribe = onSnapshot(
      pickupsQuery,
      (snapshot) => {
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
        logger.error('Error fetching pickups', { error: err, profileId });
        setError(err as Error);
        setLoading(false);
      }
    );

    // Cleanup
    return () => unsubscribe();
  }, [profileId]);

  return { pickups, loading, error };
}
