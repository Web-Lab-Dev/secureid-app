'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { medicalFormSchema, type MedicalFormData } from '@/schemas/activation';
import { PhotoUpload } from './PhotoUpload';

interface MedicalFormProps {
  /** ID temporaire du profil (généré côté client avant submission) */
  profileId: string;
  /** Callback appelé à la soumission du formulaire */
  onSubmit: (data: MedicalFormData) => Promise<void>;
  /** Données initiales (mode édition) */
  initialData?: Partial<MedicalFormData>;
  /** Texte du bouton de soumission */
  submitButtonText?: string;
}

// Options pour le groupe sanguin
const BLOOD_TYPES = [
  { value: 'UNKNOWN', label: 'Non renseigné' },
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
] as const;

// Options pour relation contact d'urgence
const RELATIONSHIPS = [
  { value: 'MOTHER', label: 'Mère' },
  { value: 'FATHER', label: 'Père' },
  { value: 'PARENT', label: 'Parent' },
  { value: 'GUARDIAN', label: 'Tuteur/Tutrice' },
  { value: 'GRANDPARENT', label: 'Grand-parent' },
  { value: 'SIBLING', label: 'Frère/Sœur' },
  { value: 'DOCTOR', label: 'Médecin' },
  { value: 'OTHER', label: 'Autre' },
] as const;

/**
 * PHASE 3D - FORMULAIRE MÉDICAL COMPLET
 *
 * Formulaire de création de profil enfant avec:
 * - Photo de profil
 * - Informations de base (nom, date de naissance)
 * - Informations médicales (groupe sanguin, allergies, conditions, médicaments)
 * - Code PIN médecin (4 chiffres)
 * - Contacts d'urgence (1-5)
 */
