import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mode strict React désactivé temporairement pour tests mobile
  reactStrictMode: false,

  // Compression automatique des réponses
  compress: true,

  // Masquer le header X-Powered-By pour la sécurité
  poweredByHeader: false,

  // Autoriser les requêtes cross-origin en développement (pour tests mobile)
  // Ajouter votre IP locale si vous testez sur mobile
  allowedDevOrigins: [
    'http://192.168.1.73:3001',
    'http://192.168.1.66:3001',
    'http://192.168.100.108:3001',
    'http://localhost:3001',
    'http://192.168.1.73:3000',
    'http://192.168.1.66:3000',
    'http://192.168.100.108:3000',
    'http://localhost:3000',
  ],

  // Configuration des images (pour optimisation future)
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // Domaines autorisés pour les images externes
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },

  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
    ];
  },
};

export default nextConfig;
