# Guide de Déploiement - Security Rules Firestore

## 🎯 Objectif

Ce guide explique comment intégrer et déployer les règles de sécurité Firestore pour la collection `safeZones`.

---

## 📋 Prérequis

### 1. Firebase CLI Installée

```bash
# Vérifier si Firebase CLI est installée
firebase --version

# Si non installée, installer:
npm install -g firebase-tools

# Se connecter à Firebase
firebase login
```

### 2. Projet Firebase Initialisé

```bash
# Vérifier la configuration Firebase
firebase projects:list

# Si besoin, initialiser le projet
firebase init firestore
```

---

## 🔧 Étape 1 : Localiser le Fichier firestore.rules

Le fichier principal des règles Firestore se trouve généralement à la racine du projet :

```
secureid-app/
├── firestore.rules          ← Fichier principal à modifier
├── firestore.rules.safe-zones  ← Règles safe zones à intégrer
└── firebase.json
```

Si le fichier `firestore.rules` n'existe pas, créez-le :

```bash
touch firestore.rules
```

---

## 📝 Étape 2 : Intégrer les Règles Safe Zones

### Option A : Intégration Manuelle (Recommandée)

1. **Ouvrir** `firestore.rules`

2. **Copier les fonctions helper** du fichier `firestore.rules.safe-zones` :

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // ============================================
    // FONCTIONS HELPER
    // ============================================

    function isSignedIn() {
      return request.auth != null;
    }

    function userId() {
      return request.auth.uid;
    }

    function isParentOfProfile(profileId) {
      return isSignedIn() &&
             exists(/databases/$(database)/documents/profiles/$(profileId)) &&
             get(/databases/$(database)/documents/profiles/$(profileId)).data.parentId == userId();
    }

    function isValidSafeZone() {
      let data = request.resource.data;

      return data.keys().hasAll(['name', 'icon', 'center', 'radius', 'color', 'enabled', 'alertDelay', 'profileId', 'createdAt', 'updatedAt']) &&
             data.name is string &&
             data.name.size() >= 2 &&
             data.name.size() <= 50 &&
             data.icon is string &&
             data.center is map &&
             data.center.keys().hasAll(['lat', 'lng']) &&
             data.center.lat is number &&
             data.center.lat >= -90 && data.center.lat <= 90 &&
             data.center.lng is number &&
             data.center.lng >= -180 && data.center.lng <= 180 &&
             data.radius is number &&
             data.radius >= 100 && data.radius <= 5000 &&
             data.color is string &&
             data.color.matches('^#[0-9A-Fa-f]{6}$') &&
             data.enabled is bool &&
             data.alertDelay is number &&
             data.alertDelay >= 1 && data.alertDelay <= 60 &&
             data.profileId is string &&
             data.profileId == profileId &&
             data.createdAt is timestamp &&
             data.updatedAt is timestamp;
    }

    function isValidUpdate() {
      let data = request.resource.data;
      let existingData = resource.data;

      return data.updatedAt is timestamp &&
             data.updatedAt > existingData.updatedAt &&
             data.createdAt == existingData.createdAt &&
             data.profileId == existingData.profileId;
    }

    // ============================================
    // RÈGLES EXISTANTES (profiles, etc.)
    // ============================================

    match /profiles/{profileId} {
      // Vos règles existantes pour profiles
      allow read: if isParentOfProfile(profileId);
      allow write: if isParentOfProfile(profileId);
    }

    // ============================================
    // RÈGLES SAFE ZONES (NOUVEAU)
    // ============================================

    match /profiles/{profileId}/safeZones/{zoneId} {
      allow read: if isParentOfProfile(profileId);

      allow create: if isParentOfProfile(profileId) &&
                       isValidSafeZone() &&
                       request.resource.data.createdAt == request.resource.data.updatedAt;

      allow update: if isParentOfProfile(profileId) &&
                       isValidSafeZone() &&
                       isValidUpdate();

      allow delete: if isParentOfProfile(profileId);
    }

    // Collection Group (optionnel)
    match /{path=**}/safeZones/{zoneId} {
      allow read: if isSignedIn() &&
                     exists(/databases/$(database)/documents/profiles/$(resource.data.profileId)) &&
                     get(/databases/$(database)/documents/profiles/$(resource.data.profileId)).data.parentId == userId();
    }
  }
}
```

### Option B : Remplacement Complet

Si vous partez de zéro ou voulez réinitialiser :

```bash
# Copier le fichier de règles
cp firestore.rules.safe-zones firestore.rules
```

---

## ✅ Étape 3 : Valider les Règles

Avant de déployer, validez la syntaxe :

```bash
# Valider la syntaxe des règles
firebase deploy --only firestore:rules --dry-run

