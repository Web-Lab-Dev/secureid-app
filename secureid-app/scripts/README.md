# Script de Provisioning - SecureID

## 🏭 L'USINE DE PROVISIONING (PHASE 1)

Script Node.js autonome pour générer simultanément:
- **QR codes SVG** vectoriels (pour gravure laser sur bracelets)
- **Enregistrements Firestore** correspondants (base de données)

---

## 📋 Prérequis

### 1. Dépendances NPM

Les dépendances sont déjà installées si vous avez exécuté :
```bash
npm install
```

Dépendances utilisées :
- `qrcode` - Génération de QR codes
- `firebase-admin` - Accès privilégié à Firestore
- `dotenv` - Gestion des variables d'environnement

### 2. Compte de Service Firebase (CRITIQUE)

Vous devez télécharger une clé de compte de service Firebase :

**Étapes :**
1. Aller sur [Firebase Console](https://console.firebase.google.com)
2. Sélectionner votre projet
3. Aller dans **Paramètres du projet** (icône engrenage)
4. Onglet **Comptes de service**
5. Cliquer sur **Générer une nouvelle clé privée**
6. Télécharger le fichier JSON
7. Le renommer en `service-account.json`
8. Le placer dans le dossier `scripts/`

⚠️ **IMPORTANT** : Ce fichier ne doit JAMAIS être commité sur GitHub. Il est déjà dans `.gitignore`.

---

## ⚙️ Configuration

### Étape 1 : Créer le fichier de configuration

Copier le template :
```bash
cp scripts/.env.provisioning.example scripts/.env.provisioning
```

### Étape 2 : Éditer les variables

Ouvrir `scripts/.env.provisioning` et configurer :

```env
# Chemin vers votre clé de service (normalement ne pas modifier)
SERVICE_ACCOUNT_PATH=./scripts/service-account.json

# URL de base de votre application
BASE_URL=http://localhost:3000        # En développement
# BASE_URL=https://secureid.bf        # En production
```

### Étape 3 : Configurer le batch

Ouvrir `scripts/generate-batch.js` et modifier en haut du fichier :

```javascript
const CONFIG = {
  BATCH_ID: 'LOT_OUAGA_01',      // ← Nom du lot (traçabilité)
  QUANTITY: 50,                   // ← Nombre de bracelets à générer
  START_INDEX: 1,                 // ← Commence à BF-0001
  BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
};
```

**Exemples de configuration :**

| Cas d'usage | BATCH_ID | QUANTITY | START_INDEX | Résultat |
|-------------|----------|----------|-------------|----------|
| Premier lot Ouagadougou | `LOT_OUAGA_01` | 50 | 1 | BF-0001 → BF-0050 |
| Deuxième lot Ouagadougou | `LOT_OUAGA_02` | 100 | 51 | BF-0051 → BF-0150 |
| Lot Bobo-Dioulasso | `LOT_BOBO_01` | 25 | 1 | BF-0001 → BF-0025 |

---

## 🚀 Exécution

### Méthode 1 : Via npm (Recommandé)

```bash
npm run provision
```

### Méthode 2 : Direct avec Node.js

```bash
node scripts/generate-batch.js
```

---

## 📊 Fonctionnement

### Processus pour chaque bracelet :

1. **Génération des identifiants**
   - Slug public : `BF-XXXX` (ex: BF-0042)
   - Token secret : 8 caractères aléatoires cryptographiques (ex: `aF89kL2p`)
   - URL complète : `https://secureid.bf/s/BF-0042?t=aF89kL2p`

2. **Création dans Firestore**
   - Collection : `bracelets`
   - Document ID : Le slug (BF-0042)
   - Champs :
     ```json
     {
       "id": "BF-0042",
       "secretToken": "aF89kL2p",
       "status": "INACTIVE",
       "batchId": "LOT_OUAGA_01",
       "createdAt": "2024-01-15T10:30:00.000Z",
       "linkedUserId": null
     }
     ```

3. **Génération du QR code SVG**
   - Format : SVG vectoriel (pour gravure laser)
   - Nom du fichier : `BF-0042.svg`
   - Error correction : High (30% de redondance anti-rayures)
   - Contenu : URL complète avec token

---

## 📁 Sortie

Après exécution, le script crée :

```
output/
└── LOT_OUAGA_01/
    ├── BF-0001.svg
    ├── BF-0002.svg
    ├── BF-0003.svg
    ├── ...
    ├── BF-0050.svg
    └── batch_report.json
```

### Fichier `batch_report.json`

Contient toutes les informations de traçabilité :

```json
{
  "batchId": "LOT_OUAGA_01",
  "generatedAt": "2024-01-15T10:30:45.123Z",
  "quantity": 50,
  "bracelets": [
    {
      "id": "BF-0001",
      "secretToken": "xY7kP2mN",
      "url": "http://localhost:3000/s/BF-0001?t=xY7kP2mN",
      "svgFile": "BF-0001.svg"
    },
    // ...
  ],
  "summary": {
    "firstId": "BF-0001",
    "lastId": "BF-0050",
    "status": "INACTIVE"
  }
}
```

⚠️ **IMPORTANT** : Ce fichier contient les tokens secrets. Le conserver en sécurité !

---

## 🔒 Sécurité

### Gestion des erreurs

Le script utilise un système de **transaction atomique** :
- Si la création dans Firestore échoue → Pas de SVG généré
- Si la génération SVG échoue → Le document Firestore est supprimé (rollback)
- Chaque erreur est loggée avec détails

### Tokens secrets

- Générés avec `crypto.randomBytes()` (cryptographiquement sécurisé)
- **Pas de `Math.random()`** (trop prévisible)
- Longueur : 8 caractères
- Caractères utilisés : `A-Z, a-z, 2-9` (sans 0, O, 1, l, I pour éviter confusion)

### Status INACTIVE

Tous les bracelets sont créés avec `status: "INACTIVE"` :
- Empêche l'utilisation avant activation
- Activation manuelle lors de la première utilisation
- Protection contre la contrefaçon

---

## 🔧 Troubleshooting

### Erreur : `service-account.json introuvable`

**Cause** : Le fichier de clé de service n'existe pas.

**Solution** :
1. Télécharger la clé depuis Firebase Console (voir section Prérequis)
2. La placer dans `scripts/service-account.json`

### Erreur : `Permission denied` sur Firestore

**Cause** : Le compte de service n'a pas les bonnes permissions.

**Solution** :
1. Aller sur Firebase Console > IAM & Admin
2. Vérifier que le compte de service a le rôle `Cloud Datastore User` ou `Editor`

### Erreur : `Project ID not found`

**Cause** : Le fichier `service-account.json` est mal formaté.

**Solution** :
1. Vérifier que le fichier est un JSON valide
2. Vérifier qu'il contient `project_id`
3. Re-télécharger une nouvelle clé si nécessaire

### Les QR codes ne se génèrent pas

**Cause** : Le dossier `output/` n'existe pas ou n'a pas les permissions.

**Solution** :
```bash
mkdir -p output
chmod 755 output
```

### Conflit d'ID (document existe déjà)

**Cause** : Vous avez déjà généré un lot avec les mêmes IDs.

**Solution** :
1. Modifier `START_INDEX` dans `CONFIG` pour commencer après le dernier ID
2. Ou changer `BATCH_ID` pour un nouveau lot

---

## 📈 Bonnes Pratiques

### 1. Traçabilité

Utiliser des noms de lot explicites :
- ✅ `LOT_OUAGA_01` (ville + numéro)
- ✅ `LOT_EVENT_TECH_SUMMIT_2024`
- ❌ `LOT_1` (pas assez descriptif)

### 2. Sauvegarde

Après chaque génération :
1. Sauvegarder le fichier `batch_report.json` (contient les tokens)
2. Archiver les fichiers SVG
3. Faire un backup de Firestore

### 3. Production

Pour la production :
1. Changer `BASE_URL` vers `https://secureid.bf`
2. Utiliser des quantités réelles (ex: 1000 bracelets)
3. Archiver immédiatement les rapports

### 4. Tests

Pour tester le script :
```javascript
const CONFIG = {
  BATCH_ID: 'TEST_LOT',
  QUANTITY: 5,              // Petit nombre pour test
  START_INDEX: 9000,        // Index élevé pour éviter conflits
  BASE_URL: 'http://localhost:3000',
};
```

---

## 🎯 Prochaines Étapes

Après avoir généré les bracelets :

1. **Gravure laser** : Utiliser les fichiers SVG pour graver les QR codes
2. **Activation** : Créer l'interface pour activer les bracelets (Phase 2)
3. **Scan** : Implémenter la page de scan (`/s/:slug`) (Phase 3)
4. **Dashboard** : Tableau de bord pour suivre les bracelets (Phase 4)

---

## 💬 Support

En cas de problème :
1. Vérifier les logs d'erreur affichés par le script
2. Consulter cette documentation
3. Vérifier les permissions Firebase
4. Consulter la documentation Firebase Admin SDK

---

## 📝 Changelog

### v1.0.0 (Phase 1 - Initial)
- Génération de QR codes SVG
- Création automatique dans Firestore
- Gestion des erreurs avec rollback
- Rapport JSON de traçabilité
- Documentation complète
