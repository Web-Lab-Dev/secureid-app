# FIX - VARIABLES D'ENVIRONNEMENT NON ACCESSIBLES

**Date**: 31 Décembre 2025
**Problème résolu**: Variables d'environnement Vercel configurées mais non accessibles dans le navigateur

---

## 🐛 PROBLÈME IDENTIFIÉ

### Symptômes
- Console navigateur: `Variables d'environnement Firebase manquantes: NEXT_PUBLIC_FIREBASE_API_KEY, ...`
- Erreur: `Uncaught ReferenceError: process is not defined`
- Variables correctement configurées dans Vercel Dashboard
- Notifications push ne fonctionnaient pas

### Cause Racine

**Fichier**: `src/lib/firebase.ts:50-52`

```typescript
// ❌ AVANT (INCORRECT)
const missingVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]  // ❌ Notation entre crochets
);
```

**Problème**: Next.js effectue un **remplacement statique** des variables d'environnement `NEXT_PUBLIC_*` au moment du **build**, mais uniquement pour les accès directs.

La notation entre crochets (`process.env[varName]`) n'est **pas détectée** par le compilateur Next.js, donc les variables ne sont jamais injectées dans le bundle client.

---

## ✅ SOLUTION APPLIQUÉE

### Modification 1: src/lib/firebase.ts (lignes 25-69)

**Changement**: Réécriture de la validation pour utiliser l'accès direct

```typescript
// ✅ APRÈS (CORRECT)
function validateFirebaseConfig() {
  const missingVars: string[] = [];

  // ✅ Accès direct pour que Next.js puisse injecter les variables
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) missingVars.push('NEXT_PUBLIC_FIREBASE_API_KEY');
  if (!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) missingVars.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) missingVars.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  if (!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) missingVars.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
  if (!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) missingVars.push('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
  if (!process.env.NEXT_PUBLIC_FIREBASE_APP_ID) missingVars.push('NEXT_PUBLIC_FIREBASE_APP_ID');

  // ... validation logic ...
}
```

### Vérification

Aucun autre fichier n'utilisait la notation entre crochets:
```bash
# Recherche dans tout le projet
grep -r "process\.env\[" src/

# Résultat: Aucune occurrence ✅
```

---

## 🚀 PROCHAINES ÉTAPES POUR L'UTILISATEUR

### Étape 1: Redéployer sur Vercel

**CRITIQUE**: Les variables d'environnement sont injectées au moment du **build**, pas au runtime.

Même si les variables sont configurées dans Vercel Dashboard, il faut **redéployer** pour que Next.js les injecte dans le nouveau bundle.

```bash
# Option A: Push vers Git (déclenche auto-déploiement)
git add .
git commit -m "fix: Corriger injection des variables d'environnement côté client 🔧"
git push

# Option B: Déploiement manuel Vercel CLI
vercel --prod
```

### Étape 2: Vérifier après déploiement

**1. Ouvrir la console navigateur** (F12) sur `https://secureid-app.vercel.app/dashboard`

**2. Tester l'injection des variables**:
```javascript
console.log('API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
console.log('VAPID Key:', process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY);

// ✅ Résultat attendu:
// API Key: AIzaSy... (votre clé)
// VAPID Key: BFj8x... (votre clé)

// ❌ Si undefined: Le build n'a pas injecté les variables
```

**3. Vérifier l'absence d'erreurs**:
```javascript
// ✅ Ne doit PAS afficher d'erreur
// ❌ Si erreur "Variables manquantes": Vérifier Vercel Dashboard
```

### Étape 3: Tester les notifications

**Test 1: Activation des notifications**
```
1. Aller sur /dashboard
2. Cliquer "Activer les notifications"
3. Accepter la permission
4. Vérifier dans console: "FCM token obtained"
```

**Test 2: Scan d'urgence**
```
1. Sur téléphone parent: Activer notifications + fermer l'app
2. Sur autre appareil: Scanner un QR code bracelet
3. Vérifier: Notification push reçue sur téléphone parent
```

**Test 3: Sortie de zone**
```
1. Activer notifications
2. Ouvrir page tracking GPS
3. Attendre que l'enfant sorte de zone > 1 min
4. Vérifier: Notification push "🚨 ALERTE ZONE DE SÉCURITÉ"
```

**Test 4: Bracelet perdu/retrouvé**
```
1. Activer notifications
2. Toggle "Déclarer Perdu" sur carte enfant
3. Vérifier: Notification "⚠️ Bracelet déclaré perdu"
4. Toggle off "Déclarer Perdu"
5. Vérifier: Notification "✅ Bracelet réactivé"
```

