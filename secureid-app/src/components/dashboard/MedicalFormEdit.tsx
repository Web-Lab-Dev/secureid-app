'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save } from 'lucide-react';
import { updateProfile } from '@/actions/profile-actions';
import { useAuthContext } from '@/contexts/AuthContext';
import type { ProfileDocument } from '@/types/profile';
import { phoneSchema } from '@/schemas/activation';
import type { RelationshipType } from '@/types/profile';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';

/**
 * PHASE 4B - FORMULAIRE ÉDITION PROFIL
 *
 * Formulaire pour modifier les informations médicales publiques
 * (groupe sanguin, allergies, conditions, médicaments, contacts d'urgence)
 */

// Schema simplifié pour l'édition (sans photo et PIN)
const editProfileSchema = z.object({
  fullName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN']),
  allergies: z.string(),
  conditions: z.string(),
  medications: z.string(),
  medicalNotes: z.string(),
  emergencyContactName: z.string().min(2),
  emergencyContactPhone: phoneSchema,
  emergencyContactRelation: z.string(),
});

type EditProfileData = z.infer<typeof editProfileSchema>;

interface MedicalFormEditProps {
  profile: ProfileDocument;
  onUpdate?: () => void;
}

export function MedicalFormEdit({ profile, onUpdate }: MedicalFormEditProps) {
  const { user } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditProfileData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      fullName: profile.fullName,
      bloodType: profile.medicalInfo.bloodType,
      allergies: profile.medicalInfo.allergies.join(', '),
      conditions: profile.medicalInfo.conditions.join(', '),
      medications: profile.medicalInfo.medications.join(', '),
      medicalNotes: profile.medicalInfo.notes || '',
      emergencyContactName: profile.emergencyContacts[0]?.name || '',
      emergencyContactPhone: profile.emergencyContacts[0]?.phone || '',
      emergencyContactRelation: profile.emergencyContacts[0]?.relationship || 'PARENT',
    },
  });

  const onSubmit = async (data: EditProfileData) => {
    if (!user) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Convertir les strings en arrays
      const allergiesArray = data.allergies
        .split(',')
        .map((a) => a.trim())
        .filter((a) => a !== '');
      const conditionsArray = data.conditions
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c !== '');
      const medicationsArray = data.medications
        .split(',')
        .map((m) => m.trim())
        .filter((m) => m !== '');

      const result = await updateProfile({
        profileId: profile.id,
        userId: user.uid, // 🔒 SECURITY: Passer userId pour vérification ownership
        updates: {
          fullName: data.fullName,
          bloodType: data.bloodType,
          allergies: allergiesArray,
          conditions: conditionsArray,
          medications: medicationsArray,
          medicalNotes: data.medicalNotes,
          emergencyContacts: [
            {
              name: data.emergencyContactName,
              phone: data.emergencyContactPhone,
              relationship: data.emergencyContactRelation as RelationshipType,
              email: profile.emergencyContacts[0]?.email || '',
            },
            ...profile.emergencyContacts.slice(1),
          ],
        },
      });

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la mise à jour');
      }

      setSuccess(true);
      onUpdate?.();

      // Masquer le message de succès après 3s
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      logger.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Message de succès */}
      {success && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-4">
          <p className="text-sm text-green-500">✓ Profil mis à jour avec succès</p>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Nom complet */}
      <div>
        <label className="mb-2 block text-sm font-medium text-white">
          Nom complet
        </label>
        <input
          {...register('fullName')}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-brand-orange focus:outline-none"
        />
        {errors.fullName && (
          <p className="mt-1 text-sm text-red-500">{errors.fullName.message}</p>
        )}
      </div>

      {/* Groupe sanguin */}
      <div>
        <label className="mb-2 block text-sm font-medium text-white">
          Groupe sanguin
        </label>
        <select
          {...register('bloodType')}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-brand-orange focus:outline-none"
        >
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
          <option value="UNKNOWN">Non connu</option>
        </select>
        {errors.bloodType && (
          <p className="mt-1 text-sm text-red-500">{errors.bloodType.message}</p>
        )}
      </div>

      {/* Allergies */}
      <div>
        <label className="mb-2 block text-sm font-medium text-white">
          Allergies
          <span className="ml-2 text-xs font-normal text-slate-400">
            (Séparer par des virgules)
          </span>
        </label>
        <input
          {...register('allergies')}
          placeholder="Arachides, Pénicilline, Latex..."
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-brand-orange focus:outline-none"
        />
      </div>

      {/* Conditions médicales */}
      <div>
        <label className="mb-2 block text-sm font-medium text-white">
          Conditions médicales
          <span className="ml-2 text-xs font-normal text-slate-400">
            (Séparer par des virgules)
          </span>
        </label>
        <input
          {...register('conditions')}
          placeholder="Asthme, Diabète, Épilepsie..."
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-brand-orange focus:outline-none"
        />
      </div>

      {/* Médicaments */}
      <div>
        <label className="mb-2 block text-sm font-medium text-white">
          Médicaments
          <span className="ml-2 text-xs font-normal text-slate-400">
            (Séparer par des virgules)
          </span>
        </label>
        <input
          {...register('medications')}
          placeholder="Ventoline, Insuline..."
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-brand-orange focus:outline-none"
        />
      </div>

      {/* Notes médicales */}
      <div>
        <label className="mb-2 block text-sm font-medium text-white">
          Notes médicales supplémentaires
        </label>
        <textarea
          {...register('medicalNotes')}
          rows={3}
          placeholder="Informations importantes pour les secouristes..."
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-brand-orange focus:outline-none"
        />
      </div>

      {/* Contact d'urgence principal */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
        <h3 className="mb-4 font-semibold text-white">Contact d'urgence principal</h3>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-white">Nom</label>
            <input
              {...register('emergencyContactName')}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-brand-orange focus:outline-none"
            />
            {errors.emergencyContactName && (
              <p className="mt-1 text-sm text-red-500">
                {errors.emergencyContactName.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Téléphone
            </label>
            <input
              {...register('emergencyContactPhone')}
              placeholder="72259827"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-brand-orange focus:outline-none"
            />
            {errors.emergencyContactPhone && (
              <p className="mt-1 text-sm text-red-500">
                {errors.emergencyContactPhone.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Relation
            </label>
            <select
              {...register('emergencyContactRelation')}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-brand-orange focus:outline-none"
            >
              <option value="PARENT">Parent</option>
              <option value="MOTHER">Mère</option>
              <option value="FATHER">Père</option>
              <option value="GUARDIAN">Tuteur</option>
              <option value="GRANDPARENT">Grand-parent</option>
              <option value="SIBLING">Frère/Sœur</option>
              <option value="DOCTOR">Médecin</option>
              <option value="OTHER">Autre</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bouton Enregistrer */}
      <Button
        type="submit"
        disabled={isSubmitting}
        variant="primary"
        size="md"
        fullWidth
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Enregistrement...
          </>
        ) : (
          <>
            <Save className="h-5 w-5" />
            Enregistrer les modifications
          </>
        )}
      </Button>
    </form>
  );
}
