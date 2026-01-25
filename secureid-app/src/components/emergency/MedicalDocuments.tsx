'use client';

import { useState, useEffect } from 'react';
import { FileText, Image as ImageIcon, Download, Loader2, FileX } from 'lucide-react';
import { getMedicalDocuments } from '@/actions/emergency-actions';

/**
 * PHASE 5 - MEDICAL DOCUMENTS
 *
 * Affichage des documents médicaux après validation PIN
 * - Liste des documents depuis Firebase Storage
 * - URLs signées pour téléchargement sécurisé
 * - Icônes différenciées (PDF vs Images)
 */

interface MedicalDocumentsProps {
  profileId: string;
  pin: string;
}

interface Document {
  name: string;
  url: string;
  type: 'pdf' | 'image';
}

export function MedicalDocuments({ profileId, pin }: MedicalDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [profileId, pin]);

  const loadDocuments = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getMedicalDocuments({ profileId, pin });

      if (result.success && result.documents) {
        setDocuments(result.documents);
      } else {
        setError(result.error || 'Erreur lors du chargement des documents');
      }
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-health-mint" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <FileX className="mb-3 h-12 w-12 text-health-lavender/50" />
        <p className="text-sm text-health-teal/70">Aucun document médical disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-health-teal">
        {documents.length} document{documents.length > 1 ? 's' : ''} disponible
        {documents.length > 1 ? 's' : ''}
      </p>

      <div className="space-y-2">
        {documents.map((doc) => (
          <a
            key={`doc-${doc.name}`}
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl border-2 border-health-mint/20 bg-slate-800/80 p-3 transition-all hover:bg-health-bg/20 hover:border-health-mint/40"
          >
            <div className="flex items-center gap-3">
              {doc.type === 'pdf' ? (
                <FileText className="h-5 w-5 text-health-pink" />
              ) : (
                <ImageIcon className="h-5 w-5 text-health-lavender" />
              )}
              <div>
                <p className="text-sm font-medium text-white">{doc.name}</p>
                <p className="text-xs text-health-teal/60">
                  {doc.type === 'pdf' ? 'Document PDF' : 'Image'}
                </p>
              </div>
            </div>

            <Download className="h-4 w-4 text-health-mint" />
          </a>
        ))}
      </div>

      <p className="text-xs text-health-teal/50">
        Les liens de téléchargement expirent après 15 minutes
      </p>
    </div>
  );
}
