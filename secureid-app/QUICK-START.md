# ⚡ Quick Start - Provisioning Bracelets

## ❌ Erreur Actuelle

```
❌ ERREUR : service-account.json introuvable
```

## ✅ Solution en 3 Étapes

### 1️⃣ Télécharger le Service Account

**Lien direct** : https://console.firebase.google.com/project/taskflow-26718/settings/serviceaccounts/adminsdk

1. Cliquer sur **"Generate New Private Key"**
2. Confirmer dans la popup
3. Un fichier JSON sera téléchargé

### 2️⃣ Renommer et Placer le Fichier

```bash
# Le fichier téléchargé s'appelle quelque chose comme :
# taskflow-26718-firebase-adminsdk-xxxxx-xxxxxxxxxx.json

# Le renommer en :
service-account.json

# Le placer ICI :
c:\Users\X1 Carbon\Desktop\QR-CODE\secureid-app\service-account.json
```

**Structure finale** :
```
secureid-app/
├── service-account.json  ← Nouveau fichier ici
├── package.json
├── .env.local
├── src/
└── scripts/
```

### 3️⃣ Tester

```bash
npm run test-china
```

**Résultat attendu** :
```
🧪 TEST LOT CHINA - DÉMARRAGE
======================================================================
📦 Lot ID      : LOT_TEST_001
🔢 Quantité    : 3 unités (TEST)
🌐 URL Prod    : https://secureid-app.vercel.app
🔒 Statut      : FACTORY_LOCKED
======================================================================

🔄 Génération TEST-001...
  ✅ Document Firestore créé
  ✅ QR Code généré: ...

🔄 Génération TEST-002...
  ✅ Document Firestore créé
  ✅ QR Code généré: ...

🔄 Génération TEST-003...
  ✅ Document Firestore créé
  ✅ QR Code généré: ...

✅ TEST TERMINÉ
```

---

## 🚀 Une Fois le Test Réussi

### Générer le Lot Complet (120 bracelets)

```bash
npm run generate-china
```

**Durée** : ~3-5 minutes

**Résultat** :
- 120 documents Firestore créés
- 120 QR codes PNG générés dans `output/LOT_CHINA_001/qr-codes/`
- Rapports complets dans `output/LOT_CHINA_001/data/`

---

## 📚 Documentation Complète

- [SETUP-SERVICE-ACCOUNT.md](SETUP-SERVICE-ACCOUNT.md) - Guide détaillé configuration
- [PROVISIONING-CHINA.md](PROVISIONING-CHINA.md) - Vue d'ensemble complète
- [scripts/COMMANDES-QUICK-START.md](scripts/COMMANDES-QUICK-START.md) - Référence commandes

---

## 🔐 Sécurité

⚠️ Le fichier `service-account.json` contient des secrets critiques !

✅ Il est déjà dans `.gitignore` → Ne sera jamais commité
✅ Ne le partagez jamais publiquement
✅ Ne l'envoyez jamais à l'usine

---

## ❓ Besoin d'Aide ?

**Problème** : "service-account.json introuvable"
→ Voir étapes 1-2 ci-dessus

**Problème** : "Permission denied"
→ Vérifier les permissions du service account dans Firebase Console

**Problème** : "Invalid credentials"
→ Re-télécharger une nouvelle clé privée

---

## 🎯 Prochaine Étape

```bash
# 1. Télécharger service-account.json depuis Firebase
# 2. Le placer à la racine du projet
# 3. Lancer le test :
npm run test-china
```
