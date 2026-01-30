// Firebase Cloud Messaging Service Worker
// Permet de recevoir des notifications push en arrière-plan

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuration Firebase chargée depuis les variables d'environnement
// Ce fichier est généré dynamiquement au build-time par Next.js
// Les variables NEXT_PUBLIC_* sont injectées par le système de build

// Note: Les clés Firebase sont publiques et sécurisées par Firestore Security Rules
// Elles ne donnent pas d'accès privilégié sans authentification
// IMPORTANT: Ces valeurs doivent correspondre au projet Firebase de production (Vercel)
const firebaseConfig = {
  apiKey: "AIzaSyDZKzZHIrqWXm_nfGRa2syWEEeSwGu5Eu8",
  authDomain: "taskflow-26718.firebaseapp.com",
  projectId: "taskflow-26718",
  storageBucket: "taskflow-26718.firebasestorage.app",
  messagingSenderId: "685355004652",
  appId: "1:685355004652:web:0bc75c2c13cb306ba46bc9"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Gestion des messages en arrière-plan (téléphone en veille)
messaging.onBackgroundMessage(async (payload) => {
  console.log('[firebase-messaging-sw.js] Background message received:', payload);

  // Mettre à jour le badge de l'app (PWA Badge API)
  // Note: Dans un Service Worker, on utilise simplement setAppBadge()
  // car localStorage n'est pas accessible. Le badge indique juste qu'il y a des notifications.
  if ('setAppBadge' in navigator) {
    try {
      // Afficher un badge simple (point de notification)
      await navigator.setAppBadge();
      console.log('[firebase-messaging-sw.js] App badge set');
    } catch (error) {
      console.log('[firebase-messaging-sw.js] Badge API error:', error);
    }
  }

  const notificationTitle = payload.notification?.title || 'SecureID Alert';
  const notificationOptions = {
    body: payload.notification?.body || 'Nouvelle activité sur votre bracelet',
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    vibrate: [200, 100, 200],
    tag: 'secureid-scan',
    requireInteraction: true, // La notification reste affichée
    data: payload.data,
    actions: [
      {
        action: 'view',
        title: 'Voir détails',
        icon: '/icon-96.png'
      },
      {
        action: 'dismiss',
        title: 'Ignorer',
        icon: '/icon-96.png'
      }
    ]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);

  event.notification.close();

  // Effacer le badge quand l'utilisateur interagit
  if ('clearAppBadge' in navigator) {
    navigator.clearAppBadge().catch(() => {});
  }

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
