#!/usr/bin/env node

/**
 * SCRIPT DE DIAGNOSTIC - Vérification des tokens de test
 *
 * Compare les tokens locaux (test-data.json) avec ceux en production Firestore
 * pour identifier les décalages qui causent "Bracelet invalide"
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

// Initialiser Firebase Admin SDK
const serviceAccountPath = join(__dirname, '../service-account.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

/**
 * Compare les tokens locaux et production
 */
async function checkTokens() {
  console.log('🔍 DIAGNOSTIC DES TOKENS DE TEST\n');
  console.log('=' .repeat(80));

  // 1. Lire les tokens locaux
  const testDataPath = join(__dirname, '../output/LOT_TEST_001/data/test-data.json');
  const testData = JSON.parse(readFileSync(testDataPath, 'utf8'));

  console.log('\n📁 Tokens LOCAUX (test-data.json):');
  console.log('-'.repeat(80));

  const localTokens = {};
  testData.bracelets.forEach((bracelet) => {
    localTokens[bracelet.id] = bracelet.secretToken;
    console.log(`  ${bracelet.id}: ${bracelet.secretToken.substring(0, 20)}...`);
  });

  // 2. Lire les tokens en production
  console.log('\n\n🔥 Tokens PRODUCTION (Firestore):');
  console.log('-'.repeat(80));

  const productionTokens = {};
  const braceletIds = ['TEST-001', 'TEST-002', 'TEST-003'];

  for (const braceletId of braceletIds) {
    const braceletRef = db.collection('bracelets').doc(braceletId);
    const braceletSnap = await braceletRef.get();

    if (braceletSnap.exists) {
      const data = braceletSnap.data();
      productionTokens[braceletId] = data.secretToken;
      console.log(`  ${braceletId}: ${data.secretToken.substring(0, 20)}... [${data.status}]`);
    } else {
      productionTokens[braceletId] = null;
      console.log(`  ${braceletId}: ❌ N'EXISTE PAS`);
    }
  }

  // 3. Comparer
  console.log('\n\n⚖️  COMPARAISON:');
  console.log('-'.repeat(80));

  let allMatch = true;
  for (const braceletId of braceletIds) {
    const local = localTokens[braceletId];
    const prod = productionTokens[braceletId];

    if (!prod) {
      console.log(`  ${braceletId}: ❌ MANQUANT EN PRODUCTION`);
      allMatch = false;
    } else if (local === prod) {
      console.log(`  ${braceletId}: ✅ TOKENS IDENTIQUES`);
    } else {
      console.log(`  ${braceletId}: ⚠️  TOKENS DIFFÉRENTS !`);
      console.log(`    Local:      ${local}`);
      console.log(`    Production: ${prod}`);
      allMatch = false;
    }
  }

  // 4. Résultat et recommandations
  console.log('\n\n' + '='.repeat(80));
  if (allMatch) {
    console.log('✅ RÉSULTAT: Tous les tokens correspondent !');
    console.log('\nLe problème ne vient PAS des tokens.');
    console.log('Vérifiez plutôt:');
    console.log('  - Les variables d\'environnement Vercel');
    console.log('  - Le statut des bracelets (doivent être INACTIVE, pas FACTORY_LOCKED)');
    console.log('  - Les logs Vercel pour voir l\'erreur exacte');
  } else {
    console.log('❌ RÉSULTAT: Décalage de tokens détecté !');
    console.log('\nSOLUTIONS POSSIBLES:');
    console.log('\n1. SOLUTION RAPIDE - Utiliser les tokens de production:');
    console.log('   Scannez ces URLs avec les tokens de PRODUCTION:');
    braceletIds.forEach((id) => {
      if (productionTokens[id]) {
        console.log(`   https://secureid-app.vercel.app/s/${id}?token=${productionTokens[id]}`);
      }
    });

    console.log('\n2. SOLUTION PROPRE - Régénérer les bracelets:');
    console.log('   a) Supprimer TEST-001, TEST-002, TEST-003 de Firestore');
    console.log('   b) Exécuter: npm run test-china');
    console.log('   c) Débloquer: npm run unlock-batch LOT_TEST_001');
    console.log('   d) Utiliser les nouveaux QR codes générés');
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

// Exécuter le diagnostic
checkTokens()
  .then(() => {
    console.log('✅ Diagnostic terminé\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur lors du diagnostic:', error);
    process.exit(1);
  });
