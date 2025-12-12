'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { X, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logger } from '@/lib/logger';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

export function QRScanner({ isOpen, onClose, onScan }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    const startScanner = async () => {
      try {
        // Demander permission caméra
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' } // Caméra arrière sur mobile
        });

        setHasPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          // Démarrer la lecture QR
          reader.decodeFromVideoDevice(
            null,
            videoRef.current,
            (result, error) => {
              if (result) {
                const text = result.getText();
                onScan(text);
                stopScanner();
                onClose();
              }
            }
          );
        }
      } catch (err) {
        logger.error('Camera access failed', err);
        setHasPermission(false);
        setError('Impossible d\'accéder à la caméra. Veuillez autoriser l\'accès.');
      }
    };

    const stopScanner = () => {
      if (readerRef.current) {
        readerRef.current.reset();
      }

      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };

    startScanner();

    // Cleanup
    return () => {
      stopScanner();
    };
  }, [isOpen, onScan, onClose]);

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
