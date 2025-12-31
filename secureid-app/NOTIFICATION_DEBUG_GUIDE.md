# GUIDE DE DÉBOGAGE - NOTIFICATIONS EN ARRIÈRE-PLAN

**Date**: 31 Décembre 2025
**Problème**: Notifications s'affichent dans l'app mais pas en arrière-plan (téléphone en veille)

---

## 🔍 DIAGNOSTIC ÉTAPE PAR ÉTAPE

### Étape 1: Vérifier les permissions navigateur

**Sur Android (Chrome/Firefox)**:

1. **Paramètres du téléphone** → Applications → Chrome/Firefox
2. Vérifier:
   - ✅ Notifications autorisées
   - ✅ "Ne pas optimiser la batterie" pour Chrome/Firefox
   - ✅ Pas de mode "Ne pas déranger" actif

3. **Paramètres Chrome**:
   ```
   chrome://settings/content/notifications
   ```
   - Chercher "secureid-app.vercel.app"
   - Doit être dans "Autorisé"

4. **Test de permission**:
   - Aller sur https://secureid-app.vercel.app/dashboard
   - Console (F12):
     ```javascript
     console.log('Permission:', Notification.permission);
     // Doit afficher "granted"
     ```

---

### Étape 2: Vérifier le Service Worker

