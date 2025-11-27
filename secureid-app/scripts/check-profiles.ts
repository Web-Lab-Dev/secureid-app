import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
};

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();

async function checkProfiles() {
  const profiles = await db.collection('profiles').limit(3).get();
  console.log('\n=== PROFILS ===');
  profiles.forEach((doc) => {
    const data = doc.data();
    console.log(`\nProfil: ${data.fullName}`);
    console.log(`  - ID: ${doc.id}`);
    console.log(`  - currentBraceletId: ${data.currentBraceletId || 'NULL'}`);
  });

  const bracelets = await db.collection('bracelets').limit(5).get();
  console.log('\n\n=== BRACELETS ===');
  bracelets.forEach((doc) => {
    const data = doc.data();
    console.log(`\nBracelet: ${doc.id}`);
    console.log(`  - Status: ${data.status}`);
    console.log(`  - linkedUserId: ${data.linkedUserId || 'NULL'}`);
  });
}

checkProfiles().then(() => process.exit(0));
