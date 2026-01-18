# 📱 Guide Configuration Notifications Push

## 🎯 Objectif

Permettre aux parents de recevoir des **notifications push en temps réel** sur leur téléphone (même si l'app est fermée) lorsque :
- 🚨 Leur enfant sort d'une zone de sécurité GPS
- 📍 Le bracelet est scanné en mode d'urgence
- ⚠️ Le bracelet est déclaré perdu
- ✅ Le bracelet est retrouvé

---

## ⚙️ Configuration (Une seule fois)

### Étape 1 : Obtenir la clé VAPID

1. **Accéder à la console Firebase** :
   ```
   https://console.firebase.google.com/project/securedid/settings/cloudmessaging
   ```

2. **Section "Web Push certificates"** :
   - Cliquer sur "Generate key pair" (si pas déjà fait)
   - Copier la **Clé publique (VAPID)**

   Exemple : `BM8xYz...` (environ 88 caractères)

### Étape 2 : Ajouter la clé dans le projet

Éditer le fichier `.env.local` :

```bash
# Firebase Messaging VAPID Key (Web Push)
NEXT_PUBLIC_FIREBASE_VAPID_KEY=VOTRE_CLE_VAPID_ICI
```

**⚠️ Important** :
- Ne PAS mettre de guillemets autour de la clé
- Redémarrer le serveur dev après modification

### Étape 3 : Redéployer sur Vercel

1. **Ajouter la variable d'environnement sur Vercel** :
   ```
   Dashboard Vercel → Settings → Environment Variables

   Name: NEXT_PUBLIC_FIREBASE_VAPID_KEY
   Value: [Coller la clé VAPID]
   Environment: Production, Preview, Development
   ```

2. **Redéployer** :
   ```bash
   git push origin main
   ```

---

## 🧪 Test des Notifications Push

### Étape 1 : Activer les notifications (OBLIGATOIRE)

1. **Accéder au dashboard** :
   ```
   https://secureid-app.vercel.app/dashboard
   ```

2. **Cliquer sur le bouton jaune** :
   ```
   🔔 Activer les notifications
   ```

3. **Accepter la permission** dans le navigateur :
   - Chrome : "Autoriser" les notifications
   - Safari : "Autoriser"
   - Firefox : "Toujours recevoir les notifications"

4. **Vérification** :
   - Le bouton devient vert ✅
   - Console affiche : "FCM token obtained"
   - Token sauvegardé dans Firestore (`users/{uid}/fcmToken`)

### Étape 2 : Tester l'alerte GPS

1. **Créer une zone de sécurité** :
   ```
   Dashboard → Profil enfant → Tracking GPS
   → Bouton bleu "Zones de Sécurité"
   → "Ajouter une Zone"

   Nom : École
   Rayon : 700m
   Délai alerte : 2 minutes (pour test rapide)
   Couleur : Vert
   Activée : ✅
   ```

2. **Tester la sortie de zone** :
   ```
   Page Tracking GPS
   → Cliquer "Mode Démo" (bouton violet bas-gauche)
   → Cliquer "Sortir de la zone" 🔴
   → Attendre 2 minutes ⏱️
   ```

3. **Résultats attendus** :

   **Immédiatement** :
   - Enfant se déplace hors du cercle vert sur la carte
   - Timer démarre (visible dans console)

   **Après 2 minutes** :
   - 🔊 **Son d'alerte** joue dans le navigateur
   - 🚨 **Modal visuelle** rouge apparaît
   - 📱 **Notification push** sur téléphone/desktop

**Format notification** :
```
🚨 ALERTE ZONE DE SÉCURITÉ
Nom Enfant est sorti(e) de la zone de sécurité depuis 2 minutes

[Voir détails] [Ignorer]
```

### Étape 3 : Tester notification en arrière-plan

1. **Fermer l'app** (onglet navigateur)
2. **Sortir de zone** via Mode Démo
3. **Attendre le délai**
4. **→ Notification apparaît sur l'écran verrouillé** 🎉

---

## 🔍 Debugging

### Vérifier que le token FCM est enregistré

Page : `/dashboard/test-token` (debug uniquement)

**Informations affichées** :
- User ID
- FCM Token (50 premiers caractères)
- Date mise à jour
- État : "Token configuré ✅" ou "Token manquant ❌"

### Console Logs

**Permission accordée** :
```
✅ Service worker registered
✅ FCM token obtained
✅ FCM token saved to Firestore
```

**Notification envoyée** :
```
✅ Geofence exit notification sent
✅ FCM notification sent successfully
```

**Token manquant** (non bloquant) :
```
ℹ️ No FCM token for user (notifications not enabled)
```

### Erreurs Courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| `VAPID key not configured` | Variable `.env` manquante | Ajouter `NEXT_PUBLIC_FIREBASE_VAPID_KEY` |
| `Permission denied` | Utilisateur a refusé | Réinitialiser permissions navigateur |
| `Service worker failed` | Fichier SW manquant | Vérifier `/public/firebase-messaging-sw.js` |
| `Token not registered` | Token expiré | Cliquer à nouveau "Activer notifications" |

---

## 📱 Compatibilité Navigateurs

| Navigateur | Desktop | Mobile | Arrière-plan |
|------------|---------|--------|--------------|
| Chrome | ✅ | ✅ | ✅ |
| Firefox | ✅ | ✅ | ✅ |
| Edge | ✅ | ✅ | ✅ |
| Safari | ✅ | ⚠️ iOS 16.4+ | ⚠️ Limité |
| Opera | ✅ | ✅ | ✅ |

**Note Safari** :
- iOS < 16.4 : Pas de support Web Push
- iOS ≥ 16.4 : Support partiel (notifications uniquement si app ajoutée à l'écran d'accueil)

---

## 🔐 Sécurité

✅ **Token FCM stocké côté serveur** (Firestore)
✅ **Communication chiffrée** (HTTPS/TLS)
✅ **Validation côté serveur** (Admin SDK)
✅ **Permissions utilisateur** (Notification API)

**Ce qui est envoyé** :
- Titre notification
- Corps message
- Données métadata (type, timestamp, childName)

**Ce qui N'est PAS envoyé** :
- Localisation GPS précise
- Données sensibles
- Identifiants privés

---

## 📊 Architecture

```
[Enfant sort de zone]
       ↓
[GpsSimulationCard détecte]
       ↓
[Timer (délai configurable)]
       ↓
[sendGeofenceExitNotification()]
       ↓
[Firebase Admin SDK]
       ↓
[Firebase Cloud Messaging]
       ↓
[Service Worker (sw.js)]
       ↓
[📱 Notification apparaît]
```

**Deux modes** :
1. **Foreground** (app ouverte) : `onMessage` → Notification navigateur
2. **Background** (app fermée) : `onBackgroundMessage` → Notification système

---

## ✅ Checklist Déploiement

- [ ] Clé VAPID générée sur Firebase Console
- [ ] Variable `NEXT_PUBLIC_FIREBASE_VAPID_KEY` ajoutée
- [ ] Redéploiement Vercel effectué
- [ ] Service Worker `/firebase-messaging-sw.js` présent
- [ ] Hook `useNotifications` intégré au dashboard
- [ ] Bouton "Activer notifications" visible
- [ ] Test notification réussi (foreground)
- [ ] Test notification réussi (background)
- [ ] Son d'alerte `alert.ogg` déployé
- [ ] Modal visuelle fonctionne

---

## 📞 Support

**Problème persistant ?**
1. Vérifier Console Chrome (F12) → onglet "Console"
2. Vérifier onglet "Application" → Service Workers
3. Vérifier Firestore : `users/{uid}/fcmToken` existe ?
4. Tester avec `/dashboard/test-token`

**Contact** : Voir logs console pour diagnostic détaillé.
