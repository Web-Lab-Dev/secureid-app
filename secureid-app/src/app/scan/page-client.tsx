'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, AlertCircle, Loader2, Zap } from 'lucide-react';
import { logger } from '@/lib/logger';

/**
 * PAGE CLIENT DE SCAN DE QR CODE - VERSION OPTIMISÉE
 *
 * PERFORMANCE: Utilise l'API native BarcodeDetector (Chrome/Edge 83+) pour un scan instantané.
 * Fallback sur @zxing/browser pour les navigateurs non supportés.
 *
 * FLUX OPTIMISÉ (depuis dashboard):
 * - QR code contient: /s/{braceletId}?token=xxx
 * - On extrait braceletId et token
 * - On redirige directement vers /activate?id={braceletId}&token={token}
 * - Évite le détour par la landing page pour les utilisateurs connectés
 */

// Type pour l'API native BarcodeDetector (pas encore dans TypeScript standard)
declare global {
  interface Window {
    BarcodeDetector?: new (options?: { formats: string[] }) => {
      detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue: string; format: string }>>;
    };
  }
}

export function ScanPageClient() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(true);
  const [scannerType, setScannerType] = useState<'native' | 'zxing' | null>(null);

  // Traiter le résultat du scan
  const handleScanResult = useCallback((scannedText: string) => {
    try {
      const url = new URL(scannedText);

      // Vérifier si c'est une URL SecureID valide
      if (url.pathname.startsWith('/s/') || url.pathname.startsWith('/activate')) {
        logger.info('QR code scanned successfully', { url: scannedText });

        // FLUX OPTIMISÉ: Extraire braceletId et token pour rediriger vers /activate
        if (url.pathname.startsWith('/s/')) {
          const braceletId = url.pathname.replace('/s/', '');
          const token = url.searchParams.get('token') || url.searchParams.get('t');

          if (braceletId && token) {
            router.push(`/activate?id=${braceletId}&token=${token}`);
            return true;
          }
        }

        // Fallback: Si déjà une URL /activate ou format non reconnu
        router.push(url.pathname + url.search);
        return true;
      } else {
        setError('Ce QR code ne correspond pas à un bracelet SecureID');
        return false;
      }
    } catch {
      setError('QR code invalide');
      return false;
    }
  }, [router]);

  // Arrêter le scan proprement
  const stopScanning = useCallback(() => {
    scanningRef.current = false;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (!scanning) return;

    let mounted = true;

    const startScanning = async () => {
      try {
        // Contraintes vidéo optimisées pour QR (résolution basse = scan rapide)
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: 'environment', // Caméra arrière sur mobile
            width: { ideal: 640 },     // Résolution basse suffisante pour QR
            height: { ideal: 480 },
            frameRate: { ideal: 30 }
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setLoading(false);

        // STRATÉGIE 1: API native BarcodeDetector (100x plus rapide)
        if ('BarcodeDetector' in window && window.BarcodeDetector) {
          setScannerType('native');
          logger.info('Using native BarcodeDetector API');

          const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
          scanningRef.current = true;

          const scanFrame = async () => {
            if (!scanningRef.current || !videoRef.current || !mounted) return;

            try {
              const barcodes = await barcodeDetector.detect(videoRef.current);

              if (barcodes.length > 0) {
                const result = barcodes[0].rawValue;
                stopScanning();
                setScanning(false);
                handleScanResult(result);
                return;
              }
            } catch (err) {
              // Ignorer les erreurs de détection (frame non prête, etc.)
            }

            // Scanner toutes les 100ms (10 fps de scan, suffisant pour QR)
            if (scanningRef.current && mounted) {
              animationFrameRef.current = requestAnimationFrame(() => {
                setTimeout(scanFrame, 100);
              });
            }
          };

          scanFrame();
        } else {
          // STRATÉGIE 2: Fallback @zxing/browser (si BarcodeDetector non supporté)
          setScannerType('zxing');
          logger.info('Falling back to @zxing/browser');

          const { BrowserQRCodeReader } = await import('@zxing/browser');
          const codeReader = new BrowserQRCodeReader();

          scanningRef.current = true;

          await codeReader.decodeFromVideoDevice(
            undefined, // Utiliser le stream existant
            videoRef.current!,
            (result, error) => {
              if (!mounted || !scanningRef.current) return;

              if (error && error.name !== 'NotFoundException') {
                logger.warn('QR scan error', { error: error.message });
                return;
              }

              if (result) {
                stopScanning();
                setScanning(false);
                handleScanResult(result.getText());
              }
            }
          );
        }
      } catch (err: unknown) {
        if (!mounted) return;
        logger.error('Camera error', { error: err });
        setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
        setLoading(false);
      }
    };

    startScanning();

    return () => {
      mounted = false;
      stopScanning();
    };
  }, [scanning, handleScanResult, stopScanning]);

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

              {/* Indicateur mode rapide (API native) */}
              {!loading && scannerType === 'native' && (
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-green-500/90 px-3 py-1 text-xs font-medium text-white">
                  <Zap className="h-3 w-3" />
                  Mode rapide
                </div>
              )}

              {/* Zone de visée */}
              {!loading && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative h-48 w-48">
                    {/* Coins du cadre */}
                    <div className="absolute top-0 left-0 h-6 w-6 border-l-4 border-t-4 border-white rounded-tl-lg" />
                    <div className="absolute top-0 right-0 h-6 w-6 border-r-4 border-t-4 border-white rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 h-6 w-6 border-l-4 border-b-4 border-white rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 h-6 w-6 border-r-4 border-b-4 border-white rounded-br-lg" />
                    {/* Ligne de scan animée */}
                    <div className="absolute left-2 right-2 h-0.5 bg-brand-orange/80 animate-scan-line" />
                  </div>
                </div>
              )}

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
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
