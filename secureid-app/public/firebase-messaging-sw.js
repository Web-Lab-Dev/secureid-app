/**
 * Firebase Cloud Messaging Service Worker
 *
 * Gère les notifications push en arrière-plan.
 * Projet Firebase: taskflow-26718
 */

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuration Firebase (doit correspondre à Vercel)
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
 * Handler FCM pour messages en arrière-plan
 */
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] onBackgroundMessage:', payload);
  return showNotification(payload);
});

/**
 * Handler push direct (fallback si onBackgroundMessage ne fonctionne pas)
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push event reçu:', event);

  if (!event.data) {
    console.log('[SW] Push sans données');
    return;
  }

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { notification: { title: 'SecureID', body: event.data.text() } };
  }

  // Note: FCM peut avoir déjà affiché la notification via onBackgroundMessage
  // On vérifie si c'est un message FCM standard
  if (payload.notification) {
    event.waitUntil(showNotification(payload));
  }
});

/**
 * Affiche une notification système
 */
function showNotification(payload) {
  const title = payload.notification?.title || 'SecureID';
  const options = {
    body: payload.notification?.body || 'Nouvelle notification',
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    vibrate: [200, 100, 200],
    tag: `secureid-${Date.now()}`,
    renotify: true,
    requireInteraction: true,
    data: payload.data || {},
    actions: [
      { action: 'open', title: 'Ouvrir' },
      { action: 'close', title: 'Fermer' }
    ]
  };

  return self.registration.showNotification(title, options);
}

/**
 * Handler clic sur notification
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification cliquée:', event.action);
  event.notification.close();

  if (event.action === 'close') return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus fenêtre existante
        for (const client of clientList) {
          if (client.url.includes('secureid') && 'focus' in client) {
            return client.focus();
          }
        }
        // Ouvrir nouvelle fenêtre
        return clients.openWindow('/dashboard');
      })
  );
});

/**
 * Installation SW
 */
self.addEventListener('install', () => {
  console.log('[SW] Install');
  self.skipWaiting();
});

/**
 * Activation SW
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate');
  event.waitUntil(clients.claim());
});
