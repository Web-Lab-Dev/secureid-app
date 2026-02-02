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
import { QRScanner } from '../components/QRScanner';
import { COLORS } from '../helpers/constants';

/**
 * Vidéo 3: Malaise en Classe (~20s = 600 frames at 30fps)
 *
 * Scene 1 (0-120f): Classe, enfant ne se sent pas bien
 * Scene 2 (120-210f): Enseignante s'approche
 * Scene 3 (210-330f): Scan du bracelet
 * Scene 4 (330-480f): Affichage données médicales (allergies, groupe sanguin)
 * Scene 5 (480-600f): Enseignante informe l'infirmerie avec les bonnes infos
 */

export const MedicalEmergencyVideo: React.FC = () => {
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

  // Medical info reveal animation
  const infoReveal = currentScene >= 4
    ? spring({
        frame: frame - scene3End,
        fps,
        config: { damping: 15, stiffness: 80 },
      })
    : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.gray[100] }}>
      {/* Intro title */}
      <Sequence from={0} durationInFrames={60}>
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
              fontSize: 48,
              fontWeight: 'bold',
              color: COLORS.white,
              textAlign: 'center',
              marginBottom: 20,
            }}
          >
            Urgence Médicale
          </div>
          <div
            style={{
              fontSize: 24,
              color: COLORS.white,
              opacity: 0.9,
              textAlign: 'center',
            }}
          >
            Les données vitales toujours accessibles
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 1: Child feeling unwell in classroom */}
      <Sequence from={60} durationInFrames={scene1End - 60}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fef3c7',
            padding: 40,
          }}
        >
          {/* Classroom illustration */}
          <div
            style={{
              fontSize: 80,
              marginBottom: 30,
            }}
          >
            📚 😷 📝
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
            En classe...
          </div>
          <div
            style={{
              fontSize: 18,
              color: COLORS.gray[600],
              textAlign: 'center',
            }}
          >
            Awa ne se sent pas bien
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: Teacher approaches */}
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
            👩‍🏫 ➡️ 🤒
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
            L'enseignante intervient
          </div>
          <div
            style={{
              fontSize: 18,
              color: COLORS.gray[600],
              textAlign: 'center',
            }}
          >
            "Je vais scanner son bracelet SecureID"
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

      {/* Scene 4: Medical info display */}
      <Sequence from={scene3End} durationInFrames={scene4End - scene3End}>
        <Phone scale={0.9} y={50}>
          <div
            style={{
              height: '100%',
              backgroundColor: COLORS.white,
              padding: 20,
              paddingTop: 60,
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                backgroundColor: COLORS.danger,
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
                🏥 Fiche Médicale d'Urgence
              </div>
            </div>

            {/* Child info */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 15,
                marginBottom: 20,
                transform: `translateY(${interpolate(infoReveal, [0, 1], [50, 0])}px)`,
                opacity: infoReveal,
              }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: COLORS.gray[200],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 30,
                  border: `3px solid ${COLORS.danger}`,
                }}
              >
                👧
              </div>
              <div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: COLORS.dark,
                  }}
                >
                  Awa TRAORE
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: COLORS.gray[500],
                  }}
                >
                  7 ans - CE1
                </div>
              </div>
            </div>

            {/* Blood type - Critical info */}
            <div
              style={{
                backgroundColor: '#fee2e2',
                borderRadius: 12,
                padding: 15,
                marginBottom: 15,
                border: `2px solid ${COLORS.danger}`,
                transform: `translateY(${interpolate(infoReveal, [0, 1], [50, 0])}px)`,
                opacity: infoReveal,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      color: COLORS.danger,
                      fontWeight: 'bold',
                      marginBottom: 5,
                    }}
                  >
                    🩸 GROUPE SANGUIN
                  </div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 'bold',
                      color: COLORS.danger,
                    }}
                  >
                    A+
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 50,
                  }}
                >
                  🩸
                </div>
              </div>
            </div>

            {/* Allergies */}
            <div
              style={{
                backgroundColor: '#fef3c7',
                borderRadius: 12,
                padding: 15,
                marginBottom: 15,
                transform: `translateY(${interpolate(infoReveal, [0, 1], [50, 0])}px)`,
                opacity: infoReveal,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: '#92400e',
                  fontWeight: 'bold',
                  marginBottom: 8,
                }}
              >
                ⚠️ ALLERGIES
              </div>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                {['Arachides', 'Aspirine'].map((allergy) => (
                  <span
                    key={allergy}
                    style={{
                      backgroundColor: '#fcd34d',
                      color: '#78350f',
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: 14,
                      fontWeight: 'bold',
                    }}
                  >
                    {allergy}
                  </span>
                ))}
              </div>
            </div>

            {/* Medical conditions */}
            <div
              style={{
                backgroundColor: COLORS.gray[100],
                borderRadius: 12,
                padding: 15,
                transform: `translateY(${interpolate(infoReveal, [0, 1], [50, 0])}px)`,
                opacity: infoReveal,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: COLORS.gray[500],
                  fontWeight: 'bold',
                  marginBottom: 8,
                }}
              >
                📋 CONDITIONS MÉDICALES
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: COLORS.dark,
                }}
              >
                Asthme léger - Ventoline si besoin
              </div>
            </div>
          </div>
        </Phone>
      </Sequence>

      {/* Scene 5: Nurse informed */}
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
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            }}
          >
            ✅
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: COLORS.white,
              textAlign: 'center',
              marginBottom: 15,
            }}
          >
            Infirmerie informée !
          </div>
          <div
            style={{
              fontSize: 18,
              color: COLORS.white,
              opacity: 0.9,
              textAlign: 'center',
              maxWidth: 300,
            }}
          >
            L'infirmière connaît les allergies et le groupe sanguin d'Awa
          </div>
          <div
            style={{
              marginTop: 40,
              padding: '12px 24px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 30,
              fontSize: 14,
              color: COLORS.white,
            }}
          >
            🛡️ Protégée par SecureID
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

export default MedicalEmergencyVideo;
