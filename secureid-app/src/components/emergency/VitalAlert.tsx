'use client';

import { AlertTriangle, AlertCircle, Pill } from 'lucide-react';
import type { ProfileDocument } from '@/types/profile';

/**
 * PHASE 5 - VITAL ALERT
 *
 * Bloc d'alerte vitale affichant:
 * - Allergies
 * - Conditions médicales
 * - Notes médicales importantes
 *
 * Design: Encadré rouge/orange avec icônes
 */

interface VitalAlertProps {
  profile: ProfileDocument;
}

export function VitalAlert({ profile }: VitalAlertProps) {
  const { allergies, conditions, medications, notes } = profile.medicalInfo;

  const hasAllergies = allergies.length > 0;
  const hasConditions = conditions.length > 0;
  const hasMedications = medications.length > 0;
  const hasNotes = notes && notes.trim() !== '';

  // Si aucune donnée, ne rien afficher
  if (!hasAllergies && !hasConditions && !hasMedications && !hasNotes) {
    return null;
  }

  return (
    <div className="rounded-lg border-2 border-red-500/50 bg-red-500/10 p-4">
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle className="h-6 w-6 text-red-500" />
        <h2 className="text-lg font-bold uppercase text-red-500">Informations Vitales</h2>
      </div>

      <div className="space-y-3">
        {/* Allergies */}
        {hasAllergies && (
          <div>
            <div className="mb-1 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <h3 className="font-semibold text-orange-500">Allergies</h3>
            </div>
            <ul className="ml-6 list-disc space-y-1">
              {allergies.map((allergy) => (
                <li key={`allergy-${allergy}`} className="text-white">
                  {allergy}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Conditions médicales */}
        {hasConditions && (
          <div>
            <div className="mb-1 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <h3 className="font-semibold text-yellow-500">Conditions Médicales</h3>
            </div>
            <ul className="ml-6 list-disc space-y-1">
              {conditions.map((condition) => (
                <li key={`condition-${condition}`} className="text-white">
                  {condition}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Médicaments */}
        {hasMedications && (
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Pill className="h-4 w-4 text-blue-500" />
              <h3 className="font-semibold text-blue-500">Médicaments</h3>
            </div>
            <ul className="ml-6 list-disc space-y-1">
              {medications.map((medication) => (
                <li key={`medication-${medication}`} className="text-white">
                  {medication}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Notes médicales */}
        {hasNotes && (
          <div className="rounded border border-slate-700 bg-slate-900/50 p-3">
            <p className="text-sm italic text-slate-300">{notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
