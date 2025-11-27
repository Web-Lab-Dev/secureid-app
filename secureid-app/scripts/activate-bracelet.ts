/**
 * Script pour activer un bracelet INACTIVE
 * Usage: npx tsx scripts/activate-bracelet.ts BF-9002
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
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

async function activateBracelet(braceletId: string) {
  console.log(`\n🔍 Recherche du bracelet ${braceletId}...\n`);

  const braceletRef = doc(db, 'bracelets', braceletId);
  const braceletSnap = await getDoc(braceletRef);

  if (!braceletSnap.exists()) {
    console.error(`❌ Bracelet ${braceletId} introuvable!`);
    process.exit(1);
  }

  const bracelet = braceletSnap.data();
  console.log(`📋 Bracelet trouvé:`);
  console.log(`   - Status actuel: ${bracelet.status}`);
  console.log(`   - linkedUserId: ${bracelet.linkedUserId || 'NULL'}`);

  if (bracelet.status === 'ACTIVE') {
    console.log(`\n✅ Le bracelet est déjà ACTIVE!`);
    process.exit(0);
  }

  console.log(`\n🔄 Activation du bracelet...`);

  await updateDoc(braceletRef, {
    status: 'ACTIVE'
  });

  console.log(`✅ Bracelet ${braceletId} activé avec succès!\n`);
  process.exit(0);
}

const braceletId = process.argv[2] || 'BF-9002';
activateBracelet(braceletId).catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});
