# 🏭 PROVISIONING LOT CHINA 001 - Guide Complet

## 📋 Vue d'Ensemble

Ce document décrit le processus complet de provisioning du premier lot de production de bracelets SecureID destinés à la gravure laser en Chine.

### Caractéristiques du Lot

| Paramètre | Valeur |
|-----------|--------|
| **Lot ID** | LOT_CHINA_001 |
| **Quantité** | 120 unités |
| **Format ID** | BF-001 à BF-120 |
| **URL Production** | https://secureid-app.vercel.app |
| **Statut Initial** | FACTORY_LOCKED 🔒 |
| **Méthode de Gravure** | Laser sur silicone médical |
| **Taille QR Code** | 15mm x 15mm |

---

## 🎯 Objectifs Stratégiques

### 1. Sécurité Anti-Contrefaçon
- **Token cryptographique** : 64 caractères hex (256 bits d'entropie)
- **Validation serveur** : Authentification obligatoire du token
- **URL unique** : Impossible à reproduire sans accès à Firestore

### 2. Contrôle du Cycle de Vie
```
FACTORY_LOCKED → [Transport] → PROVISIONED → [Vente] → INACTIVE → [Activation] → ACTIVE
```

- **FACTORY_LOCKED** : Transit usine/douane (scan = maintenance)
- **PROVISIONED** : En stock Ouagadougou (scan = redirection activation)
- **INACTIVE** : Vendu non activé (scan = redirection activation)
- **ACTIVE** : Bracelet fonctionnel (scan = mode urgence)

### 3. Protection Transport
Le statut `FACTORY_LOCKED` empêche :
- ❌ Activation prématurée par un ouvrier
- ❌ Confusion d'un douanier (produit défectueux?)
- ❌ Vol de bracelets activables pendant le transport
- ✅ Affichage d'un message neutre de maintenance

---

## 🚀 Processus de Génération

### Étape 1 : Test (RECOMMANDÉ)

Générer 3 bracelets de test avant la production complète :

```bash
npm run test-china
```

**Résultat attendu :**
- 3 documents Firestore créés (TEST-001, TEST-002, TEST-003)
- 3 QR codes PNG générés dans `output/LOT_TEST_001/qr-codes/`
- Fichier JSON de rapport

**Vérification :**
1. Scanner un QR code test
2. Vérifier l'affichage de la page "MAINTENANCE"
3. Confirmer que l'URL pointe vers `secureid-app.vercel.app`

### Étape 2 : Production Complète

Une fois le test validé :

```bash
npm run generate-china
```

**Durée estimée** : ~3-5 minutes (120 bracelets)

**Opérations effectuées :**
- ✅ Création de 120 documents Firestore
- ✅ Génération de 120 QR codes PNG (800x800px)
- ✅ Rapports JSON, CSV et Markdown
- ✅ Liste d'URLs pour tests

**Structure de sortie :**
```
output/LOT_CHINA_001/
├── qr-codes/
│   ├── BF-001.png
│   ├── BF-002.png
│   └── ... (120 fichiers)
└── data/
    ├── batch-data.json      # Données complètes
    ├── factory-manifest.csv # Manifeste pour usine
    ├── urls.txt            # Liste URLs (tests)
    └── RAPPORT.md          # Documentation
```

---

## 📦 Envoi à l'Usine

### Fichiers à Transmettre

**UNIQUEMENT les fichiers PNG** :
```bash
# Créer une archive ZIP
cd output/LOT_CHINA_001/qr-codes
# Zipper tous les PNG
```

**NE PAS envoyer** :
- ❌ batch-data.json (contient les tokens secrets!)
- ❌ urls.txt
- ❌ factory-manifest.csv
- ⚠️ Seuls les PNG sont nécessaires pour la gravure

### Spécifications Techniques pour l'Usine

```yaml
Format: PNG
Résolution: 800x800 pixels
Correction d'erreur: Medium (15%)
Taille de gravure: 15mm x 15mm
Méthode: Laser
Support: Silicone médical
Contraste: Noir sur fond clair
Marge: 2mm minimum
```

### Instructions Gravure

1. **Position** : Centre du bracelet, face visible
2. **Profondeur** : Assez profonde pour résister à l'eau/savon
3. **Qualité** : Tous les pixels doivent être nets
4. **Test** : Scanner chaque 10ème bracelet pour QA

---

## 🔍 Vérification Post-Production

### Tests à Effectuer à Réception

#### Test 1 : Scan Physique
```bash
# Scanner 10 bracelets aléatoires
# Résultat attendu pour chacun :
# 1. URL correcte (secureid-app.vercel.app)
# 2. Page "MAINTENANCE" s'affiche
# 3. Référence bracelet visible (BF-XXX)
```

#### Test 2 : Vérification Firestore
```javascript
// Console Firebase
db.collection('bracelets')
  .where('batchId', '==', 'LOT_CHINA_001')
  .where('status', '==', 'FACTORY_LOCKED')
  .get()
  .then(snap => {
    console.log('Total:', snap.size); // Doit être 120
  });
```

#### Test 3 : Validation Token
```bash
# Tester manuellement avec une URL complète
https://secureid-app.vercel.app/s/BF-050?token=XXXXX

# Avec le bon token → Page maintenance
# Avec un mauvais token → Erreur "QR Code non authentique"
```

---

## 🔓 Déblocage du Lot

### Quand Débloquer ?

Débloquer le lot une fois que :
- ✅ Les bracelets sont reçus à Ouagadougou
- ✅ La QA physique est effectuée (scan tests)
- ✅ Les bracelets sont en stock sécurisé
- ✅ Prêts pour la vente

### Script de Déblocage (À Créer)

```bash
npm run unlock-batch LOT_CHINA_001
```

**Opération** : `FACTORY_LOCKED` → `PROVISIONED`

**Effet** :
- ❌ Avant : Scan → "Maintenance"
- ✅ Après : Scan → Redirection `/activate`

---

## 📊 Structure des Données

### Document Firestore

```typescript
{
  id: "BF-001",
  secretToken: "a1b2c3d4e5f6789...", // 64 caractères
  status: "FACTORY_LOCKED",
  batchId: "LOT_CHINA_001",
  createdAt: Timestamp,
  linkedUserId: null,
  linkedProfileId: null
}
```

### URL Générée

```
https://secureid-app.vercel.app/s/BF-001?token=a1b2c3d4e5f6789...
                                   ↑           ↑
                              Slug (ID)    Token secret
```

### QR Code

```
┌─────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓▓                        ▓▓ │
│ ▓▓  [URL encodée]         ▓▓ │
│ ▓▓  secureid-app.vercel   ▓▓ │
│ ▓▓  /s/BF-XXX?token=...   ▓▓ │
│ ▓▓                        ▓▓ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
└─────────────────────────────┘
     15mm x 15mm
```

**Optimisations** :
- Niveau correction 'M' : 15% de redondance
- Densité optimisée pour ~50 caractères
- Gravure laser lisible sur 15mm

---

## 🔐 Sécurité

### Protection des Tokens

⚠️ **CRITIQUE** : Les tokens secrets donnent accès total au bracelet

**Bonnes pratiques** :
- ✅ Stockés uniquement dans Firestore
- ✅ Jamais dans le code source
- ✅ Jamais envoyés à l'usine
- ✅ Générés cryptographiquement (`crypto.randomBytes`)
- ❌ NE PAS partager batch-data.json publiquement
- ❌ NE PAS commit dans Git

### Règles Firestore

```javascript
// Collection: bracelets
match /bracelets/{braceletId} {
  // Lecture publique pour vérification scan
  allow read: if true;

  // Écriture limitée aux admins
  allow write: if request.auth.token.admin == true;
}
```

---

## 📱 Expérience Utilisateur

### Flux Scan FACTORY_LOCKED

```
1. Utilisateur scanne le QR code
   ↓
2. Redirection vers /s/BF-XXX?token=...
   ↓
3. Serveur vérifie :
   - Bracelet existe? ✅
   - Token valide? ✅
   - Status? FACTORY_LOCKED
   ↓
4. Affichage page maintenance
   ┌─────────────────────────────┐
   │  🔧 MAINTENANCE             │
   │  Ce bracelet n'est pas      │
   │  encore disponible          │
   │                             │
   │  Ce produit est en cours    │
   │  de préparation             │
   │                             │
   │  🏭 En transit              │
   └─────────────────────────────┘
```

### Flux Scan INACTIVE (Après Déblocage)

```
1. Scan QR → /s/BF-XXX?token=...
   ↓
2. Status: INACTIVE
   ↓
3. Redirection /activate?id=BF-XXX&token=...
   ↓
4. Interface d'activation parent
```

---

## 📈 Monitoring et Statistiques

### Requêtes Firestore Utiles

```javascript
// Total bracelets LOT_CHINA_001
db.collection('bracelets')
  .where('batchId', '==', 'LOT_CHINA_001')
  .get();

// Bracelets encore verrouillés
db.collection('bracelets')
  .where('batchId', '==', 'LOT_CHINA_001')
  .where('status', '==', 'FACTORY_LOCKED')
  .get();

// Bracelets vendus mais non activés
db.collection('bracelets')
  .where('batchId', '==', 'LOT_CHINA_001')
  .where('status', '==', 'INACTIVE')
  .get();

// Bracelets actifs
db.collection('bracelets')
  .where('batchId', '==', 'LOT_CHINA_001')
  .where('status', '==', 'ACTIVE')
  .get();
```

### Métriques Clés

- **Taux d'activation** : Actifs / Total
- **Temps moyen activation** : createdAt → activatedAt
- **Bracelets en stock** : INACTIVE count

---

## 🛠️ Troubleshooting

### Problème : QR Code illisible après gravure

**Causes possibles** :
1. Gravure trop superficielle → Augmenter profondeur laser
2. Contraste insuffisant → Vérifier couleur silicone
3. Taille trop petite → Tester 20mm au lieu de 15mm
4. Niveau correction trop bas → Passer de 'M' à 'Q'

**Solution** :
Regénérer avec paramètres ajustés dans `CONFIG` du script

### Problème : service-account.json introuvable

```bash
# Télécharger depuis Firebase Console
# Project Settings → Service Accounts → Generate New Private Key
# Sauvegarder comme service-account.json à la racine
```

### Problème : Token invalide lors du scan

**Causes** :
1. QR code mal gravé → Rescanner avec meilleure luminosité
2. URL tronquée → Vérifier longueur complète
3. Token modifié manuellement → Utiliser URL originale

**Vérification** :
```bash
# Comparer URL scannée avec urls.txt
diff <URL_scannée> output/LOT_CHINA_001/data/urls.txt
```

---

## 📞 Support

### Documentation
- `scripts/README-PROVISIONING.md` : Guide détaillé provisioning
- `PROVISIONING-CHINA.md` : Ce document (vue d'ensemble)
- `output/LOT_CHINA_001/data/RAPPORT.md` : Rapport de génération

### Commandes Utiles

```bash
# Générer le lot de test
npm run test-china

# Générer le lot production
npm run generate-china

# Débloquer le lot (à créer)
npm run unlock-batch LOT_CHINA_001

# Vérifier la base de données
firebase firestore:get /bracelets/BF-001
```

---

## ✅ Checklist Complète

### Avant Génération
- [ ] service-account.json présent
- [ ] .env.local configuré
- [ ] Firebase accessible
- [ ] Test avec `npm run test-china` réussi

### Génération
- [ ] `npm run generate-china` exécuté
- [ ] 120 PNG générés dans output/LOT_CHINA_001/qr-codes/
- [ ] Rapport RAPPORT.md vérifié
- [ ] 120 documents Firestore créés (vérification console)

### Envoi Usine
- [ ] ZIP des PNG créé
- [ ] Spécifications techniques transmises
- [ ] Instructions gravure envoyées
- [ ] Contact usine confirmé

### Réception
- [ ] 120 bracelets reçus physiquement
- [ ] 10 scans tests effectués
- [ ] Page "MAINTENANCE" s'affiche correctement
- [ ] Aucun bracelet endommagé/illisible

### Déblocage
- [ ] Script unlock-batch créé et testé
- [ ] Lot débloqué (FACTORY_LOCKED → PROVISIONED)
- [ ] Scan test : redirection vers /activate
- [ ] Bracelets prêts pour vente

---

## 🎯 Prochaines Étapes

1. **Immédiat** : Générer le lot avec `npm run generate-china`
2. **J+1** : Envoyer les PNG à l'usine
3. **J+15-30** : Réception des bracelets gravés
4. **J+30** : QA et déblocage du lot
5. **J+31+** : Mise en vente et suivi activations

---

**Date de création** : 2025-11-27
**Version** : 1.0
**Lot** : LOT_CHINA_001 (120 unités)
**Statut** : Documentation complète ✅
