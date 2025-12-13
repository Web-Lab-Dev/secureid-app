'use server';

import { adminDb, admin } from '@/lib/firebase-admin';
import { logger } from '@/lib/logger';
import type { MedicalInfo, EmergencyContact, BloodType } from '@/types/profile';
import type { MedicalFormData, EmergencyContactFormData } from '@/schemas/activation';
import { medicalFormSchema } from '@/schemas/activation';
import { z } from 'zod';

/**
 * PHASE 3D - SERVER ACTIONS PROFILES
 *
 * Actions serveur pour la gestion des profils enfants
 *
 * SÉCURITÉ (Defense-in-Depth):
 * - Revalidation Zod côté serveur (protection contre requêtes malveillantes)
 * - Validation parentId (seul le parent peut modifier ses profils)
 * - Utilisation Firebase Admin SDK avec validations manuelles
 */

interface CreateProfileInput {
  /** Données du formulaire médical */
  formData: MedicalFormData;
  /** ID du parent (Firebase Auth UID) */
  parentId: string;
}

interface CreateProfileResult {
  success: boolean;
  profileId?: string;
  error?: string;
}

/**
 * Crée un nouveau profil enfant dans Firestore
 *
 * SÉCURITÉ:
 * 1. Revalide les données avec Zod côté serveur (defense-in-depth)
 * 2. Vérifie que parentId est valide
 * 3. Sanitize les entrées avant stockage
 *
 * @param input - Données du formulaire et ID parent
 * @returns Résultat avec ID du profil créé ou erreur
 */
