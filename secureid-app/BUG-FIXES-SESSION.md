# Session de Correction de Bugs - QR Code Activation

## 📋 Problèmes rencontrés

D'après la capture d'écran de l'utilisateur:
1. ❌ **"Token invalide"** - Message d'erreur affiché en haut
2. ❌ **Photo upload en boucle infinie** - "Compression et envoi..." qui ne se termine jamais
3. ❌ **Compte refuse de se créer** - Le formulaire ne se soumet pas

## 🔧 Corrections appliquées

### 1. Validation du token en amont ✅

**Problème**: Le token n'était validé que lors de la soumission du formulaire. L'utilisateur pouvait remplir tout le formulaire pour rien.

**Solution**:
- Ajout d'un `useEffect` qui valide le token dès le chargement de la page
- Affichage d'un loader pendant la validation
- Si le token est invalide, affichage d'une page d'erreur claire AVANT de montrer le formulaire
- Évite de perdre du temps à remplir un formulaire qui ne pourra pas être soumis

**Fichiers modifiés**:
- [`src/app/activate/page-client.tsx`](src/app/activate/page-client.tsx:43-65) - Ajout validation au mount
- [`src/app/activate/page-client.tsx`](src/app/activate/page-client.tsx:160-190) - Ajout UI de validation

### 2. Amélioration upload de photos ✅

**Problème**: L'upload restait bloqué sur "Compression et envoi..." sans jamais se terminer ni afficher d'erreur.

**Solution**:
- Ajout de logs console détaillés à chaque étape (compression, upload, URL)
- Gestion des erreurs Firebase Storage spécifiques:
  - `storage/unauthorized` → Message clair sur les permissions
  - `storage/canceled` → Upload annulé
  - `storage/unknown` → Problème réseau
- Messages d'erreur affichés à l'utilisateur en français

**Fichiers modifiés**:
- [`src/lib/storage-helpers.ts`](src/lib/storage-helpers.ts:98-140) - Logs et gestion d'erreurs

### 3. Configuration Firebase Storage Rules ✅

**Problème probable**: Les règles Firebase Storage n'étaient pas configurées, donc l'upload échouait silencieusement.

**Solution**:
- Création du fichier [`storage.rules`](storage.rules)
- Règles configurées pour:
  - ✅ Lecture publique des photos (pour affichage sur bracelets scannés)
  - ✅ Écriture uniquement pour utilisateurs authentifiés
  - ✅ Limite de taille: 10MB
  - ✅ Type de fichier: Images uniquement

**⚠️ ACTION REQUISE**: Déployer les règles Storage (voir [DEPLOY-STORAGE-RULES.md](DEPLOY-STORAGE-RULES.md))

### 4. Fix erreur SSR avec AuthContext ✅

**Problème**: Next.js 16 essayait de faire du SSR sur le composant client, causant une erreur "useAuthContext must be used within AuthProvider".

**Solution**:
- Ajout d'une vérification `typeof window === 'undefined'` dans `useAuthContext`
- Retour d'un contexte vide en SSR au lieu de throw
- Le composant se re-rend correctement côté client avec le bon contexte

**Fichiers modifiés**:
- [`src/contexts/AuthContext.tsx`](src/contexts/AuthContext.tsx:80-103) - Gestion SSR

## 📝 Guide de test

### Étape 1: Déployer les règles Storage

```bash
# Via Firebase Console (recommandé)
# 1. Aller sur https://console.firebase.google.com/
# 2. Projet taskflow-26718 → Storage → Rules
# 3. Copier-coller le contenu de storage.rules
# 4. Cliquer "Publier"

# OU via CLI
firebase deploy --only storage
```

### Étape 2: Générer de nouveaux bracelets de test

```bash
cd secureid-app
node scripts/generate-test-batch.js
```

Vérifier:
- ✅ 5 bracelets créés: BF-9000 à BF-9004
- ✅ Fichiers SVG dans `output/TEST_BATCH_2025/`
- ✅ URLs avec IP réseau: `http://192.168.1.66:3001/activate?id=BF-XXXX&token=XXXXX`

### Étape 3: Scanner un QR code

