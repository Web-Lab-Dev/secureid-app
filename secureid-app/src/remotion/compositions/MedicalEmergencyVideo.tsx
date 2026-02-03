import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from 'remotion';
import { COLORS } from '../helpers/constants';

/**
 * Vidéo 3: Malaise en Classe (~20s = 600 frames at 30fps)
 */

// Floating hearts for medical theme
const FloatingHearts: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <>
      {[...Array(6)].map((_, i) => {
        const baseX = 100 + (i * 150) % 800;
        const baseY = 200 + (i * 80) % 400;
        const floatY = interpolate(
          Math.sin(frame * 0.04 + i * 0.8),
          [-1, 1],
          [-30, 30]
        );
        const scale = interpolate(
          Math.sin(frame * 0.06 + i),
          [-1, 1],
          [0.6, 1.2]
        );

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: baseX,
              top: baseY + floatY,
              fontSize: 30,
              opacity: 0.2,
              transform: `scale(${scale})`,
            }}
          >
            ❤️
          </div>
        );
      })}
    </>
  );
};

// Pulse animation component
const PulseRing: React.FC<{ delay: number; color: string }> = ({ delay, color }) => {
  const frame = useCurrentFrame();
  const adjustedFrame = Math.max(0, frame - delay);

  const scale = interpolate(adjustedFrame % 60, [0, 60], [0.8, 2]);
  const opacity = interpolate(adjustedFrame % 60, [0, 60], [0.6, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: '50%',
        border: `3px solid ${color}`,
        transform: `scale(${scale})`,
        opacity,
      }}
    />
  );
};

