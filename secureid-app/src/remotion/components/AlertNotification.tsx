import React from 'react';
import { interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { COLORS } from '../helpers/constants';

interface AlertNotificationProps {
  type: 'alert' | 'info' | 'success';
  title: string;
  message: string;
  delay?: number;
  show?: boolean;
}

export const AlertNotification: React.FC<AlertNotificationProps> = ({
  type,
  title,
  message,
  delay = 0,
  show = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const adjustedFrame = Math.max(0, frame - delay);

  const slideProgress = spring({
    frame: adjustedFrame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  const translateY = interpolate(slideProgress, [0, 1], [-100, 0]);
  const opacity = show ? interpolate(slideProgress, [0, 1], [0, 1]) : 0;

  const colors = {
    alert: { bg: COLORS.danger, icon: '🚨' },
    info: { bg: COLORS.info, icon: 'ℹ️' },
    success: { bg: COLORS.success, icon: '✓' },
  };

  const currentColor = colors[type];

  // Shake animation for alert type
  const shakeOffset = type === 'alert' && adjustedFrame > 15
    ? Math.sin(adjustedFrame * 0.8) * 3
    : 0;

  return (
    <div
      style={{
        position: 'absolute',
        top: 60,
        left: 10,
        right: 10,
        transform: `translateY(${translateY}px) translateX(${shakeOffset}px)`,
        opacity,
        zIndex: 100,
      }}
    >
      <div
        style={{
          backgroundColor: COLORS.white,
          borderRadius: 16,
          padding: 16,
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          borderLeft: `4px solid ${currentColor.bg}`,
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: currentColor.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          {currentColor.icon}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 'bold',
              color: COLORS.dark,
              marginBottom: 4,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 12,
              color: COLORS.gray[600],
              lineHeight: 1.4,
            }}
          >
            {message}
          </div>
        </div>

        {/* Time */}
        <div
          style={{
            fontSize: 10,
            color: COLORS.gray[400],
            flexShrink: 0,
          }}
        >
          maintenant
        </div>
      </div>
    </div>
  );
};

export default AlertNotification;
