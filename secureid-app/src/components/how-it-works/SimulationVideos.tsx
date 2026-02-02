'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import {
  Play,
  Pause,
  MapPin,
  UserSearch,
  Heart,
  Bell,
  Phone,
  FileText
} from 'lucide-react';

interface VideoScenario {
  id: string;
  title: string;
  description: string;
  duration: string;
  icon: typeof MapPin;
  color: string;
  bgColor: string;
  scenes: string[];
  videoSrc?: string;
}

const scenarios: VideoScenario[] = [
  {
    id: 'alert-zone',
    title: 'Alerte Sortie de Zone',
    description: 'Voyez comment SecureID vous alerte instantanément quand votre enfant quitte une zone sécurisée.',
    duration: '15s',
    icon: MapPin,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    scenes: [
      'Carte avec zone sécurisée (école)',
      'Enfant qui sort de la zone',
      'Notification push sur téléphone parent',
      'Parent voit position en temps réel',
    ],
    videoSrc: '/videos/how-it-works/alert-zone.mp4',
  },
  {
    id: 'lost-child',
    title: 'Enfant Perdu + Secouriste',
    description: 'Découvrez comment un secouriste peut rapidement identifier et contacter les parents.',
    duration: '20s',
    icon: UserSearch,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    scenes: [
      'Enfant seul dans un parc',
      'Secouriste s\'approche, voit le bracelet',
      'Scan du QR code',
      'Page secouriste avec photo + nom + contact',
      'Appel au parent',
    ],
    videoSrc: '/videos/how-it-works/lost-child.mp4',
  },
  {
    id: 'medical-emergency',
    title: 'Malaise en Classe',
    description: 'Comment les données médicales du bracelet peuvent sauver une vie en urgence.',
    duration: '20s',
    icon: Heart,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    scenes: [
      'Classe, enfant ne se sent pas bien',
      'Enseignante s\'approche',
      'Scan du bracelet',
      'Affichage données médicales (allergies, groupe sanguin)',
      'Enseignante informe l\'infirmerie',
    ],
    videoSrc: '/videos/how-it-works/medical-emergency.mp4',
  },
];

function VideoCard({ scenario, index }: { scenario: VideoScenario; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const SceneIcon = ({ sceneIndex }: { sceneIndex: number }) => {
    const icons = [Bell, MapPin, Phone, FileText, Phone];
    const Icon = icons[sceneIndex % icons.length];
    return <Icon className="h-3 w-3" />;
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-gray-100/50"
    >
      {/* Video placeholder / player */}
      <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800">
        {/* Placeholder illustration while video loads or if not available */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`rounded-2xl ${scenario.bgColor} p-8`}>
            <scenario.icon className={`h-16 w-16 ${scenario.color}`} />
          </div>
        </div>

        {/* Video element (hidden until we have actual videos) */}
        {scenario.videoSrc && (
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover opacity-0"
            src={scenario.videoSrc}
            loop
            muted
            playsInline
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        )}

        {/* Play button overlay */}
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/30"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-transform hover:scale-110">
            {isPlaying ? (
              <Pause className="h-6 w-6 text-gray-900" />
            ) : (
              <Play className="ml-1 h-6 w-6 text-gray-900" />
            )}
          </div>
        </button>

        {/* Duration badge */}
        <div className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {scenario.duration}
        </div>

        {/* Coming soon badge */}
        <div className="absolute left-3 top-3 rounded-full bg-orange-500 px-3 py-1 text-xs font-medium text-white">
          Bientôt disponible
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

        <p className="mb-4 font-outfit text-gray-600">
          {scenario.description}
        </p>

        {/* Scene breakdown */}
        <div className="space-y-2 border-t border-gray-100 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Scènes de la vidéo
          </p>
          <div className="flex flex-wrap gap-2">
            {scenario.scenes.map((scene, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
              >
                <SceneIcon sceneIndex={i} />
                {scene}
              </span>
            ))}
          </div>
        </div>
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
