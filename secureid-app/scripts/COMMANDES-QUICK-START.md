# 🚀 Quick Start - Provisioning LOT CHINA 001

## Commandes Essentielles

### 1. Test Rapide (3 bracelets)
```bash
npm run test-china
```
**Durée** : ~10 secondes
**Résultat** : 3 bracelets de test dans `output/LOT_TEST_001/`

---

### 2. Production Complète (120 bracelets)
```bash
npm run generate-china
```
**Durée** : ~3-5 minutes
**Résultat** : 120 bracelets dans `output/LOT_CHINA_001/`

---

### 3. Vérifier les Fichiers Générés
```bash
# Lister les QR codes
ls output/LOT_CHINA_001/qr-codes/

# Lire le rapport
cat output/LOT_CHINA_001/data/RAPPORT.md

# Voir les URLs
cat output/LOT_CHINA_001/data/urls.txt
```

---

### 4. Tester un Scan

1. Ouvrir un QR code : `output/LOT_CHINA_001/qr-codes/BF-001.png`
2. Scanner avec un téléphone
3. **Résultat attendu** : Page "MAINTENANCE - Ce bracelet n'est pas encore disponible"

Ou tester directement avec une URL :
```bash
# Prendre la première URL du fichier
head -1 output/LOT_CHINA_001/data/urls.txt
# Ouvrir dans un navigateur
```

---

### 5. Vérifier Firestore

```javascript
// Console Firebase → Firestore
// Requête :
db.collection('bracelets')
  .where('batchId', '==', 'LOT_CHINA_001')
  .where('status', '==', 'FACTORY_LOCKED')
  .count()

// Résultat attendu : 120
```

---

## 📦 Workflow Complet

```
┌─────────────────────────────────────────────────────────────┐
│                     PROVISIONING WORKFLOW                    │
└─────────────────────────────────────────────────────────────┘

1. TEST
   npm run test-china
   ↓
   Vérifier 3 bracelets de test
   ↓

2. PRODUCTION
   npm run generate-china
   ↓
   120 bracelets générés
   ↓

3. ENVOI USINE
   ZIP: output/LOT_CHINA_001/qr-codes/*.png
   ↓
   Gravure laser en Chine
   ↓

4. RÉCEPTION (J+15-30)
   Scanner 10 bracelets aléatoires
   ✓ Page "MAINTENANCE" s'affiche
   ↓

5. DÉBLOCAGE
   npm run unlock-batch LOT_CHINA_001
   ↓
   FACTORY_LOCKED → PROVISIONED
   ↓

6. MISE EN VENTE
   Scan → Redirection /activate
   ✓ Prêts pour activation client
```

---

## ⚡ En Cas d'Urgence

### Regénérer un Bracelet Spécifique

Si un bracelet est endommagé/illisible :

```javascript
// Créer script custom : scripts/regenerate-single.js
const braceletId = "BF-042";
// Générer nouveau QR avec même token existant
// (Récupérer token depuis Firestore)
```

### Vérifier Intégrité du Lot

```bash
# Compter fichiers PNG
ls output/LOT_CHINA_001/qr-codes/ | wc -l
# Doit afficher: 120

# Vérifier Firestore
# Voir commande section 5 ci-dessus
```

### Nettoyer un Lot de Test

```javascript
// Console Firebase
const batch = db.batch();
db.collection('bracelets')
  .where('batchId', '==', 'LOT_TEST_001')
  .get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    return batch.commit();
  });
```

---

## 📚 Documentation Complète

- **Vue d'ensemble** : `PROVISIONING-CHINA.md`
- **Guide détaillé** : `scripts/README-PROVISIONING.md`
- **Ce fichier** : Quick commands reference

---

**Prêt à lancer ?**

```bash
npm run test-china
```
