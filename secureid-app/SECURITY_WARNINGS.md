# ⚠️ AVERTISSEMENTS DE SÉCURITÉ CRITIQUES

## 🔴 ACTIONS OBLIGATOIRES AVANT DÉPLOIEMENT EN PRODUCTION

### 1. Révoquer les secrets exposés dans `.env.local`

Le fichier `.env.local` contient actuellement des credentials réels qui **NE DOIVENT PAS** être versionnés dans Git.

#### Secrets à révoquer immédiatement :

1. **Gmail App Password** (`SMTP_PASS`)
   - Aller sur https://myaccount.google.com/apppasswords
   - Révoquer le mot de passe actuel
   - Générer un nouveau mot de passe

2. **Resend API Key** (`RESEND_API_KEY`)
   - Aller sur https://resend.com/api-keys
   - Supprimer la clé actuelle
   - Créer une nouvelle clé API

3. **Google Maps API Key** (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`)
   - Aller sur https://console.cloud.google.com/apis/credentials
   - Supprimer la clé actuelle
   - Créer une nouvelle clé avec restrictions appropriées

#### Vérifier l'historique Git :

```bash
# Vérifier si .env.local est dans l'historique
git log --all --full-history -- .env.local

# Si oui, purger l'historique (DANGEREUX - backup d'abord!)
# Utiliser BFG Repo-Cleaner ou git-filter-repo
```

### 2. Configurer les variables d'environnement sur Vercel

Une fois les nouveaux secrets générés :

1. Aller sur Vercel Dashboard > Votre projet > Settings > Environment Variables
2. Ajouter chaque secret avec le scope approprié :
   - `Production` : pour la production
   - `Preview` : pour les branches preview
   - `Development` : pour le développement local

**Liste des variables à configurer** :

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin SDK
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Email (SMTP)
SMTP_USER=
SMTP_PASS=

# Email (Resend)
RESEND_API_KEY=
ADMIN_EMAIL=

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

### 3. Migration des PINs médicaux

Les PINs existants en clair dans Firestore doivent être migrés vers bcrypt.

#### Migration automatique

Le système migre automatiquement les PINs à la première vérification réussie. Aucune action manuelle nécessaire.

Pour forcer la migration de tous les profils :

```typescript
// Script de migration (à exécuter UNE FOIS)
import { adminDb } from './lib/firebase-admin';
import { hashPin } from './lib/pin-helper';

async function migrateAllPins() {
  const profiles = await adminDb.collection('profiles').get();

  for (const doc of profiles.docs) {
    const data = doc.data();

    if (data.doctorPin && !data.doctorPin.startsWith('$2a$')) {
      // PIN en clair, le hasher
      const hashedPin = await hashPin(data.doctorPin);
      await doc.ref.update({ doctorPin: hashedPin });
      console.log(`Migrated PIN for profile ${doc.id}`);
    }
  }

  console.log('Migration complete');
}
```

### 4. Déployer les règles Firestore

Une nouvelle collection `rate_limits` a été ajoutée. Mettre à jour les règles :

```bash
# Éditer firestore.rules
nano firestore.rules

# Ajouter à la fin :
match /rate_limits/{key} {
  // Réservé aux Server Actions (Admin SDK)
  allow read, write: if false;
}

# Déployer
firebase deploy --only firestore:rules
```

### 5. Configurer Firebase App Check (Recommandé)

Pour prévenir l'abus des API publiques :

1. Aller sur Firebase Console > App Check
2. Activer reCAPTCHA v3 pour le web
3. Ajouter le code dans `_app.tsx` :

```typescript
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

if (typeof window !== 'undefined') {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('VOTRE_RECAPTCHA_SITE_KEY'),
    isTokenAutoRefreshEnabled: true
  });
}
```

### 6. Configurer le monitoring (Recommandé)

#### Sentry pour error tracking :

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

#### Vercel Analytics :

1. Aller sur Vercel Dashboard > Votre projet > Analytics
2. Activer "Speed Insights" et "Web Vitals"

---

## 🟠 LIMITATIONS ACTUELLES

### Rate Limiting

Le rate limiting utilise maintenant Firestore pour la persistance, mais :

- **Coût** : Chaque vérification de PIN = 1 lecture Firestore
- **Latence** : ~50-100ms de latence ajoutée
- **Alternative** : Migrer vers Redis (Upstash) pour meilleures performances

### Content Security Policy

La CSP actuelle utilise `'unsafe-inline'` et `'unsafe-eval'` car Next.js en a besoin.

Pour une CSP stricte :
- Utiliser des nonces pour les scripts inline
- Externaliser tous les styles inline
- Configurer Next.js avec `experimental.strictCsp`

### Firestore Rules Publiques

Les collections `bracelets` et `profiles` sont lisibles publiquement (pour urgence médicale).

**Risques** :
- Énumération de tous les bracelets
- Scraping des données enfants
- Violation RGPD potentielle

**Mitigations** :
- Firebase App Check (limiter aux apps légitimes)
- Rate limiting global par IP
- Monitoring des accès suspects
- Considérer un système de "view tokens" temporaires

---

## 🟢 AMÉLIORATIONS IMPLÉMENTÉES

### ✅ Sécurité

- [x] PINs médicaux hashés avec bcrypt (migration automatique)
- [x] Rate limiting persistant avec Firestore
- [x] Validation stricte des données (Zod)
- [x] Error codes structurés
- [x] Headers de sécurité (CSP, HSTS, Permissions-Policy)
- [x] Logs sans données sensibles (hashage des téléphones)

### ✅ Code Quality

- [x] Suppression des `any` TypeScript
- [x] Fix race conditions (useProfiles, QRScanner)
- [x] Fix memory leaks (Google Maps markers/listeners)
- [x] Hooks GPS extraits (useGpsSimulation, useGeofencing, useGoogleMapsMarkers)
- [x] Cleanup approprié des timers et event listeners

### ✅ Performance

- [x] Cache en mémoire pour rate limiting (1 minute TTL)
- [x] Mocks TypeScript pour le build
- [x] Cleanup Google Maps markers avec event listeners

---

## 📋 CHECKLIST AVANT DÉPLOIEMENT

- [ ] Révoquer tous les secrets exposés (Gmail, Resend, Google Maps)
- [ ] Configurer toutes les variables d'environnement sur Vercel
- [ ] Déployer les règles Firestore mises à jour
- [ ] Tester la migration automatique des PINs
- [ ] Configurer Firebase App Check
- [ ] Configurer Sentry pour le monitoring
- [ ] Activer Vercel Analytics
- [ ] Tester le rate limiting en production
- [ ] Vérifier les logs de sécurité
- [ ] Documenter les procédures d'urgence

---

## 🆘 EN CAS DE COMPROMISSION

### Si un secret est exposé publiquement :

1. **Immédiatement** :
   - Révoquer le secret compromis
   - Vérifier les logs d'accès (Gmail, Resend, Google Cloud)
   - Générer un nouveau secret
   - Mettre à jour Vercel
   - Redéployer l'application

2. **Dans les 24h** :
   - Analyser l'étendue de la compromission
   - Notifier les utilisateurs si données exposées
   - Documenter l'incident
   - Mettre en place des mesures préventives

3. **Suivi** :
   - Audit de sécurité complet
   - Révision des accès Firebase
   - Formation de l'équipe

---

## 📞 CONTACTS SÉCURITÉ

- **Firebase Support** : https://firebase.google.com/support/contact
- **Vercel Support** : https://vercel.com/help
- **Google Cloud Security** : https://cloud.google.com/security

---

**Dernière mise à jour** : 29 Décembre 2025
**Version application** : 0.1.1
**Audit de sécurité** : Complété
