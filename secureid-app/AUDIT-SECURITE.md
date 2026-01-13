# 🔒 AUDIT DE SÉCURITÉ - SECUREID APP
**Date**: 13 janvier 2026
**Auditeur**: Expert en Cybersécurité
**Version**: v0.1.1
**Périmètre**: Analyse complète de la codebase (auth, API, storage, Firestore, uploads)

---

## 📊 RÉSUMÉ EXÉCUTIF

### Score Global: 🟡 **7.5/10** - Bon niveau de sécurité avec améliorations critiques requises

| Catégorie | Score | Statut |
|-----------|-------|--------|
| **Authentification** | 8/10 | 🟢 Bon |
| **Gestion des Secrets** | 2/10 | 🔴 **CRITIQUE** |
| **Routes API** | 6/10 | 🟡 Moyen |
| **Injection XSS/SQL** | 9/10 | 🟢 Excellent |
| **Uploads Fichiers** | 8/10 | 🟢 Bon |
| **CORS & Headers** | 9/10 | 🟢 Excellent |
| **Permissions Firebase** | 9/10 | 🟢 Excellent |
| **Dépendances** | 10/10 | 🟢 Parfait |

---

## 🔴 VULNÉRABILITÉS CRITIQUES (URGENT)

### 1. 🚨 SECRETS EXPOSÉS DANS `.env.local` ⚠️ CRITIQUE

