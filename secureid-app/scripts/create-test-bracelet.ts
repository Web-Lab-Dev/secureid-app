/**
 * Script de création de bracelet de test
 *
 * Usage: npx tsx scripts/create-test-bracelet.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import * as crypto from 'crypto';

// Configuration Firebase (même que l'app)
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

async function createTestBracelet() {
  try {
    // Générer un ID de bracelet de test
    const braceletId = `BF-TEST-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Générer un token secret sécurisé
    const secretToken = crypto.randomBytes(32).toString('hex');

    // Créer le document bracelet
    const braceletData = {
      id: braceletId,
      secretToken,
      status: 'INACTIVE',
      batchId: 'TEST-BATCH-001',
      createdAt: serverTimestamp(),
      linkedUserId: null,
      linkedProfileId: null,
    };

    // Sauvegarder dans Firestore
    const braceletRef = doc(db, 'bracelets', braceletId);
    await setDoc(braceletRef, braceletData);

    console.log('\n✅ Bracelet de test créé avec succès!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📱 ID Bracelet: ${braceletId}`);
    console.log(`🔑 Token Secret: ${secretToken}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Générer l'URL d'activation
    const activationUrl = `http://localhost:3001/activate?id=${braceletId}&token=${secretToken}`;
    console.log('🔗 URL d\'activation:');
    console.log(activationUrl);
    console.log('\n');

    // Instructions pour générer le QR code
    console.log('📋 Pour générer le QR code:');
    console.log('1. Visitez: https://www.qr-code-generator.com/');
    console.log('2. Collez l\'URL ci-dessus');
    console.log('3. Téléchargez le QR code');
    console.log('\nOu utilisez cette commande si vous avez qrencode installé:');
    console.log(`qrencode -o test-qr.png "${activationUrl}"\n`);

    // Alternative: créer un fichier HTML avec QR code
    const qrCodeHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QR Code Test - ${braceletId}</title>
    <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 500px;
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
        }
        .bracelet-id {
            color: #667eea;
            font-size: 24px;
            font-weight: bold;
            margin: 20px 0;
            font-family: monospace;
        }
        #qrcode {
            margin: 30px auto;
            padding: 20px;
            background: white;
            border-radius: 10px;
            display: inline-block;
        }
        .info {
            color: #666;
            font-size: 14px;
            margin-top: 20px;
            line-height: 1.6;
        }
        .url {
            color: #764ba2;
            word-break: break-all;
            font-size: 12px;
            margin: 15px 0;
            padding: 10px;
            background: #f5f5f5;
            border-radius: 5px;
        }
        .status {
            display: inline-block;
            background: #22c55e;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔒 Bracelet SecureID Test</h1>
        <div class="bracelet-id">${braceletId}</div>
        <div class="status">INACTIVE - Prêt pour activation</div>

        <div id="qrcode"></div>

        <div class="info">
            <strong>Instructions:</strong><br>
            1. Scannez ce QR code avec votre téléphone<br>
            2. Ou cliquez directement sur l'URL ci-dessous<br>
            3. Suivez le processus d'activation
        </div>

        <div class="url">
            <a href="${activationUrl}" target="_blank" style="color: #764ba2; text-decoration: none;">
                ${activationUrl}
            </a>
        </div>
    </div>

    <script>
        // Générer le QR code
        QRCode.toCanvas(document.getElementById('qrcode'), '${activationUrl}', {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        }, function (error) {
            if (error) console.error(error);
            console.log('QR code généré!');
        });
    </script>
</body>
</html>
    `;

    // Sauvegarder le fichier HTML
    const fs = require('fs');
    const path = require('path');
    const qrFilePath = path.join(__dirname, '..', `test-qr-${braceletId}.html`);
    fs.writeFileSync(qrFilePath, qrCodeHtml);

    console.log(`✅ Fichier QR code HTML créé: test-qr-${braceletId}.html`);
    console.log('   Ouvrez ce fichier dans votre navigateur pour voir le QR code!\n');

  } catch (error) {
    console.error('❌ Erreur lors de la création du bracelet:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Exécuter
createTestBracelet();
