// Firebase Cloud Messaging Service Worker
// Permet de recevoir des notifications push en arrière-plan

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuration Firebase chargée depuis les variables d'environnement
// Ce fichier est généré dynamiquement au build-time par Next.js
// Les variables NEXT_PUBLIC_* sont injectées par le système de build

// Note: Les clés Firebase sont publiques et sécurisées par Firestore Security Rules
// Elles ne donnent pas d'accès privilégié sans authentification
const firebaseConfig = {
  apiKey: self.FIREBASE_API_KEY || "AIzaSyDL0PmkQDjMXF0b4gTI2Fv6QKBPHXfW3J8",
  authDomain: self.FIREBASE_AUTH_DOMAIN || "securedid.firebaseapp.com",
  projectId: self.FIREBASE_PROJECT_ID || "securedid",
  storageBucket: self.FIREBASE_STORAGE_BUCKET || "securedid.firebasestorage.app",
  messagingSenderId: self.FIREBASE_MESSAGING_SENDER_ID || "638803887867",
  appId: self.FIREBASE_APP_ID || "1:638803887867:web:99b6a069fc0c2a83a4c12f"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Gestion des messages en arrière-plan (téléphone en veille)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'SecureID Alert';
  const notificationOptions = {
    body: payload.notification?.body || 'Nouvelle activité sur votre bracelet',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'secureid-scan',
    requireInteraction: true, // La notification reste affichée
    data: payload.data,
    actions: [
      {
        action: 'view',
        title: 'Voir détails',
        icon: '/icons/view.png'
      },
      {
        action: 'dismiss',
        title: 'Ignorer',
        icon: '/icons/close.png'
      }
    ]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);

  event.notification.close();

  if (event.action === 'view') {
    // Ouvrir l'app sur le dashboard
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  } else if (event.action === 'dismiss') {
    // Juste fermer la notification
    return;
  } else {
    // Clic sur la notification elle-même
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});
