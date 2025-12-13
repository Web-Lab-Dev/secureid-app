/**
 * SCRIPT DE PROVISIONING - LOT CHINA 001
 * GÉNÉRATION DE 120 BRACELETS FACTORY_LOCKED
 *
 * CONTEXTE CRITIQUE :
 * - Les QR codes seront gravés au laser (irréversible)
 * - URL de production : https://secureid-app.vercel.app
 * - Statut FACTORY_LOCKED pour éviter toute activation prématurée
 * - Format BF-001 à BF-120 pour lisibilité gravure
 */

import admin from 'firebase-admin';
import QRCode from 'qrcode';
import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Configuration ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// ============================================================================
// CONFIGURATION DU LOT
// ============================================================================
const CONFIG = {
  BATCH_ID: 'LOT_CHINA_001',
  QUANTITY: 120,
  PRODUCTION_URL: 'https://secureid-app.vercel.app',
  ID_PREFIX: 'BF',
  QR_ERROR_CORRECTION: 'M', // Medium - Compromis sécurité/lisibilité pour gravure
  QR_SIZE: 800, // Pixels - Haute résolution pour gravure laser
  QR_MARGIN: 2, // Marge minimale
};

// ============================================================================
// INITIALISATION FIREBASE ADMIN
// ============================================================================
let serviceAccount;
try {
  const serviceAccountPath = join(__dirname, '..', 'service-account.json');
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
} catch (error) {
  console.error('❌ ERREUR : service-account.json introuvable');
  console.error('   Assurez-vous que le fichier existe à la racine du projet');
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// ============================================================================
// UTILITAIRES
// ============================================================================

/**
 * Génère un ID de bracelet au format BF-XXX
 *
 * @param {number} index - Numéro séquentiel (1-120)
 * @returns {string} ID formaté (ex: "BF-001", "BF-042", "BF-120")
 */
function generateBraceletId(index) {
  return `${CONFIG.ID_PREFIX}-${String(index).padStart(3, '0')}`;
}

/**
 * Génère un token secret cryptographiquement sûr
 *
 * SÉCURITÉ:
 * - Utilise crypto.randomBytes() (CSPRNG) au lieu de Math.random()
 * - 32 bytes = 256 bits d'entropie = impossible à brute-force
 * - Format hexadécimal (64 caractères) pour compatibilité URL
 *
 * Ce token est la clé de sécurité principale du système:
 * - Il est gravé dans le QR code (partie de l'URL)
 * - Il est stocké dans Firestore lors de la fabrication
 * - Au scan, on vérifie que les deux correspondent
 * - Sans correspondance = QR code cloné/falsifié
 *
 * @returns {string} Token de 64 caractères hexadécimaux
 */
function generateSecretToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Construit l'URL complète qui sera gravée dans le QR code
 *
 * Format: https://secureid-app.vercel.app/s/BF-001?token=abc123...
 *
 * @param {string} braceletId - ID du bracelet (ex: "BF-001")
 * @param {string} secretToken - Token de sécurité (64 caractères)
 * @returns {string} URL complète pour le QR code
 */
function generateBraceletUrl(braceletId, secretToken) {
  return `${CONFIG.PRODUCTION_URL}/s/${braceletId}?token=${secretToken}`;
}

/**
 * Génère un fichier PNG de QR code optimisé pour gravure laser
 *
 * PARAMÈTRES DE GRAVURE:
 * - Résolution 800x800px (haute définition pour précision laser)
 * - Niveau de correction Medium (compromis entre densité et résilience)
 * - Marge minimale de 2 modules (réduit la taille sans compromettre la lecture)
 * - Contraste maximal noir/blanc pour gravure nette
 *
 * @param {string} url - URL à encoder dans le QR code
 * @param {string} outputPath - Chemin du fichier PNG de sortie
 * @returns {Promise<boolean>} true si succès, false si erreur
 */
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

/**
 * Crée un document bracelet dans Firestore avec statut FACTORY_LOCKED
 *
 * LOGIQUE MÉTIER - Pourquoi FACTORY_LOCKED?
 * 1. Les QR codes sont générés AVANT la production physique
 * 2. Il y a un délai entre génération et réception des bracelets (shipping)
 * 3. Le statut FACTORY_LOCKED empêche toute activation prématurée:
 *    - Si quelqu'un scanne un QR code en transit → Message "bracelet non disponible"
 *    - Protège contre les fuites de QR codes avant livraison
 * 4. Une fois les bracelets reçus, on exécute le script unlock-batch.js
 *    - FACTORY_LOCKED → INACTIVE (prêt à l'activation)
 *
 * @param {string} braceletId - ID unique du bracelet
 * @param {string} secretToken - Token de sécurité généré
 * @returns {Promise<Object>} Document Firestore créé
 */
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

// ============================================================================
// PROCESSUS PRINCIPAL
// ============================================================================

async function generateChinaBatch() {
  console.log('🏭 GÉNÉRATION LOT CHINA 001 - DÉMARRAGE');
  console.log('=' .repeat(70));
  console.log(`📦 Lot ID      : ${CONFIG.BATCH_ID}`);
  console.log(`🔢 Quantité    : ${CONFIG.QUANTITY} unités`);
  console.log(`🌐 URL Prod    : ${CONFIG.PRODUCTION_URL}`);
  console.log(`📝 Format ID   : ${CONFIG.ID_PREFIX}-001 à ${CONFIG.ID_PREFIX}-${CONFIG.QUANTITY}`);
  console.log(`🔒 Statut      : FACTORY_LOCKED`);
  console.log(`📊 QR Level    : ${CONFIG.QR_ERROR_CORRECTION} (Medium - Optimisé gravure)`);
  console.log('=' .repeat(70));
  console.log('');

  // Créer les dossiers de sortie
  const outputDir = join(__dirname, '..', 'output', CONFIG.BATCH_ID);
  const qrCodesDir = join(outputDir, 'qr-codes');
  const dataDir = join(outputDir, 'data');

  try {
    mkdirSync(qrCodesDir, { recursive: true });
    mkdirSync(dataDir, { recursive: true });
  } catch (error) {
    console.error('❌ Erreur création dossiers:', error.message);
    process.exit(1);
  }

  // Tableau pour stocker toutes les données
  const batchData = [];
  let successCount = 0;
  let errorCount = 0;

  // Génération des bracelets
  console.log('🔄 Génération en cours...\n');

  for (let i = 1; i <= CONFIG.QUANTITY; i++) {
    const braceletId = generateBraceletId(i);
    const secretToken = generateSecretToken();
    const url = generateBraceletUrl(braceletId, secretToken);

    try {
      // 1. Créer le document Firestore
      const firestoreData = await createBraceletDocument(braceletId, secretToken);

      // 2. Générer le QR Code
      const qrPath = join(qrCodesDir, `${braceletId}.png`);
      const qrSuccess = await generateQRCode(url, qrPath);

      if (qrSuccess) {
        batchData.push({
          ...firestoreData,
          url: url,
          qrCodePath: qrPath,
        });

        successCount++;

        // Affichage progressif (tous les 10)
        if (i % 10 === 0) {
          console.log(`✅ ${i}/${CONFIG.QUANTITY} bracelets générés...`);
        }
      } else {
        errorCount++;
        console.error(`❌ ${braceletId}: Échec génération QR Code`);
      }

    } catch (error) {
      errorCount++;
      console.error(`❌ ${braceletId}: ${error.message}`);
    }
  }

  // ============================================================================
  // GÉNÉRATION DES RAPPORTS
  // ============================================================================

  console.log('\n📊 Génération des rapports...\n');

  // 1. Rapport JSON complet
  const jsonReport = {
    batchId: CONFIG.BATCH_ID,
    generatedAt: new Date().toISOString(),
    configuration: CONFIG,
    statistics: {
      total: CONFIG.QUANTITY,
      success: successCount,
      errors: errorCount,
    },
    bracelets: batchData,
  };

  writeFileSync(
    join(dataDir, 'batch-data.json'),
    JSON.stringify(jsonReport, null, 2)
  );

  // 2. Rapport CSV pour l'usine (format simple)
  const csvHeader = 'ID,SecretToken,URL,Status,BatchId\n';
  const csvRows = batchData.map(b =>
    `${b.id},${b.secretToken},${b.url},${b.status},${b.batchId}`
  ).join('\n');

  writeFileSync(
    join(dataDir, 'factory-manifest.csv'),
    csvHeader + csvRows
  );

  // 3. Liste d'URLs pour tests rapides
  const urlList = batchData.map(b => b.url).join('\n');
  writeFileSync(
    join(dataDir, 'urls.txt'),
    urlList
  );

  // 4. Rapport Markdown pour documentation
  const mdReport = `# LOT CHINA 001 - Rapport de Génération

## Informations Générales

- **Lot ID**: ${CONFIG.BATCH_ID}
- **Date de génération**: ${new Date().toLocaleString('fr-FR')}
- **URL de production**: ${CONFIG.PRODUCTION_URL}
- **Statut initial**: FACTORY_LOCKED 🔒

## Statistiques

- **Total commandé**: ${CONFIG.QUANTITY} unités
- **Générés avec succès**: ${successCount} ✅
- **Erreurs**: ${errorCount} ❌
- **Taux de réussite**: ${((successCount / CONFIG.QUANTITY) * 100).toFixed(2)}%

## Configuration QR Code

- **Niveau de correction**: ${CONFIG.QR_ERROR_CORRECTION} (Medium)
- **Résolution**: ${CONFIG.QR_SIZE}x${CONFIG.QR_SIZE} pixels
- **Marge**: ${CONFIG.QR_MARGIN}
- **Optimisé pour**: Gravure laser 15mm

## Fichiers Générés

- \`qr-codes/\`: ${successCount} fichiers PNG haute résolution
- \`data/batch-data.json\`: Données complètes du lot
- \`data/factory-manifest.csv\`: Manifeste usine (format CSV)
- \`data/urls.txt\`: Liste des URLs pour tests

## Prochaines Étapes

1. ✅ Vérifier les QR codes générés
2. ⏳ Envoyer les fichiers PNG à l'usine de gravure
3. ⏳ Attendre réception des bracelets physiques
4. ⏳ Débloquer les bracelets (statut FACTORY_LOCKED → PROVISIONED)

## ⚠️ ATTENTION

Les bracelets sont actuellement **VERROUILLÉS USINE** (FACTORY_LOCKED).
Ils doivent être débloqués avant distribution aux clients.

Pour débloquer un lot complet :
\`\`\`bash
npm run unlock-batch LOT_CHINA_001
\`\`\`
`;

  writeFileSync(
    join(dataDir, 'RAPPORT.md'),
    mdReport
  );

  // ============================================================================
  // RÉSUMÉ FINAL
  // ============================================================================

  console.log('=' .repeat(70));
  console.log('✅ GÉNÉRATION TERMINÉE');
  console.log('=' .repeat(70));
  console.log(`📊 Résultats :`);
  console.log(`   • Succès  : ${successCount}/${CONFIG.QUANTITY}`);
  console.log(`   • Erreurs : ${errorCount}/${CONFIG.QUANTITY}`);
  console.log('');
  console.log(`📁 Fichiers générés dans : ${outputDir}`);
  console.log(`   • ${successCount} QR codes PNG (haute résolution)`);
  console.log(`   • batch-data.json (données complètes)`);
  console.log(`   • factory-manifest.csv (manifeste usine)`);
  console.log(`   • urls.txt (liste URLs)`);
  console.log(`   • RAPPORT.md (documentation)`);
  console.log('');
  console.log('🔒 RAPPEL : Bracelets en statut FACTORY_LOCKED');
  console.log('   Ils doivent être débloqués avant distribution.');
  console.log('=' .repeat(70));

  // Cleanup Firebase
  await admin.app().delete();
}

// ============================================================================
// EXÉCUTION
// ============================================================================

generateChinaBatch()
  .then(() => {
    console.log('\n✅ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ ERREUR FATALE:', error);
    process.exit(1);
  });
