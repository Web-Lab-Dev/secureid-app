'use client';

import Image from 'next/image';
import { User, Droplet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ProfileDocument } from '@/types/profile';
import { ScanEffect } from './ScanEffect';

/**
 * PHASE 5 - CHILD IDENTITY
 *
 * Section identité de l'enfant pour secouristes
 * - Photo grande et circulaire
 * - Nom complet
 * - Âge calculé depuis date de naissance
 * - Groupe sanguin très visible
 */

interface ChildIdentityProps {
  profile: ProfileDocument;
}

function calculateAge(dateOfBirth: Date | null): number | null {
  if (!dateOfBirth) return null;

  const today = new Date();
  const birthDate = dateOfBirth instanceof Date ? dateOfBirth : new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

export function ChildIdentity({ profile }: ChildIdentityProps) {
  const dateOfBirth = profile.dateOfBirth
    ? profile.dateOfBirth.toDate
      ? profile.dateOfBirth.toDate()
      : new Date(profile.dateOfBirth as unknown as string)
    : null;

  const age = calculateAge(dateOfBirth);

  return (
    <div className="relative rounded-2xl border border-slate-700 bg-slate-900 p-6 text-center">
      {/* Photo avec effet scan */}
      <div className="relative mx-auto mb-4 h-32 w-32">
        <div className="relative h-full w-full overflow-hidden rounded-full border-4 border-brand-orange shadow-lg shadow-brand-orange/50">
          {profile.photoUrl ? (
            <Image
              src={profile.photoUrl}
              alt={profile.fullName}
              width={128}
              height={128}
              className="h-full w-full object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-800">
              <User className="h-16 w-16 text-slate-600" />
            </div>
          )}
        </div>

        {/* Effet scan biométrique */}
        <ScanEffect />
      </div>

      {/* Nom */}
      <h1 className="mb-2 text-3xl font-bold text-white">{profile.fullName}</h1>

      {/* Âge */}
      {age !== null && (
        <p className="mb-4 text-lg text-slate-400">
          {age} {age > 1 ? 'ans' : 'an'}
        </p>
      )}

      {/* Groupe Sanguin */}
      {profile.medicalInfo.bloodType && (
        <div className="inline-flex items-center gap-2 rounded-full border-2 border-red-500 bg-red-500/10 px-6 py-3">
          <Droplet className="h-5 w-5 text-red-500" fill="currentColor" />
          <span className="text-2xl font-bold text-red-500">
            {profile.medicalInfo.bloodType}
          </span>
        </div>
      )}
    </div>
  );
}
