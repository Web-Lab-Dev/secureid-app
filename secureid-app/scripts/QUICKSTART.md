# 🚀 QUICKSTART - Script de Provisioning

Guide rapide pour générer vos premiers bracelets SecureID.

---

## Étapes Rapides (5 minutes)

### 1️⃣ Télécharger la clé Firebase

1. Aller sur https://console.firebase.google.com
2. Sélectionner votre projet
3. **Paramètres** (engrenage) → **Comptes de service**
4. **Générer une nouvelle clé privée**
5. Télécharger le fichier JSON
6. Le renommer en `service-account.json`
7. Le placer dans `scripts/service-account.json`

### 2️⃣ Configurer les variables d'environnement

```bash
cd scripts
cp .env.provisioning.example .env.provisioning
```

Éditer `.env.provisioning` :
```env
SERVICE_ACCOUNT_PATH=./scripts/service-account.json
BASE_URL=http://localhost:3000
```

### 3️⃣ Configurer votre batch

Éditer `scripts/generate-batch.js` (lignes 20-24) :

```javascript
const CONFIG = {
  BATCH_ID: 'LOT_OUAGA_01',      // ← Votre nom de lot
  QUANTITY: 50,                   // ← Nombre de bracelets
  START_INDEX: 1,                 // ← Commence à BF-0001
  BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
};
```

### 4️⃣ Lancer le script

```bash
npm run provision
```

✅ **C'est tout !**

---

## Résultat

Vous aurez :
- ✅ 50 fichiers SVG dans `output/LOT_OUAGA_01/`
- ✅ 50 documents dans Firestore (collection `bracelets`)
- ✅ 1 fichier `batch_report.json` avec tous les tokens

---

## Exemple de Sortie

```
🏭 USINE DE PROVISIONING - SecureID
=====================================

📦 Batch ID: LOT_OUAGA_01
🔢 Quantité: 50 bracelets
🎯 Index de départ: 1
🌐 URL de base: http://localhost:3000

📁 Dossier de sortie: C:\...\output\LOT_OUAGA_01

🚀 Démarrage de la génération...

⚙️  [1/50] Génération: BF-0001
   📝 Création document Firestore...
   🎨 Génération QR code SVG...
   ✅ BF-0001 généré avec succès!

⚙️  [2/50] Génération: BF-0002
   📝 Création document Firestore...
   🎨 Génération QR code SVG...
   ✅ BF-0002 généré avec succès!

...

=====================================
📊 RÉSUMÉ DE LA GÉNÉRATION
=====================================

✅ Succès: 50/50
❌ Erreurs: 0/50

📄 Rapport sauvegardé: output/LOT_OUAGA_01/batch_report.json

✨ GÉNÉRATION TERMINÉE!

📁 Fichiers générés dans: output/LOT_OUAGA_01
   - 50 fichiers SVG
   - 1 fichier batch_report.json

📦 50 bracelets créés dans Firestore (statut: INACTIVE)

⚠️  IMPORTANT: Les bracelets sont en statut INACTIVE.
   Ils doivent être activés manuellement lors de la première utilisation.

👋 Script terminé.
```

---

## Prochaines Étapes

1. **Archiver** le fichier `batch_report.json` (contient les tokens secrets)
2. **Graver** les QR codes SVG sur les bracelets physiques
3. **Implémenter** la page de scan (Phase suivante)

---

## Besoin d'aide ?

Consulter la documentation complète : `scripts/README.md`
