'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Camera, Loader2, X } from 'lucide-react';
import { uploadProfilePhoto, validateImageFile } from '@/lib/storage-helpers';

interface PhotoUploadProps {
  /** ID du profil pour organiser le storage */
  profileId: string;
  /** Callback appelé quand l'upload est terminé */
  onPhotoUploaded: (photoUrl: string) => void;
  /** Photo existante (mode édition) */
  existingPhotoUrl?: string;
  /** Texte du bouton */
  buttonText?: string;
}

/**
 * PHASE 3D - COMPOSANT PHOTO UPLOAD
 *
 * Upload de photo de profil avec:
 * - Preview avant upload
 * - Compression automatique
 * - Upload Firebase Storage
 * - Support mobile (caméra directe)
 */
export function PhotoUpload({
  profileId,
  onPhotoUploaded,
  existingPhotoUrl,
  buttonText = "Ajouter une photo"
}: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(existingPhotoUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Valider le fichier
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Fichier invalide');
      return;
    }

    // Créer preview immédiat
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    // Upload vers Firebase Storage
    try {
      setUploading(true);
      const photoUrl = await uploadProfilePhoto(file, profileId);

      // Nettoyer l'ancien preview
      URL.revokeObjectURL(previewUrl);

      // Mettre à jour avec l'URL Firebase
      setPreview(photoUrl);
      onPhotoUploaded(photoUrl);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'upload');
      setPreview(existingPhotoUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setPreview(null);
    setError(null);
    onPhotoUploaded('');

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Zone de preview / upload */}
      <div className="relative">
        {preview ? (
          // Preview de la photo
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-brand-orange">
            <Image
              src={preview}
              alt="Photo de profil"
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />

            {/* Bouton supprimer */}
            {!uploading && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                aria-label="Supprimer la photo"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Overlay uploading */}
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>
        ) : (
          // Bouton d'upload initial (grand cercle avec icône caméra)
          <button
            type="button"
            onClick={handleClick}
            disabled={uploading}
            className="w-32 h-32 rounded-full bg-slate-800 hover:bg-slate-700 border-2 border-dashed border-slate-600 hover:border-brand-orange flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Ajouter une photo"
          >
            {uploading ? (
              <Loader2 className="w-12 h-12 text-brand-orange animate-spin" />
            ) : (
              <Camera className="w-12 h-12 text-gray-400" />
            )}
          </button>
        )}
      </div>

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        // Sur mobile, ouvrir directement l'appareil photo
        capture="environment"
      />

      {/* Bouton texte (si photo déjà présente) */}
      {preview && !uploading && (
        <button
          type="button"
          onClick={handleClick}
          className="text-sm text-brand-orange hover:text-brand-orange/80 transition-colors"
        >
          Changer la photo
        </button>
      )}

      {/* Texte d'instruction */}
      {!preview && !uploading && (
        <p className="text-sm text-gray-400 text-center max-w-xs">
          {buttonText}<br />
          <span className="text-xs">JPG, PNG ou WebP - Max 5MB</span>
        </p>
      )}

      {/* Message d'erreur */}
      {error && (
        <p className="text-sm text-red-500 text-center max-w-xs">
          {error}
        </p>
      )}

      {/* État uploading */}
      {uploading && (
        <p className="text-sm text-brand-orange">
          Compression et envoi...
        </p>
      )}
    </div>
  );
}
