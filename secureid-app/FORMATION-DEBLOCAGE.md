# 🎓 Formation : Comment Fonctionne le Système de Déblocage

## 📚 Table des Matières
1. Vue d'ensemble
2. Les technologies utilisées
3. Anatomie du script unlock-batch.js
4. Comment créer une commande npm
5. Comment modifier des données dans Firestore
6. Exercice pratique

---

## 1️⃣ Vue d'Ensemble

### Qu'est-ce qu'on veut faire ?

**Objectif** : Changer le statut de 120 bracelets de `FACTORY_LOCKED` vers `INACTIVE`

**Pourquoi ?** :
- FACTORY_LOCKED : Bracelet en transit (affiche page maintenance)
- INACTIVE : Bracelet prêt à activer (redirige vers /activate)

**Comment ?** : Modifier les documents dans la base de données Firestore

---

## 2️⃣ Les Technologies Utilisées

### 🟢 Node.js (JavaScript côté serveur)

**C'est quoi ?**
- JavaScript qui s'exécute sur votre PC (pas dans le navigateur)
- Permet d'écrire des scripts pour automatiser des tâches

**Exemple simple** :
```javascript
// Afficher un message dans la console
console.log("Bonjour !");

// Faire une boucle
for (let i = 1; i <= 5; i++) {
  console.log("Nombre:", i);
}
```

### 🔷 TypeScript / ESM (Modules ES)

**C'est quoi ?**
- TypeScript = JavaScript avec des types (plus sûr)
- ESM = Façon moderne d'importer du code

**Exemple** :
```javascript
// Importer une fonction depuis un autre fichier
import { sayHello } from './utils.js';

// Utiliser cette fonction
sayHello("Alice");
```

### 🔥 Firebase Admin SDK

**C'est quoi ?**
- Une bibliothèque (ensemble de fonctions) pour gérer Firebase depuis le serveur
- Permet de lire/écrire dans Firestore, gérer l'authentification, etc.

**Exemple** :
```javascript
// Se connecter à Firebase
import admin from 'firebase-admin';
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Accéder à la base de données
const db = admin.firestore();
```

### 📦 npm (Node Package Manager)

**C'est quoi ?**
- Un gestionnaire de paquets (bibliothèques)
- Permet d'installer des outils et de créer des commandes personnalisées

**Fichier important** : `package.json`

---

## 3️⃣ Anatomie du Script unlock-batch.js

Je vais décomposer le script ligne par ligne pour que vous compreniez tout !

### Partie 1 : Les Imports (Ligne 11-17)

```javascript
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
```

**Explication** :
- `firebase-admin` : Pour gérer Firebase
- `fs` (File System) : Pour lire des fichiers
- `path` : Pour manipuler les chemins de fichiers
- `dotenv` : Pour charger les variables d'environnement (.env.local)

**Analogie** : C'est comme importer des outils dans une boîte à outils avant de commencer à bricoler.

---

### Partie 2 : Configuration (Ligne 19-25)

```javascript
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });
```

**Explication** :
- `__dirname` : Le dossier où se trouve le script
- `dotenv.config()` : Charge les variables d'environnement (comme les clés API)

**Pourquoi ?** : Pour savoir où on est et charger les configurations secrètes.

---

### Partie 3 : Connexion à Firebase (Ligne 27-43)

```javascript
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
```

**Explication étape par étape** :

1. **Chercher le fichier service-account.json** :
   ```javascript
   const serviceAccountPath = join(__dirname, '..', 'service-account.json');
   ```
   - `__dirname` = dossier scripts/
   - `'..'` = remonter d'un niveau
   - Résultat : `secureid-app/service-account.json`

2. **Lire le fichier** :
   ```javascript
   serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
   ```
   - `readFileSync()` : Lit le fichier texte
   - `JSON.parse()` : Convertit le texte JSON en objet JavaScript

3. **Initialiser Firebase** :
   ```javascript
   admin.initializeApp({
     credential: admin.credential.cert(serviceAccount),
   });
   ```
   - Se connecte à Firebase avec les credentials

4. **Obtenir la base de données** :
   ```javascript
   const db = admin.firestore();
   ```
   - `db` = Notre objet pour manipuler Firestore

