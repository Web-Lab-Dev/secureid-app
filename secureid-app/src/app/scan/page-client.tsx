'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { BrowserQRCodeReader } from '@zxing/browser';
import { ArrowLeft, Camera, AlertCircle, Loader2 } from 'lucide-react';
import { logger } from '@/lib/logger';

/**
 * PAGE CLIENT DE SCAN DE QR CODE
 *
 * Ouvre la caméra pour scanner un bracelet QR code
 * et redirige vers la page d'activation.
 *
 * FLUX OPTIMISÉ (depuis dashboard):
 * - QR code contient: /s/{braceletId}?token=xxx
 * - On extrait braceletId et token
 * - On redirige directement vers /activate?id={braceletId}&token={token}
 * - Évite le détour par la landing page pour les utilisateurs connectés
 */

export function ScanPageClient() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserQRCodeReader | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const codeReader = new BrowserQRCodeReader();
    codeReaderRef.current = codeReader;

    const startScanning = async () => {
      try {
        // Obtenir les devices vidéo disponibles (méthode statique)
        const videoInputDevices = await BrowserQRCodeReader.listVideoInputDevices();

        if (videoInputDevices.length === 0) {
          setError('Aucune caméra détectée sur cet appareil');
          setLoading(false);
          return;
        }

        // Utiliser la caméra arrière si disponible (mobile)
        const backCamera = videoInputDevices.find((device: MediaDeviceInfo) =>
          device.label.toLowerCase().includes('back') ||
          device.label.toLowerCase().includes('arrière')
        );
        const selectedDeviceId = backCamera ? backCamera.deviceId : videoInputDevices[0].deviceId;

        setLoading(false);

        // Démarrer le scan
        await codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current!,
          (result, error) => {
            // Ignorer les erreurs de type "not found" (scan en cours, pas encore de QR détecté)
            if (error && error.name !== 'NotFoundException') {
              logger.warn('QR scan error', { error: error.message });
              return;
            }

            if (result) {
              try {
                const scannedText = result.getText();
                const url = new URL(scannedText);

                // Vérifier si c'est une URL SecureID valide
                if (url.pathname.startsWith('/s/') || url.pathname.startsWith('/activate')) {
                  logger.info('QR code scanned successfully', { url: scannedText });

                  // Arrêter le scan
                  stopScanning();
                  setScanning(false);

                  // FLUX OPTIMISÉ: Extraire braceletId et token pour rediriger vers /activate
                  // Évite le détour par la landing page pour les users connectés (dashboard)
                  if (url.pathname.startsWith('/s/')) {
                    // Format: /s/{braceletId}?token=xxx
                    const braceletId = url.pathname.replace('/s/', '');
                    const token = url.searchParams.get('token') || url.searchParams.get('t');

                    if (braceletId && token) {
                      // Rediriger directement vers /activate avec les paramètres
                      router.push(`/activate?id=${braceletId}&token=${token}`);
                      return;
                    }
                  }

                  // Fallback: Si déjà une URL /activate ou format non reconnu
                  router.push(url.pathname + url.search);
                } else {
                  setError('Ce QR code ne correspond pas à un bracelet SecureID');
                  stopScanning();
                  setScanning(false);
                }
              } catch (urlError) {
                setError('QR code invalide');
                logger.error('Invalid QR code', { error: urlError });
                stopScanning();
                setScanning(false);
              }
            }
          }
        );
      } catch (err: any) {
        logger.error('Camera error', { error: err });
        setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
        setLoading(false);
      }
    };

    if (scanning) {
      startScanning();
    }

    // Cleanup
    return () => {
      stopScanning();
    };
  }, [scanning, router]);

  const stopScanning = () => {
    if (codeReaderRef.current) {
      try {
        // Arrêter tous les streams vidéo
        const stream = videoRef.current?.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        videoRef.current!.srcObject = null;
      } catch (err) {
        logger.error('Error stopping scanner', { error: err });
      }
    }
  };

  const handleRetry = () => {
    setError(null);
    setScanning(true);
    setLoading(true);
  };

  return (
    <div className="min-h-screen bg-brand-black text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-slate-300 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Retour</span>
            </button>
            <h1 className="text-xl font-bold">Scanner un Bracelet</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          {/* Instructions */}
          <div className="mb-6 rounded-lg bg-slate-900 p-6">
            <div className="mb-4 flex items-center gap-3">
              <Camera className="h-6 w-6 text-brand-orange" />
              <h2 className="text-lg font-semibold">Comment scanner ?</h2>
            </div>
            <ol className="space-y-2 text-slate-300">
              <li>1. Autorisez l'accès à votre caméra</li>
              <li>2. Placez le QR code du bracelet devant la caméra</li>
              <li>3. Le scan se fera automatiquement</li>
            </ol>
          </div>

          {/* Scanner */}
          {scanning && (
            <div className="relative overflow-hidden rounded-lg border-4 border-brand-orange">
              {loading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
                  <div className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-brand-orange" />
                    <p className="mt-4 text-white">Chargement de la caméra...</p>
                  </div>
                </div>
              )}
              <video
                ref={videoRef}
                className="w-full"
                style={{ maxHeight: '500px', objectFit: 'cover' }}
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 rounded-lg border border-red-500 bg-red-900/20 p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-red-400">{error}</p>
              </div>
              <button
                onClick={handleRetry}
                className="mt-4 rounded-lg bg-red-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-600"
              >
                Réessayer
              </button>
            </div>
          )}

          {/* Help */}
          <div className="mt-8 rounded-lg border border-blue-500 bg-blue-900/20 p-4">
            <p className="text-sm text-blue-300">
              💡 <strong>Astuce :</strong> Assurez-vous d'avoir un bon éclairage et que le QR code est bien visible dans le cadre.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
