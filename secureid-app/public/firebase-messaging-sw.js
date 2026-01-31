/**
 * Firebase Cloud Messaging Service Worker
 *
 * Gère les notifications push en arrière-plan (quand l'app est fermée ou minimisée).
 *
 * IMPORTANT: La configuration Firebase doit correspondre EXACTEMENT à celle utilisée
 * côté client (Vercel env vars) sinon les notifications ne fonctionneront pas.
 *
 * Projet Firebase: taskflow-26718
 */

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuration Firebase - DOIT correspondre aux variables Vercel NEXT_PUBLIC_FIREBASE_*
const firebaseConfig = {
  apiKey: "AIzaSyDZKzZHIrqWXm_nfGRa2syWEEeSwGu5Eu8",
  authDomain: "taskflow-26718.firebaseapp.com",
  projectId: "taskflow-26718",
  storageBucket: "taskflow-26718.firebasestorage.app",
  messagingSenderId: "685355004652",
  appId: "1:685355004652:web:0bc75c2c13cb306ba46bc9"
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

/**
 * Gestionnaire des messages en arrière-plan
 * Appelé quand l'app est fermée ou minimisée
 */
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Message reçu en arrière-plan:', payload);

  const notificationTitle = payload.notification?.title || 'SecureID';
  const notificationOptions = {
    body: payload.notification?.body || 'Nouvelle notification',
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: payload.data?.type || 'secureid-notification',
    requireInteraction: true,
    data: payload.data,
    actions: [
      { action: 'open', title: 'Ouvrir' },
      { action: 'dismiss', title: 'Fermer' }
    ]
  };

  // Afficher la notification système
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

/**
 * Gestionnaire des clics sur les notifications
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification cliquée:', event.action);

  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Ouvrir ou focus l'app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si une fenêtre est déjà ouverte, la focus
      for (const client of clientList) {
        if (client.url.includes('/dashboard') && 'focus' in client) {
          return client.focus();
        }
      }
      // Sinon ouvrir une nouvelle fenêtre
      if (clients.openWindow) {
        return clients.openWindow('/dashboard');
      }
    })
  );
});

/**
 * Gestionnaire d'installation du SW
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installation...');
  // Activer immédiatement sans attendre
  self.skipWaiting();
});

/**
 * Gestionnaire d'activation du SW
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation...');
  // Prendre le contrôle immédiatement
  event.waitUntil(clients.claim());
});

/**
 * Gestionnaire des messages depuis l'app
 */
self.addEventListener('message', (event) => {
  console.log('[SW] Message reçu:', event.data);

  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