**Analogie** : C'est comme ouvrir une session sur un site web en entrant votre login/password.

---

### Partie 4 : La Fonction de Déblocage (Ligne 48-120)

#### Étape A : Récupérer les Bracelets (Ligne 57-64)

```javascript
const braceletsRef = db.collection('bracelets');
const query = braceletsRef
  .where('batchId', '==', batchId)
  .where('status', '==', 'FACTORY_LOCKED');

const snapshot = await query.get();
```

**Explication** :

1. **Accéder à la collection** :
   ```javascript
   const braceletsRef = db.collection('bracelets');
   ```
   - Une "collection" dans Firestore = un dossier de documents
   - Comme un dossier "Bracelets/" sur votre PC

2. **Créer une requête avec filtres** :
   ```javascript
   .where('batchId', '==', batchId)
   ```
   - Cherche uniquement les bracelets du lot spécifié
   - Exemple : `batchId == "LOT_CHINA_001"`

   ```javascript
   .where('status', '==', 'FACTORY_LOCKED')
   ```
   - Et qui ont le statut FACTORY_LOCKED

3. **Exécuter la requête** :
   ```javascript
   const snapshot = await query.get();
   ```
   - `await` = Attendre que Firestore réponde
   - `snapshot` = Photo instantanée des résultats

**Analogie SQL** (si vous connaissez) :
```sql
SELECT * FROM bracelets
WHERE batchId = 'LOT_CHINA_001'
AND status = 'FACTORY_LOCKED';
```

---

#### Étape B : Vérifier qu'il y a des Résultats (Ligne 66-91)

```javascript
if (snapshot.empty) {
  console.log('⚠️  AUCUN bracelet trouvé...');
  // ... code pour afficher les statistiques
  process.exit(0);
}

const totalBracelets = snapshot.size;
console.log(`✅ ${totalBracelets} bracelet(s) trouvé(s)`);
```

**Explication** :
- `snapshot.empty` : Est-ce que la requête a trouvé 0 résultats ?
- `snapshot.size` : Nombre de documents trouvés
- `process.exit(0)` : Arrêter le script (code 0 = succès)

---

#### Étape C : Mettre à Jour en Lot (Ligne 105-120)

```javascript
const batch = db.batch();
let updateCount = 0;

snapshot.forEach(doc => {
  batch.update(doc.ref, {
    status: 'INACTIVE',
    unlockedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  updateCount++;
});

await batch.commit();
```

**Explication détaillée** :

