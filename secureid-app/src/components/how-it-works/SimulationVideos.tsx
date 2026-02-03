'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import {
  Play,
  MapPin,
  UserSearch,
  Heart,
} from 'lucide-react';
import { AlertZoneVideo } from '@/remotion/compositions/AlertZoneVideo';
import { LostChildVideo } from '@/remotion/compositions/LostChildVideo';
import { MedicalEmergencyVideo } from '@/remotion/compositions/MedicalEmergencyVideo';
import { VIDEO_CONFIG } from '@/remotion/helpers/constants';

interface VideoScenario {
  id: string;
  title: string;
  description: string;
  duration: string;
  durationInFrames: number;
  icon: typeof MapPin;
  color: string;
  bgColor: string;
  component: React.FC;
}

const scenarios: VideoScenario[] = [
  {
    id: 'alert-zone',
    title: 'Alerte Sortie de Zone',
    description: 'Voyez comment SecureID vous alerte instantanément quand votre enfant quitte une zone sécurisée.',
    duration: '15s',
    durationInFrames: VIDEO_CONFIG.durationInFrames.alertZone,
    icon: MapPin,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    component: AlertZoneVideo,
  },
  {
    id: 'lost-child',
    title: 'Enfant Perdu + Secouriste',
    description: 'Découvrez comment un secouriste peut rapidement identifier et contacter les parents.',
    duration: '20s',
    durationInFrames: VIDEO_CONFIG.durationInFrames.lostChild,
    icon: UserSearch,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    component: LostChildVideo,
  },
  {
    id: 'medical-emergency',
    title: 'Malaise en Classe',
    description: 'Comment les données médicales du bracelet peuvent sauver une vie en urgence.',
    duration: '20s',
    durationInFrames: VIDEO_CONFIG.durationInFrames.medicalEmergency,
    icon: Heart,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    component: MedicalEmergencyVideo,
  },
];

function VideoCard({ scenario, index }: { scenario: VideoScenario; index: number }) {
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
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-gray-100/50"
    >
      {/* Remotion Player */}
      <div className="relative aspect-[9/16] max-h-[500px] overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
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

        {/* Duration badge */}
        <div className="absolute bottom-3 right-3 z-10 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {scenario.duration}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-3 flex items-center gap-2">
          <div className={`rounded-lg ${scenario.bgColor} p-2`}>
            <scenario.icon className={`h-5 w-5 ${scenario.color}`} />
          </div>
          <h3 className="font-playfair text-xl font-bold text-gray-900">
            {scenario.title}
          </h3>
        </div>

        <p className="font-outfit text-gray-600">
          {scenario.description}
        </p>
      </div>
    </motion.div>
  );
}

export default function SimulationVideos() {
  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4">
        {/* Section header */}
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2"
          >
            <Play className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-700">Vidéos de simulation</span>
          </motion.div>

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

        {/* Video cards grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((scenario, index) => (
            <VideoCard key={scenario.id} scenario={scenario} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
