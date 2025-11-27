#!/usr/bin/env node

/**
 * SCRIPT DE GÉNÉRATION DE BATCH DE TEST
 * Génère 5 bracelets avec QR codes SVG dans output/
 *
 * Usage: node scripts/generate-test-batch.js
 */

require('dotenv').config({ path: './scripts/.env.provisioning' });
const admin = require('firebase-admin');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration du batch de test
const CONFIG = {
  BATCH_ID: 'TEST_BATCH_2025',
  QUANTITY: 5,
  START_INDEX: 9000,
  BASE_URL: process.env.BASE_URL || 'http://localhost:3001',
};

// Initialisation Firebase Admin
const serviceAccountPath = process.env.SERVICE_ACCOUNT_PATH || './scripts/service-account.json';

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ ERREUR: Fichier service-account.json introuvable!');
  console.error(`   Chemin recherché: ${path.resolve(serviceAccountPath)}`);
  console.error('\n📝 Créez ce fichier depuis Firebase Console > Paramètres > Comptes de service');
  process.exit(1);
}

const serviceAccount = require(path.resolve(serviceAccountPath));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = admin.firestore();

// Fonctions utilitaires
function generateSecretToken(length = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const randomBytes = crypto.randomBytes(length);
  let token = '';

  for (let i = 0; i < length; i++) {
    token += chars[randomBytes[i] % chars.length];
  }

  return token;
}

function generateSlug(index) {
  return `BF-${String(index).padStart(4, '0')}`;
}

function generateURL(slug, token) {
  return `${CONFIG.BASE_URL}/activate?id=${slug}&token=${token}`;
}

async function createFirestoreDocument(slug, token, batchId) {
  const docRef = db.collection('bracelets').doc(slug);

  await docRef.set({
    id: slug,
    secretToken: token,
    status: 'INACTIVE',
    batchId: batchId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    linkedUserId: null,
    linkedProfileId: null,
  });
}

async function generateQRCodeSVG(url, slug, outputDir) {
  const filePath = path.join(outputDir, `${slug}.svg`);

  await QRCode.toFile(filePath, url, {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 300,
  });

  return filePath;
}

function saveBatchReport(bracelets, outputDir) {
  const reportPath = path.join(outputDir, 'batch_report.json');

  const report = {
    batchId: CONFIG.BATCH_ID,
    generatedAt: new Date().toISOString(),
    quantity: bracelets.length,
    bracelets: bracelets,
    summary: {
      firstId: bracelets[0]?.id,
      lastId: bracelets[bracelets.length - 1]?.id,
      status: 'INACTIVE',
    },
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Rapport sauvegardé: ${reportPath}`);
}

async function main() {
  console.log('\n🏭 GÉNÉRATION DE BATCH DE TEST - SecureID');
  console.log('==========================================\n');
  console.log(`📦 Batch ID: ${CONFIG.BATCH_ID}`);
  console.log(`🔢 Quantité: ${CONFIG.QUANTITY} bracelets`);
  console.log(`🎯 Index de départ: ${CONFIG.START_INDEX}`);
  console.log(`🌐 URL de base: ${CONFIG.BASE_URL}\n`);

  // Supprimer les anciens bracelets de la base
  console.log('🗑️  Suppression des anciens bracelets de test...');
  const oldBracelets = await db.collection('bracelets').get();
  const deletePromises = [];

  oldBracelets.forEach((doc) => {
    deletePromises.push(doc.ref.delete());
  });

  await Promise.all(deletePromises);
  console.log(`   ✅ ${oldBracelets.size} ancien(s) bracelet(s) supprimé(s)\n`);

  // Créer le dossier de sortie
  const outputDir = path.join(__dirname, '..', 'output', CONFIG.BATCH_ID);
  if (fs.existsSync(outputDir)) {
    // Supprimer l'ancien dossier
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`📁 Dossier de sortie: ${outputDir}\n`);

  const generatedBracelets = [];
  let successCount = 0;
  let errorCount = 0;

  console.log('🚀 Démarrage de la génération...\n');

  for (let i = 0; i < CONFIG.QUANTITY; i++) {
    const index = CONFIG.START_INDEX + i;
    const slug = generateSlug(index);

    try {
      const token = generateSecretToken(8);
      const url = generateURL(slug, token);

      console.log(`⚙️  [${i + 1}/${CONFIG.QUANTITY}] Génération: ${slug}`);
      console.log(`   Token: ${token}`);
      console.log(`   URL: ${url}`);

      // Créer le document Firestore
      console.log(`   📝 Création document Firestore...`);
      await createFirestoreDocument(slug, token, CONFIG.BATCH_ID);

      // Générer le QR code SVG
      console.log(`   🎨 Génération QR code SVG...`);
      const svgPath = await generateQRCodeSVG(url, slug, outputDir);

      generatedBracelets.push({
        id: slug,
        secretToken: token,
        url: url,
        svgFile: path.basename(svgPath),
      });

      successCount++;
      console.log(`   ✅ ${slug} généré avec succès!\n`);

    } catch (error) {
      errorCount++;
      console.error(`   ❌ ERREUR lors de la génération de ${slug}:`);
      console.error(`      ${error.message}\n`);
    }
  }

  console.log('=========================================');
  console.log('📊 RÉSUMÉ DE LA GÉNÉRATION');
  console.log('=========================================\n');
  console.log(`✅ Succès: ${successCount}/${CONFIG.QUANTITY}`);
  console.log(`❌ Erreurs: ${errorCount}/${CONFIG.QUANTITY}`);

  if (generatedBracelets.length > 0) {
    saveBatchReport(generatedBracelets, outputDir);

    console.log('\n✨ GÉNÉRATION TERMINÉE!\n');
    console.log(`📁 Fichiers générés dans: ${outputDir}`);
    console.log(`   - ${successCount} fichiers SVG`);
    console.log(`   - 1 fichier batch_report.json\n`);
    console.log(`📦 ${successCount} bracelets créés dans Firestore (statut: INACTIVE)\n`);

    console.log('🔗 URLs de test:');
    generatedBracelets.forEach((b, i) => {
      console.log(`   ${i + 1}. ${b.url}`);
    });
    console.log('');
  } else {
    console.log('\n❌ Aucun bracelet généré avec succès.\n');
  }

  await admin.app().delete();
}

// Gestion des erreurs
process.on('unhandledRejection', (error) => {
  console.error('\n❌ ERREUR NON GÉRÉE:');
  console.error(error);
  process.exit(1);
});

main()
  .then(() => {
    console.log('👋 Script terminé.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ ERREUR FATALE:');
    console.error(error);
    process.exit(1);
  });