# Si erreurs, corriger dans firestore.rules
```

---

## 🚀 Étape 4 : Déployer les Règles

### Déploiement Production

```bash
# Déployer uniquement les règles Firestore
firebase deploy --only firestore:rules

# Output attendu:
# ✔  firestore: rules file firestore.rules compiled successfully
# ✔  firestore: released rules firestore.rules to cloud.firestore
```

### Déploiement avec Index (si nécessaire)

Si vous avez des index composites :

```bash
# Déployer règles + index
firebase deploy --only firestore
```

---

## 🧪 Étape 5 : Tester les Règles

### Dans Firebase Console

1. **Ouvrir Firebase Console** : https://console.firebase.google.com
2. **Aller dans Firestore Database** > **Rules**
3. **Cliquer sur "Rules Playground"**

### Test 1 : Lecture Autorisée (Parent)

```javascript
// Simuler: Parent lit ses zones
Operation: get
Path: /profiles/PROFILE_ID/safeZones/ZONE_ID
Auth: { uid: 'PARENT_UID' }

// Setup requis:
// - Document profiles/PROFILE_ID existe
// - profiles/PROFILE_ID.parentId == 'PARENT_UID'

// Résultat attendu: ✅ Allow
```

### Test 2 : Lecture Refusée (Non-Parent)

```javascript
Operation: get
Path: /profiles/PROFILE_ID/safeZones/ZONE_ID
Auth: { uid: 'OTHER_USER_UID' }

// Résultat attendu: ❌ Deny (not parent)
```

### Test 3 : Création Valide

```javascript
Operation: create
Path: /profiles/PROFILE_ID/safeZones/NEW_ZONE_ID
Auth: { uid: 'PARENT_UID' }

Data: {
  name: "École Test",
  icon: "🏫",
  center: { lat: 12.3714, lng: -1.5197 },
  radius: 500,
  color: "#22c55e",
  enabled: true,
  alertDelay: 5,
  profileId: "PROFILE_ID",
  createdAt: timestamp.now(),
  updatedAt: timestamp.now()
}

// Résultat attendu: ✅ Allow
```

### Test 4 : Création Invalide (Radius > 5000)

```javascript
Operation: create
Path: /profiles/PROFILE_ID/safeZones/NEW_ZONE_ID
Auth: { uid: 'PARENT_UID' }

Data: {
  ...validData,
  radius: 10000  // ❌ Invalid (> 5000)
}

// Résultat attendu: ❌ Deny (invalid radius)
```

### Test 5 : Update Valide

```javascript
Operation: update
Path: /profiles/PROFILE_ID/safeZones/EXISTING_ZONE_ID
Auth: { uid: 'PARENT_UID' }

Data: {
  ...existingData,
  name: "École Modifiée",
  updatedAt: timestamp.now() + 1000  // Nouveau timestamp
}

// Résultat attendu: ✅ Allow
```

### Test 6 : Update Invalide (Modification profileId)

```javascript
Operation: update
Path: /profiles/PROFILE_ID/safeZones/EXISTING_ZONE_ID
Auth: { uid: 'PARENT_UID' }

Data: {
  ...existingData,
  profileId: "DIFFERENT_PROFILE_ID",  // ❌ Invalid
  updatedAt: timestamp.now() + 1000
}

