'use client';

import { logger } from '@/lib/logger';
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save, Upload, User, Loader2, Calendar } from 'lucide-react';
import Image from 'next/image';
import { updateProfile } from '@/actions/profile-actions';
import { useAuthContext } from '@/contexts/AuthContext';
import { uploadProfilePhoto } from '@/lib/storage-helpers';
import type { ProfileDocument } from '@/types/profile';
import { phoneSchema } from '@/schemas/activation';
import { Button } from '@/components/ui/button';

/**
 * RÉORGANISATION DASHBOARD
 *
 * Dialog pour modifier les informations publiques du profil enfant
 * Visible par les secouristes lors du scan du bracelet
 */

const editProfileSchema = z.object({
  fullName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  dateOfBirth: z.string().optional(),
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

interface EditProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileDocument;
  onUpdate?: () => void;
}

export function EditProfileDialog({ isOpen, onClose, profile, onUpdate }: EditProfileDialogProps) {
  const { user } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convertir Timestamp Firebase en string YYYY-MM-DD pour l'input date
  const formatDateForInput = (timestamp: unknown): string => {
    if (!timestamp) return '';
    try {
      const firebaseTimestamp = timestamp as { toDate?: () => Date };
      const date = firebaseTimestamp.toDate ? firebaseTimestamp.toDate() : new Date(timestamp as string | number | Date);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditProfileData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      fullName: profile.fullName,
      dateOfBirth: formatDateForInput(profile.dateOfBirth),
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Le fichier doit être une image');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 10 MB');
      return;
    }

    setPhotoFile(file);
    setError('');

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: EditProfileData) => {
    if (!user) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      let photoUrl = profile.photoUrl;

      // Upload photo si changée (avec compression via storage-helpers)
      if (photoFile) {
        setIsUploadingPhoto(true);
        photoUrl = await uploadProfilePhoto(photoFile, profile.id);
        setIsUploadingPhoto(false);
      }

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

      // Convertir la date de naissance en Date JS (pas Timestamp)
      let dateOfBirthDate: Date | null = null;
      if (data.dateOfBirth) {
        dateOfBirthDate = new Date(data.dateOfBirth);
      } else if (profile.dateOfBirth) {
        // Conserver la valeur existante si pas de changement
        dateOfBirthDate = profile.dateOfBirth.toDate();
      }

      // Construire le contact d'urgence sans champs undefined
      const emergencyContact = {
        name: data.emergencyContactName,
        phone: data.emergencyContactPhone,
        relationship: data.emergencyContactRelation as 'PARENT' | 'MOTHER' | 'FATHER' | 'GUARDIAN' | 'GRANDPARENT' | 'SIBLING' | 'DOCTOR' | 'OTHER',
      };

      const result = await updateProfile({
        profileId: profile.id,
        updates: {
          fullName: data.fullName,
          dateOfBirth: dateOfBirthDate,
          photoUrl: photoUrl || undefined,
          bloodType: data.bloodType,
          allergies: allergiesArray,
          conditions: conditionsArray,
          medications: medicationsArray,
          medicalNotes: data.medicalNotes || undefined,
          emergencyContacts: [emergencyContact],
        },
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onUpdate?.();
          onClose();
        }, 1500);
      } else {
        setError(result.error || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      logger.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
      setIsUploadingPhoto(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={isSubmitting ? undefined : onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-x-0 top-0 bottom-0 z-50 overflow-y-auto">
        <div className="min-h-full bg-gradient-to-b from-slate-950 to-slate-900 px-4 py-6">
          <div className="mx-auto max-w-2xl">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Modifier le Profil</h2>
                <p className="mt-1 text-slate-400">
                  Informations visibles par les secouristes
                </p>
              </div>
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-full bg-slate-800/50 p-3 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white disabled:opacity-50"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Photo de profil */}
              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
                <label className="block text-sm font-medium text-white">
                  Photo de Profil
                </label>
                <p className="mb-4 text-sm text-slate-400">
                  Visible sur le bracelet et lors du scan
                </p>

                <div className="flex items-center gap-6">
                  <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-slate-700">
                    {photoPreview || profile.photoUrl ? (
                      <Image
                        src={photoPreview || profile.photoUrl || ''}
                        alt={profile.fullName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-800">
                        <User className="h-12 w-12 text-slate-600" />
                      </div>
                    )}
                  </div>

                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSubmitting}
                      variant="secondary"
                      size="sm"
                      className="border border-slate-700"
                    >
                      <Upload className="h-4 w-4" />
                      {photoFile ? 'Changer la photo' : 'Ajouter une photo'}
                    </Button>
                    <p className="mt-2 text-xs text-slate-500">PNG, JPG (max 10MB)</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {/* Nom complet */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-white">
                    Nom complet <span className="text-red-400">*</span>
                  </label>
                  <input
                    {...register('fullName')}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                    disabled={isSubmitting}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-500">{errors.fullName.message}</p>
                  )}
                </div>

                {/* Date de naissance */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-white">
                    Date de naissance <span className="text-xs text-slate-400 ml-2">(L'âge s'affichera automatiquement)</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                    <input
                      {...register('dateOfBirth')}
                      type="date"
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 pl-10 text-white focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.dateOfBirth && (
                    <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth.message}</p>
                  )}
                </div>

                {/* Groupe sanguin */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Groupe sanguin <span className="text-red-400">*</span>
                  </label>
                  <select
                    {...register('bloodType')}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                    disabled={isSubmitting}
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
                </div>

                {/* Allergies */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-white">
                    Allergies <span className="text-xs text-slate-400 ml-2">(Séparer par des virgules)</span>
                  </label>
                  <input
                    {...register('allergies')}
                    placeholder="Arachides, Pénicilline, Latex..."
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Conditions médicales */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-white">
                    Conditions médicales <span className="text-xs text-slate-400 ml-2">(Séparer par des virgules)</span>
                  </label>
                  <input
                    {...register('conditions')}
                    placeholder="Asthme, Diabète, Épilepsie..."
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Médicaments */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-white">
                    Médicaments <span className="text-xs text-slate-400 ml-2">(Séparer par des virgules)</span>
                  </label>
                  <input
                    {...register('medications')}
                    placeholder="Ventoline, Insuline..."
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Notes médicales */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-white">
                    Notes médicales
                  </label>
                  <textarea
                    {...register('medicalNotes')}
                    rows={3}
                    placeholder="Informations complémentaires..."
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Contact d'urgence */}
                <div className="sm:col-span-2">
                  <h3 className="mb-3 text-lg font-semibold text-white">Contact d'Urgence</h3>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Nom <span className="text-red-400">*</span>
                  </label>
                  <input
                    {...register('emergencyContactName')}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                    disabled={isSubmitting}
                  />
                  {errors.emergencyContactName && (
                    <p className="mt-1 text-sm text-red-500">{errors.emergencyContactName.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Téléphone <span className="text-red-400">*</span>
                  </label>
                  <input
                    {...register('emergencyContactPhone')}
                    type="tel"
                    placeholder="70 12 34 56"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                    disabled={isSubmitting}
                  />
                  {errors.emergencyContactPhone && (
                    <p className="mt-1 text-sm text-red-500">{errors.emergencyContactPhone.message}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-white">
                    Relation <span className="text-red-400">*</span>
                  </label>
                  <select
                    {...register('emergencyContactRelation')}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                    disabled={isSubmitting}
                  >
                    <option value="PARENT">Parent</option>
                    <option value="GRAND_PARENT">Grand-parent</option>
                    <option value="UNCLE_AUNT">Oncle/Tante</option>
                    <option value="SIBLING">Frère/Sœur</option>
                    <option value="OTHER">Autre</option>
                  </select>
                </div>
              </div>

              {/* Messages */}
              {success && (
                <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-4">
                  <p className="text-sm text-green-500">✓ Profil mis à jour avec succès</p>
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4">
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  variant="outline"
                  size="md"
                  className="flex-1 border-slate-700 text-slate-300"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || isUploadingPhoto}
                  variant="primary"
                  size="md"
                  className="flex-1"
                >
                  {isSubmitting || isUploadingPhoto ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {isUploadingPhoto ? 'Upload photo...' : 'Enregistrement...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
