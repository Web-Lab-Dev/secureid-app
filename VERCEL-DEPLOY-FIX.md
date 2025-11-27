# 🚀 FIX DÉPLOIEMENT VERCEL - SecureID

## ❌ Problème Actuel

Erreur **404** sur Vercel après déploiement.

**Cause**: Structure monorepo - Vercel cherche Next.js à la racine mais l'app est dans `secureid-app/`.

---

## ✅ SOLUTION COMPLÈTE (3 Méthodes)

### 🎯 Méthode 1: Configuration Vercel Dashboard (RECOMMANDÉE)

Cette méthode est la plus fiable et écrase toute autre configuration.

#### Étapes:

1. **Aller sur Vercel**: https://vercel.com
2. **Sélectionner votre projet**: `secureid-app`
3. **Settings** → **General**
4. **Trouver "Root Directory"**
5. **Cliquer "Edit"**
6. **Entrer**: `secureid-app`
7. **Sauvegarder**
8. **Deployments** → **Redeploy** (bouton avec 3 points) → **Redeploy**

#### Capture d'écran de ce qu'il faut faire:
```
Root Directory
┌─────────────────────────────────────┐
│ secureid-app                        │ ← Entrez ceci
└─────────────────────────────────────┘
        [Edit]  [Save]
```

---

### 🎯 Méthode 2: Recréer le projet Vercel (SI MÉTHODE 1 NE MARCHE PAS)

1. **Supprimer le projet actuel sur Vercel**:
   - Settings → General → Delete Project

2. **Créer un nouveau projet**:
   - New Project → Import `Web-Lab-Dev/secureid-app`

3. **IMPORTANT - Pendant la configuration**:
   - Framework: **Next.js** (détecté automatiquement)
   - Root Directory: **`secureid-app`** ← CRUCIAL!
   - Build Command: `npm run build` (automatique)
   - Install Command: `npm install` (automatique)

4. **Ajouter les variables d'environnement**:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDZKzZHIrqWXm_nfGRa2syWEEeSwGu5Eu8
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=taskflow-26718.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=taskflow-26718
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=taskflow-26718.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=685355004652
   NEXT_PUBLIC_FIREBASE_APP_ID=1:685355004652:web:0bc75c2c13cb306ba46bc9
   ```

5. **Deploy**

---

### 🎯 Méthode 3: Restructurer le Repository (DERNIÈRE OPTION)

Si les 2 méthodes précédentes ne marchent pas, déplacer tout à la racine:

```bash
# NE PAS FAIRE MAINTENANT - Essayez d'abord les méthodes 1 et 2
```

---

## 📋 Checklist de Vérification

Avant de redéployer, vérifiez:

- [ ] **Root Directory** = `secureid-app` (dans Vercel dashboard)
- [ ] **6 variables d'environnement** ajoutées (Firebase)
- [ ] **Framework** = Next.js
- [ ] **Build Command** = `npm run build` (ou vide pour auto-détection)
- [ ] **Output Directory** = `.next` (ou vide pour auto-détection)

---

## 🔍 Comment Vérifier le Build

Après déploiement, allez sur **Deployments** → Cliquez sur le dernier déploiement → **Building**

### ✅ Build Réussi - Vous devriez voir:

```
[npm install] Installing dependencies...
[npm install] added 350 packages
[next build] Creating an optimized production build...
[next build] ✓ Compiled successfully
[next build] ✓ Linting and checking validity of types
[next build] ✓ Collecting page data
[next build] ✓ Generating static pages
```

### ❌ Build Échoué - Vous verrez:

```
Error: Cannot find module 'next'
Error: ENOENT: no such file or directory 'package.json'
```

**Si vous voyez ces erreurs** → Root Directory n'est pas configuré!

---

## 🎯 URLs Après Déploiement Réussi

Votre app sera accessible sur:

- **Production**: `https://secureid-app.vercel.app`
- **Dashboard**: `https://secureid-app.vercel.app/dashboard`
- **Scan QR**: `https://secureid-app.vercel.app/s/BF-9000?t=m2SZFK2a`

---

## 🐛 Dépannage

### Problème: "404 - This page could not be found"

**Causes possibles**:
1. Root Directory pas configuré → **Méthode 1**
2. Build échoué silencieusement → Vérifier les logs
3. Variables d'environnement manquantes → Ajouter Firebase vars

### Problème: "Application error: a client-side exception has occurred"

**Causes possibles**:
1. Variables Firebase manquantes
2. Erreur dans le code (vérifier logs)

### Problème: Build prend trop de temps

**Solution**:
- Vérifier que vous n'avez pas `node_modules` dans le repo
- Le `.gitignore` doit contenir `node_modules/`

---

## 📞 Support

Si rien ne marche après les 3 méthodes:

1. **Copier les logs de build Vercel** (Deployments → Dernier déploiement → Onglet "Building")
2. **Partager l'URL du déploiement** (ex: `secureid-app-abc123.vercel.app`)
3. **Vérifier que GitHub a bien tous les fichiers**: https://github.com/Web-Lab-Dev/secureid-app

---

## ✨ Dernière Vérification

Fichiers requis dans le repo GitHub:

- [x] `secureid-app/package.json` ✓
- [x] `secureid-app/next.config.ts` ✓
- [x] `secureid-app/src/app/page.tsx` ✓
- [x] `vercel.json` (à la racine) ✓

Tout est prêt côté GitHub! Le problème est juste la configuration Vercel.

---

## 🎬 Action Immédiate

**ESSAYEZ MÉTHODE 1 EN PREMIER**:

1. Vercel Dashboard → Settings → General
2. Root Directory = `secureid-app`
3. Save
4. Deployments → Redeploy

Si ça ne marche pas → Essayez Méthode 2 (recréer le projet)
