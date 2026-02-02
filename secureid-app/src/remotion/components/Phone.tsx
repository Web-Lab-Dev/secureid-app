import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { COLORS } from '../helpers/constants';

interface PhoneProps {
  children: React.ReactNode;
  scale?: number;
  x?: number;
  y?: number;
  animateIn?: boolean;
}

export const Phone: React.FC<PhoneProps> = ({
  children,
  scale = 1,
  x = 0,
  y = 0,
  animateIn = true,
}) => {
  const frame = useCurrentFrame();

  const opacity = animateIn
    ? interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' })
    : 1;

  const slideY = animateIn
    ? interpolate(frame, [0, 20], [50, 0], { extrapolateRight: 'clamp' })
    : 0;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        opacity,
        transform: `scale(${scale}) translate(${x}px, ${y + slideY}px)`,
      }}
    >
      {/* Phone frame */}
      <div
        style={{
          width: 320,
          height: 640,
          backgroundColor: COLORS.gray[900],
          borderRadius: 40,
          padding: 10,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          position: 'relative',
        }}
      >
        {/* Dynamic Island / Notch */}
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 100,
            height: 30,
            backgroundColor: COLORS.dark,
            borderRadius: 20,
            zIndex: 10,
          }}
        />

        {/* Screen */}
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: COLORS.white,
            borderRadius: 32,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {children}
        </div>

        {/* Home indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: 15,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 120,
            height: 5,
            backgroundColor: COLORS.gray[600],
            borderRadius: 3,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export default Phone;