export const MedicalEmergencyVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene timing
  const scene1End = 120;
  const scene2End = 240;
  const scene3End = 380;
  const scene4End = 520;

  // Current scene
  const currentScene =
    frame < scene1End ? 1 :
    frame < scene2End ? 2 :
    frame < scene3End ? 3 :
    frame < scene4End ? 4 : 5;

  // Child wobble when unwell
  const childWobble = currentScene === 1
    ? interpolate(Math.sin(frame * 0.2), [-1, 1], [-5, 5])
    : 0;

  // Teacher walking
  const teacherX = currentScene === 2
    ? interpolate(frame, [scene1End, scene1End + 60], [700, 500], { extrapolateRight: 'clamp' })
    : 500;

  // Scan progress
  const scanProgress = currentScene === 3
    ? interpolate(frame, [scene2End, scene3End - 40], [0, 1], { extrapolateRight: 'clamp' })
    : currentScene > 3 ? 1 : 0;

  // Medical info reveal
  const infoReveal = spring({
    frame: Math.max(0, frame - scene3End),
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  // Success pulse
  const successPulse = currentScene === 5
    ? interpolate(Math.sin(frame * 0.15), [-1, 1], [0.95, 1.05])
    : 1;

  return (
    <AbsoluteFill style={{ backgroundColor: '#fef3c7' }}>
      {/* Scene 1: Classroom, child unwell */}
      <Sequence from={0} durationInFrames={scene1End}>
        <AbsoluteFill
          style={{
            background: 'linear-gradient(180deg, #fef9c3 0%, #fef3c7 50%, #fde68a 100%)',
          }}
        >
          {/* Classroom elements */}
          <div style={{ position: 'absolute', left: 50, top: 200, fontSize: 80 }}>📚</div>
          <div style={{ position: 'absolute', right: 80, top: 180, fontSize: 90 }}>🎒</div>
          <div style={{ position: 'absolute', left: 150, top: 280, fontSize: 70 }}>✏️</div>

          {/* Blackboard */}
          <div
            style={{
              position: 'absolute',
              top: 100,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 500,
              height: 200,
              background: '#166534',
              borderRadius: 10,
              border: '10px solid #854d0e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: 'white', fontSize: 40 }}>Mathématiques 📐</span>
          </div>

          {/* Desk rows */}
          {[0, 1].map((row) => (
            <div
              key={row}
              style={{
                position: 'absolute',
                top: 500 + row * 200,
                left: 100,
                right: 100,
                display: 'flex',
                justifyContent: 'space-around',
              }}
            >
              {[0, 1, 2].map((col) => (
                <div
                  key={col}
                  style={{
                    width: 120,
                    height: 80,
                    background: '#d4a574',
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: row === 0 && col === 1 ? 60 : 50,
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                  }}
                >
                  {row === 0 && col === 1 ? (
                    <span style={{ transform: `rotate(${childWobble}deg)` }}>🤒</span>
                  ) : (
                    '👧'
                  )}
                </div>
              ))}
            </div>
          ))}

          {/* Alert indicator above sick child */}
          <div
            style={{
              position: 'absolute',
              top: 420,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Pulse rings */}
            <div style={{ position: 'relative', width: 100, height: 100 }}>
              <PulseRing delay={0} color={COLORS.danger} />
              <PulseRing delay={20} color={COLORS.danger} />
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              position: 'absolute',
              bottom: 150,
              left: 0,
              right: 0,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 42, fontWeight: 'bold', color: '#92400e' }}>
              Awa ne se sent pas bien...
            </div>
            <div style={{ fontSize: 26, color: '#a16207', marginTop: 10 }}>
              L'enseignante remarque le malaise
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: Teacher approaches */}
      <Sequence from={scene1End} durationInFrames={scene2End - scene1End}>
        <AbsoluteFill
          style={{
            background: 'linear-gradient(180deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%)',
          }}
        >
          <FloatingHearts />

          {/* Child */}
          <div
            style={{
              position: 'absolute',
              left: 300,
              top: 600,
              fontSize: 120,
              transform: `rotate(${interpolate(Math.sin(frame * 0.1), [-1, 1], [-3, 3])}deg)`,
            }}
          >
            🤒
          </div>

          {/* Bracelet glow */}
          <div
            style={{
              position: 'absolute',
              left: 340,
              top: 780,
              width: 80,
              height: 35,
              borderRadius: 20,
              background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary})`,
              boxShadow: `0 0 ${25 + interpolate(Math.sin(frame * 0.25), [-1, 1], [0, 20])}px ${COLORS.primary}`,
            }}
          />

          {/* Teacher */}
          <div
            style={{
              position: 'absolute',
              left: teacherX,
              top: 550,
              fontSize: 130,
              transform: 'scaleX(-1)',
            }}
          >
            👩‍🏫
          </div>

          {/* Speech bubble */}
          {frame > scene1End + 40 && (
            <div
              style={{
                position: 'absolute',
                left: teacherX - 80,
                top: 430,
                background: 'white',
                padding: '20px 30px',
                borderRadius: 25,
                fontSize: 26,
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                transform: `scale(${spring({ frame: frame - scene1End - 40, fps, config: { damping: 10 } })})`,
              }}
            >
              Je vais scanner son bracelet 💡
            </div>
          )}
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3: QR Scan */}
      <Sequence from={scene2End} durationInFrames={scene3End - scene2End}>
        <AbsoluteFill
          style={{
            background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Medical cross animation */}
          <div
            style={{
              position: 'absolute',
              top: 150,
              left: '50%',
              transform: `translateX(-50%) rotate(${frame * 2}deg)`,
              fontSize: 80,
              opacity: 0.3,
            }}
          >
            ⚕️
          </div>

          {/* Scan frame */}
          <div style={{ width: 450, height: 450, position: 'relative' }}>
            {/* Animated corners */}
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: 70,
                  height: 70,
                  border: `5px solid ${scanProgress === 1 ? COLORS.success : '#ef4444'}`,
                  borderRadius: 10,
                  transition: 'border-color 0.3s',
                  ...(i === 0 ? { top: 0, left: 0, borderRight: 'none', borderBottom: 'none' } : {}),
                  ...(i === 1 ? { top: 0, right: 0, borderLeft: 'none', borderBottom: 'none' } : {}),
                  ...(i === 2 ? { bottom: 0, left: 0, borderRight: 'none', borderTop: 'none' } : {}),
                  ...(i === 3 ? { bottom: 0, right: 0, borderLeft: 'none', borderTop: 'none' } : {}),
                }}
              />
            ))}

            {/* Bracelet visualization */}
            <div
              style={{
                position: 'absolute',
                inset: 80,
                background: 'white',
                borderRadius: 25,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 15,
              }}
            >
              <div style={{ fontSize: 80 }}>⌚</div>
              <div
                style={{
                  width: 150,
                  height: 40,
                  borderRadius: 20,
                  background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary})`,
                }}
              />
            </div>

            {/* Scanning animation */}
            {scanProgress < 1 && (
              <>
                <div
                  style={{
                    position: 'absolute',
                    left: 30,
                    right: 30,
                    top: 80 + (290 * ((frame - scene2End) % 50) / 50),
                    height: 5,
                    background: 'linear-gradient(90deg, transparent, #ef4444, transparent)',
                    boxShadow: '0 0 30px #ef4444',
                  }}
                />
                {/* Scanning dots */}
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: 150 + i * 50,
                      bottom: 80,
                      width: 15,
                      height: 15,
                      borderRadius: '50%',
                      background: '#ef4444',
                      opacity: interpolate((frame + i * 10) % 30, [0, 15, 30], [0.3, 1, 0.3]),
                    }}
                  />
                ))}
              </>
            )}

            {/* Success overlay */}
            {scanProgress === 1 && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(34, 197, 94, 0.95)',
                  borderRadius: 25,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 150,
                  transform: `scale(${spring({ frame: frame - scene3End + 40, fps })})`,
                }}
              >
                ✅
              </div>
            )}
          </div>

          {/* Status */}
          <div
            style={{
              position: 'absolute',
              bottom: 250,
              fontSize: 36,
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            {scanProgress === 1 ? '✓ Données médicales chargées' : '🔍 Lecture des données...'}
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 4: Medical info displayed */}
      <Sequence from={scene3End} durationInFrames={scene4End - scene3End}>
        <AbsoluteFill
          style={{
            background: 'linear-gradient(180deg, #fef2f2 0%, #fee2e2 100%)',
          }}
        >
          {/* Medical card */}
          <div
            style={{
              position: 'absolute',
              top: 100,
              left: 50,
              right: 50,
              background: 'white',
              borderRadius: 35,
              padding: 40,
              boxShadow: '0 25px 80px rgba(239, 68, 68, 0.2)',
              transform: `scale(${infoReveal}) translateY(${interpolate(infoReveal, [0, 1], [80, 0])}px)`,
            }}
          >
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                margin: -40,
                marginBottom: 30,
                padding: 35,
                borderRadius: '35px 35px 0 0',
                display: 'flex',
                alignItems: 'center',
                gap: 20,
              }}
            >
              <span style={{ fontSize: 40 }}>🏥</span>
              <span style={{ fontSize: 32, fontWeight: 'bold', color: 'white' }}>
                Fiche Médicale d'Urgence
              </span>
            </div>

            {/* Child info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 25, marginBottom: 30 }}>
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  background: '#fef3c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 60,
                  border: '4px solid #ef4444',
                }}
              >
                👧
              </div>
              <div>
                <div style={{ fontSize: 34, fontWeight: 'bold', color: COLORS.dark }}>
                  Awa TRAORE
                </div>
                <div style={{ fontSize: 22, color: COLORS.gray[500] }}>7 ans - CE1</div>
              </div>
            </div>

            {/* Blood type - Critical */}
            <div
              style={{
                background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                borderRadius: 25,
                padding: 25,
                marginBottom: 20,
                border: '3px solid #ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: 16, color: '#dc2626', fontWeight: 'bold', marginBottom: 8 }}>
                  🩸 GROUPE SANGUIN
                </div>
                <div style={{ fontSize: 50, fontWeight: 'bold', color: '#dc2626' }}>A+</div>
              </div>
              <div style={{ fontSize: 70 }}>🩸</div>
            </div>

            {/* Allergies */}
            <div
              style={{
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                borderRadius: 25,
                padding: 25,
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 16, color: '#92400e', fontWeight: 'bold', marginBottom: 15 }}>
                ⚠️ ALLERGIES
              </div>
              <div style={{ display: 'flex', gap: 15, flexWrap: 'wrap' }}>
                {['Arachides 🥜', 'Aspirine 💊'].map((allergy) => (
                  <span
                    key={allergy}
                    style={{
                      background: '#fbbf24',
                      color: '#78350f',
                      padding: '12px 25px',
                      borderRadius: 25,
                      fontSize: 22,
                      fontWeight: 'bold',
                    }}
                  >
                    {allergy}
                  </span>
                ))}
              </div>
            </div>

            {/* Medical condition */}
            <div
              style={{
                background: '#f0f9ff',
                borderRadius: 25,
                padding: 25,
              }}
            >
              <div style={{ fontSize: 16, color: '#0369a1', fontWeight: 'bold', marginBottom: 10 }}>
                📋 CONDITIONS MÉDICALES
              </div>
              <div style={{ fontSize: 22, color: COLORS.dark }}>
                Asthme léger - Ventoline si besoin 💨
              </div>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 5: Nurse informed */}
      <Sequence from={scene4End}>
        <AbsoluteFill
          style={{
            background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FloatingHearts />

          {/* Success icon */}
          <div
            style={{
              width: 200,
              height: 200,
              borderRadius: 100,
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 100,
              transform: `scale(${successPulse})`,
              boxShadow: '0 25px 80px rgba(0,0,0,0.2)',
              marginBottom: 50,
            }}
          >
            ✅
          </div>

          {/* Text */}
          <div style={{ fontSize: 38, fontWeight: 'bold', color: 'white', marginBottom: 20, textAlign: 'center' }}>
            Infirmerie informée !
          </div>
          <div style={{ fontSize: 26, color: 'rgba(255,255,255,0.9)', textAlign: 'center', maxWidth: 600, lineHeight: 1.5 }}>
            L'infirmière connaît les allergies et le groupe sanguin d'Awa
          </div>

          {/* SecureID badge */}
          <div
            style={{
              marginTop: 60,
              padding: '20px 45px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: 40,
              fontSize: 26,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 15,
            }}
          >
            <span style={{ fontSize: 35 }}>🛡️</span>
            Protégée par SecureID
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

export default MedicalEmergencyVideo;
