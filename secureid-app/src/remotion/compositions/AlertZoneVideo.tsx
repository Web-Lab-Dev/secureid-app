import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
} from 'remotion';
import { Phone } from '../components/Phone';
import { MapView } from '../components/MapView';
import { AlertNotification } from '../components/AlertNotification';
import { COLORS, VIDEO_CONFIG } from '../helpers/constants';

/**
 * Vidéo 1: Alerte Sortie de Zone (~15s = 450 frames at 30fps)
 *
 * Scene 1 (0-90f): Carte avec zone sécurisée (école)
 * Scene 2 (90-180f): Enfant qui sort de la zone (point rouge)
 * Scene 3 (180-300f): Notification push sur téléphone parent
 * Scene 4 (300-450f): Parent voit position en temps réel
 */

export const AlertZoneVideo: React.FC = () => {
  const frame = useCurrentFrame();

  // Scene timing
  const scene1End = 90;
  const scene2End = 180;
  const scene3End = 300;

  // Child position animation (moves from inside zone to outside)
  const childX = interpolate(
    frame,
    [0, scene1End, scene2End],
    [150, 150, 150],
    { extrapolateRight: 'clamp' }
  );

  const childY = interpolate(
    frame,
    [0, scene1End, scene2End, scene3End],
    [200, 200, 320, 380],
    { extrapolateRight: 'clamp' }
  );

  // Alert becomes active when child leaves zone
  const isOutsideZone = frame > scene2End - 30;
  const alertActive = frame > scene2End;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.gray[100] }}>
      {/* Title at start */}
      <Sequence from={0} durationInFrames={60}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: COLORS.primary,
            padding: 40,
          }}
        >
          <div
            style={{
              fontSize: 48,
              fontWeight: 'bold',
              color: COLORS.white,
              textAlign: 'center',
              marginBottom: 20,
            }}
          >
            Alerte Zone
          </div>
          <div
            style={{
              fontSize: 24,
              color: COLORS.white,
              opacity: 0.9,
              textAlign: 'center',
            }}
          >
            Votre enfant sort de la zone sécurisée
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Main content */}
      <Sequence from={60}>
        <Phone scale={0.9} y={50}>
          {/* Map view */}
          <MapView
            showSafeZone={true}
            childPosition={{ x: childX, y: childY }}
            alertActive={alertActive}
            safeZoneCenter={{ x: 150, y: 200 }}
            safeZoneRadius={80}
          />

          {/* Alert notification */}
          {alertActive && (
            <AlertNotification
              type="alert"
              title="⚠️ Alerte Zone"
              message="Amadou a quitté la zone École Primaire"
              delay={0}
            />
          )}

          {/* Header overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 50,
              backgroundColor: COLORS.white,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottom: `1px solid ${COLORS.gray[200]}`,
            }}
          >
            <span
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: COLORS.dark,
              }}
            >
              🛡️ SecureID - GPS
            </span>
          </div>

          {/* Bottom info bar */}
          <div
            style={{
              position: 'absolute',
              bottom: 20,
              left: 10,
              right: 10,
              backgroundColor: alertActive ? COLORS.danger : COLORS.primary,
              borderRadius: 12,
              padding: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: COLORS.white,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}
            >
              👦
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: COLORS.white,
                }}
              >
                Amadou
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: COLORS.white,
                  opacity: 0.9,
                }}
              >
                {alertActive ? 'Hors zone !' : 'Dans la zone sécurisée'}
              </div>
            </div>
            <div
              style={{
                fontSize: 12,
                color: COLORS.white,
                opacity: 0.8,
              }}
            >
              En direct
            </div>
          </div>
        </Phone>
      </Sequence>
    </AbsoluteFill>
  );
};

export default AlertZoneVideo;
