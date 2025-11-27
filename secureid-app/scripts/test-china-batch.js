/**
 * SCRIPT DE TEST - PROVISIONING LOT CHINA
 * GÉNÉRATION DE 3 BRACELETS DE TEST FACTORY_LOCKED
 *
 * Utilisez ce script pour tester le processus avant de générer les 120 bracelets
 */

import admin from 'firebase-admin';
import QRCode from 'qrcode';
import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Configuration du lot de test
const CONFIG = {
  BATCH_ID: 'LOT_TEST_001',
  QUANTITY: 3, // Seulement 3 pour test
  PRODUCTION_URL: 'https://secureid-app.vercel.app',
  ID_PREFIX: 'TEST',
  QR_ERROR_CORRECTION: 'M',
  QR_SIZE: 800,
  QR_MARGIN: 2,
};

// Initialisation Firebase Admin
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

function generateBraceletId(index) {
  return `${CONFIG.ID_PREFIX}-${String(index).padStart(3, '0')}`;
}

function generateSecretToken() {
  return crypto.randomBytes(32).toString('hex');
}

function generateBraceletUrl(braceletId, secretToken) {
  return `${CONFIG.PRODUCTION_URL}/s/${braceletId}?token=${secretToken}`;
}

async function generateQRCode(url, outputPath) {
  try {
    await QRCode.toFile(outputPath, url, {
      errorCorrectionLevel: CONFIG.QR_ERROR_CORRECTION,
      width: CONFIG.QR_SIZE,
      margin: CONFIG.QR_MARGIN,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return true;
  } catch (error) {
    console.error(`❌ Erreur génération QR: ${error.message}`);
    return false;
  }
}

async function createBraceletDocument(braceletId, secretToken) {
  const docRef = db.collection('bracelets').doc(braceletId);

  const data = {
    id: braceletId,
    secretToken: secretToken,
    status: 'FACTORY_LOCKED',
    batchId: CONFIG.BATCH_ID,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    linkedUserId: null,
    linkedProfileId: null,
  };

  await docRef.set(data);
  return data;
}

async function testBatch() {
  console.log('🧪 TEST LOT CHINA - DÉMARRAGE');
  console.log('=' .repeat(70));
  console.log(`📦 Lot ID      : ${CONFIG.BATCH_ID}`);
  console.log(`🔢 Quantité    : ${CONFIG.QUANTITY} unités (TEST)`);
  console.log(`🌐 URL Prod    : ${CONFIG.PRODUCTION_URL}`);
  console.log(`🔒 Statut      : FACTORY_LOCKED`);
  console.log('=' .repeat(70));

  const outputDir = join(__dirname, '..', 'output', CONFIG.BATCH_ID);
  const qrCodesDir = join(outputDir, 'qr-codes');
  const dataDir = join(outputDir, 'data');

  mkdirSync(qrCodesDir, { recursive: true });
  mkdirSync(dataDir, { recursive: true });

  const batchData = [];

  for (let i = 1; i <= CONFIG.QUANTITY; i++) {
    const braceletId = generateBraceletId(i);
    const secretToken = generateSecretToken();
    const url = generateBraceletUrl(braceletId, secretToken);

    console.log(`\n🔄 Génération ${braceletId}...`);

    try {
      const firestoreData = await createBraceletDocument(braceletId, secretToken);
      console.log(`  ✅ Document Firestore créé`);

      const qrPath = join(qrCodesDir, `${braceletId}.png`);
      const qrSuccess = await generateQRCode(url, qrPath);

      if (qrSuccess) {
        console.log(`  ✅ QR Code généré: ${qrPath}`);
        batchData.push({
          ...firestoreData,
          url: url,
          qrCodePath: qrPath,
        });
      }
    } catch (error) {
      console.error(`  ❌ Erreur: ${error.message}`);
    }
  }

  // Rapport JSON
  const jsonReport = {
    batchId: CONFIG.BATCH_ID,
    generatedAt: new Date().toISOString(),
    configuration: CONFIG,
    bracelets: batchData,
  };

  writeFileSync(
    join(dataDir, 'test-data.json'),
    JSON.stringify(jsonReport, null, 2)
  );

  console.log('\n' + '=' .repeat(70));
  console.log('✅ TEST TERMINÉ');
  console.log('=' .repeat(70));
  console.log(`📁 Fichiers dans : ${outputDir}`);
  console.log(`\n📋 URLs générées :`);
  batchData.forEach(b => {
    console.log(`   ${b.id}: ${b.url}`);
  });
  console.log('\n💡 Testez en scannant ces QR codes ou en visitant les URLs');
  console.log('   Résultat attendu: Page "MAINTENANCE - Ce bracelet n\'est pas encore disponible"');
  console.log('=' .repeat(70));

  await admin.app().delete();
}

testBatch()
  .then(() => {
    console.log('\n✅ Script de test terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ ERREUR:', error);
    process.exit(1);
  });
