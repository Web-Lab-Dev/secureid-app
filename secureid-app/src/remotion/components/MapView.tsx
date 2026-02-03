import React from 'react';
import { interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { COLORS } from '../helpers/constants';

interface MapViewProps {
  showSafeZone?: boolean;
  childPosition?: { x: number; y: number };
  alertActive?: boolean;
  safeZoneCenter?: { x: number; y: number };
  safeZoneRadius?: number;
}

export const MapView: React.FC<MapViewProps> = ({
  showSafeZone = true,
  childPosition = { x: 150, y: 200 },
  alertActive = false,
  safeZoneCenter = { x: 150, y: 180 },
  safeZoneRadius = 80,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animated clouds
  const cloud1X = interpolate(frame % 300, [0, 300], [0, 50]);
  const cloud2X = interpolate(frame % 400, [0, 400], [50, 0]);

  // Pulsing safe zone border
  const pulseOpacity = interpolate(
    Math.sin(frame * 0.08),
    [-1, 1],
    [0.2, 0.5]
  );

  const pulseScale = interpolate(
    Math.sin(frame * 0.08),
    [-1, 1],
    [0.98, 1.02]
  );

  // Alert flash with more intensity
  const alertFlash = alertActive
    ? interpolate(Math.sin(frame * 0.4), [-1, 1], [0.1, 0.6])
    : 0;

  const alertPulseRadius = alertActive
    ? interpolate(Math.sin(frame * 0.2), [-1, 1], [0, 30])
    : 0;

  // Child position marker animations
  const markerScale = interpolate(
    Math.sin(frame * 0.15),
    [-1, 1],
    [1, 1.3]
  );

  const markerGlow = interpolate(
    Math.sin(frame * 0.15),
    [-1, 1],
    [10, 25]
  );

  // Breathing animation for buildings
  const buildingBreath = interpolate(
    Math.sin(frame * 0.05),
    [-1, 1],
    [0.99, 1.01]
  );

  // Trees swaying
  const treeSway = interpolate(
    Math.sin(frame * 0.1),
    [-1, 1],
    [-3, 3]
  );

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#e8f4f8',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Map background with animated elements */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 300 500"
        style={{ position: 'absolute' }}
      >
        {/* Sky gradient */}
        <defs>
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#87CEEB" />
            <stop offset="100%" stopColor="#e8f4f8" />
          </linearGradient>
          <linearGradient id="roadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d1d5db" />
            <stop offset="100%" stopColor="#e5e7eb" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="alertGlow">
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect width="300" height="500" fill="url(#skyGradient)" />

        {/* Animated clouds */}
        <ellipse cx={50 + cloud1X} cy="50" rx="40" ry="20" fill="white" opacity="0.8" />
        <ellipse cx={70 + cloud1X} cy="45" rx="30" ry="15" fill="white" opacity="0.9" />
        <ellipse cx={200 + cloud2X} cy="80" rx="35" ry="18" fill="white" opacity="0.7" />
        <ellipse cx={220 + cloud2X} cy="75" rx="25" ry="12" fill="white" opacity="0.85" />

        {/* Streets with gradient */}
        <rect x="0" y="120" width="300" height="30" fill="url(#roadGradient)" />
        <rect x="0" y="280" width="300" height="30" fill="url(#roadGradient)" />
        <rect x="70" y="0" width="25" height="500" fill="url(#roadGradient)" />
        <rect x="200" y="0" width="25" height="500" fill="url(#roadGradient)" />

        {/* Street lines - animated dashes */}
        <line x1="0" y1="135" x2="300" y2="135" stroke="#fff" strokeWidth="2" strokeDasharray="15,10" strokeDashoffset={frame % 25} />
        <line x1="0" y1="295" x2="300" y2="295" stroke="#fff" strokeWidth="2" strokeDasharray="15,10" strokeDashoffset={frame % 25} />

        {/* School building with breathing */}
        <g transform={`translate(150, 200) scale(${buildingBreath})`} style={{ transformOrigin: '0 0' }}>
          <rect x="-50" y="-40" width="100" height="80" rx="5" fill="#64748b" />
          <rect x="-45" y="-35" width="25" height="25" rx="2" fill="#93c5fd" />
          <rect x="20" y="-35" width="25" height="25" rx="2" fill="#93c5fd" />
          <rect x="-15" y="5" width="30" height="35" rx="2" fill="#78716c" />
          <text x="0" y="-5" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">
            ÉCOLE
          </text>
        </g>

        {/* Animated trees */}
        <g transform={`rotate(${treeSway}, 40, 380)`}>
          <circle cx="40" cy="360" r="20" fill="#22c55e" />
          <rect x="37" y="370" width="6" height="20" fill="#854d0e" />
        </g>
        <g transform={`rotate(${-treeSway * 0.8}, 260, 350)`}>
          <circle cx="260" cy="330" r="25" fill="#16a34a" />
          <rect x="256" y="345" width="8" height="25" fill="#854d0e" />
        </g>

        {/* Park area with animated grass */}
        <ellipse cx="150" cy="400" rx="90" ry="60" fill="#86efac" opacity="0.6" />
        <g>
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1={100 + i * 25}
              y1={390}
              x2={100 + i * 25 + interpolate(Math.sin(frame * 0.1 + i), [-1, 1], [-2, 2])}
              y2={380}
              stroke="#22c55e"
              strokeWidth="2"
            />
          ))}
        </g>
        <text x="150" y="410" textAnchor="middle" fill="#166534" fontSize="12" fontWeight="500">
          Parc Municipal
        </text>

        {/* Safe zone with animations */}
        {showSafeZone && (
          <g transform={`translate(${safeZoneCenter.x}, ${safeZoneCenter.y}) scale(${pulseScale})`} style={{ transformOrigin: '0 0' }}>
            {/* Alert expanding rings */}
            {alertActive && (
              <>
                <circle
                  cx={0}
                  cy={0}
                  r={safeZoneRadius + alertPulseRadius}
                  fill="none"
                  stroke={COLORS.danger}
                  strokeWidth="2"
                  opacity={0.5 - alertPulseRadius / 60}
                />
                <circle
                  cx={0}
                  cy={0}
                  r={safeZoneRadius + alertPulseRadius * 0.5}
                  fill="none"
                  stroke={COLORS.danger}
                  strokeWidth="3"
                  opacity={0.7 - alertPulseRadius / 60}
                />
              </>
            )}

            {/* Alert overlay when active */}
            {alertActive && (
              <circle
                cx={0}
                cy={0}
                r={safeZoneRadius + 10}
                fill={COLORS.danger}
                opacity={alertFlash}
                filter="url(#alertGlow)"
              />
            )}

            {/* Safe zone circle */}
            <circle
              cx={0}
              cy={0}
              r={safeZoneRadius}
              fill={alertActive ? COLORS.danger : COLORS.success}
              opacity={pulseOpacity}
            />
            <circle
              cx={0}
              cy={0}
              r={safeZoneRadius}
              fill="none"
              stroke={alertActive ? COLORS.danger : COLORS.success}
              strokeWidth="3"
              strokeDasharray="8,4"
              strokeDashoffset={frame * 0.5}
            />

            {/* Zone center marker */}
            <circle
              cx={0}
              cy={0}
              r="10"
              fill={COLORS.white}
              stroke={alertActive ? COLORS.danger : COLORS.success}
              strokeWidth="3"
            />
            <circle
              cx={0}
              cy={0}
              r="4"
              fill={alertActive ? COLORS.danger : COLORS.success}
            />
          </g>
        )}

        {/* Child position marker with glow effect */}
        <g transform={`translate(${childPosition.x}, ${childPosition.y})`}>
          {/* Glow effect */}
          <circle
            cx="0"
            cy="0"
            r={markerGlow}
            fill={alertActive ? COLORS.danger : COLORS.primary}
            opacity="0.3"
            filter="url(#glow)"
          />
          {/* Pulse rings */}
          <circle
            cx="0"
            cy="0"
            r={20 * markerScale}
            fill={alertActive ? COLORS.danger : COLORS.primary}
            opacity="0.2"
          />
          <circle
            cx="0"
            cy="0"
            r={15 * markerScale * 0.8}
            fill={alertActive ? COLORS.danger : COLORS.primary}
            opacity="0.3"
          />
          {/* Main marker */}
          <circle
            cx="0"
            cy="0"
            r="14"
            fill={alertActive ? COLORS.danger : COLORS.primary}
            stroke={COLORS.white}
            strokeWidth="3"
          />
          {/* Child icon */}
          <text x="0" y="5" textAnchor="middle" fontSize="12">
            👦
          </text>
        </g>
      </svg>

      {/* Animated location pins */}
      <div
        style={{
          position: 'absolute',
          bottom: 100,
          left: 30,
          animation: 'bounce 2s infinite',
        }}
      >
        📍
      </div>
    </div>
  );
};

export default MapView;
