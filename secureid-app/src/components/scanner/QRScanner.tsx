'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Camera, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logger } from '@/lib/logger';

// Type pour l'API native BarcodeDetector
declare global {
  interface Window {
    BarcodeDetector?: new (options?: { formats: string[] }) => {
      detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue: string; format: string }>>;
    };
  }
}

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

export function QRScanner({ isOpen, onClose, onScan }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);

  const [error, setError] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannerType, setScannerType] = useState<'native' | 'zxing' | null>(null);

  // Arrêter le scan proprement
  const stopScanner = useCallback(() => {
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
    if (!isOpen) return;

    let mounted = true;

    const startScanner = async () => {
      try {
        // Contraintes vidéo optimisées pour QR (résolution basse = scan rapide)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { ideal: 30 }
          }
        });

        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = stream;
        setHasPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // STRATÉGIE 1: API native BarcodeDetector (100x plus rapide)
        if ('BarcodeDetector' in window && window.BarcodeDetector) {
          setScannerType('native');
          logger.info('QRScanner: Using native BarcodeDetector API');

          const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
          scanningRef.current = true;

          const scanFrame = async () => {
            if (!scanningRef.current || !videoRef.current || !mounted) return;

            try {
              const barcodes = await barcodeDetector.detect(videoRef.current);

              if (barcodes.length > 0) {
                const result = barcodes[0].rawValue;
                stopScanner();
                onScan(result);
                onClose();
                return;
              }
            } catch {
              // Ignorer les erreurs de détection
            }

            if (scanningRef.current && mounted) {
              animationFrameRef.current = requestAnimationFrame(() => {
                setTimeout(scanFrame, 100);
              });
            }
          };

          scanFrame();
        } else {
          // STRATÉGIE 2: Fallback @zxing/library
          setScannerType('zxing');
          logger.info('QRScanner: Falling back to @zxing/library');

          const { BrowserMultiFormatReader } = await import('@zxing/library');
          const reader = new BrowserMultiFormatReader();
          scanningRef.current = true;

          reader.decodeFromVideoDevice(
            null,
            videoRef.current!,
            (result) => {
              if (result && mounted && scanningRef.current) {
                const text = result.getText();
                stopScanner();
                reader.reset();
                onScan(text);
                onClose();
              }
            }
          );
        }
      } catch (err) {
        if (mounted) {
          logger.error('Camera access failed', err);
          setHasPermission(false);
          setError('Impossible d\'accéder à la caméra. Veuillez autoriser l\'accès.');
        }
      }
    };

    startScanner();

    return () => {
      mounted = false;
      stopScanner();
    };
  }, [isOpen, onScan, onClose, stopScanner]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg"
        >
          {/* Bouton fermer */}
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
            aria-label="Fermer"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Zone scanner */}
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-black">
            {/* Indicateur mode rapide (API native) */}
            {hasPermission && scannerType === 'native' && (
              <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 rounded-full bg-green-500/90 px-3 py-1 text-xs font-medium text-white">
                <Zap className="h-3 w-3" />
                Mode rapide
              </div>
            )}

            {hasPermission === false && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                <Camera className="h-16 w-16 text-red-400 mb-4" />
                <p className="text-white font-semibold mb-2">Accès caméra refusé</p>
                <p className="text-slate-300 text-sm">{error}</p>
              </div>
            )}

            {hasPermission === null && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Camera className="h-16 w-16 text-white animate-pulse mb-4" />
                <p className="text-white">Demande d'accès caméra...</p>
              </div>
            )}

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />

            {/* Overlay de guidage */}
            {hasPermission && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Carré de visée */}
                  <div className="h-64 w-64 border-4 border-brand-orange rounded-2xl shadow-2xl">
                    {/* Coins animés */}
                    <div className="absolute -top-1 -left-1 h-8 w-8 border-l-4 border-t-4 border-white rounded-tl-2xl" />
                    <div className="absolute -top-1 -right-1 h-8 w-8 border-r-4 border-t-4 border-white rounded-tr-2xl" />
                    <div className="absolute -bottom-1 -left-1 h-8 w-8 border-l-4 border-b-4 border-white rounded-bl-2xl" />
                    <div className="absolute -bottom-1 -right-1 h-8 w-8 border-r-4 border-b-4 border-white rounded-br-2xl" />
                  </div>

                  {/* Ligne de scan animée */}
                  <motion.div
                    className="absolute left-0 right-0 h-1 bg-brand-orange shadow-lg shadow-brand-orange/50"
                    animate={{
                      top: ['10%', '90%', '10%']
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-4 text-center">
            <p className="text-white font-semibold mb-1">
              Scannez le QR Code du bracelet
            </p>
            <p className="text-slate-300 text-sm">
              Positionnez le code dans le cadre orange
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
