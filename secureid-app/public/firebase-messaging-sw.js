/**
 * Firebase Cloud Messaging Service Worker
 *
 * Gère les notifications push en arrière-plan.
 * Projet Firebase: taskflow-26718
 *
 * IMPORTANT: Les notifications peuvent arriver de 3 sources:
 * 1. Via webpush.notification dans le message FCM (affichée automatiquement par le navigateur)
 * 2. Via onBackgroundMessage (code FCM)
 * 3. Via push event listener (code natif)
 *
 * Pour éviter les doublons, on utilise un tag stable basé sur le type + timestamp arrondi.
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

// Cache pour éviter les doublons (stocke les tags récents)
const recentNotifications = new Set();
const NOTIFICATION_DEDUP_WINDOW = 5000; // 5 secondes de déduplication

/**
 * Génère un tag stable pour déduplication
 * Basé sur le type de notification, pas sur l'heure exacte
 */
function getStableTag(payload) {
  const type = payload.data?.type || 'alert';
  const childName = payload.data?.childName || '';
  // Arrondir le timestamp à 10 secondes pour déduplication
  const roundedTime = Math.floor(Date.now() / 10000);
  return `secureid-${type}-${childName}-${roundedTime}`;
}

/**
 * Handler FCM pour messages en arrière-plan
 * NOTE: onBackgroundMessage reçoit les messages DATA-ONLY (sans notification dans le payload)
 * Les messages avec webpush.notification sont affichés automatiquement par le navigateur
 */
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] onBackgroundMessage:', payload);

  // Si le payload contient déjà notification, le navigateur l'a déjà affichée
  // On ne montre que les messages data-only
  if (payload.notification) {
    console.log('[SW] Notification déjà gérée par le navigateur (webpush.notification)');
    return;
  }

  return showNotificationSafe(payload);
});

/**
 * Handler push direct - DÉSACTIVÉ pour éviter les doublons
 * FCM gère tout via onBackgroundMessage et webpush.notification
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push event reçu (ignoré pour éviter doublon FCM)');
  // Ne pas afficher de notification ici - FCM le fait déjà
});

/**
 * Affiche une notification avec déduplication
 */
function showNotificationSafe(payload) {
  const tag = getStableTag(payload);

  // Vérifier si on a déjà affiché cette notification récemment
  if (recentNotifications.has(tag)) {
    console.log('[SW] Notification dupliquée ignorée:', tag);
    return Promise.resolve();
  }

  // Marquer comme récemment affichée
  recentNotifications.add(tag);
  setTimeout(() => recentNotifications.delete(tag), NOTIFICATION_DEDUP_WINDOW);

  console.log('[SW] Affichage notification:', tag);

  const title = payload.notification?.title || payload.data?.title || 'SecureID';
  const options = {
    body: payload.notification?.body || payload.data?.body || 'Nouvelle notification',
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    vibrate: [200, 100, 200],
    tag: tag, // Tag stable pour remplacement
    renotify: false, // Ne pas re-notifier si même tag
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
