/**
 * Script pour lier un bracelet existant à un profil
 * Usage: npx tsx scripts/link-bracelet-to-profile.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function linkBraceletToProfile() {
  console.log('\n🔍 Recherche des profils et bracelets...\n');

  // Récupérer tous les profils
  const profilesSnap = await getDocs(collection(db, 'profiles'));
  const profiles = profilesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Récupérer tous les bracelets
  const braceletsSnap = await getDocs(collection(db, 'bracelets'));
  const bracelets = braceletsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  console.log(`✓ Trouvé ${profiles.length} profils`);
  console.log(`✓ Trouvé ${bracelets.length} bracelets\n`);

  // Pour chaque profil, essayer de lier un bracelet
  for (const profile of profiles) {
    console.log(`\n📋 Profil: ${profile.fullName} (${profile.id})`);
    console.log(`   currentBraceletId: ${profile.currentBraceletId || 'NULL'}`);

    if (profile.currentBraceletId) {
      // Vérifier que le bracelet existe
      const bracelet = bracelets.find(b => b.id === profile.currentBraceletId);
      if (bracelet) {
        console.log(`   ✓ Bracelet ${bracelet.id} déjà lié (Status: ${bracelet.status})`);
      } else {
        console.log(`   ⚠️  Bracelet ${profile.currentBraceletId} introuvable!`);
      }
    } else {
      // Chercher un bracelet avec le même linkedUserId
      const matchingBracelet = bracelets.find(b => b.linkedUserId === profile.parentId);

      if (matchingBracelet) {
        console.log(`   🔗 Liaison du bracelet ${matchingBracelet.id}...`);

        await updateDoc(doc(db, 'profiles', profile.id), {
          currentBraceletId: matchingBracelet.id
        });

        // S'assurer que le bracelet est ACTIVE
        if (matchingBracelet.status !== 'ACTIVE') {
          await updateDoc(doc(db, 'bracelets', matchingBracelet.id), {
            status: 'ACTIVE'
          });
          console.log(`   ✓ Bracelet activé`);
        }

        console.log(`   ✅ Profil lié au bracelet ${matchingBracelet.id}`);
      } else {
        console.log(`   ⚠️  Aucun bracelet compatible trouvé`);
      }
    }
  }

  console.log('\n✅ Traitement terminé!\n');
  process.exit(0);
}

linkBraceletToProfile().catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});
