# Mise à jour des règles Firestore

## Nouvelle collection: rate_limits

Ajouter cette règle dans `firestore.rules`:

```javascript
// Collection: rate_limits (rate limiting persistant)
match /rate_limits/{key} {
  // Lecture/écriture réservée aux Server Actions (Admin SDK)
  allow read, write: if false;
}
```

**Pourquoi**:
- La collection `rate_limits` est utilisée uniquement par les Server Actions avec Admin SDK
- Pas d'accès client nécessaire
- Sécurité renforcée contre la manipulation côté client

## Déploiement

1. Éditer le fichier `firestore.rules`
2. Déployer avec: `firebase deploy --only firestore:rules`
3. Ou via la console Firebase: https://console.firebase.google.com/

## Nettoyage automatique (TTL)

Firebase Firestore ne supporte pas nativement les TTL. Deux options:

### Option 1: Cloud Function de nettoyage (Recommandé)
Créer une Cloud Function qui s'exécute quotidiennement:

```typescript
// functions/src/cleanup-rate-limits.ts
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

export const cleanupRateLimits = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async () => {
    const now = Date.now();
    const fifteenMinutesAgo = now - (15 * 60 * 1000);

    const db = admin.firestore();
    const snapshot = await db.collection('rate_limits').get();

    const batch = db.batch();
    let count = 0;

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.firstAttempt < fifteenMinutesAgo) {
        batch.delete(doc.ref);
        count++;
      }
    });

    await batch.commit();
    console.log(`Cleaned up ${count} expired rate limit entries`);
  });
```

### Option 2: Firebase Extensions
Installer l'extension "Delete Collections" avec un schedule quotidien.

## Monitoring

Ajouter un index composite si nécessaire pour les requêtes:
- Collection: `rate_limits`
- Champs: `firstAttempt` (Ascending)
- Query scope: Collection
