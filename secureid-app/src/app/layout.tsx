import type { Metadata, Viewport } from "next";
import { Playfair_Display, Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { PWAInstallProvider } from "@/hooks/usePWAInstall";

// PHASE 10 - Fonts Landing Page émotionnelle
// Utilise uniquement Playfair (headings) et Outfit (body, buttons)
// Inter et Roboto_Mono supprimés pour réduire le poids des fonts (-~30KB)
const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap", // Optimisation: swap pour éviter FOIT
  preload: true,
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "600"], // Réduit de 4 à 2 poids pour performance (-30KB)
  display: "swap", // Optimisation: swap pour éviter FOIT
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "SecureID - Parce qu'il est votre monde",
    template: "%s | SecureID",
  },
  description:
    "Un lien invisible qui veille sur vos enfants quand vos yeux ne le peuvent pas. Bracelet connecté avec identification rapide, dossier médical d'urgence et contact familial au Burkina Faso.",
  keywords: [
    "bracelet enfant Burkina Faso",
    "sécurité enfant Ouagadougou",
    "identification enfant",
    "bracelet QR code",
    "dossier médical enfant",
    "géolocalisation enfant",
    "bracelet connecté Bobo-Dioulasso",
    "protection enfant Afrique",
    "bracelet sécurité scolaire",
    "identité médicale enfant",
  ],
  authors: [{ name: "SecureID", url: "https://secureid-app.vercel.app" }],
  creator: "SecureID",
  publisher: "SecureID",
  applicationName: "SecureID",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SecureID",
    startupImage: [
      // iPhone
      { url: "/splash/splash-640x1136.png", media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" },
      { url: "/splash/splash-750x1334.png", media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" },
      { url: "/splash/splash-828x1792.png", media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" },
      { url: "/splash/splash-1125x2436.png", media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" },
      { url: "/splash/splash-1170x2532.png", media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" },
      { url: "/splash/splash-1179x2556.png", media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)" },
      { url: "/splash/splash-1284x2778.png", media: "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)" },
      { url: "/splash/splash-1290x2796.png", media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" },
      { url: "/splash/splash-1242x2688.png", media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" },
      // iPad
      { url: "/splash/splash-1536x2048.png", media: "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)" },
      { url: "/splash/splash-1668x2224.png", media: "(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)" },
      { url: "/splash/splash-1668x2388.png", media: "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)" },
      { url: "/splash/splash-2048x2732.png", media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" },
    ],
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-touch-icon-152.png", sizes: "152x152", type: "image/png" },
      { url: "/apple-touch-icon-167.png", sizes: "167x167", type: "image/png" },
      { url: "/apple-touch-icon-120.png", sizes: "120x120", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/icon.svg", color: "#f97316" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "fr_BF",
    url: "https://secureid-app.vercel.app",
    title: "SecureID - Parce qu'il est votre monde",
    description:
      "Un lien invisible qui veille sur lui quand vos yeux ne le peuvent pas. Rejoignez les centaines de familles burkinabé qui ont choisi la tranquillité.",
    siteName: "SecureID",
    images: [
      {
        url: "https://secureid-app.vercel.app/og-image.webp",
        width: 1200,
        height: 630,
        alt: "SecureID - Protection invisible pour vos enfants",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SecureID - Parce qu'il est votre monde",
    description:
      "Un lien invisible qui veille sur vos enfants. Bracelet connecté intelligent au Burkina Faso.",
    images: ["https://secureid-app.vercel.app/og-image.webp"],
    creator: "@SecureID_BF",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://secureid-app.vercel.app",
  },
};

export const viewport: Viewport = {
  themeColor: "#f97316", // Orange chaud pour Landing Page
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Schema.org - Structured Data pour SEO
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SecureID",
    "url": "https://secureid-app.vercel.app",
    "logo": "https://secureid-app.vercel.app/icon-512.png",
    "description": "Bracelet connecté intelligent pour la sécurité et l'identification rapide des enfants au Burkina Faso",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "BF",
      "addressLocality": "Ouagadougou"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["fr"]
    },
    "sameAs": [
      "https://twitter.com/SecureID_BF"
    ]
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "SecureID Bracelet de Sécurité Enfant",
    "description":
      "Bracelet connecté avec QR code pour protection et identification rapide des enfants. Inclut dossier médical d'urgence et contacts familiaux.",
    "brand": {
      "@type": "Brand",
      "name": "SecureID",
    },
    "manufacturer": {
      "@type": "Organization",
      "name": "SecureID"
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "XOF",
      "availability": "https://schema.org/InStock",
      "url": "https://secureid-app.vercel.app",
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "127",
    },
    "image": "https://secureid-app.vercel.app/landing/bouclier.webp",
    "url": "https://secureid-app.vercel.app",
  };

  return (
    <html lang="fr">
      <head>
        {/* Preconnect pour Google Fonts - Améliore FCP */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      </head>
      <body
        className={`${playfairDisplay.variable} ${outfit.variable} font-outfit antialiased`}
      >
        <AuthProvider>
          <PWAInstallProvider>{children}</PWAInstallProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
