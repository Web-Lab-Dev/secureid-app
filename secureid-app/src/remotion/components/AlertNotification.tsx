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

  // Spring animation for entrance
  const slideProgress = spring({
    frame: adjustedFrame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  const translateY = interpolate(slideProgress, [0, 1], [-150, 0]);
  const opacity = show ? interpolate(slideProgress, [0, 1], [0, 1]) : 0;
  const scale = interpolate(slideProgress, [0, 1], [0.8, 1]);

  const colors = {
    alert: { bg: COLORS.danger, icon: '🚨', gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' },
    info: { bg: COLORS.info, icon: 'ℹ️', gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
    success: { bg: COLORS.success, icon: '✓', gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' },
  };

  const currentColor = colors[type];

  // Shake animation for alert type
  const shakeOffset = type === 'alert' && adjustedFrame > 15
    ? Math.sin(adjustedFrame * 0.8) * 4
    : 0;

  // Pulsing glow for alert
  const glowIntensity = type === 'alert'
    ? interpolate(Math.sin(adjustedFrame * 0.3), [-1, 1], [10, 25])
    : 0;

  // Icon bounce
  const iconBounce = interpolate(
    Math.sin(adjustedFrame * 0.2),
    [-1, 1],
    [0.9, 1.1]
  );

  // Bell ring animation for alert
  const bellRotation = type === 'alert' && adjustedFrame > 10
    ? interpolate(Math.sin(adjustedFrame * 0.5), [-1, 1], [-15, 15])
    : 0;

  return (
    <div
      style={{
        position: 'absolute',
        top: 100,
        left: 20,
        right: 20,
        transform: `translateY(${translateY}px) translateX(${shakeOffset}px) scale(${scale})`,
        opacity,
        zIndex: 100,
      }}
    >
      {/* Glow effect behind */}
      {type === 'alert' && (
        <div
          style={{
            position: 'absolute',
            inset: -10,
            background: currentColor.bg,
            borderRadius: 26,
            opacity: 0.3,
            filter: `blur(${glowIntensity}px)`,
          }}
        />
      )}

      <div
        style={{
          backgroundColor: COLORS.white,
          borderRadius: 20,
          padding: 20,
          boxShadow: type === 'alert'
            ? `0 15px 40px rgba(239, 68, 68, 0.4), 0 5px 15px rgba(0,0,0,0.1)`
            : '0 15px 40px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 16,
          borderLeft: `5px solid ${currentColor.bg}`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Animated background gradient */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: currentColor.gradient,
          }}
        />

        {/* Icon with animation */}
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: 14,
            background: currentColor.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            flexShrink: 0,
            transform: `scale(${iconBounce}) rotate(${bellRotation}deg)`,
            boxShadow: `0 4px 15px ${currentColor.bg}50`,
          }}
        >
          {currentColor.icon}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: COLORS.dark,
              marginBottom: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {title}
            {type === 'alert' && (
              <span
                style={{
                  display: 'inline-block',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: COLORS.danger,
                  animation: 'pulse 1s infinite',
                }}
              />
            )}
          </div>
          <div
            style={{
              fontSize: 14,
              color: COLORS.gray[600],
              lineHeight: 1.5,
            }}
          >
            {message}
          </div>
        </div>

        {/* Time with animation */}
        <div
          style={{
            fontSize: 12,
            color: COLORS.gray[400],
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 4,
          }}
        >
          <span>maintenant</span>
          {type === 'alert' && (
            <span
              style={{
                fontSize: 10,
                color: COLORS.danger,
                fontWeight: 'bold',
                textTransform: 'uppercase',
              }}
            >
              Urgent
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertNotification;