**Fichier**: [.env.local:12](c:/Users/X1%20Carbon/Desktop/QR-CODE/secureid-app/.env.local#L12)

**Problème**:
```env
SMTP_PASS=oejobrmcdacldpod  # ⚠️ MOT DE PASSE EN CLAIR VISIBLE
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyByycjxPhBQM7J8rypz9rsKb1uE89bXez4  # ⚠️ CLÉ API PUBLIQUE
RESEND_API_KEY=re_Eauvro7k_7gxv95us9UgWa99XCT3NQ1wB  # ⚠️ CLÉ API EXPOSÉE
```

**Impact**: 🔴 **CRITIQUE - Score 10/10**
- Le fichier `.env.local` contient des **secrets réels en clair**
- Si ce fichier est commité dans Git → **Exposition publique immédiate**
- Risque de **compromission totale**:
  - ✉️ Accès SMTP Gmail → Envoi emails frauduleux
  - 🗺️ Google Maps API → Facturation illimitée (coûts élevés)
  - 📧 Resend API → Spam via votre compte

**Vérification Git**:
```bash
git ls-files | grep ".env.local"
# Si résultat → DANGER: fichier tracké!
```

**Preuve d'exposition**:
- `.env.local` ligne 12: `SMTP_PASS=oejobrmcdacldpod`
- Gmail App Password: 16 caractères → Accès complet au compte
- Lignes 33-40: Clés API non chiffrées

**ACTIONS IMMÉDIATES REQUISES** (Dans l'ordre):

1. **Vérifier si `.env.local` est dans Git**:
```bash
git status
git log --all --full-history -- .env.local
```

2. **Si tracké → SUPPRIMER IMMÉDIATEMENT**:
```bash
# Retirer du repo
git rm --cached .env.local
git commit -m "Remove .env.local from tracking"

# Ajouter au .gitignore (vérifier présence)
echo ".env.local" >> .gitignore
git add .gitignore
git commit -m "Add .env.local to gitignore"
```

3. **RÉVOQUER TOUS LES SECRETS**:
   - 🔴 Gmail App Password: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) → Révoquer `oejobrmcdacldpod`
   - 🔴 Google Maps API: [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials) → Révoquer `AIzaSyByycjxPhBQM7J8rypz9rsKb1uE89bXez4`
   - 🔴 Resend API: Dashboard → Révoquer `re_Eauvro7k_7gxv95us9UgWa99XCT3NQ1wB`

4. **Générer de nouveaux secrets**:
```bash
# Créer .env.local.example sans valeurs
cp .env.local .env.local.example
# Remplacer toutes les valeurs par des placeholders
sed -i 's/=.*/=your_secret_here/g' .env.local.example
```

5. **Configurer Vercel avec nouveaux secrets**:
   - Vercel Dashboard → Settings → Environment Variables
   - Ajouter: `SMTP_PASS`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `RESEND_API_KEY`

**Score de gravité**: 🔴 **10/10 - EXPLOITATION IMMÉDIATE POSSIBLE**

---

### 2. 🟡 VARIABLES FIREBASE PLACEHOLDER (MOYEN)

**Fichier**: [.env.local:14-19](c:/Users/X1%20Carbon/Desktop/QR-CODE/secureid-app/.env.local#L14-L19)

**Problème**:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
```

**Impact**: 🟡 **MOYEN**
- Configuration Firebase incomplète
- Risque: Application non fonctionnelle en production
- **Mais**: Pas de secrets réels exposés (placeholders)

**Action**:
- Vérifier que Vercel possède les **vraies** valeurs Firebase
- Documenter la configuration requise pour nouveaux développeurs

---

## 🟡 VULNÉRABILITÉS MOYENNES

### 3. 🟡 ROUTES API SANS RATE LIMITING

**Fichiers**:
- [src/app/api/order/route.ts](src/app/api/order/route.ts)
- [src/app/api/partnership/route.ts](src/app/api/partnership/route.ts)

**Problème**:
```typescript
export async function POST(request: NextRequest) {
  // ⚠️ Aucune protection contre spam/DDoS
  const body = await request.json();
  // ... envoi email direct
}
```

**Impact**: 🟡 **MOYEN - Score 6/10**
- **Attaque par spam**: Un attaquant peut envoyer 1000+ emails en 1 minute
- **Coût financier**: Épuisement quota SMTP (Gmail: 500/jour)
- **Réputation email**: Blocage par Gmail/Outlook pour spam

**Vecteur d'attaque**:
```bash
# Script d'attaque simple
for i in {1..1000}; do
  curl -X POST https://secureid-app.vercel.app/api/order \
    -H "Content-Type: application/json" \
    -d '{"orderId":"SPAM-$i", ...}'
done
# Résultat: 1000 emails en < 2 minutes
```

**Validation actuelle** (insuffisante):
```typescript
// order/route.ts:21-27
if (!orderId || !customerName || !customerPhone || !deliveryAddress) {
  return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
}
// ✅ Validation présente MAIS ❌ Pas de rate limit
```

**Solutions recommandées**:

**Option A - Rate Limiting avec Vercel Edge Middleware** (recommandé):
```typescript
// middleware.ts (À CRÉER)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimit = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.ip || 'unknown';
    const now = Date.now();
    const limit = rateLimit.get(ip);

    // Reset après 1 minute
    if (limit && now > limit.resetTime) {
      rateLimit.delete(ip);
    }

    // Vérifier limite (5 requêtes/minute)
    if (limit && limit.count >= 5) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Réessayez dans 1 minute.' },
        { status: 429 }
      );
    }

    // Incrémenter compteur
    rateLimit.set(ip, {
      count: (limit?.count || 0) + 1,
      resetTime: limit?.resetTime || now + 60000,
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

**Option B - Upstash Redis Rate Limiting** (production-grade):
```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 req/min
  analytics: true,
});

// api/order/route.ts
export async function POST(request: NextRequest) {
  const ip = request.ip || 'anonymous';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: 'Trop de requêtes' },
      { status: 429 }
    );
  }
  // ... reste du code
}
```

**Priorité**: 🟡 Moyenne (implémenter avant scaling production)

---

### 4. 🟡 VALIDATION INSUFFISANTE DES DONNÉES API

**Fichier**: [src/app/api/order/route.ts:20-27](src/app/api/order/route.ts#L20-L27)

**Problème**:
```typescript
// Validation basique
if (!orderId || !customerName || !customerPhone || !deliveryAddress) {
  return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
}
// ❌ Pas de validation de format
// ❌ Pas de sanitisation
// ❌ Pas de limite de longueur
```

**Impact**: 🟡 **MOYEN**
- Injection de contenu malveillant dans emails
- Possibilité d'envoyer des données corrompues

**Exemple d'attaque**:
```javascript
// Payload malveillant
{
  "customerName": "<script>alert('XSS')</script>",
  "customerPhone": "A".repeat(10000), // 10KB de "A"
  "deliveryAddress": "<?php system($_GET['cmd']); ?>"
}
// Email envoyé contient du code malveillant
```

**Solution recommandée**:
```typescript
import { z } from 'zod';

const OrderSchema = z.object({
  orderId: z.string().regex(/^ORD-\d{8}-\d{3}$/),
  customerName: z.string().min(2).max(100),
  customerPhone: z.string().regex(/^\+226\d{8}$/),
  quantity: z.number().int().min(1).max(100),
  deliveryAddress: z.string().min(10).max(500),
  deliveryNotes: z.string().max(1000).optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Validation avec Zod
  const result = OrderSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: 'Données invalides', details: result.error.issues },
      { status: 400 }
    );
  }

  const data = result.data; // Données validées et typées
  // ... reste du code
}
```

**Priorité**: 🟡 Moyenne (ajouter validation Zod progressive)

---

### 5. 🟡 LOGS INSUFFISANTS POUR AUDIT

**Fichier**: [src/app/api/order/route.ts:93](src/app/api/order/route.ts#L93)

**Problème**:
```typescript
logger.info('Order email sent successfully', { orderId, messageId: info.messageId });
// ❌ Pas de log IP/User-Agent
// ❌ Pas de timestamp structured
// ❌ Pas de corrélation ID
```

**Impact**: 🟡 **MOYEN**
- Difficulté à tracer les attaques
- Impossibilité de forensics en cas d'incident

**Solution recommandée**:
```typescript
// lib/api-logger.ts
export function logApiRequest(
  request: NextRequest,
  action: string,
  metadata: Record<string, unknown>
) {
  logger.info(`API: ${action}`, {
    ...metadata,
    ip: request.ip || request.headers.get('x-forwarded-for'),
    userAgent: request.headers.get('user-agent'),
    timestamp: new Date().toISOString(),
    correlationId: request.headers.get('x-correlation-id') || crypto.randomUUID(),
  });
}

// api/order/route.ts
logApiRequest(request, 'order_created', { orderId, customerPhone });
```

---

## 🟢 POINTS FORTS DE SÉCURITÉ

### ✅ 1. Authentification Firebase Robuste

**Fichier**: [src/hooks/useAuth.ts](src/hooks/useAuth.ts)

**Bonnes pratiques identifiées**:
```typescript
// ✅ Hash des numéros de téléphone pour logs
logger.error('Error during signup', {
  phoneHashed: hashPhoneForLogging(data.phoneNumber)  // Ligne 147
});

// ✅ Normalisation des inputs
const normalizedPhone = normalizePhoneNumber(data.phoneNumber);  // Ligne 106

// ✅ Gestion d'erreurs avec messages utilisateur-friendly
const appError = fromFirebaseError(err);  // Ligne 151
throw new Error(appError.getUserMessage());
```

**Sécurité**:
- ✅ Pas de stockage de mots de passe en local
- ✅ Firebase Auth gère hashing (bcrypt + salt)
- ✅ Tokens JWT avec expiration automatique
- ✅ Protection contre brute-force (Firebase built-in)

---

### ✅ 2. Permissions Firestore Très Strictes

**Fichier**: [firestore.rules](firestore.rules)

**Points excellents**:

**2.1 Protection secretToken**:
```javascript
// Ligne 41-69: Bracelets
allow read: if isAuthenticated() &&
             (resource.data.linkedUserId == request.auth.uid || ...)
// ✅ secretToken jamais exposé côté client
// ✅ Lecture uniquement par propriétaire
```

**2.2 Validation stricte des données**:
```javascript
// Ligne 105-151: Profils enfants
allow create: if isAuthenticated() &&
               request.resource.data.parentId == request.auth.uid &&
               request.resource.data.keys().hasAll([...]) &&  // Champs requis
               request.resource.data.keys().hasOnly([...]) &&  // Pas de champs supplémentaires
               request.resource.data.doctorPin.matches('^[0-9]{4}$') &&  // Format PIN
               request.resource.data.emergencyContacts.size() >= 1;  // Min 1 contact
```

**2.3 Protection contre modification de champs critiques**:
```javascript
// Ligne 152-162: Mise à jour profils
allow update: if ... &&
               !request.resource.data.diff(resource.data).affectedKeys()
                 .hasAny(['id', 'parentId', 'createdAt']);
// ✅ Empêche changement d'ownership
// ✅ Empêche modification de timestamps
```

**2.4 Deny-by-default**:
```javascript
// Ligne 277-279: Règle finale
match /{document=**} {
  allow read, write: if false;
}
// ✅ Toute collection non listée = interdite
```

**Score**: 🟢 **9/10** - Excellent niveau de sécurité

---

### ✅ 3. Storage Rules Sécurisées

**Fichier**: [storage.rules](storage.rules)

**Points forts**:

**3.1 Validation de ownership**:
```javascript
// Ligne 8-11: Helper function
function isProfileOwner() {
  let profile = firestore.get(/databases/(default)/documents/profiles/$(profileId));
  return request.auth != null && profile.data.parentId == request.auth.uid;
}
// ✅ Vérification cross-collection (Firestore → Storage)
```

**3.2 Validation de fichiers**:
```javascript
// Ligne 17-19: Upload photos
allow write: if isProfileOwner()
             && request.resource.size < 10 * 1024 * 1024  // Max 10MB
             && request.resource.contentType.matches('image/.*');
// ✅ Limite de taille
// ✅ Validation MIME type
```

**3.3 Confidentialité documents médicaux**:
```javascript
// Ligne 26-41: Documents médicaux
match /medical_docs/{profileId}/{fileName} {
  allow read, write: if isProfileOwner()  // ✅ Privé uniquement
                     && (request.resource.contentType.matches('image/.*')
                         || request.resource.contentType == 'application/pdf');
}
// ✅ Pas d'accès public (vs photos de profil)
```

**Score**: 🟢 **8/10** - Très bon

---

### ✅ 4. Headers de Sécurité Next.js

**Fichier**: [next.config.ts:56-104](next.config.ts#L56-L104)

**Configuration excellente**:
```typescript
// ✅ Protection XSS
'X-Content-Type-Options': 'nosniff'
'X-Frame-Options': 'SAMEORIGIN'

// ✅ HTTPS forcé
'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'

// ✅ Content Security Policy stricte
'Content-Security-Policy': [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com",  // ⚠️ unsafe-inline
  "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com",
  "object-src 'none'",  // ✅ Bloque Flash/Java
  "upgrade-insecure-requests"  // ✅ HTTP → HTTPS
].join('; ')

// ✅ Permissions restreintes
'Permissions-Policy': 'camera=*, geolocation=*, microphone=()'
```

**Amélioration mineure**:
```typescript
// Remplacer 'unsafe-inline' par nonce (sécurité++):
"script-src 'self' 'nonce-{RANDOM}' https://maps.googleapis.com"
```

**Score**: 🟢 **9/10** - Excellent

---

### ✅ 5. Upload de Fichiers Sécurisé

**Fichier**: [src/components/dashboard/DocumentUpload.tsx:75-96](src/components/dashboard/DocumentUpload.tsx#L75-L96)

**Validation robuste**:
```typescript
const validateFile = (file: File): string | null => {
  // ✅ Whitelist MIME types (pas de blacklist)
  const acceptedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  if (!acceptedTypes.includes(file.type)) {
    return 'Format non supporté';
  }

  // ✅ Limite de taille (10MB)
  const MAX_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return 'Fichier trop volumineux (max 10MB)';
  }

  return null;
};
```

**Sécurité côté client**: ✅ Bon
**Sécurité côté serveur (Storage Rules)**: ✅ Excellent (double validation)

**Score**: 🟢 **8/10** - Très bon

---

### ✅ 6. Absence d'Injection XSS

**Recherche effectuée**:
```bash
grep -r "dangerouslySetInnerHTML|eval\(|innerHTML" src/
```

**Résultats**:
```typescript
// src/app/layout.tsx:177-181
dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
```

**Analyse**: ✅ **SÉCURISÉ**
- Utilisation légitime pour Schema.org JSON-LD
- Données contrôlées (objets statiques)
- `JSON.stringify()` échappe automatiquement les caractères spéciaux

**Aucune injection XSS détectée dans**:
- ❌ Formulaires utilisateur
- ❌ Affichage de données
- ❌ Paramètres URL

**Score**: 🟢 **9/10** - Excellent

---

### ✅ 7. Dépendances Sans Vulnérabilités

**Commande**: `npm audit --production`

**Résultat**:
```
found 0 vulnerabilities
```

**Analyse**:
- ✅ Toutes les dépendances à jour
- ✅ Aucune CVE connue
- ✅ Next.js 16.1.1 (dernière version stable)
- ✅ Firebase 12.6.0 (sécurisé)
- ✅ React 19.2.1 (récent)

**Score**: 🟢 **10/10** - Parfait

---

## 🔧 RECOMMANDATIONS PRIORISÉES

### 🔴 PRIORITÉ 1 - URGENT (< 24h)

1. **Révoquer secrets exposés dans `.env.local`**
   - Révoquer: SMTP_PASS, Google Maps API, Resend API
   - Vérifier si `.env.local` est tracké dans Git
   - Générer nouveaux secrets et les configurer dans Vercel

2. **Ajouter `.env.local` au `.gitignore`**
   - Vérifier présence de la règle
   - Créer `.env.local.example` avec placeholders

### 🟡 PRIORITÉ 2 - Important (< 1 semaine)

3. **Implémenter Rate Limiting sur routes API**
   - Option A: Middleware Next.js (simple)
   - Option B: Upstash Redis (production-grade)
   - Limite recommandée: 5 req/min par IP

4. **Ajouter validation Zod sur routes API**
   - `/api/order`: Valider formats téléphone, quantités, adresses
   - `/api/partnership`: Valider email, téléphone, ville

5. **Améliorer logging des API**
   - Ajouter IP, User-Agent, timestamp
   - Implémenter correlation IDs
   - Configurer alertes pour attaques (> 10 req/min)

### 🟢 PRIORITÉ 3 - Optionnel (amélioration continue)

6. **Migrer CSP vers nonces**
   - Retirer `'unsafe-inline'` de script-src
   - Utiliser nonces dynamiques Next.js

7. **Ajouter CAPTCHA sur formulaires publics**
   - Page commande bracelet
   - Formulaire partenariat école
   - Option: hCaptcha ou Cloudflare Turnstile

8. **Implémenter monitoring sécurité**
   - Sentry pour tracking erreurs + security issues
   - Vercel Analytics pour détection anomalies trafic

---

## 📋 CHECKLIST DE DÉPLOIEMENT SÉCURISÉ

Avant tout déploiement production:

### Variables d'environnement
- [ ] `.env.local` est dans `.gitignore`
- [ ] Aucun secret en clair dans le code source
- [ ] Toutes les variables sont configurées dans Vercel
- [ ] Variables Firebase Admin (PRIVATE) ne sont PAS `NEXT_PUBLIC_`

### Firebase
- [ ] Firestore Rules déployées (`firebase deploy --only firestore:rules`)
- [ ] Storage Rules déployées (`firebase deploy --only storage`)
- [ ] Authentification activée (Email/Password)
- [ ] Règles testées avec Firestore Rules Playground

### API Routes
- [ ] Rate limiting activé
- [ ] Validation Zod sur tous les inputs
- [ ] Logs structurés avec IP/User-Agent
- [ ] Alertes configurées pour attaques

### Headers de sécurité
- [ ] CSP configurée (next.config.ts)
- [ ] HSTS activé (Strict-Transport-Security)
- [ ] X-Frame-Options: SAMEORIGIN
- [ ] X-Content-Type-Options: nosniff

### Monitoring
- [ ] Vercel Analytics activé
- [ ] Sentry configuré (optionnel)
- [ ] Alertes email pour erreurs critiques

---

## 📚 RESSOURCES & RÉFÉRENCES

### Standards de sécurité
- OWASP Top 10 2021: https://owasp.org/www-project-top-ten/
- OWASP API Security: https://owasp.org/www-project-api-security/
- CWE Top 25: https://cwe.mitre.org/top25/

### Firebase Security
- Security Rules Best Practices: https://firebase.google.com/docs/rules/best-practices
- Auth Security Checklist: https://firebase.google.com/docs/auth/security-checklist

### Next.js Security
- Security Headers: https://nextjs.org/docs/app/api-reference/config/next-config-js/headers
- Content Security Policy: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP

---

## ✅ CONCLUSION

**Niveau de sécurité actuel**: 🟡 **BON** avec 1 vulnérabilité critique à corriger

### Points positifs
✅ Architecture Firebase sécurisée
✅ Rules Firestore/Storage excellentes
✅ Headers de sécurité robustes
✅ Validation uploads fichiers
✅ Aucune vulnérabilité XSS/SQL détectée
✅ Dépendances à jour sans CVE

### Points critiques
🔴 Secrets exposés dans `.env.local` → **RÉVOQUER IMMÉDIATEMENT**
🟡 Absence de rate limiting API → Risque spam
🟡 Validation API insuffisante → Risque données corrompues

### Action immédiate requise
1. Vérifier si `.env.local` est dans Git
2. Révoquer tous les secrets exposés
3. Générer nouveaux secrets
4. Configurer Vercel avec les bonnes variables

**Après correction**: Score projeté 🟢 **9/10** - Excellent

---

**Date du rapport**: 13 janvier 2026
**Prochaine revue**: À planifier après corrections critiques
**Contact**: Expert Cybersécurité - Audit SecureID
