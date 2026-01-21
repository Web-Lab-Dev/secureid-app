'use client';

import React from 'react';
import Image from 'next/image';
import { UserPlus, Users, Loader2, AlertCircle } from 'lucide-react';
import { useProfiles } from '@/hooks/useProfiles';
import type { ProfileDocument } from '@/types/profile';
import { Button } from '@/components/ui/button';

/**
 * PHASE 3C - SÉLECTEUR DE PROFIL
 *
 * Permet au parent de choisir entre:
 * 1. Créer un nouveau profil enfant
 * 2. Lier le bracelet à un enfant existant (transfert)
 */

interface ProfileSelectorProps {
  /** Callback appelé lors de la sélection "Nouvel enfant" */
  onNewProfile: () => void;

  /** Callback appelé lors de la sélection d'un profil existant */
  onSelectProfile: (profile: ProfileDocument) => void;

  /** Nom du parent (pour personnalisation) */
  parentName?: string;
}

export const ProfileSelector = React.memo(function ProfileSelector({
  onNewProfile,
  onSelectProfile,
  parentName,
}: ProfileSelectorProps) {
  const { profiles, loading, error } = useProfiles();

  // Pendant le chargement
  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-slate-900 rounded-lg border border-slate-800 p-12 text-center">
          <Loader2 className="w-12 h-12 text-brand-orange animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Chargement de vos profils...</p>
        </div>
      </div>
    );
  }

  // En cas d'erreur
  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-400 mb-2">Erreur de chargement</h3>
          <p className="text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-0">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          {parentName ? `Bonjour ${parentName}` : 'Choisissez un profil'}
        </h2>
        <p className="text-gray-400">
          Associez ce bracelet à un enfant
        </p>
      </div>

      <div className="space-y-4">
        {/* Card: Nouvel enfant */}
        <Button
          onClick={onNewProfile}
          variant="secondary"
          className="w-full border-2 border-brand-orange p-6 transition-all group text-left h-auto"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-16 h-16 rounded-full bg-brand-orange/10 flex items-center justify-center group-hover:bg-brand-orange/20 transition-colors">
              <UserPlus className="w-8 h-8 text-brand-orange" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">
                Nouvel Enfant
              </h3>
              <p className="text-gray-400 text-sm">
                Créer un nouveau profil avec informations médicales et contacts d&apos;urgence
              </p>
            </div>
            <div className="flex-shrink-0 text-brand-orange font-bold text-2xl">
              →
            </div>
          </div>
        </Button>

        {/* Séparateur si des profils existent */}
        {profiles.length > 0 && (
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-brand-black text-gray-400">
                Ou choisir un enfant existant
              </span>
            </div>
          </div>
        )}

        {/* Liste des profils existants */}
        {profiles.length > 0 ? (
          <div className="space-y-3">
            {profiles.map((profile) => (
              <Button
                key={profile.id}
                onClick={() => onSelectProfile(profile)}
                variant="secondary"
                className="w-full p-4 transition-all group text-left h-auto"
              >
                <div className="flex items-center gap-4">
                  {/* Photo ou initiale */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                    {profile.photoUrl ? (
                      <Image
                        src={profile.photoUrl}
                        alt={profile.fullName}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-lg font-bold text-white">
                        {profile.fullName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Infos */}
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">
                      {profile.fullName}
                    </h4>
                    <p className="text-xs text-gray-400">
                      {profile.currentBraceletId
                        ? `Bracelet actuel: ${profile.currentBraceletId}`
                        : 'Aucun bracelet lié'}
                    </p>
                  </div>

                  {/* Icône */}
                  <div className="flex-shrink-0">
                    <Users className="w-5 h-5 text-gray-400 group-hover:text-brand-orange transition-colors" />
                  </div>
                </div>

                {/* Warning si bracelet déjà lié */}
                {profile.currentBraceletId && (
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <p className="text-xs text-yellow-500">
                      ⚠️ Ce profil a déjà un bracelet. Le sélectionner remplacera l&apos;ancien bracelet.
                    </p>
                  </div>
                )}
              </Button>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 text-center">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              Vous n&apos;avez pas encore de profil enfant enregistré.
              <br />
              Créez votre premier profil ci-dessus.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});
