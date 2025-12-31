# GUIDE DE DÉPANNAGE - NOTIFICATIONS PUSH

**Date**: 30 Décembre 2025
**Problème**: Notifications push ne fonctionnent pas malgré clé VAPID configurée dans Vercel

---

## 🔍 DIAGNOSTIC ÉTAPE PAR ÉTAPE

### Étape 1: Vérifier la clé VAPID côté client

**Dans la console du navigateur (F12):**

```javascript
// 1. Ouvrir https://votre-app.vercel.app/dashboard
// 2. Dans la console, taper:
console.log(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY);

// ✅ Résultat attendu: "BFj8x..." (votre clé VAPID)
// ❌ Si undefined ou null: La variable n'est pas accessible côté client
```

**Si undefined:**
- La variable n'est PAS préfixée par `NEXT_PUBLIC_`
- Dans Vercel, elle doit être: `NEXT_PUBLIC_FIREBASE_VAPID_KEY`
- Pas juste `FIREBASE_VAPID_KEY`

---

### Étape 2: Vérifier l'enregistrement du Service Worker

**Dans la console navigateur:**

```javascript
// Vérifier si le Service Worker est enregistré
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers enregistrés:', registrations);
  registrations.forEach(reg => {
    console.log('  - Scope:', reg.scope);
    console.log('  - Active:', reg.active?.scriptURL);
  });
});

// ✅ Résultat attendu:
// Service Workers enregistrés: [ServiceWorkerRegistration]
//   - Scope: https://votre-app.vercel.app/
//   - Active: https://votre-app.vercel.app/firebase-messaging-sw.js

// ❌ Si tableau vide: Service Worker pas enregistré
```

**Si pas enregistré:**
- Vérifier que le fichier `/firebase-messaging-sw.js` existe à la racine publique
- Vérifier qu'il n'y a pas d'erreur dans la console lors du chargement

---

### Étape 3: Vérifier l'obtention du token FCM

**Dans src/hooks/useNotifications.ts, ajouter temporairement des logs:**

```typescript
// Ligne 86, AJOUTER:
console.log('🔑 Tentative d\'obtention du token FCM...');
console.log('📝 VAPID Key présente:', !!vapidKey);
console.log('📝 VAPID Key (premiers 20 chars):', vapidKey?.substring(0, 20));

const currentToken = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });

console.log('✅ Token FCM obtenu:', !!currentToken);
console.log('📝 Token (premiers 30 chars):', currentToken?.substring(0, 30));
```

**Résultats possibles:**

**Cas 1: Token obtenu ✅**
```
🔑 Tentative d'obtention du token FCM...
📝 VAPID Key présente: true
📝 VAPID Key (premiers 20 chars): BFj8x...
✅ Token FCM obtenu: true
📝 Token (premiers 30 chars): fY3h9...
```
→ Le token est généré, problème ailleurs

**Cas 2: Erreur VAPID invalide ❌**
```
🔑 Tentative d'obtention du token FCM...
📝 VAPID Key présente: true
Error: Firebase: The public VAPID key is not valid
```
→ La clé VAPID est incorrecte ou corrompue

**Cas 3: VAPID manquante ❌**
```
🔑 Tentative d'obtention du token FCM...
📝 VAPID Key présente: false
VAPID key not configured
```
→ Variable d'environnement non accessible

---

### Étape 4: Vérifier le stockage du token dans Firestore

**Dans Firebase Console → Firestore:**

```
Collection: users
Document: {votre_userId}

Vérifier:
- Champ fcmToken existe: ✅ / ❌
- Champ fcmToken n'est pas null: ✅ / ❌
- Champ fcmTokenUpdatedAt est récent: ✅ / ❌
```

**Si fcmToken est null ou absent:**
→ Le token n'a pas été sauvegardé, vérifier les logs Vercel

---

### Étape 5: Tester l'envoi d'une notification

**Méthode 1: Déclencher un scan**

```bash
1. Sur téléphone parent:
   - Ouvrir /dashboard
   - Cliquer "Activer les notifications"
   - Accepter la permission
   - FERMER L'ONGLET (ou mettre en veille)

2. Sur autre appareil:
   - Scanner un QR code de bracelet
   - OU aller sur /s/BF-XXX

3. Vérifier:
   - Logs Vercel Functions (chercher "FCM notification")
   - Notification reçue sur téléphone parent
```

**Méthode 2: Test manuel via Firebase Console**

```bash
Firebase Console → Cloud Messaging → Send your first message

Remplir:
- Notification title: "Test SecureID"
- Notification text: "Ceci est un test"
- Target: Token unique
  → Coller le fcmToken depuis Firestore

Cliquer "Test" ou "Send"

Si ça fonctionne:
→ FCM est OK, problème dans le code d'envoi

Si ça ne fonctionne pas:
→ Problème avec le token ou les permissions
```

---

### Étape 6: Vérifier les logs Vercel

**Accéder aux logs:**

```bash
Vercel Dashboard → Votre projet → Functions → Runtime Logs

Rechercher:
- "FCM notification sent successfully" ✅
- "Error sending FCM notification" ❌
- "VAPID key not configured" ❌
- "registration-token-not-registered" ❌
```

**Erreurs communes:**

**Erreur 1: "registration-token-not-registered"**
```
❌ Error: registration-token-not-registered
```
→ Le token FCM a expiré ou est invalide
→ Solution: Réactiver les notifications dans l'app

**Erreur 2: "Invalid APNS credentials"**
```
❌ Error: Invalid APNS credentials
```
→ Problème avec la config Firebase (uniquement iOS)
→ Vérifier Firebase Console → Project Settings → Cloud Messaging

