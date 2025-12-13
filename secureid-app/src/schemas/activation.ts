import { z } from 'zod';

/**
 * PHASE 3A - SCHEMAS ZOD
 *
 * Validation des formulaires d'activation et création de profil
 */

/**
 * Regex pour numéro de téléphone Burkina Faso
 * Formats acceptés:
 * - 8 chiffres: 72259827
 * - Format international: +22672259827
 * - Avec espaces: +226 72 25 98 27
 */
const PHONE_REGEX = /^(\+?226)?[567]\d{7}$/;

/**
 * Regex pour PIN médecin (4 chiffres exactement)
 */
const PIN_REGEX = /^\d{4}$/;

/**
 * Schema de validation pour numéro de téléphone
 */
export const phoneSchema = z
  .string()
  .min(8, 'Le numéro doit contenir au moins 8 chiffres')
  .max(15, 'Le numéro est trop long')
  .regex(PHONE_REGEX, 'Format invalide. Exemple: 72259827 ou +22672259827');

/**
 * Schema de validation pour mot de passe
 */
export const passwordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .max(100, 'Le mot de passe est trop long');

/**
 * Schema de validation pour PIN médecin
 */
export const doctorPinSchema = z
  .string()
  .length(4, 'Le PIN doit contenir exactement 4 chiffres')
  .regex(PIN_REGEX, 'Le PIN doit contenir uniquement des chiffres');

/**
 * Schema de validation pour contact d'urgence
 */
export const emergencyContactSchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom est trop long'),

  relationship: z.enum([
    'PARENT',
    'MOTHER',
    'FATHER',
    'GUARDIAN',
    'GRANDPARENT',
    'SIBLING',
    'DOCTOR',
    'OTHER',
  ]),

  phone: phoneSchema,

  email: z
    .string()
    .email('Email invalide')
    .optional()
    .or(z.literal('')),
});

/**
 * Schema de validation pour le formulaire d'inscription parent
 */
export const signupSchema = z.object({
  phoneNumber: phoneSchema,

  password: passwordSchema,

  confirmPassword: passwordSchema,

  displayName: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom est trop long'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

/**
 * Schema de validation pour le formulaire de connexion
 */
export const loginSchema = z.object({
  phoneNumber: phoneSchema,
  password: passwordSchema,
});

/**
 * Schema de validation pour le formulaire de profil enfant complet
 */
export const medicalFormSchema = z.object({
  // Informations de base
  fullName: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom est trop long'),

  dateOfBirth: z
    .date()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const age = new Date().getFullYear() - date.getFullYear();
      return age >= 0 && age <= 18;
    }, 'L\'âge doit être entre 0 et 18 ans'),

  // Photo (fichier validé côté composant, pas ici)
  photoUrl: z.string().url().optional().or(z.literal('')),

  // Informations médicales
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN'], {
    message: 'Sélectionnez un groupe sanguin valide',
  }),

  allergies: z.array(z.string()).default([]),

  conditions: z.array(z.string()).default([]),

  medications: z.array(z.string()).default([]),

  medicalNotes: z
    .string()
    .max(1000, 'Les notes médicales sont trop longues')
    .optional()
    .or(z.literal('')),

  // Code PIN médecin
  doctorPin: doctorPinSchema,

  confirmDoctorPin: doctorPinSchema,

  // Contacts d'urgence (minimum 1, maximum 5)
  emergencyContacts: z
    .array(emergencyContactSchema)
    .min(1, 'Au moins un contact d\'urgence est requis')
    .max(5, 'Maximum 5 contacts d\'urgence'),
}).refine((data) => data.doctorPin === data.confirmDoctorPin, {
  message: 'Les codes PIN ne correspondent pas',
  path: ['confirmDoctorPin'],
});

/**
 * Schema simplifié pour création rapide de profil
 */
export const quickProfileSchema = z.object({
  fullName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  emergencyPhone: phoneSchema,
  emergencyName: z.string().min(2, 'Le nom du contact est requis'),
});

/**
 * Schema partiel pour mise à jour de profil
 * Toutes les propriétés sont optionnelles pour permettre les updates partiels
 */
export const updateProfileSchema = medicalFormSchema.partial();

/**
 * Types inférés des schemas (utiles pour TypeScript)
 */
export type SignupFormData = z.infer<typeof signupSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;

// Type MedicalFormData - utiliser z.infer standard
export type MedicalFormData = z.infer<typeof medicalFormSchema>;

export type QuickProfileFormData = z.infer<typeof quickProfileSchema>;
export type EmergencyContactFormData = z.infer<typeof emergencyContactSchema>;
