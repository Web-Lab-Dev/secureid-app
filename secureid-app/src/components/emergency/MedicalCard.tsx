'use client';

import { Activity, Droplet, AlertCircle, Pill } from 'lucide-react';
import type { ProfileDocument } from '@/types/profile';

/**
 * PHASE 5 V2 - MEDICAL CARD (Dossier Médical)
 *
 * Carte séparée avec informations vitales:
 * - Groupe sanguin (badge)
 * - Allergies (texte rouge)
 * - Conditions (liste)
 * - Médicaments (liste)
 * - Notes médicales
 */

interface MedicalCardProps {
  profile: ProfileDocument;
}

export function MedicalCard({ profile }: MedicalCardProps) {
  const { bloodType, allergies, conditions, medications, notes } = profile.medicalInfo;

  const hasAllergies = allergies.length > 0;
  const hasConditions = conditions.length > 0;
  const hasMedications = medications.length > 0;
  const hasNotes = notes && notes.trim() !== '';

  // Si aucune donnée médicale, ne pas afficher
  if (!bloodType && !hasAllergies && !hasConditions && !hasMedications && !hasNotes) {
    return null;
  }

  return (
    <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-xl">
      {/* En-tête */}
      <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
        <Activity className="h-5 w-5 text-orange-500" />
        <h2 className="text-lg font-bold uppercase tracking-wide text-orange-500">
          Info Vitale
        </h2>
      </div>

      {/* Contenu (Grid 2 colonnes sur desktop) */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Groupe Sanguin */}
        {bloodType && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Groupe Sanguin
            </p>
            <div className="inline-flex items-center gap-2 rounded-md bg-slate-700 px-4 py-2">
              <Droplet className="h-4 w-4 text-red-500" fill="currentColor" />
              <span className="text-lg font-bold text-white">{bloodType}</span>
            </div>
          </div>
        )}

        {/* Allergies */}
        {hasAllergies && (
          <div className="sm:col-span-2 rounded-lg bg-red-500/10 p-3 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <div className="mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <p className="text-xs font-semibold uppercase tracking-wide text-red-400">
                Allergies
              </p>
            </div>
            <ul className="ml-6 list-disc space-y-1">
              {allergies.map((allergy, index) => (
                <li key={index} className="text-red-400">
                  {allergy}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Maladies */}
        {hasConditions && (
          <div className="sm:col-span-2">
            <div className="mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              <p className="text-xs font-semibold uppercase tracking-wide text-yellow-400">
                Maladies
              </p>
            </div>
            <ul className="ml-6 list-disc space-y-1">
              {conditions.map((condition, index) => (
                <li key={index} className="text-slate-300">
                  {condition}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Médicaments */}
        {hasMedications && (
          <div className="sm:col-span-2">
            <div className="mb-2 flex items-center gap-2">
              <Pill className="h-4 w-4 text-blue-400" />
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-400">
                Médicaments
              </p>
            </div>
            <ul className="ml-6 list-disc space-y-1">
              {medications.map((medication, index) => (
                <li key={index} className="text-slate-300">
                  {medication}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Notes Médicales */}
        {hasNotes && (
          <div className="sm:col-span-2">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Notes Importantes
            </p>
            <div className="rounded-md bg-slate-900/50 p-3">
              <p className="text-sm italic text-slate-300">{notes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
