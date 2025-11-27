import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

/**
 * HELPERS FIREBASE STORAGE
 * Gestion upload/compression/suppression des photos de profil
 */

/**
 * Compresse une image côté client pour économiser la bande passante
 * Cible : 800x800px max, qualité 0.85, format WebP si possible
 */
export async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Calculer les dimensions pour garder le ratio
        const MAX_SIZE = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = (height * MAX_SIZE) / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = (width * MAX_SIZE) / height;
            height = MAX_SIZE;
          }
        }

        // Créer canvas et dessiner l'image redimensionnée
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convertir en Blob (WebP si supporté, sinon JPEG)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/webp', // Format moderne et efficace
          0.85 // Qualité
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Upload une photo de profil vers Firebase Storage
 * Chemin : profiles/{profileId}/photo.webp
 *
 * @param file - Fichier image à uploader
 * @param profileId - ID du profil (pour organiser le storage)
 * @returns URL publique de la photo uploadée
 */
export async function uploadProfilePhoto(
  file: File,
  profileId: string
): Promise<string> {
  try {
    // Valider le fichier
    if (!file.type.startsWith('image/')) {
      throw new Error('Le fichier doit être une image');
    }

    // Taille max : 5MB avant compression
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('La photo est trop volumineuse (max 5MB)');
    }

    console.log('📤 Début compression image...', { size: file.size, type: file.type });

    // Compresser l'image
    const compressedBlob = await compressImage(file);

    console.log('✅ Image compressée', { originalSize: file.size, compressedSize: compressedBlob.size });

    // Créer la référence Storage
    const photoRef = ref(storage, `profiles/${profileId}/photo.webp`);

    console.log('📤 Upload vers Firebase Storage...', { path: `profiles/${profileId}/photo.webp` });

    // Upload
    const snapshot = await uploadBytes(photoRef, compressedBlob, {
      contentType: 'image/webp',
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });

    console.log('✅ Upload terminé, récupération URL...');

    // Récupérer l'URL publique
    const downloadURL = await getDownloadURL(snapshot.ref);

    console.log('✅ URL récupérée:', downloadURL);

    return downloadURL;
  } catch (error: any) {
    console.error('❌ Error uploading profile photo:', error);

    // Gérer les erreurs Firebase spécifiques
    if (error.code === 'storage/unauthorized') {
      throw new Error('Permissions insuffisantes. Vérifiez les règles Firebase Storage.');
    } else if (error.code === 'storage/canceled') {
      throw new Error('Upload annulé');
    } else if (error.code === 'storage/unknown') {
      throw new Error('Erreur réseau. Vérifiez votre connexion.');
    }

    throw error;
  }
}

/**
 * Supprime une photo de profil de Firebase Storage
 *
 * @param photoUrl - URL complète de la photo à supprimer
 */
export async function deleteProfilePhoto(photoUrl: string): Promise<void> {
  try {
    // Extraire le path du Storage depuis l'URL
    const url = new URL(photoUrl);
    const path = decodeURIComponent(
      url.pathname.split('/o/')[1]?.split('?')[0] || ''
    );

    if (!path) {
      throw new Error('Invalid photo URL');
    }

    const photoRef = ref(storage, path);
    await deleteObject(photoRef);
  } catch (error) {
    console.error('Error deleting profile photo:', error);
    // Ne pas throw - la suppression peut échouer si le fichier n'existe plus
  }
}

/**
 * Valide qu'un fichier est une image acceptable
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Types acceptés
  const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!acceptedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Format non supporté. Utilisez JPG, PNG ou WebP.',
    };
  }

  // Taille max : 5MB
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: 'La photo est trop volumineuse (max 5MB).',
    };
  }

  return { valid: true };
}
