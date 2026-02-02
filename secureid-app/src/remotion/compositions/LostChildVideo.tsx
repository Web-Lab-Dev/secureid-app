import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from 'remotion';
import { Phone } from '../components/Phone';
import { Bracelet } from '../components/Bracelet';
import { QRScanner } from '../components/QRScanner';
import { COLORS } from '../helpers/constants';

/**
 * Vidéo 2: Enfant Perdu + Secouriste (~20s = 600 frames at 30fps)
 *
 * Scene 1 (0-120f): Enfant seul dans un parc/marché
 * Scene 2 (120-210f): Secouriste s'approche, voit le bracelet
 * Scene 3 (210-330f): Scan du QR code
 * Scene 4 (330-480f): Page secouriste avec photo + nom + contact parent
 * Scene 5 (480-600f): Appel au parent
 */

export const LostChildVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene timing
  const scene1End = 120;
  const scene2End = 210;
  const scene3End = 330;
  const scene4End = 480;

  // Current scene
  const currentScene =
    frame < scene1End ? 1 :
    frame < scene2End ? 2 :
    frame < scene3End ? 3 :
    frame < scene4End ? 4 : 5;

  // Scanning animation
  const isScanning = currentScene === 3 && frame > scene2End + 30;
  const scanComplete = frame > scene3End - 30;

  // Call animation
  const callProgress = currentScene === 5
    ? spring({
        frame: frame - scene4End,
        fps,
        config: { damping: 15, stiffness: 100 },
      })
    : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.gray[100] }}>
      {/* Scene 1: Intro title */}
      <Sequence from={0} durationInFrames={60}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: COLORS.info,
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
            Enfant Perdu
          </div>
          <div
            style={{
              fontSize: 24,
              color: COLORS.white,
              opacity: 0.9,
              textAlign: 'center',
            }}
          >
            Un secouriste peut rapidement vous contacter
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 1: Child alone illustration */}
      <Sequence from={60} durationInFrames={scene1End - 60}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#e8f5e9',
            padding: 40,
          }}
        >
          {/* Park background */}
          <div
            style={{
              fontSize: 100,
              marginBottom: 30,
            }}
          >
            🌳👦🌳
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: COLORS.dark,
              textAlign: 'center',
              marginBottom: 10,
            }}
          >
            Amadou est seul dans le parc
          </div>
          <Bracelet y={80} showQR={true} pulseQR={true} />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: Rescuer approaches */}
      <Sequence from={scene1End} durationInFrames={scene2End - scene1End}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#e3f2fd',
            padding: 40,
          }}
        >
          <div
            style={{
              fontSize: 80,
              marginBottom: 30,
            }}
          >
            👨‍⚕️ ➡️ 👦
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: COLORS.dark,
              textAlign: 'center',
              marginBottom: 10,
            }}
          >
            Un secouriste remarque le bracelet
          </div>
          <div
            style={{
              fontSize: 18,
              color: COLORS.gray[600],
              textAlign: 'center',
            }}
          >
            "Ce bracelet a un QR code SecureID !"
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3: QR Scan */}
      <Sequence from={scene2End} durationInFrames={scene3End - scene2End}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: COLORS.light,
            padding: 40,
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: COLORS.dark,
              textAlign: 'center',
              marginBottom: 40,
            }}
          >
            Scan du bracelet
          </div>
          <QRScanner
            scanning={isScanning}
            scanComplete={scanComplete}
            delay={scene2End}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 4: Rescuer page with child info */}
      <Sequence from={scene3End} durationInFrames={scene4End - scene3End}>
        <Phone scale={0.9} y={50}>
          <div
            style={{
              height: '100%',
              backgroundColor: COLORS.white,
              padding: 20,
              paddingTop: 60,
            }}
          >
            {/* Header */}
            <div
              style={{
                backgroundColor: COLORS.primary,
                margin: -20,
                marginTop: -60,
                padding: 20,
                paddingTop: 50,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: COLORS.white,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                🛡️ SecureID - Page Secouriste
              </div>
            </div>

            {/* Child photo */}
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: COLORS.gray[200],
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 50,
                border: `4px solid ${COLORS.primary}`,
              }}
            >
              👦
            </div>

            {/* Child name */}
            <div
              style={{
                fontSize: 28,
                fontWeight: 'bold',
                color: COLORS.dark,
                textAlign: 'center',
                marginBottom: 5,
              }}
            >
              Amadou OUEDRAOGO
            </div>
            <div
              style={{
                fontSize: 16,
                color: COLORS.gray[500],
                textAlign: 'center',
                marginBottom: 20,
              }}
            >
              8 ans
            </div>

            {/* Info cards */}
            <div
              style={{
                backgroundColor: COLORS.gray[100],
                borderRadius: 12,
                padding: 15,
                marginBottom: 15,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: COLORS.gray[500],
                  marginBottom: 5,
                }}
              >
                Contact d'urgence
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: COLORS.dark,
                }}
              >
                Fatou OUEDRAOGO (Maman)
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: COLORS.primary,
                }}
              >
                +226 70 12 34 56
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#fef3c7',
                borderRadius: 12,
                padding: 15,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: COLORS.gray[500],
                  marginBottom: 5,
                }}
              >
                ⚠️ Allergies
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: COLORS.dark,
                }}
              >
                Arachides, Pénicilline
              </div>
            </div>
          </div>
        </Phone>
      </Sequence>

      {/* Scene 5: Calling parent */}
      <Sequence from={scene4End}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: COLORS.success,
            padding: 40,
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: COLORS.white,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 60,
              marginBottom: 30,
              transform: `scale(${interpolate(callProgress, [0, 1], [0.5, 1])})`,
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            }}
          >
            📞
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: COLORS.white,
              textAlign: 'center',
              marginBottom: 10,
            }}
          >
            Appel en cours...
          </div>
          <div
            style={{
              fontSize: 20,
              color: COLORS.white,
              opacity: 0.9,
              textAlign: 'center',
            }}
          >
            Fatou OUEDRAOGO
          </div>
          <div
            style={{
              fontSize: 16,
              color: COLORS.white,
              opacity: 0.7,
              textAlign: 'center',
              marginTop: 40,
            }}
          >
            ✓ Amadou est en sécurité
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

export default LostChildVideo;
