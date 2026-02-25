'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { SafeZonesClient } from './safe-zones-client';
import type { ProfileDocument } from '@/types/profile';

interface SafeZonesClientWrapperProps {
  profileId: string;
}

export function SafeZonesClientWrapper({ profileId }: SafeZonesClientWrapperProps) {
  const [profile, setProfile] = useState<ProfileDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const profileDoc = await getDoc(doc(db, 'profiles', profileId));

        if (profileDoc.exists()) {
          setProfile({ ...profileDoc.data(), id: profileDoc.id } as ProfileDocument);
        } else {
          setError('Profil introuvable');
        }
      } catch {
        setError('Erreur lors du chargement du profil');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [profileId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h3 className="text-lg font-bold text-white mb-2">Erreur</h3>
          <p className="text-sm text-slate-400">{error || 'Profil introuvable'}</p>
        </div>
      </div>
    );
  }

  return <SafeZonesClient profile={profile} />;
}
