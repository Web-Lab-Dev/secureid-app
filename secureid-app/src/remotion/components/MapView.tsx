import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
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

  // Pulsing safe zone border
  const pulseOpacity = interpolate(
    Math.sin(frame * 0.1),
    [-1, 1],
    [0.3, 0.6]
  );

  // Alert flash
  const alertFlash = alertActive
    ? interpolate(Math.sin(frame * 0.3), [-1, 1], [0.2, 0.5])
    : 0;

  // Child position marker pulse
  const markerScale = interpolate(
    Math.sin(frame * 0.2),
    [-1, 1],
    [1, 1.2]
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
      {/* Map background with streets */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 300 500"
        style={{ position: 'absolute' }}
      >
        {/* Background */}
        <rect width="300" height="500" fill="#e8f4f8" />

        {/* Streets */}
        <rect x="0" y="120" width="300" height="30" fill="#f5f5f5" />
        <rect x="0" y="280" width="300" height="30" fill="#f5f5f5" />
        <rect x="70" y="0" width="25" height="500" fill="#f5f5f5" />
        <rect x="200" y="0" width="25" height="500" fill="#f5f5f5" />

        {/* Street lines */}
        <line x1="0" y1="135" x2="300" y2="135" stroke="#ddd" strokeWidth="2" strokeDasharray="10,10" />
        <line x1="0" y1="295" x2="300" y2="295" stroke="#ddd" strokeWidth="2" strokeDasharray="10,10" />
        <line x1="82" y1="0" x2="82" y2="500" stroke="#ddd" strokeWidth="2" strokeDasharray="10,10" />
        <line x1="213" y1="0" x2="213" y2="500" stroke="#ddd" strokeWidth="2" strokeDasharray="10,10" />

        {/* Buildings */}
        <rect x="100" y="160" width="100" height="80" rx="5" fill="#94a3b8" />
        <text x="150" y="205" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">
          ÉCOLE
        </text>

        {/* Park area */}
        <ellipse cx="150" cy="380" rx="80" ry="50" fill="#86efac" opacity="0.5" />
        <text x="150" y="385" textAnchor="middle" fill="#166534" fontSize="10">
          Parc
        </text>

        {/* Safe zone */}
        {showSafeZone && (
          <>
            {/* Alert overlay when active */}
            {alertActive && (
              <circle
                cx={safeZoneCenter.x}
                cy={safeZoneCenter.y}
                r={safeZoneRadius + 10}
                fill={COLORS.danger}
                opacity={alertFlash}
              />
            )}

            {/* Safe zone circle */}
            <circle
              cx={safeZoneCenter.x}
              cy={safeZoneCenter.y}
              r={safeZoneRadius}
              fill={alertActive ? COLORS.danger : COLORS.success}
              opacity={pulseOpacity}
            />
            <circle
              cx={safeZoneCenter.x}
              cy={safeZoneCenter.y}
              r={safeZoneRadius}
              fill="none"
              stroke={alertActive ? COLORS.danger : COLORS.success}
              strokeWidth="3"
              strokeDasharray="8,4"
            />

            {/* Zone center marker */}
            <circle
              cx={safeZoneCenter.x}
              cy={safeZoneCenter.y}
              r="8"
              fill={COLORS.white}
              stroke={alertActive ? COLORS.danger : COLORS.success}
              strokeWidth="3"
            />
          </>
        )}

        {/* Child position marker */}
        <g transform={`translate(${childPosition.x}, ${childPosition.y})`}>
          {/* Pulse ring */}
          <circle
            cx="0"
            cy="0"
            r={15 * markerScale}
            fill={alertActive ? COLORS.danger : COLORS.primary}
            opacity="0.3"
          />
          {/* Main marker */}
          <circle
            cx="0"
            cy="0"
            r="12"
            fill={alertActive ? COLORS.danger : COLORS.primary}
          />
          {/* Inner dot */}
          <circle
            cx="0"
            cy="0"
            r="5"
            fill={COLORS.white}
          />
        </g>
      </svg>

      {/* Map controls overlay (decorative) */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            backgroundColor: COLORS.white,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            fontSize: 20,
            color: COLORS.gray[600],
          }}
        >
          +
        </div>
        <div
          style={{
            width: 36,
            height: 36,
            backgroundColor: COLORS.white,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            fontSize: 20,
            color: COLORS.gray[600],
          }}
        >
          −
        </div>
      </div>
    </div>
  );
};

export default MapView;
