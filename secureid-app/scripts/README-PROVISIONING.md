# 🏭 Guide de Provisioning - LOT CHINA 001

## Contexte Stratégique

Ce guide documente le processus de génération du premier lot de 120 bracelets prototypes qui seront gravés au laser en Chine.

### ⚠️ Points Critiques

1. **Gravure Irréversible** : Une fois le QR Code gravé au laser, l'URL est fixée définitivement
2. **URL de Production** : Nous utilisons `https://secureid-app.vercel.app` (pas localhost!)
3. **Statut FACTORY_LOCKED** : Les bracelets sont verrouillés pour éviter toute activation prématurée pendant le transport

## Prérequis

### 1. Service Account Firebase

Le script nécessite les credentials Firebase Admin :

```bash
# Le fichier service-account.json doit exister à la racine
# Si vous ne l'avez pas :
# 1. Firebase Console → Project Settings → Service Accounts
# 2. Generate New Private Key
# 3. Sauvegarder comme service-account.json
```

### 2. Variables d'environnement

Vérifiez que `.env.local` contient les configurations Firebase.

## Utilisation

### Génération du Lot China 001

```bash
# Depuis la racine du projet
npm run generate-china
```

### Ce Que Fait le Script

1. **Génère 120 bracelets** avec IDs : `BF-001` à `BF-120`
2. **Crée les documents Firestore** avec :
   - `status: "FACTORY_LOCKED"` 🔒
   - `batchId: "LOT_CHINA_001"`
   - Token secret cryptographiquement sûr (64 caractères hex)
3. **Génère les QR Codes** optimisés pour gravure laser :
   - Format PNG haute résolution (800x800px)
   - Niveau de correction 'M' (Medium) pour lisibilité
   - Marge minimale pour gravure 15mm
4. **Produit les rapports** :
   - JSON complet des données
   - CSV pour l'usine
   - Liste d'URLs pour tests
   - Documentation Markdown

## Structure des Fichiers Générés

```
output/
└── LOT_CHINA_001/
    ├── qr-codes/
    │   ├── BF-001.png
    │   ├── BF-002.png
    │   └── ... (120 fichiers)
    └── data/
        ├── batch-data.json      # Données complètes
        ├── factory-manifest.csv # Manifeste usine
        ├── urls.txt            # Liste URLs
        └── RAPPORT.md          # Documentation
```

## Format des Données

### Document Firestore

```json
{
  "id": "BF-001",
  "secretToken": "a1b2c3d4e5f6...", // 64 caractères hex
  "status": "FACTORY_LOCKED",        // 🔒 CRITIQUE
  "batchId": "LOT_CHINA_001",
  "createdAt": "2025-11-27T...",
  "linkedUserId": null,
  "linkedProfileId": null
}
```

### URL Générée

```
https://secureid-app.vercel.app/s/BF-001?token=a1b2c3d4e5f6...
```

## Workflow Complet

### Phase 1 : Génération (MAINTENANT)

```bash
npm run generate-china
```

✅ Résultat : 120 QR codes PNG + données Firestore

### Phase 2 : Envoi à l'Usine

1. Extraire les fichiers PNG du dossier `output/LOT_CHINA_001/qr-codes/`
2. Envoyer à l'usine de gravure en Chine
3. Spécifications :
   - Taille gravure : 15mm x 15mm
   - Méthode : Laser
   - Matériau : Silicone médical

### Phase 3 : Réception des Bracelets

1. Les bracelets arrivent à Ouagadougou
2. Vérification qualité (scan de contrôle)
3. **IMPORTANT** : Les scans doivent retourner une page de maintenance (FACTORY_LOCKED)

### Phase 4 : Déblocage (Script à créer)

```bash
# Commande future pour débloquer le lot
npm run unlock-batch LOT_CHINA_001
```

Cela changera le statut : `FACTORY_LOCKED` → `PROVISIONED`

### Phase 5 : Distribution

Une fois débloqués, les bracelets peuvent être :
- Vendus aux clients
- Activés via l'application
- Liés à des profils enfants

## Sécurité

### Pourquoi FACTORY_LOCKED ?

❌ **Sans verrouillage** :
- Un ouvrier scanne → Voit "Bienvenue Parent..."
- Un douanier scanne → Pense que le produit est défectueux
- Activation prématurée possible

✅ **Avec FACTORY_LOCKED** :
- Scan → Page de maintenance neutre
- Aucune information sensible exposée
- Contrôle total du cycle de vie

### Token Secret

- **Longueur** : 64 caractères hexadécimaux (32 bytes)
- **Générateur** : `crypto.randomBytes(32)` (Node.js)
- **Entropie** : 256 bits (cryptographiquement sûr)
- **Usage** : Authentification du scan (empêche l'usurpation d'identité)

## Optimisation QR Code

### Pourquoi Niveau 'M' ?

| Niveau | Correction | Densité | Lisibilité 15mm |
|--------|-----------|---------|-----------------|
| L      | 7%        | Faible  | ✅ Excellent     |
| M      | 15%       | Moyenne | ✅ Bon           |
| Q      | 25%       | Élevée  | ⚠️ Moyen         |
| H      | 30%       | Très élevée | ❌ Difficile |

**Décision** : Niveau 'M' = Meilleur compromis sécurité/lisibilité pour une URL de ~50 caractères gravée sur 15mm.

## Troubleshooting

### Erreur : service-account.json introuvable

```bash
# Vérifier que le fichier existe
ls service-account.json

# S'il manque, le télécharger depuis Firebase Console
```

### Erreur : Permission denied (Firestore)

Vérifier que le service account a les permissions :
- Cloud Datastore User
- Firebase Admin

### QR Code illisible après gravure

1. Vérifier la résolution du fichier PNG (doit être 800x800)
2. Augmenter la taille de gravure (tester 20mm au lieu de 15mm)
3. Vérifier le contraste laser/silicone

## Tests

### Test 1 : Vérifier les QR Codes

```bash
# Utiliser un scanner QR pour tester
# Les URLs doivent pointer vers https://secureid-app.vercel.app
```

### Test 2 : Vérifier Firestore

```javascript
// Dans la console Firebase
db.collection('bracelets')
  .where('batchId', '==', 'LOT_CHINA_001')
  .where('status', '==', 'FACTORY_LOCKED')
  .get()
  .then(snapshot => console.log('Count:', snapshot.size)); // Doit afficher 120
```

### Test 3 : Tester un Scan

1. Scanner un QR Code généré
2. Vérifier que la page de scan s'affiche
3. **Attendu** : Message de maintenance (bracelet verrouillé)

## Support

Pour toute question sur le provisioning :
- Documentation : Ce fichier
- Logs : Les scripts affichent des logs détaillés
- Firestore : Vérifier la collection `bracelets`

## Prochaines Étapes

- [ ] Générer LOT_CHINA_001
- [ ] Envoyer les PNG à l'usine
- [ ] Créer le script `unlock-batch.js`
- [ ] Définir le workflow de déblocage
- [ ] Tester la page de scan en mode FACTORY_LOCKED
