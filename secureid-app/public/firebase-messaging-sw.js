// Firebase Cloud Messaging Service Worker
// Permet de recevoir des notifications push en arrière-plan

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuration Firebase (variables publiques uniquement)
firebase.initializeApp({
  apiKey: "AIzaSyDL0PmkQDjMXF0b4gTI2Fv6QKBPHXfW3J8",
  authDomain: "securedid.firebaseapp.com",
  projectId: "securedid",
  storageBucket: "securedid.firebasestorage.app",
  messagingSenderId: "638803887867",
  appId: "1:638803887867:web:99b6a069fc0c2a83a4c12f"
});

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
