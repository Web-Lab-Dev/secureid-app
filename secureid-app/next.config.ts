import type { NextConfig } from "next";

// NIVEAU 3 - Bundle Analyzer pour optimisation des performances
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // Mode strict React activé pour détecter les problèmes en développement
  reactStrictMode: true,

  // Note: instrumentation.ts est maintenant activé par défaut dans Next.js 16+
  // L'option experimental.instrumentationHook n'est plus nécessaire

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

  // Configuration des images optimisée
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 jours de cache
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Configuration des qualités d'image
    qualities: [60, 75, 90], // 60 pour carousel, 75 default, 90 pour hero
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

  // Optimisations de compilation
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Optimisations expérimentales
  experimental: {
    optimizeCss: true,
  },

  // Headers de sécurité renforcés
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
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=*, geolocation=*, microphone=()'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com https://www.gstatic.com https://vercel.live https://*.vercel-scripts.com https://*.vercel-insights.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.cloudfunctions.net wss://*.firebaseio.com https://*.vercel-insights.com https://*.vercel-analytics.com",
              "frame-src 'self'",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
