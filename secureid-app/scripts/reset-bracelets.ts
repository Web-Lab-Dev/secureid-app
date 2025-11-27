/**
 * Script pour réinitialiser les bracelets
 * Supprime tous les bracelets existants et en crée 5 nouveaux
 *
 * Usage: npx tsx scripts/reset-bracelets.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import * as crypto from 'crypto';

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

async function resetBracelets() {
  try {
    console.log('\n🔄 Réinitialisation des bracelets...\n');

    // Étape 1: Supprimer tous les bracelets existants
    console.log('📋 Étape 1: Suppression des anciens bracelets...');
    const braceletsRef = collection(db, 'bracelets');
    const snapshot = await getDocs(braceletsRef);

    if (!snapshot.empty) {
      console.log(`   Trouvé ${snapshot.size} bracelet(s) à supprimer...`);

      const deletePromises = snapshot.docs.map(docSnap =>
        deleteDoc(doc(db, 'bracelets', docSnap.id))
      );

      await Promise.all(deletePromises);
      console.log(`   ✅ ${snapshot.size} bracelet(s) supprimé(s)\n`);
    } else {
      console.log('   Aucun bracelet à supprimer\n');
    }

    // Étape 2: Créer 5 nouveaux bracelets
    console.log('📋 Étape 2: Création de 5 nouveaux bracelets...\n');

    const newBracelets = [];

    for (let i = 0; i < 5; i++) {
      const braceletId = `BF-${9000 + i}`;
      const secretToken = crypto.randomBytes(4).toString('hex').substring(0, 8);

      const braceletData = {
        id: braceletId,
        secretToken,
        status: 'INACTIVE' as const,
        batchId: 'BATCH-2025-001',
        createdAt: serverTimestamp(),
        linkedUserId: null,
        linkedProfileId: null,
      };

      const braceletRef = doc(db, 'bracelets', braceletId);
      await setDoc(braceletRef, braceletData);

      newBracelets.push({
        id: braceletId,
        token: secretToken,
      });

      console.log(`   ✅ Bracelet ${i + 1}/5 créé: ${braceletId}`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎉 5 nouveaux bracelets créés avec succès!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    newBracelets.forEach((bracelet, index) => {
      console.log(`${index + 1}. 🔒 Bracelet: ${bracelet.id}`);
      console.log(`   Token: ${bracelet.token}`);
      console.log(`   URL: http://localhost:3001/activate?id=${bracelet.id}&token=${bracelet.token}\n`);
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Générer fichiers QR code HTML pour chaque bracelet
    console.log('📄 Génération des fichiers QR code HTML...\n');

    const fs = require('fs');
    const path = require('path');

    for (const bracelet of newBracelets) {
      const activationUrl = `http://localhost:3001/activate?id=${bracelet.id}&token=${bracelet.token}`;

      const qrCodeHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QR Code - ${bracelet.id}</title>
    <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
            font-size: 28px;
        }
        .bracelet-id {
            color: #667eea;
            font-size: 32px;
            font-weight: bold;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
            letter-spacing: 2px;
        }
        #qrcode {
            margin: 30px auto;
            padding: 20px;
            background: white;
            border-radius: 10px;
            display: inline-block;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .info {
            color: #666;
            font-size: 14px;
            margin-top: 20px;
            line-height: 1.8;
        }
        .url {
            color: #764ba2;
            word-break: break-all;
            font-size: 11px;
            margin: 15px 0;
            padding: 12px;
            background: #f5f5f5;
            border-radius: 8px;
            font-family: monospace;
        }
        .status {
            display: inline-block;
            background: #22c55e;
            color: white;
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 13px;
            margin-top: 10px;
            font-weight: 600;
        }
        .token {
            color: #999;
            font-size: 12px;
            margin-top: 10px;
            font-family: monospace;
        }
        .print-btn {
            margin-top: 20px;
            padding: 12px 30px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: background 0.3s;
        }
        .print-btn:hover {
            background: #5568d3;
        }
        @media print {
            body {
                background: white;
            }
            .container {
                box-shadow: none;
            }
            .print-btn {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔒 SecureID Bracelet</h1>
        <div class="bracelet-id">${bracelet.id}</div>
        <div class="status">INACTIVE - Prêt pour activation</div>
        <div class="token">Token: ${bracelet.token}</div>

        <div id="qrcode"></div>

        <div class="info">
            <strong>📱 Instructions d'activation:</strong><br>
            1. Scannez ce QR code avec votre téléphone<br>
            2. Ou cliquez sur le lien ci-dessous<br>
            3. Suivez le processus d'activation complet
        </div>

        <div class="url">
            <a href="${activationUrl}" target="_blank" style="color: #764ba2; text-decoration: none;">
                ${activationUrl}
            </a>
        </div>

        <button class="print-btn" onclick="window.print()">🖨️ Imprimer ce QR Code</button>
    </div>

    <script>
        // Générer le QR code
        const canvas = document.createElement('canvas');
        QRCode.toCanvas(canvas, '${activationUrl}', {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        }, function (error) {
            if (error) {
                console.error(error);
                document.getElementById('qrcode').innerHTML = '<p style="color: red;">Erreur lors de la génération du QR code</p>';
            } else {
                document.getElementById('qrcode').appendChild(canvas);
                console.log('QR code généré avec succès!');
            }
        });
    </script>
</body>
</html>`;

      const fileName = `qr-code-${bracelet.id}.html`;
      const filePath = path.join(__dirname, '..', fileName);
      fs.writeFileSync(filePath, qrCodeHtml);

      console.log(`   ✅ ${fileName}`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ Fichiers QR code créés dans le dossier racine');
    console.log('   Ouvrez-les dans votre navigateur pour voir les QR codes!\n');

    console.log('🎯 Pour commencer à tester:');
    console.log(`   Ouvrez: http://localhost:3001/activate?id=${newBracelets[0].id}&token=${newBracelets[0].token}\n`);

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Exécuter
resetBracelets();
