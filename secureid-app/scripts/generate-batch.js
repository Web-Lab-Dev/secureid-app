#!/usr/bin/env node

/**
 * SCRIPT DE PROVISIONING - PHASE 1
 * Génère des QR codes SVG + Enregistrements Firestore pour bracelets SecureID
 *
 * Usage: node scripts/generate-batch.js
 * ou: npm run provision
 */

require('dotenv').config({ path: './scripts/.env.provisioning' });
const admin = require('firebase-admin');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ============================================================================
// CONFIGURATION DU BATCH (À MODIFIER SELON VOS BESOINS)
// ============================================================================

const CONFIG = {
  BATCH_ID: 'LOT_OUAGA_01',      // Identifiant du lot pour traçabilité
  QUANTITY: 50,                   // Nombre de bracelets à générer
  START_INDEX: 1,                 // Index de départ (génère BF-0001, BF-0002, etc.)
  BASE_URL: process.env.BASE_URL || 'http://localhost:3000',  // URL de base de l'app
};

// ============================================================================
// INITIALISATION FIREBASE ADMIN
// ============================================================================

const serviceAccountPath = process.env.SERVICE_ACCOUNT_PATH || './scripts/service-account.json';

// Vérifier que le service account existe
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ ERREUR: Fichier service-account.json introuvable!');
  console.error(`   Chemin recherché: ${path.resolve(serviceAccountPath)}`);
  console.error('\n📝 Instructions:');
  console.error('   1. Aller sur Firebase Console > Paramètres du projet > Comptes de service');
  console.error('   2. Cliquer sur "Générer une nouvelle clé privée"');
  console.error('   3. Enregistrer le fichier JSON sous ./scripts/service-account.json');
  process.exit(1);
}

const serviceAccount = require(path.resolve(serviceAccountPath));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = admin.firestore();

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

/**
 * Génère un token secret cryptographiquement sécurisé
 * @param {number} length - Longueur du token (6-8 caractères recommandés)
 * @returns {string} Token aléatoire
 */
function generateSecretToken(length = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const randomBytes = crypto.randomBytes(length);
  let token = '';

  for (let i = 0; i < length; i++) {
    token += chars[randomBytes[i] % chars.length];
  }

  return token;
}

/**
 * Génère un slug au format BF-XXXX
 * @param {number} index - Index du bracelet
 * @returns {string} Slug formaté (ex: BF-0042)
 */
function generateSlug(index) {
  return `BF-${String(index).padStart(4, '0')}`;
}

/**
 * Génère l'URL complète du bracelet
 * @param {string} slug - Slug du bracelet
 * @param {string} token - Token secret
 * @returns {string} URL complète
 */
function generateURL(slug, token) {
  return `${CONFIG.BASE_URL}/s/${slug}?t=${token}`;
}

/**
 * Crée un document dans Firestore
 * @param {string} slug - ID du document
 * @param {string} token - Token secret
 * @param {string} batchId - ID du lot
 * @returns {Promise<void>}
 */
async function createFirestoreDocument(slug, token, batchId) {
  const docRef = db.collection('bracelets').doc(slug);

  await docRef.set({
    id: slug,
    secretToken: token,
    status: 'INACTIVE',           // ⚠️ CRITIQUE: Statut par défaut
    batchId: batchId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    linkedUserId: null,
  });
}

/**
 * Génère un QR code SVG
 * @param {string} url - URL à encoder
 * @param {string} slug - Slug pour le nom du fichier
 * @param {string} outputDir - Dossier de sortie
 * @returns {Promise<string>} Chemin du fichier créé
 */
async function generateQRCodeSVG(url, slug, outputDir) {
  const filePath = path.join(outputDir, `${slug}.svg`);

  await QRCode.toFile(filePath, url, {
    type: 'svg',
    errorCorrectionLevel: 'H',  // High (30% de redondance pour résister aux rayures)
    margin: 1,                   // Marge minimale
    width: 300,                  // Largeur en pixels (sera vectoriel)
  });

  return filePath;
}

/**
 * Sauvegarde le rapport du batch
 * @param {Array} bracelets - Liste des bracelets générés
 * @param {string} outputDir - Dossier de sortie
 */
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

// ============================================================================
// FONCTION PRINCIPALE
// ============================================================================

