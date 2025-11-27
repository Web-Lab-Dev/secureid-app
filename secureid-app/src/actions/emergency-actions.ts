'use server';

import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import type { GeolocationData } from '@/types/scan';

/**
 * PHASE 5 - EMERGENCY ACTIONS
 *
 * Server Actions sécurisées pour:
 * - Validation PIN médecin
 * - Enregistrement scans GPS
 * - Génération URLs documents médicaux
 */

interface VerifyPinInput {
  profileId: string;
  pin: string;
}

interface VerifyPinResult {
  success: boolean;
  error?: string;
}

/**
 * Vérifie le code PIN médecin d'un profil
 * CRITIQUE: Validation TOUJOURS côté serveur, jamais côté client
 *
 * @param input - ID profil et PIN à vérifier
 * @returns Résultat de la validation
 */
export async function verifyDoctorPin(input: VerifyPinInput): Promise<VerifyPinResult> {
  try {
    const { profileId, pin } = input;

    // Validation basique
    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return {
        success: false,
        error: 'Code PIN invalide (4 chiffres requis)',
      };
    }

    // Récupérer le profil
    const profileRef = doc(db, 'profiles', profileId);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      return {
        success: false,
        error: 'Profil introuvable',
      };
    }

    const profile = profileSnap.data();

    // Comparer les PINs
    if (profile.doctorPin !== pin) {
      return {
        success: false,
        error: 'Code PIN incorrect',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return {
      success: false,
      error: 'Erreur lors de la vérification du code',
    };
  }
}

interface RecordScanInput {
  braceletId: string;
  geolocation: GeolocationData | null;
  userAgent: string;
}

interface RecordScanResult {
  success: boolean;
  scanId?: string;
  error?: string;
}

/**
 * Enregistre un scan de bracelet dans Firestore
 * Utilisé pour tracking et notifications futures (n8n)
 *
 * @param input - Données du scan (bracelet, position GPS, user agent)
 * @returns ID du scan créé ou erreur
 */
export async function recordScan(input: RecordScanInput): Promise<RecordScanResult> {
  try {
    const { braceletId, geolocation, userAgent } = input;

    const scanData = {
      braceletId,
      timestamp: serverTimestamp(),
      lat: geolocation?.lat || null,
      lng: geolocation?.lng || null,
      userAgent,
    };

    const scansCollection = collection(db, 'scans');
    const scanDoc = await addDoc(scansCollection, scanData);

    return {
      success: true,
      scanId: scanDoc.id,
    };
  } catch (error) {
    console.error('Error recording scan:', error);
    return {
      success: false,
      error: 'Erreur lors de l\'enregistrement du scan',
    };
  }
}

interface MedicalDocument {
  name: string;
  url: string;
  type: 'pdf' | 'image';
  size?: number;
}

interface GetDocumentsInput {
  profileId: string;
  pin: string;
}

interface GetDocumentsResult {
  success: boolean;
  documents?: MedicalDocument[];
  error?: string;
}

/**
 * Récupère la liste des documents médicaux après validation PIN
 * Génère des URLs de téléchargement signées (sécurité Firebase Storage)
 *
 * @param input - ID profil et PIN validé
 * @returns Liste des documents avec URLs signées
 */
export async function getMedicalDocuments(
  input: GetDocumentsInput
): Promise<GetDocumentsResult> {
  try {
    const { profileId, pin } = input;

    // Vérifier le PIN d'abord
    const pinResult = await verifyDoctorPin({ profileId, pin });
    if (!pinResult.success) {
      return {
        success: false,
        error: pinResult.error,
      };
    }

    // Récupérer les documents depuis Storage
    const docsRef = ref(storage, `medical_docs/${profileId}`);

    try {
      const result = await listAll(docsRef);

      const documents: MedicalDocument[] = await Promise.all(
        result.items.map(async (item) => {
          const url = await getDownloadURL(item);
          const name = item.name;
          const type = name.endsWith('.pdf') ? 'pdf' : 'image';

          return {
            name,
            url,
            type,
          };
        })
      );

      return {
        success: true,
        documents,
      };
    } catch (storageError: unknown) {
      // Si le dossier n'existe pas, retourner liste vide
      if (storageError && typeof storageError === 'object' && 'code' in storageError) {
        const error = storageError as { code: string };
        if (error.code === 'storage/object-not-found') {
          return {
            success: true,
            documents: [],
          };
        }
      }
      throw storageError;
    }
  } catch (error) {
    console.error('Error fetching medical documents:', error);
    return {
      success: false,
      error: 'Erreur lors de la récupération des documents',
    };
  }
}
