import React from 'react';
import { interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { COLORS } from '../helpers/constants';

interface QRScannerProps {
  scanning?: boolean;
  scanComplete?: boolean;
  delay?: number;
}

export const QRScanner: React.FC<QRScannerProps> = ({
  scanning = false,
  scanComplete = false,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const adjustedFrame = Math.max(0, frame - delay);

  // Scanner line animation
  const scanLineY = scanning
    ? interpolate(
        adjustedFrame % 60,
        [0, 30, 60],
        [0, 200, 0],
        { extrapolateRight: 'clamp' }
      )
    : 100;

  // Corner pulse when scanning
  const cornerPulse = scanning
    ? interpolate(Math.sin(adjustedFrame * 0.2), [-1, 1], [0.9, 1.1])
    : 1;

  // Success animation
  const successScale = scanComplete
    ? spring({
        frame: adjustedFrame,
        fps,
        config: { damping: 10, stiffness: 100 },
      })
    : 0;

  return (
    <div
      style={{
        width: 250,
        height: 250,
        position: 'relative',
        margin: '0 auto',
      }}
    >
      {/* Scanner frame corners */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 250 250"
        style={{
          position: 'absolute',
          transform: `scale(${cornerPulse})`,
        }}
      >
        {/* Top-left corner */}
        <path
          d="M10 50 L10 10 L50 10"
          fill="none"
          stroke={scanComplete ? COLORS.success : COLORS.primary}
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Top-right corner */}
        <path
          d="M200 10 L240 10 L240 50"
          fill="none"
          stroke={scanComplete ? COLORS.success : COLORS.primary}
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Bottom-left corner */}
        <path
          d="M10 200 L10 240 L50 240"
          fill="none"
          stroke={scanComplete ? COLORS.success : COLORS.primary}
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Bottom-right corner */}
        <path
          d="M200 240 L240 240 L240 200"
          fill="none"
          stroke={scanComplete ? COLORS.success : COLORS.primary}
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>

      {/* Scanning line */}
      {scanning && !scanComplete && (
        <div
          style={{
            position: 'absolute',
            top: 20 + scanLineY * 0.8,
            left: 20,
            right: 20,
            height: 3,
            background: `linear-gradient(90deg, transparent, ${COLORS.primary}, transparent)`,
            boxShadow: `0 0 20px ${COLORS.primary}`,
          }}
        />
      )}

      {/* QR Code placeholder */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: 40,
          right: 40,
          bottom: 40,
          backgroundColor: COLORS.white,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        {/* Simplified QR pattern */}
        <svg width="120" height="120" viewBox="0 0 120 120">
          <rect x="10" y="10" width="30" height="30" fill={COLORS.dark} />
          <rect x="80" y="10" width="30" height="30" fill={COLORS.dark} />
          <rect x="10" y="80" width="30" height="30" fill={COLORS.dark} />

          <rect x="15" y="15" width="20" height="20" fill={COLORS.white} />
          <rect x="85" y="15" width="20" height="20" fill={COLORS.white} />
          <rect x="15" y="85" width="20" height="20" fill={COLORS.white} />

          <rect x="20" y="20" width="10" height="10" fill={COLORS.dark} />
          <rect x="90" y="20" width="10" height="10" fill={COLORS.dark} />
          <rect x="20" y="90" width="10" height="10" fill={COLORS.dark} />

          {/* Data modules */}
          <rect x="50" y="10" width="8" height="8" fill={COLORS.dark} />
          <rect x="62" y="10" width="8" height="8" fill={COLORS.dark} />
          <rect x="50" y="22" width="8" height="8" fill={COLORS.dark} />
          <rect x="10" y="50" width="8" height="8" fill={COLORS.dark} />
          <rect x="22" y="50" width="8" height="8" fill={COLORS.dark} />
          <rect x="50" y="50" width="8" height="8" fill={COLORS.dark} />
          <rect x="62" y="50" width="8" height="8" fill={COLORS.dark} />
          <rect x="74" y="50" width="8" height="8" fill={COLORS.dark} />
          <rect x="100" y="50" width="8" height="8" fill={COLORS.dark} />
          <rect x="50" y="80" width="8" height="8" fill={COLORS.dark} />
          <rect x="62" y="80" width="8" height="8" fill={COLORS.dark} />
          <rect x="80" y="80" width="8" height="8" fill={COLORS.dark} />
          <rect x="100" y="80" width="8" height="8" fill={COLORS.dark} />
          <rect x="100" y="100" width="8" height="8" fill={COLORS.dark} />
        </svg>
      </div>

      {/* Success checkmark overlay */}
      {scanComplete && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) scale(${successScale})`,
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: COLORS.success,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 10px 30px ${COLORS.success}50`,
          }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40">
            <path
              d="M10 20 L18 28 L30 12"
              fill="none"
              stroke={COLORS.white}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      {/* Scanning text */}
      <div
        style={{
          position: 'absolute',
          bottom: -40,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 14,
          fontWeight: 'bold',
          color: scanComplete ? COLORS.success : COLORS.gray[600],
        }}
      >
        {scanComplete ? 'Scan réussi !' : scanning ? 'Scan en cours...' : 'Placez le QR code'}
      </div>
    </div>
  );
};

export default QRScanner;
