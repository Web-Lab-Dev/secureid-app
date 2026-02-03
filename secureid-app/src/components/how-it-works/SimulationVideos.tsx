'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { AlertZoneVideo } from '@/remotion/compositions/AlertZoneVideo';
import { LostChildVideo } from '@/remotion/compositions/LostChildVideo';
import { MedicalEmergencyVideo } from '@/remotion/compositions/MedicalEmergencyVideo';
import { VIDEO_CONFIG } from '@/remotion/helpers/constants';

interface VideoScenario {
  id: string;
  title: string;
  description: string;
  durationInFrames: number;
  component: React.FC;
}

const scenarios: VideoScenario[] = [
  {
    id: 'alert-zone',
    title: 'Alerte Sortie de Zone',
    description: 'Voyez comment SecureID vous alerte instantanément quand votre enfant quitte une zone sécurisée.',
    durationInFrames: VIDEO_CONFIG.durationInFrames.alertZone,
    component: AlertZoneVideo,
  },
  {
    id: 'lost-child',
    title: 'Enfant Perdu + Secouriste',
    description: 'Découvrez comment un secouriste peut rapidement identifier et contacter les parents.',
    durationInFrames: VIDEO_CONFIG.durationInFrames.lostChild,
    component: LostChildVideo,
  },
  {
    id: 'medical-emergency',
    title: 'Malaise en Classe',
    description: 'Comment les données médicales du bracelet peuvent sauver une vie en urgence.',
    durationInFrames: VIDEO_CONFIG.durationInFrames.medicalEmergency,
    component: MedicalEmergencyVideo,
  },
];

function VideoSection({ scenario, index }: { scenario: VideoScenario; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const playerRef = useRef<PlayerRef>(null);
  const isInView = useInView(ref, { once: false, margin: '-100px' });
  const [hasPlayed, setHasPlayed] = useState(false);

  // Autoplay when in view
  useEffect(() => {
    if (isInView && playerRef.current && !hasPlayed) {
      playerRef.current.play();
      setHasPlayed(true);
    }
  }, [isInView, hasPlayed]);

  // Restart when coming back into view
  useEffect(() => {
    if (isInView && playerRef.current && hasPlayed) {
      playerRef.current.seekTo(0);
      playerRef.current.play();
    }
  }, [isInView, hasPlayed]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="w-full"
    >
      {/* Title overlay */}
      <div className="bg-gray-900 px-4 py-3">
        <h3 className="text-center font-playfair text-lg font-bold text-white sm:text-xl">
          {scenario.title}
        </h3>
        <p className="text-center font-outfit text-sm text-gray-300">
          {scenario.description}
        </p>
      </div>

      {/* Remotion Player - Full width */}
      <div className="relative aspect-[9/16] w-full overflow-hidden bg-gray-900 sm:aspect-[3/4] md:aspect-[4/5] lg:aspect-[9/12]">
        <Player
          ref={playerRef}
          component={scenario.component}
          durationInFrames={scenario.durationInFrames}
          fps={VIDEO_CONFIG.fps}
          compositionWidth={VIDEO_CONFIG.width}
          compositionHeight={VIDEO_CONFIG.height}
          style={{
            width: '100%',
            height: '100%',
          }}
          loop
          autoPlay={false}
          controls={false}
        />
      </div>
    </motion.div>
  );
}

export default function SimulationVideos() {
  return (
    <section className="bg-gray-900">
      {/* Section header */}
      <div className="bg-gradient-to-b from-gray-50 to-gray-900 px-4 py-16 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-playfair text-3xl font-bold text-gray-900 sm:text-4xl"
        >
          SecureID en Action
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-4 max-w-2xl font-outfit text-lg text-gray-600"
        >
          Découvrez comment SecureID protège votre enfant dans 3 scénarios concrets du quotidien.
        </motion.p>
      </div>

      {/* Videos - Full width, stacked */}
      <div className="flex flex-col">
        {scenarios.map((scenario, index) => (
          <VideoSection key={scenario.id} scenario={scenario} index={index} />
        ))}
      </div>
    </section>
  );
}
