# 🔍 Debug Notifications Push - Checklist

## Problème: Notifications ne s'affichent pas sur le téléphone

### ✅ Étapes de vérification

#### 1. Vérifier que la clé VAPID est bien configurée

Dans la console navigateur (Chrome DevTools):
```javascript
console.log(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY);
// Doit afficher votre clé VAPID (commence par B...)
```

#### 2. Vérifier que le token FCM est bien sauvegardé

Dans Firestore Console:
- Aller dans `users/{votre-user-id}`
- Vérifier que le champ `fcmToken` existe
- Vérifier que `fcmTokenUpdatedAt` est récent

Ou dans la console navigateur:
```javascript
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const userRef = doc(db, 'users', 'VOTRE_USER_ID');
const snap = await getDoc(userRef);
console.log('FCM Token:', snap.data()?.fcmToken);
```

#### 3. Vérifier que le Service Worker est enregistré

Dans Chrome DevTools → Application → Service Workers:
- Doit voir `firebase-messaging-sw.js` avec status "activated"

Ou dans la console:
```javascript
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs);
});
```

#### 4. Tester l'envoi manuel de notification

Dans la console Vercel (backend logs), après un scan:
```
Emergency scan notification sent
parentId: ...
childName: ...
scanId: ...
```

Si ce log n'apparaît PAS, le problème est côté serveur.

#### 5. Vérifier les erreurs FCM

Dans les logs Vercel, chercher:
```
Error sending notification
```

Erreurs courantes:
- `registration-token-not-registered`: Token FCM invalide/expiré
- `invalid-argument`: Format du message incorrect
- `authentication-error`: Problème avec les credentials Firebase Admin

---

## 🐛 Problèmes identifiés

### Problème 1: Format du message FCM incorrect

Le code actuel dans `notification-actions.ts` envoie:
```typescript
webpush: {
  notification: {
    vibrate: [200, 100, 200],  // ← PROBLÈME: vibrate pas supporté dans webpush
  }
}
```

**Solution**: Retirer `vibrate` du webpush (seulement pour Android/APNS)

### Problème 2: Service Worker peut ne pas recevoir le message

Si le format du message FCM n'est pas correct, le Service Worker ne le reçoit jamais.

**Test**: Envoyer un message de test depuis Firebase Console:
1. Firebase Console → Cloud Messaging
2. "Send your first message"
3. Notification title: "Test"
4. Notification text: "Test message"
5. Target: Token FCM (copier depuis Firestore)
6. Send

Si ça fonctionne → Problème dans notre code serveur
Si ça ne fonctionne pas → Problème configuration Firebase/VAPID

---

## 🔧 Corrections à appliquer

### Fix 1: Retirer vibrate du webpush

Dans `src/actions/notification-actions.ts`:

```typescript
webpush: {
  notification: {
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    // vibrate: [200, 100, 200],  // ← RETIRER CETTE LIGNE
    requireInteraction: true,
    tag: 'secureid-scan',
  },
  fcmOptions: {
    link: '/dashboard',
  },
},
```

### Fix 2: Ajouter logging détaillé

Dans `src/actions/notification-actions.ts`, après `admin.messaging().send()`:

```typescript
logger.info('FCM message sent successfully', {
  messageId: response,
  parentId,
  title,
  body,
});
```

### Fix 3: Tester avec console.log dans le Service Worker

Dans `public/firebase-messaging-sw.js`:

```javascript
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Message received!', payload);

  // Force notification même si le format est étrange
  self.registration.showNotification('Test Notification', {
    body: 'Message reçu dans le SW',
    icon: '/icon-192x192.png',
  });
});
```

---

## 📱 Test en conditions réelles

### Scénario de test complet:

1. **Sur ordinateur (Chrome):**
   - Aller sur /dashboard
   - Accepter les notifications
   - Ouvrir DevTools → Console
   - Vérifier: `Service Worker registered`

2. **Scanner le bracelet depuis un autre appareil**

3. **Vérifier les logs:**
   - Console navigateur: Chercher "Foreground message received"
   - Logs Vercel: Chercher "Notification sent successfully"

4. **Si aucun message reçu:**
   - Vérifier Firestore `users/{userId}.fcmToken` existe
   - Vérifier Vercel logs pour erreurs FCM
   - Tester envoi manuel depuis Firebase Console

---

## 🚨 Checklist avant déploiement production

- [ ] VAPID key configurée dans Vercel (production)
- [ ] Firebase Cloud Messaging API activée dans Google Cloud
- [ ] Token FCM sauvegardé dans Firestore après activation
- [ ] Service Worker enregistré (`firebase-messaging-sw.js`)
- [ ] Test notification depuis Firebase Console fonctionne
- [ ] Test notification après scan fonctionne
- [ ] Notification affichée même téléphone en veille
- [ ] Clic sur notification ouvre `/dashboard`

---

## 🔍 Debugging avancé

### Voir tous les messages dans la console Service Worker

Dans Chrome DevTools:
1. Application → Service Workers
2. Cliquer sur "firebase-messaging-sw.js"
3. Une nouvelle DevTools s'ouvre → Console
4. Scanner un bracelet
5. Chercher: `[firebase-messaging-sw.js] Background message received`

Si ce message n'apparaît PAS, le problème est que le message FCM n'arrive jamais au Service Worker.

### Causes possibles:

1. **Format message incorrect**: Le serveur envoie un format que FCM rejette
2. **Token invalide**: Le token FCM est expiré
3. **VAPID key incorrecte**: La clé ne correspond pas au token
4. **Permissions refusées**: L'utilisateur a refusé les notifications

---

## 📞 Support Firebase

Si rien ne fonctionne:
- Firebase Console → Cloud Messaging → Metrics
- Voir le nombre de messages envoyés vs delivered
- Si envoyés > 0 mais delivered = 0 → Problème côté client
- Si envoyés = 0 → Problème côté serveur

---

**Dernière mise à jour**: 29 Décembre 2025