// Résultat attendu: ❌ Deny (cannot change profileId)
```

---

## 🔍 Étape 6 : Tester dans l'Application

### Test Fonctionnel Complet

1. **Se connecter** en tant que parent
2. **Aller sur** `/dashboard/profile/[id]/safe-zones`
3. **Créer une zone** avec données valides → ✅ Doit réussir
4. **Modifier la zone** → ✅ Doit réussir
5. **Supprimer la zone** → ✅ Doit réussir

### Test Avec Console Dev

Ouvrir la console navigateur et observer les logs :

```javascript
// Succès
✅ Safe zone created { zoneId: "...", zoneName: "École Test" }

// Échec (ex: non autorisé)
❌ Error creating safe zone { error: "Permission denied" }
```

---

## 🐛 Troubleshooting

### Erreur : "Permission denied"

**Causes possibles** :
1. Règles pas déployées
2. User non authentifié
3. User n'est pas le parent du profil
4. Données invalides

**Solution** :
```bash
# Vérifier règles déployées
firebase firestore:rules:get

# Vérifier authentification
console.log('User:', user?.uid);

# Vérifier relation parent-profil
const profileDoc = await adminDb.collection('profiles').doc(profileId).get();
console.log('ParentId:', profileDoc.data()?.parentId);
```

### Erreur : "Invalid data"

**Causes** :
- Nom < 2 caractères ou > 50
- Radius < 100 ou > 5000
- AlertDelay < 1 ou > 60
- Couleur format invalide
- Champs manquants

**Solution** :
Vérifier validation Zod côté client correspond aux règles :

```typescript
// src/components/dashboard/SafeZoneDialog.tsx ligne 31-41
const SafeZoneSchema = z.object({
  name: z.string().min(2).max(50),  // ✅ Match rules
  radius: z.number().min(100).max(5000),  // ✅ Match rules
  alertDelay: z.number().min(1).max(60),  // ✅ Match rules
  // ...
});
```

### Erreur : "Cannot modify profileId"

**Cause** :
Tentative de changer `profileId` lors d'un update.

**Solution** :
Ne jamais envoyer `profileId` dans les updates :

```typescript
// ❌ INCORRECT
await updateSafeZone(zoneId, profileId, {
  ...data,
  profileId: newProfileId  // ❌ Interdit
});

// ✅ CORRECT
await updateSafeZone(zoneId, profileId, {
  name: newName,
  radius: newRadius,
  // profileId reste inchangé
});
```

---

## 📊 Monitoring

### Voir les Requêtes Refusées

Firebase Console > Firestore > Usage > Denied Requests

### Activer Logging Détaillé

```typescript
// src/lib/logger.ts
logger.error('Firestore permission denied', {
  operation: 'create',
  collection: 'safeZones',
  userId: user.uid,
  profileId: profileId,
  error: error
});
```

---

## 🔄 Rollback (si problème)

### Restaurer Version Précédente

```bash
# Lister versions déployées
firebase firestore:rules:list

# Restaurer version spécifique
firebase firestore:rules:release <RELEASE_ID>
```

### Version Permissive Temporaire (DEV ONLY)

```javascript
// ⚠️ UNIQUEMENT POUR DEBUG - NE JAMAIS EN PRODUCTION
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // ⚠️ DANGEREUX
    }
  }
}
```

---

## ✅ Checklist Post-Déploiement

- [ ] Règles déployées sans erreur
- [ ] Tests Playground tous passent (6 tests minimum)
- [ ] Test fonctionnel dans app (create/read/update/delete)
- [ ] Logs confirment autorisations correctes
- [ ] Aucune "Permission denied" pour opérations légitimes
- [ ] Requêtes non autorisées bien bloquées
- [ ] Documentation équipe mise à jour

---

## 📚 Ressources

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Rules Language Reference](https://firebase.google.com/docs/rules/rules-language)
- [Security Rules Testing](https://firebase.google.com/docs/rules/unit-tests)
- [Best Practices](https://firebase.google.com/docs/firestore/security/rules-structure)

---

**Règles déployées avec succès ! 🔒**
