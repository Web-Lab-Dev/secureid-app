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
 * Vidéo 2: Enfant Perdu + Secouriste (~20s = 600 frames at 30fps)
 */

// Animated character component
const AnimatedCharacter: React.FC<{
  emoji: string;
  x: number;
  y: number;
  scale?: number;
  bounce?: boolean;
  delay?: number;
}> = ({ emoji, x, y, scale = 1, bounce = false, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const adjustedFrame = Math.max(0, frame - delay);

  const entranceScale = spring({
    frame: adjustedFrame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const bounceY = bounce
    ? interpolate(Math.sin(adjustedFrame * 0.15), [-1, 1], [-5, 5])
    : 0;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y + bounceY,
        fontSize: 80 * scale,
        transform: `scale(${entranceScale})`,
        filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))',
      }}
    >
      {emoji}
    </div>
  );
};

// Floating particles
const Particles: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame();

  return (
    <>
      {[...Array(8)].map((_, i) => {
        const baseX = (i * 120) % 800 + 100;
        const baseY = 300 + (i * 50) % 200;
        const floatY = interpolate(
          Math.sin(frame * 0.05 + i * 0.5),
          [-1, 1],
          [-20, 20]
        );
        const floatX = interpolate(
          Math.cos(frame * 0.03 + i * 0.3),
          [-1, 1],
          [-10, 10]
        );
        const scale = interpolate(
          Math.sin(frame * 0.08 + i),
          [-1, 1],
          [0.5, 1]
        );

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: baseX + floatX,
              top: baseY + floatY,
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: color,
              opacity: 0.3,
              transform: `scale(${scale})`,
            }}
          />
        );
      })}
    </>
  );
};