1. **Ouvrir le QR code SVG** dans un visualiseur
2. **Scanner avec un téléphone** sur le même WiFi
3. **Vérifier le flux**:
   - ✅ Loader "Validation du bracelet..."
   - ✅ Si token invalide → Page d'erreur rouge
   - ✅ Si token valide → Page d'inscription/connexion

### Étape 4: S'authentifier

1. **Créer un compte** ou se connecter
2. **Vérifier la navigation**:
   - ✅ Redirection vers sélection de profil

### Étape 5: Remplir le formulaire médical

1. **Cliquer "Nouvel enfant"**
2. **Upload une photo**:
   - ✅ Ouvrir console navigateur (F12)
   - ✅ Chercher les logs:
     ```
     📤 Début compression image...
     ✅ Image compressée
     📤 Upload vers Firebase Storage...
     ✅ Upload terminé, récupération URL...
     ✅ URL récupérée
     ```
   - ✅ Si erreur → Message clair affiché

3. **Remplir le formulaire**:
   - Nom complet
   - Date de naissance
   - Groupe sanguin
   - Allergies, conditions, médicaments
   - Code PIN médecin (4 chiffres)
   - Contacts d'urgence

4. **Soumettre**:
   - ✅ Vérifier que ça ne reste pas bloqué
   - ✅ Si erreur → Message affiché
   - ✅ Si succès → Page de confirmation animée

### Étape 6: Vérifier dans Firestore

1. **Firebase Console → Firestore**
2. **Collection `profiles`**:
   - ✅ Document créé avec bon `id`
   - ✅ Photo URL présente
   - ✅ Toutes les données médicales
   - ✅ Contacts d'urgence avec priorités

3. **Collection `bracelets`**:
   - ✅ Statut changé de `INACTIVE` → `ACTIVE`
   - ✅ `linkedProfileId` rempli
   - ✅ `linkedUserId` rempli

## 🐛 Debugging si problèmes persistent

### Si "Token invalide" persiste

```bash
# 1. Lister les bracelets dans Firestore
cd secureid-app
npx tsx scripts/list-bracelets.ts

# 2. Comparer le token dans l'URL avec celui en base
# URL: ...&token=ABC123
# Firestore: secretToken: "ABC123"
# → Doivent être EXACTEMENT identiques (case sensitive)
```

### Si photo upload ne marche toujours pas

1. **Vérifier règles Storage déployées**:
   - Firebase Console → Storage → Rules
   - Date de publication doit être récente

2. **Vérifier authentification**:
   ```javascript
   // Dans console navigateur (F12)
   import { getAuth } from 'firebase/auth';
   console.log(getAuth().currentUser);
   // Doit afficher l'utilisateur connecté, PAS null
   ```

3. **Tester avec règles permissives** (temporaire):
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
   Si ça marche → Problème dans les règles spécifiques
   Si ça ne marche pas → Problème d'authentification ou réseau

### Si le compte ne se crée toujours pas

1. **Ouvrir console navigateur (F12)**
2. **Onglet Console** → Chercher les erreurs rouges
3. **Onglet Network** → Chercher les requêtes échouées (rouge)
4. **Vérifier Firestore rules**:
   - Firebase Console → Firestore → Rules
   - S'assurer que l'écriture est autorisée pour les utilisateurs auth

## 📊 Résumé des changements

| Fichier | Lignes | Description |
|---------|--------|-------------|
| `src/app/activate/page-client.tsx` | 40-65, 160-190 | Validation token early + UI |
| `src/lib/storage-helpers.ts` | 98-140 | Logs détaillés + gestion erreurs |
| `src/contexts/AuthContext.tsx` | 80-103 | Fix SSR |
| `storage.rules` | 1-20 | Règles Firebase Storage (À DÉPLOYER) |
| `DEPLOY-STORAGE-RULES.md` | - | Guide de déploiement |

## ✅ Checklist de déploiement

- [ ] Déployer les règles Firebase Storage
- [ ] Générer de nouveaux bracelets de test
- [ ] Tester le flux complet avec un QR code scanné
- [ ] Vérifier les logs console pendant l'upload photo
- [ ] Vérifier que le profil est bien créé dans Firestore
- [ ] Vérifier que le bracelet passe bien à ACTIVE