async function main() {
  console.log('🏭 USINE DE PROVISIONING - SecureID');
  console.log('=====================================\n');
  console.log(`📦 Batch ID: ${CONFIG.BATCH_ID}`);
  console.log(`🔢 Quantité: ${CONFIG.QUANTITY} bracelets`);
  console.log(`🎯 Index de départ: ${CONFIG.START_INDEX}`);
  console.log(`🌐 URL de base: ${CONFIG.BASE_URL}\n`);

  // Créer le dossier de sortie
  const outputDir = path.join(__dirname, '..', 'output', CONFIG.BATCH_ID);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  console.log(`📁 Dossier de sortie: ${outputDir}\n`);

  // Liste pour le rapport
  const generatedBracelets = [];

  // Compteurs de statistiques
  let successCount = 0;
  let errorCount = 0;

  // ========================================
  // BOUCLE PRINCIPALE DE GÉNÉRATION
  // ========================================

  console.log('🚀 Démarrage de la génération...\n');

  for (let i = 0; i < CONFIG.QUANTITY; i++) {
    const index = CONFIG.START_INDEX + i;
    const slug = generateSlug(index);

    try {
      // Étape 1: Générer les identifiants
      const token = generateSecretToken(8);
      const url = generateURL(slug, token);

      console.log(`⚙️  [${i + 1}/${CONFIG.QUANTITY}] Génération: ${slug}`);

      // Étape 2: Vérifier que le document n'existe pas déjà
      console.log(`   🔍 Vérification de l'existence du document...`);
      const docRef = db.collection('bracelets').doc(slug);
      const existingDoc = await docRef.get();

      if (existingDoc.exists) {
        throw new Error(
          `Le bracelet ${slug} existe déjà dans Firestore! ` +
          `Modifiez START_INDEX ou BATCH_ID pour éviter les conflits.`
        );
      }

      // Étape 3: Créer le document Firestore
      console.log(`   📝 Création document Firestore...`);
      await createFirestoreDocument(slug, token, CONFIG.BATCH_ID);

      // Étape 4: Générer le QR code SVG
      console.log(`   🎨 Génération QR code SVG...`);
      const svgPath = await generateQRCodeSVG(url, slug, outputDir);

      // Ajouter au rapport
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

      // En cas d'erreur, on tente de rollback le document Firestore si le SVG a échoué
      try {
        const docRef = db.collection('bracelets').doc(slug);
        const doc = await docRef.get();
        if (doc.exists) {
          await docRef.delete();
          console.log(`   🔄 Rollback: Document ${slug} supprimé de Firestore\n`);
        }
      } catch (rollbackError) {
        console.error(`   ⚠️  AVERTISSEMENT: Impossible de rollback ${slug}`);
        console.error(`      ${rollbackError.message}\n`);
      }
    }
  }

  // ========================================
  // FINALISATION
  // ========================================

  console.log('=====================================');
  console.log('📊 RÉSUMÉ DE LA GÉNÉRATION');
  console.log('=====================================\n');
  console.log(`✅ Succès: ${successCount}/${CONFIG.QUANTITY}`);
  console.log(`❌ Erreurs: ${errorCount}/${CONFIG.QUANTITY}`);

  if (generatedBracelets.length > 0) {
    saveBatchReport(generatedBracelets, outputDir);

    console.log('\n✨ GÉNÉRATION TERMINÉE!\n');
    console.log(`📁 Fichiers générés dans: ${outputDir}`);
    console.log(`   - ${successCount} fichiers SVG`);
    console.log(`   - 1 fichier batch_report.json\n`);
    console.log(`📦 ${successCount} bracelets créés dans Firestore (statut: INACTIVE)`);
    console.log('\n⚠️  IMPORTANT: Les bracelets sont en statut INACTIVE.');
    console.log('   Ils doivent être activés manuellement lors de la première utilisation.\n');
  } else {
    console.log('\n❌ Aucun bracelet généré avec succès.\n');
  }

  // Fermer la connexion Firebase
  await admin.app().delete();
}

// ============================================================================
// EXÉCUTION
// ============================================================================

// Gestion des erreurs non capturées
process.on('unhandledRejection', (error) => {
  console.error('\n❌ ERREUR NON GÉRÉE:');
  console.error(error);
  process.exit(1);
});

// Lancer le script
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