export function MedicalForm({
  profileId,
  onSubmit,
  initialData,
  submitButtonText = 'Créer le profil',
}: MedicalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<MedicalFormData>({
    resolver: zodResolver(medicalFormSchema),
    defaultValues: {
      fullName: initialData?.fullName || '',
      dateOfBirth: initialData?.dateOfBirth || undefined,
      photoUrl: initialData?.photoUrl || '',
      bloodType: initialData?.bloodType || 'UNKNOWN',
      allergies: initialData?.allergies || [],
      conditions: initialData?.conditions || [],
      medications: initialData?.medications || [],
      medicalNotes: initialData?.medicalNotes || '',
      doctorPin: '',
      confirmDoctorPin: '',
      emergencyContacts: initialData?.emergencyContacts || [
        {
          name: '',
          relationship: 'MOTHER',
          phone: '',
          email: '',
        },
      ],
    },
  });

  // Gestion dynamique des tableaux
  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContact,
  } = useFieldArray({
    control,
    name: 'emergencyContacts',
  });

  const {
    fields: allergyFields,
    append: appendAllergy,
    remove: removeAllergy,
  } = useFieldArray({
    control,
    name: 'allergies',
  });

  const {
    fields: conditionFields,
    append: appendCondition,
    remove: removeCondition,
  } = useFieldArray({
    control,
    name: 'conditions',
  });

  const {
    fields: medicationFields,
    append: appendMedication,
    remove: removeMedication,
  } = useFieldArray({
    control,
    name: 'medications',
  });

  const handleFormSubmit = async (data: MedicalFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="w-full max-w-2xl space-y-8">
      {/* En-tête */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">Créer un profil</h1>
        <p className="text-gray-400">Remplissez les informations médicales de l'enfant</p>
      </div>

      {/* Section Photo */}
      <div className="bg-slate-900 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-white">Photo de profil</h2>
        <PhotoUpload
          profileId={profileId}
          onPhotoUploaded={(url) => setValue('photoUrl', url)}
          existingPhotoUrl={watch('photoUrl')}
          buttonText="Photo de l'enfant"
        />
        {errors.photoUrl && (
          <p className="text-sm text-red-500">{errors.photoUrl.message}</p>
        )}
      </div>

      {/* Section Informations de base */}
      <div className="bg-slate-900 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-white">Informations de base</h2>

        {/* Nom complet */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
            Nom complet *
          </label>
          <input
            id="fullName"
            type="text"
            {...register('fullName')}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent"
            placeholder="Ex: Amadou Traoré"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-500">{errors.fullName.message}</p>
          )}
        </div>

        {/* Date de naissance */}
        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-300 mb-2">
            Date de naissance
          </label>
          <input
            id="dateOfBirth"
            type="date"
            {...register('dateOfBirth', {
              setValueAs: (value) => (value ? new Date(value) : undefined),
            })}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent"
          />
          {errors.dateOfBirth && (
            <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth.message}</p>
          )}
        </div>

        {/* Groupe sanguin */}
        <div>
          <label htmlFor="bloodType" className="block text-sm font-medium text-gray-300 mb-2">
            Groupe sanguin *
          </label>
          <select
            id="bloodType"
            {...register('bloodType')}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent"
          >
            {BLOOD_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.bloodType && (
            <p className="mt-1 text-sm text-red-500">{errors.bloodType.message}</p>
          )}
        </div>
      </div>

      {/* Section Informations médicales */}
      <div className="bg-slate-900 rounded-lg p-6 space-y-6">
        <h2 className="text-xl font-semibold text-white">Informations médicales</h2>

        {/* Allergies */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-300">Allergies</label>
            <button
              type="button"
              onClick={() => appendAllergy('')}
              className="flex items-center gap-1 px-3 py-1 text-sm text-brand-orange hover:text-brand-orange/80 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </button>
          </div>
          {allergyFields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <input
                {...register(`allergies.${index}` as const)}
                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                placeholder="Ex: Arachides"
              />
              <button
                type="button"
                onClick={() => removeAllergy(index)}
                className="p-2 text-red-500 hover:text-red-400 transition-colors"
                aria-label="Supprimer"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          {allergyFields.length === 0 && (
            <p className="text-sm text-gray-500 italic">Aucune allergie renseignée</p>
          )}
        </div>

        {/* Conditions médicales */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-300">Conditions médicales</label>
            <button
              type="button"
              onClick={() => appendCondition('')}
              className="flex items-center gap-1 px-3 py-1 text-sm text-brand-orange hover:text-brand-orange/80 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </button>
          </div>
          {conditionFields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <input
                {...register(`conditions.${index}` as const)}
                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                placeholder="Ex: Asthme"
              />
              <button
                type="button"
                onClick={() => removeCondition(index)}
                className="p-2 text-red-500 hover:text-red-400 transition-colors"
                aria-label="Supprimer"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          {conditionFields.length === 0 && (
            <p className="text-sm text-gray-500 italic">Aucune condition renseignée</p>
          )}
        </div>

        {/* Médicaments */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-300">Médicaments</label>
            <button
              type="button"
              onClick={() => appendMedication('')}
              className="flex items-center gap-1 px-3 py-1 text-sm text-brand-orange hover:text-brand-orange/80 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </button>
          </div>
          {medicationFields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <input
                {...register(`medications.${index}` as const)}
                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                placeholder="Ex: Ventolin"
              />
              <button
                type="button"
                onClick={() => removeMedication(index)}
                className="p-2 text-red-500 hover:text-red-400 transition-colors"
                aria-label="Supprimer"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          {medicationFields.length === 0 && (
            <p className="text-sm text-gray-500 italic">Aucun médicament renseigné</p>
          )}
        </div>

        {/* Notes médicales */}
        <div>
          <label htmlFor="medicalNotes" className="block text-sm font-medium text-gray-300 mb-2">
            Notes médicales additionnelles
          </label>
          <textarea
            id="medicalNotes"
            {...register('medicalNotes')}
            rows={4}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent resize-none"
            placeholder="Informations complémentaires pour les urgences..."
          />
          {errors.medicalNotes && (
            <p className="mt-1 text-sm text-red-500">{errors.medicalNotes.message}</p>
          )}
        </div>
      </div>

      {/* Section Code PIN Médecin */}
      <div className="bg-slate-900 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-white">Code PIN Médecin</h2>
        <p className="text-sm text-gray-400">
          Ce code sera demandé aux urgences pour accéder aux informations médicales complètes
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PIN */}
          <div>
            <label htmlFor="doctorPin" className="block text-sm font-medium text-gray-300 mb-2">
              Code PIN (4 chiffres) *
            </label>
            <input
              id="doctorPin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              {...register('doctorPin')}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-center text-2xl tracking-widest placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent"
              placeholder="••••"
            />
            {errors.doctorPin && (
              <p className="mt-1 text-sm text-red-500">{errors.doctorPin.message}</p>
            )}
          </div>

          {/* Confirmation PIN */}
          <div>
            <label htmlFor="confirmDoctorPin" className="block text-sm font-medium text-gray-300 mb-2">
              Confirmer le code PIN *
            </label>
            <input
              id="confirmDoctorPin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              {...register('confirmDoctorPin')}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-center text-2xl tracking-widest placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent"
              placeholder="••••"
            />
            {errors.confirmDoctorPin && (
              <p className="mt-1 text-sm text-red-500">{errors.confirmDoctorPin.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Section Contacts d'urgence */}
      <div className="bg-slate-900 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Contacts d'urgence</h2>
            <p className="text-sm text-gray-400 mt-1">Minimum 1, maximum 5 contacts</p>
          </div>
          {contactFields.length < 5 && (
            <button
              type="button"
              onClick={() =>
                appendContact({
                  name: '',
                  relationship: 'MOTHER',
                  phone: '',
                  email: '',
                })
              }
              className="flex items-center gap-2 px-4 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter un contact
            </button>
          )}
        </div>

        {errors.emergencyContacts && typeof errors.emergencyContacts === 'object' && 'root' in errors.emergencyContacts && (
          <p className="text-sm text-red-500">{errors.emergencyContacts.root?.message}</p>
        )}

        <div className="space-y-6">
          {contactFields.map((field, index) => (
            <div key={field.id} className="relative p-4 bg-slate-800 rounded-lg space-y-4 border border-slate-700">
              {/* Numéro et bouton supprimer */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Contact #{index + 1}</h3>
                {contactFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeContact(index)}
                    className="p-2 text-red-500 hover:text-red-400 transition-colors"
                    aria-label="Supprimer ce contact"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom complet *
                </label>
                <input
                  {...register(`emergencyContacts.${index}.name`)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                  placeholder="Ex: Fatima Traoré"
                />
                {errors.emergencyContacts?.[index]?.name && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.emergencyContacts[index]?.name?.message}
                  </p>
                )}
              </div>

              {/* Relation */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Relation *
                </label>
                <select
                  {...register(`emergencyContacts.${index}.relationship`)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                >
                  {RELATIONSHIPS.map((rel) => (
                    <option key={rel.value} value={rel.value}>
                      {rel.label}
                    </option>
                  ))}
                </select>
                {errors.emergencyContacts?.[index]?.relationship && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.emergencyContacts[index]?.relationship?.message}
                  </p>
                )}
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Téléphone *
                </label>
                <input
                  {...register(`emergencyContacts.${index}.phone`)}
                  type="tel"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                  placeholder="Ex: 72259827"
                />
                {errors.emergencyContacts?.[index]?.phone && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.emergencyContacts[index]?.phone?.message}
                  </p>
                )}
              </div>

              {/* Email (optionnel) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email (optionnel)
                </label>
                <input
                  {...register(`emergencyContacts.${index}.email`)}
                  type="email"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                  placeholder="email@example.com"
                />
                {errors.emergencyContacts?.[index]?.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.emergencyContacts[index]?.email?.message}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bouton de soumission */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 bg-brand-orange hover:bg-brand-orange/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Création en cours...
          </>
        ) : (
          submitButtonText
        )}
      </button>
    </form>
  );
}
