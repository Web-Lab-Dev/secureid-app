'use client';

import { useEffect, useState } from 'react';

/**
 * PHASE 6 - SCAN EFFECT (Enhanced)
 *
 * Effet visuel combiné:
 * - Ligne de scan biométrique initiale (2 secondes)
 * - Cercle de scan radar permanent (rotation lente)
 */

export function ScanEffect() {
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsScanning(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Ligne de scan initiale */}
      {isScanning && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
          <div className="scan-line absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-brand-orange to-transparent opacity-75"></div>
          <style jsx>{`
            @keyframes scan {
              0% {
                top: 0%;
              }
              100% {
                top: 100%;
              }
            }

            .scan-line {
              animation: scan 2s ease-in-out;
            }
          `}</style>
        </div>
      )}

      {/* Cercle de scan permanent (radar) */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="scanGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0" />
            <stop offset="50%" stopColor="#f97316" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </linearGradient>
        </defs>
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="url(#scanGradient)"
          strokeWidth="2"
          strokeDasharray="10 5"
          className="animate-spin-slow"
          style={{ transformOrigin: '50% 50%' }}
        />
      </svg>
    </>
  );
}
