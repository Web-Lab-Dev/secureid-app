'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, File, X, Loader2, FileText, Image as ImageIcon } from 'lucide-react';
import { ref, uploadBytes, listAll, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { MedicalUnavailableModal } from './MedicalUnavailableModal';

/**
 * PHASE 4C - UPLOAD DOCUMENTS MÉDICAUX
 *
 * Drag & drop + bouton pour uploader documents PDF et images
 * Stockage dans Firebase Storage: medical_docs/{profileId}/
 * Liste des documents avec bouton supprimer
 */

interface DocumentUploadProps {
  profileId: string;
}

interface StoredDocument {
  name: string;
  url: string;
  type: 'pdf' | 'image';
  fullPath: string;
}

export function DocumentUpload({ profileId }: DocumentUploadProps) {
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger les documents existants
  useEffect(() => {
    loadDocuments();
  }, [profileId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docsRef = ref(storage, `medical_docs/${profileId}`);
      const result = await listAll(docsRef);

      const docs: StoredDocument[] = await Promise.all(
        result.items.map(async (item) => {
          const url = await getDownloadURL(item);
          const name = item.name;
          const type = name.endsWith('.pdf') ? 'pdf' : 'image';

          return {
            name,
            url,
            type,
            fullPath: item.fullPath,
          };
        })
      );

      setDocuments(docs);
    } catch (err) {
      logger.error('Error loading documents:', err);
      // Si le dossier n'existe pas encore, c'est normal
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const validateFile = (file: File): string | null => {
    // Types acceptés
    const acceptedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];

    if (!acceptedTypes.includes(file.type)) {
      return 'Format non supporté. Utilisez PDF, JPG, PNG ou WebP.';
    }

    // Taille max : 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return 'Le fichier est trop volumineux (max 10MB)';
    }

    return null;
  };

  const handleUpload = async (files: FileList | null) => {
    // Fonctionnalité désactivée - afficher le modal d'information
    setShowUnavailableModal(true);
    return;
  };

  const handleDelete = async (doc: StoredDocument) => {
    if (!confirm(`Supprimer "${doc.name}" ?`)) return;

    try {
      const docRef = ref(storage, doc.fullPath);
      await deleteObject(docRef);

      // Recharger la liste
      await loadDocuments();
    } catch (err) {
      logger.error('Error deleting document:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleUpload(e.target.files);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Zone de drop */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          dragActive
            ? 'border-brand-orange bg-brand-orange/5'
            : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={handleFileInput}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-12 w-12 animate-spin text-brand-orange" />
            <p className="text-sm text-slate-400">Upload en cours...</p>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-12 w-12 text-slate-500" />
            <p className="mt-4 text-sm font-medium text-white">
              Glissez-déposez un document ou
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="primary"
              size="sm"
              className="mt-2"
            >
              Parcourir les fichiers
            </Button>
            <p className="mt-2 text-xs text-slate-500">
              PDF, JPG, PNG ou WebP - Max 10MB
            </p>
          </>
        )}
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Liste des documents */}
      {documents.length > 0 ? (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-400">
            Documents téléchargés ({documents.length})
          </h4>

          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.fullPath}
                className="flex items-center justify-between rounded-lg bg-slate-900 p-3"
              >
                <div className="flex items-center gap-3">
                  {doc.type === 'pdf' ? (
                    <FileText className="h-5 w-5 text-red-500" />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-blue-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">{doc.name}</p>
                    <p className="text-xs text-slate-400">
                      {doc.type === 'pdf' ? 'Document PDF' : 'Image'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
                  >
                    Voir
                  </a>
                  <Button
                    onClick={() => handleDelete(doc)}
                    variant="danger"
                    size="sm"
                    className="p-2"
                    aria-label="Supprimer"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-center text-sm text-slate-500">
          Aucun document téléchargé
        </p>
      )}

      {/* Modal indisponibilité */}
      <MedicalUnavailableModal
        isOpen={showUnavailableModal}
        onClose={() => setShowUnavailableModal(false)}
      />
    </div>
  );
}
