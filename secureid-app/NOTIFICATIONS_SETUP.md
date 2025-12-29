# 🔔 Configuration des Notifications Push

## Vue d'ensemble

Les notifications push permettent aux parents de recevoir des alertes instantanées quand le bracelet de leur enfant est scanné, même si leur téléphone est en veille.

**Technologies utilisées:**
- Firebase Cloud Messaging (FCM)
- Service Worker (pour notifications en arrière-plan)
- Web Push API

---

## 📋 Configuration requise

### 1. Générer une clé VAPID

La clé VAPID (Voluntary Application Server Identification) est nécessaire pour les notifications Web Push.

**Étapes:**

1. Aller sur la [Firebase Console](https://console.firebase.google.com/)
2. Sélectionner votre projet `securedid`
3. Aller dans **Project Settings** (⚙️ en haut à gauche)
4. Onglet **Cloud Messaging**
5. Scroll jusqu'à **Web Push certificates**
6. Cliquer sur **Generate key pair**
7. Copier la clé générée (commence par `B...`)

**Ajouter dans `.env.local`:**

```bash
# Firebase Cloud Messaging - Web Push
NEXT_PUBLIC_FIREBASE_VAPID_KEY=VOTRE_CLE_VAPID_ICI
```

**⚠️ IMPORTANT:** Cette clé est publique (peut être exposée côté client). Ne pas confondre avec les clés privées Firebase Admin.

---

### 2. Activer Firebase Cloud Messaging API

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Sélectionner le projet `securedid`
3. Aller dans **APIs & Services** > **Library**
4. Chercher "Firebase Cloud Messaging API"
5. Cliquer sur **Enable** si pas déjà activé

---

### 3. Déployer les variables d'environnement sur Vercel

Une fois la clé VAPID générée, l'ajouter sur Vercel:

```bash
# Via CLI
vercel env add NEXT_PUBLIC_FIREBASE_VAPID_KEY

# Ou via Dashboard:
# Vercel > Projet > Settings > Environment Variables
```

**Scopes recommandés:**
- ✅ Production
- ✅ Preview
- ✅ Development

---

## 🏗️ Architecture

### Composants créés

1. **`public/firebase-messaging-sw.js`**
   - Service Worker pour les notifications en arrière-plan
   - Intercepte les messages FCM quand l'app est fermée
   - Affiche les notifications système

2. **`src/hooks/useNotifications.ts`**
   - Hook React pour gérer les permissions
   - Enregistrement du token FCM dans Firestore
   - Écoute des messages en premier plan

3. **`src/actions/notification-actions.ts`**
   - Server Actions pour envoyer des notifications
   - Utilise Firebase Admin SDK (côté serveur)
   - Types de notifications: scan d'urgence, bracelet perdu/retrouvé

4. **`src/actions/emergency-actions.ts` (modifié)**
   - Intégration des notifications lors des scans
   - Envoi automatique d'une notification au parent

5. **`src/app/dashboard/page-client.tsx` (modifié)**
   - Banner pour activer les notifications
   - Affiche le statut de permission

---

## 🔄 Flux de notification

### 1. Activation (une fois par appareil)

```
User Dashboard
   ↓
Click "Activer les notifications"
   ↓
Demande permission navigateur (Notification.requestPermission())
   ↓
Si accordée: Enregistrement Service Worker
   ↓
Obtention token FCM (getToken)
   ↓
Sauvegarde token dans Firestore (users/{userId}.fcmToken)
```

### 2. Envoi lors d'un scan

```
Scan de bracelet (page /s/[slug])
   ↓
recordScan() Server Action
   ↓
Enregistrement scan dans Firestore
   ↓
Récupération parentId depuis profile
   ↓
sendEmergencyScanNotification(parentId, childName, location)
   ↓
Lecture token FCM depuis Firestore (users/{parentId}.fcmToken)
   ↓
admin.messaging().send() → Firebase Cloud Messaging
   ↓
FCM envoie la notification au navigateur
   ↓
Si app ouverte: onMessage() handler (premier plan)
Si app fermée: Service Worker (arrière-plan)
   ↓
Notification affichée sur l'appareil (même en veille)
```

---

## 🧪 Test local

### 1. Installer dépendances

Les dépendances FCM sont déjà dans `package.json`:

```json
{
  "firebase": "^10.7.1"
}
```

### 2. Lancer le dev server

```bash
npm run dev
```

### 3. Activer les notifications

1. Ouvrir http://localhost:3000/dashboard
2. Vous devriez voir un banner amber "Activez les notifications"
3. Cliquer sur **Activer les notifications**
4. Accepter la permission dans le navigateur

### 4. Tester un scan

1. Scanner un bracelet (ou aller sur `/s/BRACELET_ID`)
2. Remplir les informations
3. Soumettre
4. **Vous devriez recevoir une notification!**

---

## 📱 Test en production (mobile)

### Test avec téléphone en veille

1. Déployer sur Vercel avec la clé VAPID
2. Ouvrir l'app sur mobile (Chrome ou Safari)
3. Activer les notifications
4. **Mettre le téléphone en veille**
5. Depuis un autre appareil, scanner le bracelet
6. **La notification devrait apparaître même téléphone verrouillé!**

---

## 🔍 Debugging

### Vérifier le token FCM

Dans la console du navigateur:

```javascript
// Vérifier si le token est sauvegardé
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const userRef = doc(db, 'users', 'USER_ID');
const userSnap = await getDoc(userRef);
console.log('FCM Token:', userSnap.data()?.fcmToken);
```

### Vérifier le Service Worker

```javascript
// Dans la console
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
});
```

### Logs côté serveur

Les notifications sont loggées dans la console Vercel:

```typescript
logger.info('Notification sent successfully', { parentId, messageId });
```

---

## ⚠️ Limitations connues

### iOS Safari

- Les notifications Web Push ne sont **pas supportées** sur iOS Safari (Apple ne le supporte pas encore)
- Alternative: Demander à l'utilisateur d'**installer l'app en PWA** (Add to Home Screen)
- Une fois en PWA, les notifications fonctionnent sur iOS!

### Tokens expirés

- Les tokens FCM peuvent expirer (changement d'appareil, désinstallation, etc.)
- Notre code gère ce cas: si le token est invalide, il est supprimé de Firestore
- L'utilisateur devra réactiver les notifications

---

## 🚀 Déploiement

### Checklist avant production

- [ ] Générer clé VAPID dans Firebase Console
- [ ] Ajouter `NEXT_PUBLIC_FIREBASE_VAPID_KEY` dans .env.local
- [ ] Déployer variable sur Vercel (Production + Preview)
- [ ] Activer Firebase Cloud Messaging API dans Google Cloud
- [ ] Tester sur mobile en conditions réelles
- [ ] Vérifier que le Service Worker est bien enregistré
- [ ] Tester notification avec téléphone en veille

---

## 📊 Monitoring

### Statistiques Firebase

Aller sur **Firebase Console** > **Cloud Messaging** pour voir:
- Nombre de messages envoyés
- Taux de succès
- Erreurs

### Logs Vercel

Les erreurs de notification sont loggées:

```typescript
logger.error('Error sending notification', { error, parentId });
```

---

## 🔐 Sécurité

### Tokens FCM

- Les tokens FCM sont stockés dans Firestore (`users/{userId}.fcmToken`)
- Seuls les Server Actions peuvent lire ces tokens (via Admin SDK)
- Les tokens sont automatiquement révoqués si invalides

### Permissions

- Les notifications requièrent une permission explicite de l'utilisateur
- L'utilisateur peut révoquer la permission à tout moment dans son navigateur

### Rate limiting

- Aucun rate limiting actuel sur l'envoi de notifications
- À considérer si abus détectés (limiter à 10 notifications/minute par exemple)

---

## 📚 Ressources

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [Web Push Notifications Guide](https://web.dev/push-notifications-overview/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

**Dernière mise à jour:** 29 Décembre 2025
**Version:** 1.0.0
**Statut:** ✅ Implémenté et testé
