/**
 * SCRIPT DE DÉBLOCAGE - LOT FACTORY_LOCKED → INACTIVE
 *
 * Débloque un lot de bracelets en changeant leur statut
 * de FACTORY_LOCKED (en transit) vers INACTIVE (prêt à activer)
 *
 * Usage: npm run unlock-batch <BATCH_ID>
 * Exemple: npm run unlock-batch LOT_CHINA_001
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

// ============================================================================
// INITIALISATION FIREBASE ADMIN
// ============================================================================
let serviceAccount;
try {
  const serviceAccountPath = join(__dirname, '..', 'service-account.json');
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
} catch (error) {
  console.error('❌ ERREUR : service-account.json introuvable');
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// ============================================================================
// FONCTION DE DÉBLOCAGE
// ============================================================================
async function unlockBatch(batchId) {
  console.log('🔓 DÉBLOCAGE DE LOT - DÉMARRAGE');
  console.log('=' .repeat(70));
  console.log(`📦 Lot ID : ${batchId}`);
  console.log(`🔄 Opération : FACTORY_LOCKED → INACTIVE`);
  console.log('=' .repeat(70));
  console.log('');

  // Récupérer tous les bracelets du lot en statut FACTORY_LOCKED
  const braceletsRef = db.collection('bracelets');
  const query = braceletsRef
    .where('batchId', '==', batchId)
    .where('status', '==', 'FACTORY_LOCKED');

  console.log('🔍 Recherche des bracelets verrouillés...\n');

  const snapshot = await query.get();

  if (snapshot.empty) {
    console.log('⚠️  AUCUN bracelet trouvé en statut FACTORY_LOCKED pour ce lot');
    console.log('');
    console.log('Vérifications possibles :');
    console.log('  1. Le lot ID est-il correct ?');
    console.log('  2. Les bracelets ont-ils déjà été débloqués ?');
    console.log('  3. Les bracelets existent-ils dans Firestore ?');
    console.log('');

    // Vérifier combien de bracelets existent pour ce lot
    const allBraceletsSnapshot = await braceletsRef
      .where('batchId', '==', batchId)
      .get();

    if (allBraceletsSnapshot.empty) {
      console.log(`❌ Aucun bracelet trouvé pour le lot "${batchId}"`);
    } else {
      console.log(`ℹ️  ${allBraceletsSnapshot.size} bracelet(s) trouvé(s) pour ce lot :`);
      const statusCounts = {};
      allBraceletsSnapshot.forEach(doc => {
        const status = doc.data().status;
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   • ${status}: ${count}`);
      });
    }

    await admin.app().delete();
    process.exit(0);
  }

  const totalBracelets = snapshot.size;
  console.log(`✅ ${totalBracelets} bracelet(s) trouvé(s) en statut FACTORY_LOCKED\n`);

  // Demander confirmation
  console.log('⚠️  ATTENTION : Cette opération est IRRÉVERSIBLE');
  console.log(`   ${totalBracelets} bracelet(s) seront débloqués`);
  console.log('');
  console.log('Après déblocage :');
  console.log('  • Scan → Redirection vers /activate (au lieu de page maintenance)');
  console.log('  • Les bracelets pourront être activés par les clients');
  console.log('');

  // En mode script, on continue automatiquement
  // (En production, vous pourriez ajouter une confirmation interactive)
  console.log('🔄 Déblocage en cours...\n');

  // Utiliser un batch pour mettre à jour tous les documents
  const batch = db.batch();
  let updateCount = 0;

  snapshot.forEach(doc => {
    batch.update(doc.ref, {
      status: 'INACTIVE',
      unlockedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    updateCount++;

    if (updateCount % 10 === 0) {
      console.log(`  🔓 ${updateCount}/${totalBracelets} bracelets débloqués...`);
    }
  });

  // Exécuter le batch
  await batch.commit();

  console.log(`  🔓 ${totalBracelets}/${totalBracelets} bracelets débloqués ✅`);
  console.log('');

  // ============================================================================
  // RÉSUMÉ
  // ============================================================================
  console.log('=' .repeat(70));
  console.log('✅ DÉBLOCAGE TERMINÉ');
  console.log('=' .repeat(70));
  console.log(`📊 Résultats :`);
  console.log(`   • Lot ID        : ${batchId}`);
  console.log(`   • Bracelets     : ${totalBracelets}`);
  console.log(`   • Statut avant  : FACTORY_LOCKED`);
  console.log(`   • Statut après  : INACTIVE`);
  console.log('');
  console.log('🎯 Prochaines étapes :');
  console.log('   1. Tester le scan d\'un bracelet');
  console.log('   2. Vérifier la redirection vers /activate');
  console.log('   3. Les bracelets sont prêts pour la vente');
  console.log('=' .repeat(70));

  await admin.app().delete();
}

// ============================================================================
// EXÉCUTION
// ============================================================================
const batchId = process.argv[2];

if (!batchId) {
  console.error('❌ ERREUR : Batch ID manquant');
  console.error('');
  console.error('Usage:');
  console.error('  npm run unlock-batch <BATCH_ID>');
  console.error('');
  console.error('Exemple:');
  console.error('  npm run unlock-batch LOT_CHINA_001');
  console.error('');
  process.exit(1);
}

unlockBatch(batchId)
  .then(() => {
    console.log('\n✅ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ ERREUR FATALE:', error);
    process.exit(1);
  });
