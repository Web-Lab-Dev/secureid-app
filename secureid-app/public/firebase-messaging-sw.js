/**
 * Firebase Cloud Messaging Service Worker
 * Version simplifiée et robuste
 */

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuration Firebase
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

// Log pour debug
console.log('[FCM-SW] Service Worker initialized');

/**
 * Handler pour messages en arrière-plan
 * FCM appelle cette fonction quand un message arrive et l'app est en arrière-plan
 */
messaging.onBackgroundMessage((payload) => {
  console.log('[FCM-SW] onBackgroundMessage received:', payload);

  // Si le payload a notification, FCM l'a déjà affiché via webpush.notification
  // On ne fait rien de plus
  if (payload.notification) {
    console.log('[FCM-SW] Notification already shown by FCM');
    return;
  }

  // Message data-only, on doit afficher manuellement
  const title = payload.data?.title || 'SecureID';
  const body = payload.data?.body || 'Nouvelle notification';

  const options = {
    body: body,
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    tag: 'secureid-' + Date.now(),
    vibrate: [200, 100, 200],
    requireInteraction: true,
    data: payload.data
  };

  return self.registration.showNotification(title, options);
});

/**
 * Handler clic sur notification
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[FCM-SW] Notification clicked');
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Chercher fenêtre existante
        for (const client of clientList) {
          if ('focus' in client) {
            return client.focus();
          }
        }
        // Ouvrir nouvelle fenêtre
        return clients.openWindow('/dashboard');
      })
  );
});

/**
 * Installation
 */
self.addEventListener('install', (event) => {
  console.log('[FCM-SW] Installing...');
  self.skipWaiting();
});

/**
 * Activation
 */
self.addEventListener('activate', (event) => {
  console.log('[FCM-SW] Activating...');
  event.waitUntil(clients.claim());
});
