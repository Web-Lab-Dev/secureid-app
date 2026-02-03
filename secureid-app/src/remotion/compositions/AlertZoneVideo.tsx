import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from 'remotion';
import { MapView } from '../components/MapView';
import { AlertNotification } from '../components/AlertNotification';
import { COLORS } from '../helpers/constants';

/**
 * Vidéo 1: Alerte Sortie de Zone (~15s = 450 frames at 30fps)
 *
 * Scene 1 (0-90f): Carte avec zone sécurisée (école)
 * Scene 2 (90-180f): Enfant qui sort de la zone (point rouge)
 * Scene 3 (180-300f): Notification sur téléphone parent
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
  const alertActive = frame > scene2End;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.gray[100] }}>
      {/* Phone frame - fullscreen */}
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: COLORS.gray[900],
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Screen content */}
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: COLORS.white,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
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
              height: 80,
              backgroundColor: COLORS.white,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottom: `1px solid ${COLORS.gray[200]}`,
              paddingTop: 20,
            }}
          >
            <span
              style={{
                fontSize: 24,
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
              bottom: 40,
              left: 20,
              right: 20,
              backgroundColor: alertActive ? COLORS.danger : COLORS.primary,
              borderRadius: 20,
              padding: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 15,
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: COLORS.white,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 30,
              }}
            >
              👦
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 'bold',
                  color: COLORS.white,
                }}
              >
                Amadou
              </div>
              <div
                style={{
                  fontSize: 18,
                  color: COLORS.white,
                  opacity: 0.9,
                }}
              >
                {alertActive ? 'Hors zone !' : 'Dans la zone sécurisée'}
              </div>
            </div>
            <div
              style={{
                fontSize: 16,
                color: COLORS.white,
                opacity: 0.8,
              }}
            >
              En direct
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default AlertZoneVideo;
