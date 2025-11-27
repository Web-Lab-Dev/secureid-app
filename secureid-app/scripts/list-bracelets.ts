/**
 * Script pour lister les bracelets existants
 *
 * Usage: npx tsx scripts/list-bracelets.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDZKzZHIrqWXm_nfGRa2syWEEeSwGu5Eu8",
  authDomain: "taskflow-26718.firebaseapp.com",
  projectId: "taskflow-26718",
  storageBucket: "taskflow-26718.firebasestorage.app",
  messagingSenderId: "685355004652",
  appId: "1:685355004652:web:0bc75c2c13cb306ba46bc9",
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function listBracelets() {
  try {
    console.log('\n🔍 Récupération des bracelets...\n');

    const braceletsRef = collection(db, 'bracelets');
    const snapshot = await getDocs(braceletsRef);

    if (snapshot.empty) {
      console.log('❌ Aucun bracelet trouvé dans la base de données.');
      process.exit(0);
    }

    console.log(`✅ ${snapshot.size} bracelet(s) trouvé(s):\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const bracelets: any[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      bracelets.push({
        id: doc.id,
        ...data,
      });
    });

    // Trier par statut (INACTIVE en premier)
    bracelets.sort((a, b) => {
      if (a.status === 'INACTIVE' && b.status !== 'INACTIVE') return -1;
      if (a.status !== 'INACTIVE' && b.status === 'INACTIVE') return 1;
      return 0;
    });

    bracelets.forEach((bracelet, index) => {
      const statusEmoji = {
        'INACTIVE': '🟢',
        'ACTIVE': '🔵',
        'STOLEN': '🔴',
        'DEACTIVATED': '⚫',
      }[bracelet.status] || '⚪';

      console.log(`${index + 1}. ${statusEmoji} Bracelet: ${bracelet.id}`);
      console.log(`   Statut: ${bracelet.status}`);
      console.log(`   Token: ${bracelet.secretToken || 'N/A'}`);
      console.log(`   Lot: ${bracelet.batchId || 'N/A'}`);

      if (bracelet.linkedUserId) {
        console.log(`   👤 Lié à l'utilisateur: ${bracelet.linkedUserId}`);
      }

      if (bracelet.linkedProfileId) {
        console.log(`   👶 Lié au profil: ${bracelet.linkedProfileId}`);
      }

      // Générer l'URL d'activation si INACTIVE
      if (bracelet.status === 'INACTIVE' && bracelet.secretToken) {
        const activationUrl = `http://localhost:3001/activate?id=${bracelet.id}&token=${bracelet.secretToken}`;
        console.log(`   🔗 URL d'activation:`);
        console.log(`      ${activationUrl}`);
      }

      console.log('');
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Compter par statut
    const statusCounts = bracelets.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('📊 Résumé par statut:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      const emoji = {
        'INACTIVE': '🟢',
        'ACTIVE': '🔵',
        'STOLEN': '🔴',
        'DEACTIVATED': '⚫',
      }[status] || '⚪';
      console.log(`   ${emoji} ${status}: ${count}`);
    });
    console.log('');

    // Trouver un bracelet INACTIVE pour tester
    const inactiveBracelet = bracelets.find(b => b.status === 'INACTIVE' && b.secretToken);

    if (inactiveBracelet) {
      console.log('✅ Bracelet prêt pour test:\n');
      console.log(`ID: ${inactiveBracelet.id}`);
      console.log(`Token: ${inactiveBracelet.secretToken}`);
      console.log(`\n🔗 URL pour tester maintenant:`);
      console.log(`http://localhost:3001/activate?id=${inactiveBracelet.id}&token=${inactiveBracelet.secretToken}`);
      console.log('\n💡 Copiez cette URL dans votre navigateur pour commencer le test!\n');
    } else {
      console.log('⚠️  Aucun bracelet INACTIVE disponible pour test.\n');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Exécuter
listBracelets();
