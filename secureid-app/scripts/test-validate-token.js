#!/usr/bin/env node

/**
 * TEST DE VALIDATION - validateBraceletToken
 *
 * Teste la fonction validateBraceletToken comme si elle était appelée depuis Vercel
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, '../.env.local') });

// Initialiser Firebase Admin SDK (comme dans firebase-admin.ts)
const serviceAccountPath = join(__dirname, '../service-account.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

console.log('🔥 TEST D\'INITIALISATION FIREBASE ADMIN SDK\n');
console.log('='.repeat(80));

try {
  if (!admin.apps.length) {
    console.log('📦 Initialisation avec service account...');
    console.log(`   Project ID: ${serviceAccount.project_id}`);
    console.log(`   Client Email: ${serviceAccount.client_email}`);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log('✅ Admin SDK initialisé avec succès\n');
  }

  const db = admin.firestore();

  // Test de validateBraceletToken
  console.log('🧪 TEST DE validateBraceletToken');
  console.log('='.repeat(80));

  const braceletId = 'TEST-001';
  const token = '45d81dee0327614b58b4b399da5cc001c551376ab279806885ff403c6b902965';

  console.log(`\nBracelet: ${braceletId}`);
  console.log(`Token: ${token.substring(0, 20)}...\n`);

  async function validateBraceletToken() {
    try {
      console.log('1️⃣  Récupération du bracelet depuis Firestore...');
      const braceletRef = db.collection('bracelets').doc(braceletId);
      const braceletSnap = await braceletRef.get();

      if (!braceletSnap.exists) {
        console.log('❌ Bracelet introuvable');
        return { valid: false, error: 'Bracelet introuvable' };
      }

      console.log('✅ Bracelet trouvé');

      const bracelet = braceletSnap.data();
      console.log(`   Statut: ${bracelet.status}`);
      console.log(`   Token stocké: ${bracelet.secretToken.substring(0, 20)}...`);

      console.log('\n2️⃣  Vérification du token...');
      if (bracelet.secretToken !== token) {
        console.log('❌ Token invalide (ne correspond pas)');
        return { valid: false, error: 'Token invalide' };
      }

      console.log('✅ Token valide');

      console.log('\n3️⃣  Vérification du statut...');
      if (bracelet.status === 'STOLEN') {
        console.log('❌ Bracelet volé');
        return { valid: false, error: 'Bracelet volé' };
      }

      if (bracelet.status === 'DEACTIVATED') {
        console.log('❌ Bracelet désactivé');
        return { valid: false, error: 'Bracelet désactivé' };
      }

      console.log(`✅ Statut OK (${bracelet.status})`);

      return {
        valid: true,
        braceletStatus: bracelet.status,
      };
    } catch (error) {
      console.log(`❌ ERREUR: ${error.message}`);
      console.error('Stack:', error.stack);
      return {
        valid: false,
        error: error.message || 'Erreur lors de la validation du bracelet',
      };
    }
  }

  // Exécuter le test
  validateBraceletToken().then((result) => {
    console.log('\n' + '='.repeat(80));
    console.log('📊 RÉSULTAT FINAL:');
    console.log('='.repeat(80));
    console.log(JSON.stringify(result, null, 2));

    if (result.valid) {
      console.log('\n✅ SUCCÈS: La validation fonctionne correctement !');
      console.log('\nSi cela fonctionne ici mais pas sur Vercel, le problème est:');
      console.log('  - Les variables d\'environnement Vercel ne sont pas correctes');
      console.log('  - Ou le service account n\'a pas les bonnes permissions');
    } else {
      console.log(`\n❌ ÉCHEC: ${result.error}`);
    }

    console.log('\n' + '='.repeat(80) + '\n');
    process.exit(result.valid ? 0 : 1);
  });
} catch (error) {
  console.error('\n❌ ERREUR CRITIQUE:',error.message);
  console.error('\nCela signifie que Firebase Admin SDK ne peut pas s\'initialiser.');
  console.error('Vérifiez:');
  console.error('  - Le fichier service-account.json existe');
  console.error('  - Les credentials sont valides');
  console.error('  - Vous avez les bonnes permissions Firebase');
  console.error('\n' + '='.repeat(80) + '\n');
  process.exit(1);
}
