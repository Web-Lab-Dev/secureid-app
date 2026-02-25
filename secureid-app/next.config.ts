import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

// NIVEAU 3 - Bundle Analyzer pour optimisation des performances
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// PWA Configuration - Mode offline avec caching stratégique
// IMPORTANT: skipWaiting et reloadOnOnline désactivés pour éviter les déconnexions
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  reloadOnOnline: false,  // DÉSACTIVÉ: évite les reloads qui cassent l'auth
  cacheOnFrontEndNav: false,  // DÉSACTIVÉ: évite le cache agressif
  aggressiveFrontEndNavCaching: false,  // DÉSACTIVÉ: causait des problèmes d'auth
  fallbacks: {
    document: "/offline",
  },
  workboxOptions: {
    skipWaiting: false,  // DÉSACTIVÉ: laisse l'ancien SW finir avant de le remplacer
    clientsClaim: false,  // DÉSACTIVÉ: évite la prise de contrôle brutale
    // Stratégies de cache personnalisées
    runtimeCaching: [
      // Cache d'abord pour les assets statiques (images, fonts, etc.)
      {
        urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts",
          expiration: {
            maxEntries: 20,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 an
          },
        },
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "images",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours
          },
        },
      },
      {
        urlPattern: /\.(?:js|css)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-resources",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 jours
          },
        },
      },
      // Network d'abord pour les API Firebase (données fraîches prioritaires)
      {
        urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "firebase-storage",
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 1 jour
          },
        },
      },
      // Stale while revalidate pour les pages Next.js
      {
        urlPattern: /^https?:\/\/.*\/_next\/.*/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "next-data",
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60, // 1 jour
          },
        },
      },
    ],
  },
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

  // Désactiver Turbopack pour compatibilité PWA (utilise webpack)
  // next-pwa nécessite webpack pour générer le Service Worker
  turbopack: {},

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
            // Content Security Policy - Sécurité renforcée
            // Note: 'unsafe-inline' requis pour Next.js (hydration scripts)
            // 'unsafe-eval' retiré pour bloquer eval() et Function()
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://maps.googleapis.com https://www.gstatic.com https://vercel.live https://*.vercel-scripts.com https://*.vercel-insights.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.cloudfunctions.net wss://*.firebaseio.com https://*.vercel-insights.com https://*.vercel-analytics.com",
              "frame-src 'self' https://www.google.com",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests"
            ].join('; ')
          },
        ],
      },
    ];
  },
};

// Chaîne de plugins: PWA → Bundle Analyzer → NextConfig
export default withPWA(withBundleAnalyzer(nextConfig));
