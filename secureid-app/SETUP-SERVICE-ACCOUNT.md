# 🔑 Configuration Service Account Firebase

## Problème
Le script de provisioning nécessite un fichier `service-account.json` pour accéder à Firebase Admin SDK et créer les documents dans Firestore.

## Solution : Télécharger le Service Account

### Étape 1 : Accéder à Firebase Console

1. Ouvrir https://console.firebase.google.com
2. Sélectionner votre projet : **taskflow-26718** (ou le projet actuel)

### Étape 2 : Générer la Clé Privée

1. Cliquer sur l'icône **⚙️ (Paramètres)** en haut à gauche
2. Sélectionner **Project Settings** (Paramètres du projet)
3. Aller dans l'onglet **Service Accounts**
4. Descendre jusqu'à la section **Firebase Admin SDK**
5. Cliquer sur le bouton **Generate New Private Key** (Générer une nouvelle clé privée)
6. Confirmer en cliquant **Generate Key** dans la popup

### Étape 3 : Sauvegarder le Fichier

Un fichier JSON sera téléchargé avec un nom comme :
```
taskflow-26718-firebase-adminsdk-xxxxx-xxxxxxxxxx.json
```

**IMPORTANT** :
1. Renommer ce fichier en : `service-account.json`
2. Le placer à la racine du projet : `c:\Users\X1 Carbon\Desktop\QR-CODE\secureid-app\`

### Étape 4 : Vérifier l'Emplacement

La structure doit être :
```
secureid-app/
├── service-account.json  ← ICI (nouvelle ligne)
├── package.json
├── .env.local
├── src/
└── scripts/
```

### Étape 5 : Sécurité

⚠️ **ATTENTION** : Ce fichier contient des secrets critiques !

Le fichier `service-account.json` est déjà dans `.gitignore`, donc il ne sera jamais commité.

Vérifier :
```bash
cat .gitignore | grep service-account
```

Doit afficher : `service-account.json`

### Étape 6 : Tester

Une fois le fichier en place :
```bash
npm run test-china
```

Résultat attendu :
```
🧪 TEST LOT CHINA - DÉMARRAGE
======================================================================
📦 Lot ID      : LOT_TEST_001
🔢 Quantité    : 3 unités (TEST)
...
```

---

## Alternative : Utiliser un Service Account Existant

Si vous avez déjà un `service-account.json` ailleurs :

```bash
# Copier depuis un autre projet
cp /chemin/vers/ancien/service-account.json ./service-account.json
```

⚠️ Assurez-vous qu'il correspond au projet Firebase configuré dans `.env.local`

---

## Dépannage

### Erreur : "service-account.json introuvable"
- Vérifier que le fichier existe : `ls service-account.json`
- Vérifier qu'il est à la racine (pas dans un sous-dossier)

### Erreur : "Permission denied"
Le service account n'a pas les bonnes permissions. Dans Firebase Console :
1. IAM & Admin → Service Accounts
2. Trouver votre service account
3. Ajouter les rôles :
   - **Firebase Admin SDK Administrator Service Agent**
   - **Cloud Datastore User**

### Erreur : "Invalid credentials"
Le fichier JSON est corrompu ou incorrect. Télécharger une nouvelle clé privée.

---

## Contenu du Fichier (Exemple)

Le fichier doit ressembler à :
```json
{
  "type": "service_account",
  "project_id": "taskflow-26718",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@taskflow-26718.iam.gserviceaccount.com",
  "client_id": "123456789...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

---

## Prochaine Étape

Une fois `service-account.json` en place :
```bash
npm run test-china
```

Puis, si le test réussit :
```bash
npm run generate-china
```