export const LostChildVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene timing
  const scene1End = 120;
  const scene2End = 240;
  const scene3End = 360;
  const scene4End = 500;

  // Current scene
  const currentScene =
    frame < scene1End ? 1 :
    frame < scene2End ? 2 :
    frame < scene3End ? 3 :
    frame < scene4End ? 4 : 5;

  // Rescuer walking animation
  const rescuerX = currentScene === 2
    ? interpolate(frame, [scene1End, scene2End], [800, 400], { extrapolateRight: 'clamp' })
    : 400;

  // QR scan progress
  const scanProgress = currentScene === 3
    ? interpolate(frame, [scene2End, scene3End - 30], [0, 1], { extrapolateRight: 'clamp' })
    : currentScene > 3 ? 1 : 0;

  // Info card reveal
  const cardReveal = spring({
    frame: Math.max(0, frame - scene3End),
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  // Call animation
  const callPulse = currentScene === 5
    ? interpolate(Math.sin(frame * 0.2), [-1, 1], [0.95, 1.05])
    : 1;

  return (
    <AbsoluteFill style={{ backgroundColor: '#f0fdf4' }}>
      {/* Scene 1: Child alone in park */}
      <Sequence from={0} durationInFrames={scene1End}>
        <AbsoluteFill
          style={{
            background: 'linear-gradient(180deg, #86efac 0%, #bbf7d0 50%, #dcfce7 100%)',
          }}
        >
          <Particles color="#22c55e" />

          {/* Park elements */}
          <div style={{ position: 'absolute', left: 100, top: 400, fontSize: 120 }}>🌳</div>
          <div style={{ position: 'absolute', right: 100, top: 350, fontSize: 140 }}>🌲</div>
          <div style={{ position: 'absolute', left: '50%', top: 500, fontSize: 100, transform: 'translateX(-50%)' }}>🪨</div>

          {/* Animated sun */}
          <div
            style={{
              position: 'absolute',
              right: 80,
              top: 100,
              fontSize: 100,
              transform: `rotate(${frame * 0.5}deg)`,
            }}
          >
            ☀️
          </div>

          {/* Lost child - bouncing nervously */}
          <AnimatedCharacter emoji="👦" x={450} y={600} scale={1.5} bounce />

          {/* Question marks floating */}
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 500 + i * 60,
                top: 500 - interpolate(Math.sin(frame * 0.1 + i), [-1, 1], [0, 40]),
                fontSize: 40,
                opacity: interpolate(Math.sin(frame * 0.1 + i), [-1, 1], [0.3, 1]),
              }}
            >
              ❓
            </div>
          ))}

          {/* Title */}
          <div
            style={{
              position: 'absolute',
              bottom: 200,
              left: 0,
              right: 0,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontWeight: 'bold',
                color: '#166534',
                textShadow: '0 2px 10px rgba(0,0,0,0.1)',
              }}
            >
              Amadou est perdu...
            </div>
            <div
              style={{
                fontSize: 28,
                color: '#15803d',
                marginTop: 10,
              }}
            >
              Mais il porte son bracelet SecureID
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: Rescuer approaches */}
      <Sequence from={scene1End} durationInFrames={scene2End - scene1End}>
        <AbsoluteFill
          style={{
            background: 'linear-gradient(180deg, #bfdbfe 0%, #dbeafe 50%, #eff6ff 100%)',
          }}
        >
          <Particles color="#3b82f6" />

          {/* Park background */}
          <div style={{ position: 'absolute', left: 50, top: 400, fontSize: 100 }}>🌳</div>
          <div style={{ position: 'absolute', right: 50, top: 380, fontSize: 110 }}>🌲</div>

          {/* Child */}
          <AnimatedCharacter emoji="👦" x={300} y={700} scale={1.2} bounce />

          {/* Bracelet highlight */}
          <div
            style={{
              position: 'absolute',
              left: 340,
              top: 850,
              width: 60,
              height: 30,
              borderRadius: 15,
              background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary})`,
              boxShadow: `0 0 ${20 + interpolate(Math.sin(frame * 0.2), [-1, 1], [0, 15])}px ${COLORS.primary}`,
            }}
          />

          {/* Rescuer walking */}
          <div
            style={{
              position: 'absolute',
              left: rescuerX,
              top: 650,
              fontSize: 120,
              transform: `scaleX(-1)`,
            }}
          >
            👨‍⚕️
          </div>

          {/* Speech bubble */}
          {frame > scene1End + 60 && (
            <div
              style={{
                position: 'absolute',
                left: rescuerX - 50,
                top: 550,
                background: 'white',
                padding: '15px 25px',
                borderRadius: 20,
                fontSize: 24,
                boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
                transform: `scale(${spring({ frame: frame - scene1End - 60, fps, config: { damping: 12 } })})`,
              }}
            >
              Un bracelet SecureID ! 💡
            </div>
          )}
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3: QR Scan */}
      <Sequence from={scene2End} durationInFrames={scene3End - scene2End}>
        <AbsoluteFill
          style={{
            background: 'linear-gradient(180deg, #1e293b 0%, #334155 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Scan frame */}
          <div
            style={{
              width: 400,
              height: 400,
              position: 'relative',
            }}
          >
            {/* Corner brackets */}
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: 60,
                  height: 60,
                  border: `4px solid ${scanProgress === 1 ? COLORS.success : COLORS.primary}`,
                  borderRadius: 8,
                  ...(i === 0 ? { top: 0, left: 0, borderRight: 'none', borderBottom: 'none' } : {}),
                  ...(i === 1 ? { top: 0, right: 0, borderLeft: 'none', borderBottom: 'none' } : {}),
                  ...(i === 2 ? { bottom: 0, left: 0, borderRight: 'none', borderTop: 'none' } : {}),
                  ...(i === 3 ? { bottom: 0, right: 0, borderLeft: 'none', borderTop: 'none' } : {}),
                }}
              />
            ))}

            {/* QR Code */}
            <div
              style={{
                position: 'absolute',
                inset: 60,
                background: 'white',
                borderRadius: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 150,
              }}
            >
              📱
            </div>

            {/* Scanning line */}
            {scanProgress < 1 && (
              <div
                style={{
                  position: 'absolute',
                  left: 20,
                  right: 20,
                  top: 60 + (280 * ((frame - scene2End) % 60) / 60),
                  height: 4,
                  background: `linear-gradient(90deg, transparent, ${COLORS.primary}, transparent)`,
                  boxShadow: `0 0 20px ${COLORS.primary}`,
                }}
              />
            )}

            {/* Success checkmark */}
            {scanProgress === 1 && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(34, 197, 94, 0.9)',
                  borderRadius: 20,
                  fontSize: 120,
                  transform: `scale(${spring({ frame: frame - scene3End + 30, fps })})`,
                }}
              >
                ✅
              </div>
            )}
          </div>

          {/* Status text */}
          <div
            style={{
              position: 'absolute',
              bottom: 300,
              fontSize: 32,
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            {scanProgress === 1 ? 'Bracelet identifié !' : 'Scan en cours...'}
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 4: Child info displayed */}
      <Sequence from={scene3End} durationInFrames={scene4End - scene3End}>
        <AbsoluteFill
          style={{
            background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
          }}
        >
          {/* Info card */}
          <div
            style={{
              position: 'absolute',
              top: 150,
              left: 60,
              right: 60,
              background: 'white',
              borderRadius: 30,
              padding: 40,
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              transform: `scale(${cardReveal}) translateY(${interpolate(cardReveal, [0, 1], [50, 0])}px)`,
            }}
          >
            {/* Header */}
            <div
              style={{
                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                margin: -40,
                marginBottom: 30,
                padding: 30,
                borderRadius: '30px 30px 0 0',
                display: 'flex',
                alignItems: 'center',
                gap: 15,
              }}
            >
              <span style={{ fontSize: 30 }}>🛡️</span>
              <span style={{ fontSize: 28, fontWeight: 'bold', color: 'white' }}>
                SecureID - Fiche Enfant
              </span>
            </div>

            {/* Photo */}
            <div
              style={{
                width: 150,
                height: 150,
                borderRadius: 75,
                background: '#fef3c7',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 80,
                border: `5px solid ${COLORS.primary}`,
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              }}
            >
              👦
            </div>

            {/* Name */}
            <div style={{ textAlign: 'center', marginBottom: 30 }}>
              <div style={{ fontSize: 40, fontWeight: 'bold', color: COLORS.dark }}>
                Amadou OUEDRAOGO
              </div>
              <div style={{ fontSize: 24, color: COLORS.gray[500] }}>8 ans</div>
            </div>

            {/* Contact info */}
            <div
              style={{
                background: '#f0fdf4',
                borderRadius: 20,
                padding: 25,
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 16, color: COLORS.gray[500], marginBottom: 10 }}>
                📞 Contact d'urgence
              </div>
              <div style={{ fontSize: 26, fontWeight: 'bold', color: COLORS.dark }}>
                Fatou OUEDRAOGO (Maman)
              </div>
              <div style={{ fontSize: 24, color: COLORS.primary, marginTop: 5 }}>
                +226 70 12 34 56
              </div>
            </div>

            {/* Call button */}
            <div
              style={{
                background: `linear-gradient(135deg, ${COLORS.success}, #16a34a)`,
                borderRadius: 20,
                padding: 25,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 15,
                transform: `scale(${interpolate(Math.sin(frame * 0.15), [-1, 1], [0.98, 1.02])})`,
                boxShadow: '0 10px 30px rgba(34, 197, 94, 0.4)',
              }}
            >
              <span style={{ fontSize: 35 }}>📱</span>
              <span style={{ fontSize: 28, fontWeight: 'bold', color: 'white' }}>
                Appeler la maman
              </span>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 5: Calling parent */}
      <Sequence from={scene4End}>
        <AbsoluteFill
          style={{
            background: `linear-gradient(180deg, ${COLORS.success}, #16a34a)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Particles color="white" />

          {/* Phone icon */}
          <div
            style={{
              width: 180,
              height: 180,
              borderRadius: 90,
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 90,
              transform: `scale(${callPulse})`,
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              marginBottom: 40,
            }}
          >
            📞
          </div>

          {/* Calling text */}
          <div style={{ fontSize: 40, fontWeight: 'bold', color: 'white', marginBottom: 15 }}>
            Appel en cours...
          </div>
          <div style={{ fontSize: 30, color: 'rgba(255,255,255,0.9)' }}>
            Fatou OUEDRAOGO
          </div>

          {/* Success message */}
          <div
            style={{
              marginTop: 80,
              padding: '20px 40px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: 30,
              fontSize: 24,
              color: 'white',
            }}
          >
            ✓ Amadou est en sécurité !
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

export default LostChildVideo;
