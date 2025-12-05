import type { Metadata, Viewport } from "next";
import { Inter, Roboto_Mono, Playfair_Display, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

// PHASE 10 - Fonts Landing Page émotionnelle
const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

export const metadata: Metadata = {
  title: "SecureID - Protégez ce qui compte le plus",
  description: "Bracelet connecté intelligent pour la sécurité de vos enfants au Burkina Faso. Identification rapide, dossier médical d'urgence, géolocalisation. Parce qu'il est votre monde.",
  keywords: [
    "bracelet enfant Burkina Faso",
    "sécurité enfant Ouagadougou",
    "identification enfant",
    "bracelet QR code",
    "dossier médical enfant",
    "géolocalisation enfant",
    "bracelet connecté Bobo-Dioulasso",
    "protection enfant Afrique",
  ],
  authors: [{ name: "SecureID" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SecureID",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "fr_BF",
    url: "https://secureid-app.vercel.app",
    title: "SecureID - Protégez ce qui compte le plus",
    description: "Un lien invisible qui veille sur vos enfants. Bracelet connecté intelligent pour la sécurité des enfants au Burkina Faso.",
    siteName: "SecureID",
  },
  twitter: {
    card: "summary_large_image",
    title: "SecureID - Protégez ce qui compte le plus",
    description: "Un lien invisible qui veille sur vos enfants. Bracelet connecté intelligent au Burkina Faso.",
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
  return (
    <html lang="fr">
      <body
        className={`${inter.variable} ${robotoMono.variable} ${playfairDisplay.variable} ${outfit.variable} antialiased`}
      >
        <ErrorBoundary>
          <AuthProvider>{children}</AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
