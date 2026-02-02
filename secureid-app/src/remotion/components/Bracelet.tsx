import React from 'react';
import { interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { COLORS } from '../helpers/constants';

interface BraceletProps {
  x?: number;
  y?: number;
  scale?: number;
  rotation?: number;
  showQR?: boolean;
  pulseQR?: boolean;
}

export const Bracelet: React.FC<BraceletProps> = ({
  x = 0,
  y = 0,
  scale = 1,
  rotation = 0,
  showQR = true,
  pulseQR = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // QR code pulse animation
  const pulseScale = pulseQR
    ? interpolate(Math.sin(frame * 0.15), [-1, 1], [0.95, 1.05])
    : 1;

  // Entrance animation
  const entranceProgress = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const opacity = interpolate(entranceProgress, [0, 1], [0, 1]);
  const scaleAnim = interpolate(entranceProgress, [0, 1], [0.8, 1]) * scale;

  return (
    <div
      style={{
        position: 'absolute',
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: `translate(-50%, -50%) scale(${scaleAnim}) rotate(${rotation}deg)`,
        opacity,
      }}
    >
      {/* Bracelet band */}
      <svg
        width="200"
        height="80"
        viewBox="0 0 200 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Band gradient */}
        <defs>
          <linearGradient id="braceletGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={COLORS.primary} />
            <stop offset="50%" stopColor={COLORS.secondary} />
            <stop offset="100%" stopColor={COLORS.primary} />
          </linearGradient>
          <filter id="braceletShadow">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Main band */}
        <path
          d="M20 20 C20 10, 40 10, 100 10 C160 10, 180 10, 180 20 L180 60 C180 70, 160 70, 100 70 C40 70, 20 70, 20 60 Z"
          fill="url(#braceletGradient)"
          filter="url(#braceletShadow)"
        />

        {/* Band texture lines */}
        <path
          d="M30 25 L170 25"
          stroke={COLORS.white}
          strokeWidth="1"
          strokeOpacity="0.3"
        />
        <path
          d="M30 55 L170 55"
          stroke={COLORS.white}
          strokeWidth="1"
          strokeOpacity="0.3"
        />

        {/* QR code area */}
        {showQR && (
          <g transform={`translate(75, 20) scale(${pulseScale})`}>
            <rect
              x="0"
              y="0"
              width="50"
              height="40"
              rx="4"
              fill={COLORS.white}
            />
            {/* Simplified QR pattern */}
            <rect x="5" y="5" width="10" height="10" fill={COLORS.dark} />
            <rect x="35" y="5" width="10" height="10" fill={COLORS.dark} />
            <rect x="5" y="25" width="10" height="10" fill={COLORS.dark} />
            <rect x="18" y="5" width="4" height="4" fill={COLORS.dark} />
            <rect x="18" y="12" width="4" height="4" fill={COLORS.dark} />
            <rect x="25" y="8" width="6" height="6" fill={COLORS.dark} />
            <rect x="18" y="25" width="8" height="8" fill={COLORS.dark} />
            <rect x="30" y="20" width="6" height="6" fill={COLORS.dark} />
            <rect x="38" y="28" width="6" height="6" fill={COLORS.dark} />
          </g>
        )}

        {/* SecureID text */}
        <text
          x="100"
          y="65"
          textAnchor="middle"
          fill={COLORS.white}
          fontSize="8"
          fontWeight="bold"
          fontFamily="system-ui, sans-serif"
        >
          SecureID
        </text>
      </svg>
    </div>
  );
};

export default Bracelet;