1. **Créer un batch (lot d'opérations)** :
   ```javascript
   const batch = db.batch();
   ```
   - Un "batch" = Grouper plusieurs modifications ensemble
   - Plus rapide que modifier un par un

2. **Parcourir tous les documents** :
   ```javascript
   snapshot.forEach(doc => { ... });
   ```
   - Pour chaque bracelet trouvé, on ajoute une mise à jour au batch

3. **Ajouter la mise à jour** :
   ```javascript
   batch.update(doc.ref, {
     status: 'INACTIVE',
     unlockedAt: admin.firestore.FieldValue.serverTimestamp(),
   });
   ```
   - `doc.ref` = Référence au document dans Firestore
   - On change 2 champs :
     - `status` : FACTORY_LOCKED → INACTIVE
     - `unlockedAt` : Date/heure actuelle du serveur

4. **Exécuter toutes les modifications** :
   ```javascript
   await batch.commit();
   ```
   - Envoie toutes les modifications à Firestore en une seule fois
   - Atomique : soit tout réussit, soit tout échoue

**Analogie** : C'est comme cocher plusieurs cases à la fois dans Excel, puis appuyer sur "Appliquer" une seule fois.

---

### Partie 5 : Lire l'Argument (Ligne 144-154)

```javascript
const batchId = process.argv[2];

if (!batchId) {
  console.error('❌ ERREUR : Batch ID manquant');
  console.error('Usage: npm run unlock-batch <BATCH_ID>');
  process.exit(1);
}
```

**Explication** :
- `process.argv` = Arguments passés au script en ligne de commande
- `argv[0]` = node
- `argv[1]` = chemin du script
- `argv[2]` = Premier argument (le batch ID)

**Exemple** :
```bash
npm run unlock-batch LOT_CHINA_001
                     ↑
                     argv[2]
```

---

## 4️⃣ Comment Créer une Commande npm

### Le Fichier package.json

**Localisation** : `secureid-app/package.json`

**Extrait** :
```json
{
  "scripts": {
    "dev": "next dev -p 3001",
    "generate-china": "tsx scripts/generate-china-batch.js",
    "unlock-batch": "tsx scripts/unlock-batch.js"
  }
}
```

**Explication** :
- La section `"scripts"` définit des commandes personnalisées
- Format : `"nom-commande": "commande à exécuter"`

**Exemple** :
```json
"unlock-batch": "tsx scripts/unlock-batch.js"
```

Signifie :
- Quand je tape `npm run unlock-batch`
- npm va exécuter `tsx scripts/unlock-batch.js`
- `tsx` = Un outil pour exécuter du TypeScript/ESM

**Comment ajouter une nouvelle commande ?**

```json
{
  "scripts": {
    "unlock-batch": "tsx scripts/unlock-batch.js",
    "ma-commande": "node mon-script.js"  ← Nouvelle ligne
  }
}
```

Ensuite :
```bash
npm run ma-commande
```

---

## 5️⃣ Comment Modifier des Données dans Firestore

### Structure de Firestore

```
Firebase
└── Firestore (Base de données)
    ├── Collection: bracelets
    │   ├── Document: BF-001
    │   │   ├── id: "BF-001"
    │   │   ├── status: "FACTORY_LOCKED"
    │   │   ├── batchId: "LOT_CHINA_001"
    │   │   └── secretToken: "abc123..."
    │   ├── Document: BF-002
    │   └── ...
    └── Collection: profiles
        ├── Document: profile-1
        └── ...
```

### Opérations Basiques

#### 1. Lire un Document

```javascript
// Référence au document
const docRef = db.collection('bracelets').doc('BF-001');

// Récupérer le document
const docSnap = await docRef.get();

// Vérifier s'il existe
if (docSnap.exists()) {
  // Obtenir les données
  const data = docSnap.data();
  console.log('Statut:', data.status);
}
```

#### 2. Créer un Document

```javascript
// Référence au nouveau document
const newDocRef = db.collection('bracelets').doc('BF-999');

// Données à créer
const data = {
  id: 'BF-999',
  status: 'FACTORY_LOCKED',
  batchId: 'LOT_TEST',
  secretToken: 'xyz789...',
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
};

// Créer le document
await newDocRef.set(data);
console.log('✅ Document créé !');
```

#### 3. Mettre à Jour un Document

```javascript
// Référence au document existant
const docRef = db.collection('bracelets').doc('BF-001');

// Mettre à jour certains champs
await docRef.update({
  status: 'INACTIVE',
  unlockedAt: admin.firestore.FieldValue.serverTimestamp(),
});
console.log('✅ Document mis à jour !');
```

#### 4. Supprimer un Document

```javascript
// Référence au document
const docRef = db.collection('bracelets').doc('BF-001');

// Supprimer
await docRef.delete();
console.log('✅ Document supprimé !');
```

#### 5. Requête avec Filtres

```javascript
// Collection
const braceletsRef = db.collection('bracelets');

// Requête
const query = braceletsRef
  .where('status', '==', 'ACTIVE')
  .where('batchId', '==', 'LOT_CHINA_001')
  .limit(10);  // Limiter à 10 résultats

// Exécuter
const snapshot = await query.get();

// Parcourir les résultats
snapshot.forEach(doc => {
  console.log(doc.id, doc.data());
});
```

---

## 6️⃣ Exercice Pratique : Créer Votre Propre Script

### Objectif : Script pour Compter les Bracelets par Statut

**Fichier** : `scripts/count-bracelets.js`

```javascript
/**
 * Script pour compter les bracelets par statut
 * Usage: npm run count-bracelets
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Initialiser Firebase
let serviceAccount;
try {
  const serviceAccountPath = join(__dirname, '..', 'service-account.json');
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
} catch (error) {
  console.error('❌ service-account.json introuvable');
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// Fonction principale
async function countBracelets() {
  console.log('📊 COMPTAGE DES BRACELETS\n');

  // Récupérer tous les bracelets
  const snapshot = await db.collection('bracelets').get();

  console.log(`Total bracelets : ${snapshot.size}\n`);

  // Compter par statut
  const statusCounts = {};

  snapshot.forEach(doc => {
    const status = doc.data().status;
    // Incrémenter le compteur pour ce statut
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  // Afficher les résultats
  console.log('Répartition par statut :');
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });

  await admin.app().delete();
}

// Exécuter
countBracelets()
  .then(() => {
    console.log('\n✅ Terminé');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });
```

### Ajouter la Commande dans package.json

```json
{
  "scripts": {
    "count-bracelets": "tsx scripts/count-bracelets.js"
  }
}
```

### Utiliser le Script

```bash
npm run count-bracelets
```

**Résultat attendu** :
```
📊 COMPTAGE DES BRACELETS

Total bracelets : 123

Répartition par statut :
  FACTORY_LOCKED: 120
  INACTIVE: 0
  ACTIVE: 3

✅ Terminé
```

---

## 7️⃣ Concepts Importants

### async / await

**C'est quoi ?**
- JavaScript est asynchrone (non bloquant)
- `await` = Attendre qu'une opération se termine avant de continuer
- `async` = Marquer une fonction comme asynchrone

**Exemple** :
```javascript
// ❌ SANS await (ne fonctionne pas !)
const snapshot = db.collection('bracelets').get();
console.log(snapshot);  // Affiche une Promise, pas les données

// ✅ AVEC await
const snapshot = await db.collection('bracelets').get();
console.log(snapshot.size);  // Affiche le nombre de documents
```

### Batch Operations

**Pourquoi ?**
- Plus rapide : Une seule requête réseau au lieu de 120
- Atomique : Soit tout réussit, soit tout échoue
- Limite Firestore : 500 opérations par batch

**Exemple** :
```javascript
const batch = db.batch();

// Ajouter 100 opérations
for (let i = 0; i < 100; i++) {
  const docRef = db.collection('bracelets').doc(`BF-${i}`);
  batch.update(docRef, { status: 'INACTIVE' });
}

// Exécuter tout d'un coup
await batch.commit();
```

### Timestamps Firestore

```javascript
// ❌ Mauvais : Date JavaScript
createdAt: new Date()

// ✅ Bon : Timestamp Firestore
createdAt: admin.firestore.FieldValue.serverTimestamp()
```

**Pourquoi ?** : Le timestamp serveur est plus fiable (pas de problème de fuseau horaire).

---

## 🎓 Résumé : Ce Que Vous Avez Appris

### Langages et Outils
- ✅ JavaScript/Node.js (côté serveur)
- ✅ Firebase Admin SDK (gérer Firebase)
- ✅ npm (gestionnaire de paquets et commandes)
- ✅ Firestore (base de données NoSQL)

### Concepts
- ✅ Import/Export de modules (ESM)
- ✅ async/await (asynchrone)
- ✅ Requêtes Firestore (where, get)
- ✅ Batch operations (modifications groupées)
- ✅ Arguments de ligne de commande (process.argv)

### Pratique
- ✅ Lire/Écrire dans Firestore
- ✅ Créer des scripts Node.js
- ✅ Ajouter des commandes npm
- ✅ Manipuler des fichiers (fs)

---

## 📚 Pour Aller Plus Loin

### Ressources
1. **JavaScript** : https://developer.mozilla.org/fr/docs/Web/JavaScript
2. **Node.js** : https://nodejs.org/docs/
3. **Firebase Admin** : https://firebase.google.com/docs/admin/setup
4. **Firestore** : https://firebase.google.com/docs/firestore

### Exercices Suggérés

1. **Script de recherche** :
   - Trouver tous les bracelets d'un lot spécifique
   - `npm run find-batch LOT_CHINA_001`

2. **Script de backup** :
   - Exporter tous les bracelets vers un fichier JSON
   - `npm run backup-bracelets`

3. **Script de nettoyage** :
   - Supprimer tous les bracelets de test
   - `npm run cleanup-tests`

---

**Vous avez maintenant les bases pour créer vos propres scripts ! 🚀**

Des questions ? N'hésitez pas !
