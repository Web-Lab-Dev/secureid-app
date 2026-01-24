import { useState, useCallback } from 'react';

export interface UsePhotoUploadOptions {
  /** Taille maximum en MB (défaut: 10) */
  maxSizeMB?: number;
  /** Types de fichiers acceptés (défaut: image/*) */
  acceptedTypes?: string[];
}

export interface UsePhotoUploadReturn {
  /** Fichier sélectionné */
  photoFile: File | null;
  /** Preview en base64 data URL */
  photoPreview: string | null;
  /** Message d'erreur */
  error: string;
  /** Handler pour l'input file onChange */
  handlePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Réinitialiser l'état */
  resetPhoto: () => void;
  /** Définir une preview externe (ex: photo existante) */
  setExternalPreview: (url: string | null) => void;
}

/**
 * Hook réutilisable pour la gestion d'upload de photos
 * Gère la validation (type, taille) et la création de preview
 *
 * @example
 * ```tsx
 * const { photoFile, photoPreview, error, handlePhotoChange } = usePhotoUpload({ maxSizeMB: 5 });
 *
 * return (
 *   <input type="file" accept="image/*" onChange={handlePhotoChange} />
 *   {photoPreview && <img src={photoPreview} alt="Preview" />}
 *   {error && <p className="text-red-500">{error}</p>}
 * );
 * ```
 */
export function usePhotoUpload(options: UsePhotoUploadOptions = {}): UsePhotoUploadReturn {
  const { maxSizeMB = 10, acceptedTypes = ['image/'] } = options;

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handlePhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type
    const isValidType = acceptedTypes.some(type => file.type.startsWith(type));
    if (!isValidType) {
      setError('Le fichier doit être une image');
      return;
    }

    // Vérifier la taille
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`L'image ne doit pas dépasser ${maxSizeMB} MB`);
      return;
    }

    setPhotoFile(file);
    setError('');

    // Créer la preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [maxSizeMB, acceptedTypes]);

  const resetPhoto = useCallback(() => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setError('');
  }, []);

  const setExternalPreview = useCallback((url: string | null) => {
    setPhotoPreview(url);
  }, []);

  return {
    photoFile,
    photoPreview,
    error,
    handlePhotoChange,
    resetPhoto,
    setExternalPreview,
  };
}