**Dans la console navigateur** (sur https://secureid-app.vercel.app/dashboard):

```javascript
// 1. Vérifier que le Service Worker est enregistré
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs.length);
  regs.forEach(reg => {
    console.log('  Scope:', reg.scope);
    console.log('  Active:', reg.active?.scriptURL);
    console.log('  State:', reg.active?.state);
  });
});

// ✅ Résultat attendu:
// Service Workers: 1
//   Scope: https://secureid-app.vercel.app/
//   Active: https://secureid-app.vercel.app/firebase-messaging-sw.js
//   State: activated

// ❌ Si 0 Service Workers: Problème d'enregistrement
```

**Si le Service Worker n'est pas enregistré**:

```javascript
// Forcer le rechargement du Service Worker
navigator.serviceWorker.register('/firebase-messaging-sw.js')
  .then(reg => console.log('✅ SW registered:', reg))
  .catch(err => console.error('❌ SW registration failed:', err));
```

---

### Étape 3: Vérifier le token FCM

**Dans la console navigateur**:

```javascript
// Vérifier que le token FCM a été généré et sauvegardé
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const auth = getAuth();
const userId = auth.currentUser?.uid;

if (userId) {
  const userRef = doc(db, 'users', userId);
  getDoc(userRef).then(snap => {
    const data = snap.data();
    console.log('FCM Token:', data?.fcmToken ? '✅ Présent' : '❌ Absent');
    console.log('Token (premiers 30 chars):', data?.fcmToken?.substring(0, 30));
    console.log('Dernière mise à jour:', data?.fcmTokenUpdatedAt?.toDate());
  });
}

// ✅ Résultat attendu:
// FCM Token: ✅ Présent
// Token (premiers 30 chars): fY3h9qC...
// Dernière mise à jour: [date récente]
```

---

### Étape 4: Tester l'envoi manuel via Firebase Console

**But**: Vérifier si le problème vient du code ou de la configuration Firebase/navigateur

1. **Firebase Console** → Cloud Messaging → "Envoyer un message test"

2. **Remplir le formulaire**:
   ```
   Titre: Test SecureID
   Texte: Ceci est un test de notification push
   ```

3. **Cible**: Sélectionner "Token unique"
   - Aller sur Firestore → users → {votre userId} → Copier fcmToken
   - Coller dans "Token"

4. **Options supplémentaires** (important!):
   - ✅ Cocher "Afficher sur l'écran de verrouillage"
   - Priority: High
   - Sound: Enabled

5. **Envoyer**

**Résultats possibles**:

✅ **Notification reçue en arrière-plan**:
- Le FCM fonctionne
- Problème dans le code d'envoi (voir Étape 5)

❌ **Notification non reçue en arrière-plan**:
- Problème avec le navigateur/téléphone
- Vérifier Étape 1 (permissions)

---

### Étape 5: Vérifier les logs serveur (Vercel)

**Vercel Dashboard** → Logs → Runtime Logs

**Chercher lors d'un scan**:

```
✅ Logs corrects:
"✅ FCM notification sent successfully"
"messageId": "projects/securedid/messages/..."
"parentId": "..."

❌ Logs d'erreur:
"Error sending FCM notification"
"registration-token-not-registered" → Token expiré, réactiver notifications
"Invalid APNS credentials" → Problème config iOS (ignorer si Android)
```

**Si aucun log**:
- La fonction d'envoi n'a pas été appelée
- Vérifier que le scan appelle bien `sendEmergencyScanNotification`

---

## 🔧 SOLUTIONS PAR PROBLÈME

### Problème A: Service Worker pas enregistré

**Symptôme**: `navigator.serviceWorker.getRegistrations()` retourne tableau vide

**Solution**:

```javascript
// Dans la console navigateur
navigator.serviceWorker.register('/firebase-messaging-sw.js')
  .then(reg => {
    console.log('✅ Service Worker enregistré:', reg.scope);
    // Recharger la page
    window.location.reload();
  })
  .catch(err => {
    console.error('❌ Erreur:', err);
    // Vérifier que le fichier existe: ouvrir /firebase-messaging-sw.js
  });
```

**Si erreur "Failed to register"**:
- Vérifier que le site est en HTTPS (pas HTTP)
- Vérifier que le fichier `/public/firebase-messaging-sw.js` existe

---

### Problème B: Token FCM absent dans Firestore

**Symptôme**: `fcmToken` est `null` ou absent dans le document users

**Solution**:

1. **Désactiver puis réactiver les notifications** dans /dashboard
2. **Vérifier la console** pour les erreurs lors de l'activation
3. **Forcer la génération du token**:

```javascript
import { getMessaging, getToken } from 'firebase/messaging';
import app from '@/lib/firebase';

const messaging = getMessaging(app);
const vapidKey = 'BOi7Y0QCKYaNZjx2AEww...'; // Votre clé VAPID

navigator.serviceWorker.register('/firebase-messaging-sw.js')
  .then(registration => {
    return getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration
    });
  })
  .then(token => {
    console.log('✅ Token généré:', token.substring(0, 30) + '...');
    // Sauvegarder manuellement dans Firestore si besoin
  })
  .catch(err => {
    console.error('❌ Erreur génération token:', err);
  });
```

---

### Problème C: Notifications bloquées par le navigateur

**Symptôme**: Permission "granted" mais notifications ne s'affichent pas

**Android - Chrome**:

1. **Paramètres téléphone** → Applications → Chrome
2. **Notifications** → Activer
3. **Économie d'énergie** → "Ne pas optimiser"
4. **Mode Ne pas déranger** → Ajouter Chrome aux exceptions

**Android - Paramètres système**:

```
Paramètres → Notifications
  → Notifications d'applications
    → Chrome
      → Afficher notifications: ✅ ON
      → Afficher sur écran verrouillé: ✅ ON
      → Son: ✅ ON
      → Vibration: ✅ ON
      → Notification prioritaire: ✅ ON
```

**Test après configuration**:

```javascript
// Tester notification locale (ne passe pas par FCM)
if ('Notification' in window && Notification.permission === 'granted') {
  new Notification('Test Local', {
    body: 'Si vous voyez ceci, les notifications fonctionnent localement',
    icon: '/icon-192x192.png',
    requireInteraction: true
  });
}
```

Si cette notification s'affiche → Problème avec FCM
Si elle ne s'affiche pas → Problème avec les permissions navigateur

---

### Problème D: Message FCM mal formaté

**Symptôme**: Logs Vercel montrent "notification sent" mais rien ne s'affiche

**Vérifier le format du message** dans `src/actions/notification-actions.ts:56-91`:

Le message doit contenir **à la fois**:
- `notification`: Pour l'affichage automatique
- `webpush.notification`: Pour les options Web Push
- `data`: Pour les données custom (optionnel)

**Format correct** (déjà implémenté):

```typescript
const message = {
  token: fcmToken,

  // ✅ CRITIQUE: notification doit être présent
  notification: {
    title: "🚨 SCAN D'URGENCE",
    body: "Le bracelet de Thomas a été scanné à Paris"
  },

  // ✅ Options Web Push
  webpush: {
    notification: {
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      requireInteraction: true,  // Notification reste affichée
      tag: 'secureid-scan',      // Empêche les doublons
    },
    fcmOptions: {
      link: '/dashboard'  // Ouvre dashboard au clic
    }
  },

  // ✅ Données custom (pour Service Worker)
  data: {
    type: 'emergency_scan',
    childName: 'Thomas',
    timestamp: new Date().toISOString()
  }
};
```

---

## 🧪 TEST COMPLET - CHECKLIST

### ✅ Avant le test

- [ ] Téléphone en mode normal (pas d'économie batterie extrême)
- [ ] Connexion internet stable
- [ ] Chrome/Firefox à jour
- [ ] Notifications activées dans /dashboard
- [ ] Service Worker enregistré (vérifier console)
- [ ] Token FCM présent dans Firestore

### 📱 Procédure de test

**Téléphone parent** (celui qui doit recevoir la notification):

1. Ouvrir https://secureid-app.vercel.app/dashboard
2. Cliquer "Activer les notifications" si pas déjà fait
3. Accepter la permission
4. Vérifier dans console: `Notification.permission === "granted"`
5. **Fermer complètement Chrome** (pas juste mettre en veille)
   - Paramètres → Applications → Chrome → Forcer l'arrêt
6. **Verrouiller le téléphone**

**Téléphone scanner** (autre appareil):

1. Scanner un QR code bracelet
2. OU aller sur `https://secureid-app.vercel.app/s/BF-XXXXXX`

**Résultat attendu**:

- ⏱️ Délai: 3-10 secondes
- 📱 Téléphone parent: Écran s'allume + son + vibration
- 🔔 Notification affichée sur écran de verrouillage
- 📝 Titre: "🚨 SCAN D'URGENCE"
- 📝 Corps: "Le bracelet de [Nom] a été scanné à [Lieu]"

**Si aucune notification**:

1. Déverrouiller téléphone parent
2. Ouvrir Chrome
3. Console (F12) → Onglet "Application" → Service Workers
4. Vérifier les logs du Service Worker

---

## 🔍 LOGS DE DEBUG À ACTIVER

Pour avoir plus d'informations, activer les logs dans le Service Worker:

**Modifier `public/firebase-messaging-sw.js`**:

```javascript
// Au début du fichier, ajouter:
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...', event);
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...', event);
});

self.addEventListener('push', (event) => {
  console.log('[SW] Push event received:', event);
  console.log('[SW] Push data:', event.data?.json());
});

// Dans onBackgroundMessage
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] 🔔 Background message received');
  console.log('[SW] Payload:', JSON.stringify(payload, null, 2));
  console.log('[SW] Notification:', payload.notification);
  console.log('[SW] Data:', payload.data);

  // ... reste du code
});
```

**Voir les logs**:

1. Chrome → F12 → Onglet "Application"
2. Service Workers → Cliquer sur "firebase-messaging-sw.js"
3. Une nouvelle fenêtre s'ouvre avec la console du SW
4. Scanner un QR code
5. Vérifier si "[SW] Background message received" apparaît

---

## 🆘 PROBLÈMES CONNUS

### iOS Safari

❌ **Safari iOS ne supporte PAS les notifications Web Push** (même en PWA)

**Solution**: Installer l'app en tant que PWA (Add to Home Screen), puis elle fonctionnera comme une app native.

### Chrome en mode économie de données

⚠️ Chrome en "mode économie de données" peut bloquer les notifications

**Solution**: Désactiver dans Chrome → Paramètres → Mode économie de données

### Mode Ne pas déranger

⚠️ Mode "Ne pas déranger" bloque les notifications par défaut

**Solution**: Ajouter Chrome aux applications prioritaires

---

## 📊 MÉTRIQUES DE SUCCÈS

### Après configuration correcte

- ✅ Délai notification: 3-10 secondes
- ✅ Taux de réception: 95%+ (si connexion stable)
- ✅ Notification visible sur écran verrouillé
- ✅ Son + vibration
- ✅ Clic ouvre /dashboard

### Délais normaux

- 🕐 3-5s: Excellent
- 🕐 5-10s: Normal
- 🕐 10-30s: Lent (mais OK)
- ⏳ >30s: Problème de connexion ou configuration

---

**Document créé le**: 31 Décembre 2025
**Dernière mise à jour**: 31 Décembre 2025
**Contact support**: tko364796@gmail.com
