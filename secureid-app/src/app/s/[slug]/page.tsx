import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { redirect } from 'next/navigation';
import { ErrorPage } from '@/components/ErrorPage';

/**
 * PHASE 2 - ÉTAPE 1: ROUTEUR DE BASE
 *
 * Page dynamique de scan des bracelets QR Code
 * Route: /s/[slug]?t=token
 *
 * Cette version affiche les données brutes pour debug
 */

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    t?: string; // Token de sécurité
  }>;
}

export default async function ScanPage({ params, searchParams }: PageProps) {
  // Récupération des paramètres (await pour Next.js 16)
  const { slug } = await params;
  const { t: token } = await searchParams;

  console.log('🔍 [SCAN] Slug:', slug);
  console.log('🔑 [SCAN] Token:', token);

  // Interroger Firestore pour récupérer le bracelet
  const braceletRef = doc(db, 'bracelets', slug);
  const braceletSnap = await getDoc(braceletRef);

  // ============================================================================
  // VÉRIFICATION 1 - Le bracelet existe-t-il?
  // ============================================================================
  if (!braceletSnap.exists()) {
    return <ErrorPage type="not-found" slug={slug} />;
  }

  // Récupérer les données du bracelet
  const braceletData = braceletSnap.data();

  // ============================================================================
  // VÉRIFICATION 2 - Le token est-il valide? (Anti-Fraude)
  // ============================================================================
  const storedToken = braceletData.secretToken;
  const isTokenValid = token && token === storedToken;

  if (!isTokenValid) {
    return <ErrorPage type="counterfeit" slug={slug} token={token} />;
  }

  // ============================================================================
  // TOUTES LES VÉRIFICATIONS SONT PASSÉES ✅
  // ÉTAPE 4: AIGUILLAGE SELON LE STATUS
  // ============================================================================

  const status = braceletData.status;

  // CAS A: Bracelet INACTIVE (neuf) → Rediriger vers activation
  if (status === 'INACTIVE') {
    redirect(`/activate?id=${slug}&token=${token}`);
  }

  // CAS B: Bracelet ACTIVE → Afficher mode urgence (placeholder)
  if (status === 'ACTIVE') {
    return (
      <div className="min-h-screen bg-red-900 text-white flex items-center justify-center p-10">
        <div className="text-center space-y-6 max-w-2xl">
          <div className="text-6xl animate-pulse">🚨</div>
          <h1 className="text-4xl md:text-5xl font-bold">MODE URGENCE ACTIVÉ</h1>
          <div className="bg-black/30 p-6 rounded-lg">
            <p className="text-xl font-semibold mb-4">Profil Enfant Chargé</p>
            <div className="space-y-2 text-left text-lg">
              <p><strong>Bracelet:</strong> {braceletData.id}</p>
              <p><strong>Utilisateur lié:</strong> {braceletData.linkedUserId || 'N/A'}</p>
            </div>
          </div>
          <div className="bg-yellow-900/50 border border-yellow-500 p-4 rounded">
            <p className="text-sm">
              ⚠️ Placeholder - Phase 2 complétée<br/>
              L'interface d'urgence complète sera développée en Phase 3
            </p>
          </div>
        </div>
      </div>
    );
  }

  // CAS C: Bracelet STOLEN → Afficher message piège
  if (status === 'STOLEN') {
    return <ErrorPage type="stolen" slug={slug} token={token} />;
  }

  // CAS PAR DÉFAUT: Status inconnu
  return (
    <div className="min-h-screen bg-brand-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-orange-900/20 border border-orange-500 rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-4 text-orange-500">⚠️ Status Inconnu</h1>
          <p className="text-lg mb-4">Ce bracelet a un status non reconnu.</p>
          <div className="bg-black/50 p-4 rounded mt-6 text-sm">
            <p className="text-gray-400">Bracelet: <span className="text-white font-mono">{slug}</span></p>
            <p className="text-gray-400 mt-2">Status: <span className="text-orange-400 font-mono">{status}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