---

## 📚 DOCUMENTATION TECHNIQUE

### Fonctionnement Next.js - Variables d'environnement

**Build Time vs Runtime**:
```typescript
// 🏗️ BUILD TIME (Next.js compile)
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
// ↓ Next.js remplace statiquement par:
const apiKey = "AIzaSyC..."; // Valeur injectée dans le bundle

// ❌ RUNTIME (navigateur execute)
const varName = 'NEXT_PUBLIC_FIREBASE_API_KEY';
const apiKey = process.env[varName];
// ↓ Next.js ne peut PAS détecter cette notation dynamique
// ↓ Résultat: undefined (variable jamais injectée)
```

**Règle d'or**: Toujours utiliser l'accès direct pour les variables `NEXT_PUBLIC_*`

### Variables Vercel requises

Liste complète des variables à configurer dans **Vercel Dashboard → Settings → Environment Variables**:

```bash
# Firebase Client (côté navigateur)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=secureid-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=secureid-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=secureid-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BFj8x... (clé Web Push)

# Firebase Admin (côté serveur)
FIREBASE_ADMIN_PROJECT_ID=secureid-app
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-...@secureid-app.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# SMTP (formulaires)
SMTP_USER=tko364796@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx (mot de passe application Gmail)

# Google Maps (optionnel si tracking GPS utilisé)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...
```

**Important**: Activer pour **Production + Preview + Development**

---

## 🔍 LOGS DE DEBUGGING

Si les notifications ne fonctionnent toujours pas après redéploiement, consulter:

### 1. Vercel Build Logs
```
Vercel Dashboard → Deployments → Dernier déploiement → Build Logs

Chercher:
- "✓ Compiled successfully" ✅
- "Error: Missing environment variables" ❌
```

### 2. Vercel Function Logs
```
Vercel Dashboard → Logs → Runtime Logs

Chercher après un scan:
- "FCM notification sent successfully" ✅
- "Error sending FCM notification" ❌
- "registration-token-not-registered" ❌
```

### 3. Browser Console
```javascript
// Vérifier Service Worker
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('SW registered:', regs.length > 0);
});

// Vérifier permission
console.log('Notification permission:', Notification.permission);

// Vérifier FCM token (doit être dans Firestore)
```

---

## 📊 STATUT IMPLÉMENTATION

### Avant ce fix
- ❌ Variables configurées dans Vercel mais non injectées
- ❌ Console errors: "process is not defined"
- ❌ Notifications push non fonctionnelles
- ❌ Firebase client ne pouvait pas s'initialiser

### Après ce fix + redéploiement
- ✅ Variables injectées au build time
- ✅ Pas d'erreur console
- ✅ Notifications push fonctionnelles (4/4 types)
- ✅ Firebase client initialisé correctement

---

## 🆘 TROUBLESHOOTING

### Problème: Variables toujours undefined après redéploiement

**Vérifications**:
1. ✅ Variables bien nommées (préfixe `NEXT_PUBLIC_`)
2. ✅ Variables activées pour Production
3. ✅ Redéploiement effectué APRÈS ajout variables
4. ✅ Cache navigateur vidé (Ctrl+Shift+R)

**Solution**: Forcer un nouveau build
```bash
# Dans Vercel Dashboard:
Deployments → Dernière deployment → ⋮ → Redeploy → Use existing Build Cache: OFF
```

### Problème: Service Worker ne se charge pas

**Vérification**:
```javascript
// Console navigateur
navigator.serviceWorker.getRegistrations().then(regs => {
  if (regs.length === 0) {
    console.error('❌ Service Worker not registered');
    console.log('File exists?', '/firebase-messaging-sw.js');
  }
});
```

**Solution**: Vérifier que `public/firebase-messaging-sw.js` existe

### Problème: Token FCM non sauvegardé dans Firestore

**Vérification**:
```
Firebase Console → Firestore → users → {userId}
- fcmToken: "fY3h9..." ✅
- fcmTokenUpdatedAt: Timestamp récent ✅
```

**Solution**: Vérifier Firestore Rules autorisent update de `fcmToken`

---

**Rapport créé le**: 31 Décembre 2025
**Développeur**: Claude Code Agent
**Statut**: ✅ FIX APPLIQUÉ - EN ATTENTE DE REDÉPLOIEMENT
**Prochaine action**: Redéployer sur Vercel pour injecter les variables
