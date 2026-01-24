'use server';

import { admin } from '@/lib/firebase-admin';
import { logger } from '@/lib/logger';
import { verifyDoctorPin } from './emergency-pin';

/**
 * EMERGENCY MEDICAL DOCUMENTS
 * Récupération sécurisée des documents médicaux après validation PIN
 */

export interface MedicalDocument {
  name: string;
  url: string;
  type: 'pdf' | 'image';
  size?: number;
}

export interface GetDocumentsInput {
  profileId: string;
  pin: string;
}

export interface GetDocumentsResult {
  success: boolean;
  documents?: MedicalDocument[];
  error?: string;
}

/**
 * Récupère la liste des documents médicaux après validation PIN
 * Génère des URLs de téléchargement signées (sécurité Firebase Storage)
 *
 * NOTE: Firebase Storage Admin SDK utilise bucket.getFiles() et getSignedUrl()
 * au lieu de l'API Client SDK (ref() + getDownloadURL())
 *
 * @param input - ID profil et PIN validé
 * @returns Liste des documents avec URLs signées
 */
export async function getMedicalDocuments(
  input: GetDocumentsInput
): Promise<GetDocumentsResult> {
  try {
    const { profileId, pin } = input;

    // Validation des entrées
    if (!profileId || typeof profileId !== 'string' || profileId.trim().length === 0) {
      return {
        success: false,
        error: 'ID de profil invalide',
      };
    }

    // Vérifier le PIN d'abord
    const pinResult = await verifyDoctorPin({ profileId, pin });
    if (!pinResult.success) {
      return {
        success: false,
        error: pinResult.error,
      };
    }

    // Pour Firebase Storage, utiliser Admin SDK Storage
    // Note: Nécessite configuration différente - bucket() au lieu de ref()
    const bucket = admin.storage().bucket();
    const [files] = await bucket.getFiles({
      prefix: `medical_docs/${profileId}/`,
    });

    if (!files || files.length === 0) {
      return {
        success: true,
        documents: [],
      };
    }

    // Générer les URLs signées pour chaque document
    const documents: MedicalDocument[] = await Promise.all(
      files.map(async (file) => {
        // Générer URL signée valide 1 heure
        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: Date.now() + 60 * 60 * 1000, // 1 heure
        });

        const name = file.name.split('/').pop() || file.name;
        const type = name.endsWith('.pdf') ? 'pdf' : 'image';

        // Gérer le type de size qui peut être string | number | undefined
        // Fix TypeScript: Forcer le type avant parseInt
        const rawSize = file.metadata.size;
        let size: number | undefined;
        if (rawSize !== undefined && rawSize !== null) {
          if (typeof rawSize === 'string') {
            const parsed = parseInt(rawSize, 10);
            size = isNaN(parsed) ? undefined : parsed;
          } else {
            size = rawSize as number;
          }
        }

        return {
          name,
          url,
          type,
          size,
        };
      })
    );

    return {
      success: true,
      documents,
    };
  } catch (error) {
    logger.error('Error fetching medical documents', { error, profileId: input.profileId });
    return {
      success: false,
      error: 'Erreur lors de la récupération des documents',
    };
  }
}