**Erreur 3: "VAPID key mismatch"**
```
❌ Error: The public VAPID key does not match
```
→ La clé VAPID dans Vercel ne correspond pas à celle dans Firebase
→ Régénérer et resynchroniser

---

## 🔧 SOLUTIONS SELON LE PROBLÈME

### Problème A: Variable NEXT_PUBLIC_FIREBASE_VAPID_KEY undefined

**Cause:** Variable mal nommée ou scope incorrect dans Vercel

**Solution:**

```bash
# 1. Vercel Dashboard → Settings → Environment Variables
# 2. Vérifier le nom EXACT:
NEXT_PUBLIC_FIREBASE_VAPID_KEY

# 3. Vérifier qu'elle est activée pour:
☑️ Production
☑️ Preview
☑️ Development

# 4. Redéployer:
vercel --prod

# 5. Vérifier après déploiement dans console navigateur
```

---

### Problème B: Service Worker ne se charge pas

**Causes possibles:**
1. Fichier `firebase-messaging-sw.js` manquant dans `/public`
2. Erreur de syntaxe dans le Service Worker
3. HTTPS requis (HTTP ne fonctionne pas pour Service Workers)

**Solution:**

```bash
# 1. Vérifier que le fichier existe:
ls public/firebase-messaging-sw.js

# 2. Vérifier qu'il n'y a pas d'erreur JavaScript:
# Dans la console → Application → Service Workers
# Vérifier "Status" et "Errors"

# 3. Forcer le rechargement:
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
  location.reload();
});
```

---

### Problème C: Token FCM non sauvegardé dans Firestore

**Causes possibles:**
1. Permissions Firestore Rules bloquent l'update
2. Erreur réseau lors de la sauvegarde
3. userId incorrect

**Solution:**

```typescript
// Dans src/hooks/useNotifications.ts, ligne 94, AJOUTER logs:

try {
  console.log('💾 Sauvegarde token FCM...', {
    userId: user.uid,
    hasToken: !!currentToken,
  });

  const userRef = doc(db, 'users', user.uid);
  await updateDoc(userRef, {
    fcmToken: currentToken,
    fcmTokenUpdatedAt: new Date(),
  });

  console.log('✅ Token sauvegardé avec succès');
} catch (error) {
  console.error('❌ Erreur sauvegarde token:', error);
}
```

**Vérifier Firestore Rules:**

```javascript
// firestore.rules - Collection users
match /users/{userId} {
  allow update: if isOwner(userId) &&
    // ✅ fcmToken DOIT être autorisé
    !request.resource.data.diff(resource.data).affectedKeys()
      .hasAny(['uid', 'phoneNumber', 'generatedEmail', 'createdAt']);
      // fcmToken et fcmTokenUpdatedAt ne sont PAS dans cette liste
}
```

---

### Problème D: Notifications ne s'affichent pas sur téléphone verrouillé

**Causes:**
1. Permissions navigateur refusées
2. Mode économie d'énergie bloque les notifications
3. Paramètres système bloquent les notifications web

**Solution:**

**Sur Android:**
```
Paramètres → Applications → Chrome/Firefox
  → Notifications → Autoriser
  → Ne pas optimiser batterie pour Chrome

Paramètres → Sons et vibrations
  → Ne pas déranger → Exceptions
  → Autoriser les notifications Chrome
```

**Sur iOS (PWA uniquement):**
```
iOS ne supporte pas les notifications web push dans Safari
Solution: Installer en tant que PWA (Add to Home Screen)
```

**Test de permission:**
```javascript
// Dans la console navigateur:
console.log('Permission notifications:', Notification.permission);

// ✅ "granted" → OK
// ❌ "denied" → Bloqué par l'utilisateur
// ⚠️ "default" → Pas encore demandé
```

---

## 📱 CHECKLIST DE VALIDATION

Avant de contacter le support, vérifier :

### Côté Firebase
- [ ] Projet Firebase créé et configuré
- [ ] Cloud Messaging activé
- [ ] Clé VAPID générée (Web Push certificates)
- [ ] Configuration Firebase correcte dans `firebase-messaging-sw.js`

### Côté Vercel
- [ ] Variable `NEXT_PUBLIC_FIREBASE_VAPID_KEY` créée
- [ ] Activée pour Production + Preview
- [ ] Déploiement effectué après ajout de la variable
- [ ] Variable accessible dans console navigateur

### Côté Client
- [ ] Permission notifications accordée (Notification.permission === "granted")
- [ ] Service Worker enregistré (`/firebase-messaging-sw.js`)
- [ ] Token FCM obtenu (visible dans console)
- [ ] Token sauvegardé dans Firestore (collection users)

### Côté Serveur
- [ ] Admin SDK Firebase configuré (`service-account.json`)
- [ ] Fonction `sendNotificationToParent` sans erreur
- [ ] Logs Vercel montrent "FCM notification sent successfully"

### Test Final
- [ ] Scan de bracelet déclenche une notification
- [ ] Notification visible même téléphone verrouillé
- [ ] Clic sur notification ouvre /dashboard

---

## 🆘 AIDE SUPPLÉMENTAIRE

### Logs à fournir pour debug

Si le problème persiste, fournir :

1. **Console navigateur** (F12):
```
- process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY (premiers 20 chars)
- Notification.permission
- Service Worker status
```

2. **Logs Vercel**:
```
- Derniers logs de la fonction d'envoi
- Erreurs FCM éventuelles
```

3. **Firestore**:
```
- Screenshot du document users/{userId}
- Présence du champ fcmToken
```

4. **Firebase Console**:
```
- Screenshot Cloud Messaging configuration
- Clé VAPID générée
```

---

**Document créé le**: 30 Décembre 2025
**Dernière mise à jour**: 30 Décembre 2025
**Contact support**: tko364796@gmail.com