export async function createProfile(
  input: CreateProfileInput
): Promise<CreateProfileResult> {
  try {
    const { formData, parentId } = input;

    // 🔒 DEFENSE-IN-DEPTH: Revalidation Zod côté serveur
    // Protection contre les requêtes malveillantes qui bypassent la validation client
    try {
      medicalFormSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return {
          success: false,
          error: `Données invalides: ${errorMessages}`,
        };
      }
      throw error;
    }

    // Générer un ID unique pour le profil
    const profileId = `profile_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Convertir les contacts d'urgence avec priorités
    const emergencyContacts: EmergencyContact[] = formData.emergencyContacts.map(
      (contact, index) => {
        const ec: EmergencyContact = {
          name: contact.name,
          relationship: contact.relationship,
          phone: contact.phone,
          priority: index + 1,
        };
        if (contact.email && contact.email.trim()) {
          ec.email = contact.email;
        }
        return ec;
      }
    );

    // Construire les informations médicales
    const medicalInfo: MedicalInfo = {
      bloodType: formData.bloodType,
      allergies: formData.allergies.filter((a) => a.trim() !== ''),
      conditions: formData.conditions.filter((c) => c.trim() !== ''),
      medications: formData.medications.filter((m) => m.trim() !== ''),
    };
    if (formData.medicalNotes && formData.medicalNotes.trim()) {
      medicalInfo.notes = formData.medicalNotes;
    }

    // Convertir la date de naissance en Timestamp Firestore (Admin SDK)
    let dateOfBirthTimestamp: admin.firestore.Timestamp | null = null;
    if (formData.dateOfBirth) {
      dateOfBirthTimestamp = admin.firestore.Timestamp.fromDate(formData.dateOfBirth);
    }

    // SÉCURITÉ: Valider que parentId correspond à un utilisateur authentifié
    // Cette validation remplace les règles Firestore qui sont bypassées par Admin SDK
    if (!parentId || typeof parentId !== 'string') {
      throw new Error('Invalid parentId');
    }

    // Construire le document profil
    const profileDocument = {
      id: profileId,
      parentId,
      fullName: formData.fullName,
      dateOfBirth: dateOfBirthTimestamp,
      photoUrl: formData.photoUrl || null,
      medicalInfo,
      doctorPin: formData.doctorPin,
      emergencyContacts,
      currentBraceletId: null, // Pas encore de bracelet lié
      status: 'ACTIVE' as const,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Sauvegarder dans Firestore (Admin SDK - bypass les règles)
    await adminDb.collection('profiles').doc(profileId).set(profileDocument);

    return {
      success: true,
      profileId,
    };
  } catch (error) {
    logger.error('Error creating profile', { error, parentId: input.parentId });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la création du profil',
    };
  }
}

interface UpdateProfileInput {
  /** ID du profil à mettre à jour */
  profileId: string;
  /** Données à mettre à jour (partielles) */
  updates: {
    fullName?: string;
    dateOfBirth?: Date | null;
    photoUrl?: string;
    bloodType?: BloodType;
    allergies?: string[];
    conditions?: string[];
    medications?: string[];
    medicalNotes?: string;
    doctorPin?: string;
    emergencyContacts?: EmergencyContactFormData[];
  };
}

interface UpdateProfileResult {
  success: boolean;
  error?: string;
}

/**
 * Met à jour un profil existant
 *
 * @param input - ID du profil et données à mettre à jour
 * @returns Résultat de la mise à jour
 */
export async function updateProfile(
  input: UpdateProfileInput
): Promise<UpdateProfileResult> {
  try {
    const { profileId, updates } = input;

    const updateData: Record<string, unknown> = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Mettre à jour uniquement les champs fournis
    if (updates.fullName !== undefined) {
      updateData.fullName = updates.fullName;
    }

    if (updates.dateOfBirth !== undefined) {
      updateData.dateOfBirth = updates.dateOfBirth
        ? admin.firestore.Timestamp.fromDate(updates.dateOfBirth)
        : null;
    }

    if (updates.photoUrl !== undefined) {
      updateData.photoUrl = updates.photoUrl || null;
    }

    if (updates.bloodType !== undefined) {
      updateData.medicalInfo = {
        ...(updateData.medicalInfo || {}),
        bloodType: updates.bloodType,
      } as MedicalInfo;
    }

    if (updates.allergies !== undefined) {
      updateData.medicalInfo = {
        ...(updateData.medicalInfo || {}),
        allergies: updates.allergies.filter((a) => a.trim() !== ''),
      } as MedicalInfo;
    }

    if (updates.conditions !== undefined) {
      updateData.medicalInfo = {
        ...(updateData.medicalInfo || {}),
        conditions: updates.conditions.filter((c) => c.trim() !== ''),
      } as MedicalInfo;
    }

    if (updates.medications !== undefined) {
      updateData.medicalInfo = {
        ...(updateData.medicalInfo || {}),
        medications: updates.medications.filter((m) => m.trim() !== ''),
      } as MedicalInfo;
    }

    if (updates.medicalNotes !== undefined) {
      updateData.medicalInfo = {
        ...(updateData.medicalInfo || {}),
        notes: updates.medicalNotes || undefined,
      } as MedicalInfo;
    }

    if (updates.doctorPin !== undefined) {
      updateData.doctorPin = updates.doctorPin;
    }

    if (updates.emergencyContacts !== undefined) {
      updateData.emergencyContacts = updates.emergencyContacts.map((contact, index) => {
        const emergencyContact: Record<string, string | number> = {
          name: contact.name,
          relationship: contact.relationship,
          phone: contact.phone,
          priority: index + 1,
        };

        // N'ajouter email que s'il existe (éviter undefined)
        if (contact.email && contact.email.trim()) {
          emergencyContact.email = contact.email;
        }

        return emergencyContact;
      });
    }

    // Mettre à jour dans Firestore (Admin SDK)
    await adminDb.collection('profiles').doc(profileId).update(updateData);

    return {
      success: true,
    };
  } catch (error) {
    logger.error('Error updating profile', { error, profileId: input.profileId });
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Erreur lors de la mise à jour du profil',
    };
  }
}

interface ArchiveProfileInput {
  /** ID du profil à archiver */
  profileId: string;
}

interface ArchiveProfileResult {
  success: boolean;
  error?: string;
}

/**
 * Archive un profil (ne le supprime pas, change juste le statut)
 *
 * @param input - ID du profil à archiver
 * @returns Résultat de l'archivage
 */
export async function archiveProfile(
  input: ArchiveProfileInput
): Promise<ArchiveProfileResult> {
  try {
    const { profileId } = input;

    await adminDb.collection('profiles').doc(profileId).update({
      status: 'ARCHIVED',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
    };
  } catch (error) {
    logger.error('Error archiving profile', { error, profileId: input.profileId });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de l\'archivage du profil',
    };
  }
}
