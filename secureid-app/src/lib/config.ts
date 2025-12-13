/**
 * CONFIGURATION CENTRALISÉE - SECUREID
 *
 * Toutes les constantes et valeurs hardcodées de l'application
 * Pour modifier une valeur globale, éditez ce fichier uniquement
 */

// ============================================
// INFORMATIONS DE L'APPLICATION
// ============================================

export const APP_CONFIG = {
  name: 'SecureID',
  tagline: 'Votre Bracelet Intelligent pour la Sécurité de vos Enfants',
  description: 'Bracelet connecté avec QR code pour protéger vos enfants en cas d\'urgence',
  version: '1.0.0',
} as const;

// ============================================
// CONTACT & SUPPORT
// ============================================

export const CONTACT_INFO = {
  email: {
    support: 'support@secureid.com',
    contact: 'contact@secureid.com',
    sales: 'ventes@secureid.com',
  },
  phone: {
    support: '+33 1 23 45 67 89',
    emergency: '112', // Numéro d'urgence européen
  },
  social: {
    facebook: 'https://facebook.com/secureid',
    instagram: 'https://instagram.com/secureid',
    twitter: 'https://twitter.com/secureid',
    linkedin: 'https://linkedin.com/company/secureid',
  },
  address: {
    street: '123 Avenue de la Sécurité',
    city: 'Paris',
    postalCode: '75001',
    country: 'France',
  },
} as const;

// ============================================
// TARIFICATION & PRODUITS
// ============================================

export const PRICING = {
  bracelet: {
    price: 29.99,
    currency: '€',
    currencySymbol: '€',
    originalPrice: 49.99, // Prix barré
    discount: 40, // Pourcentage de réduction
  },
  shipping: {
    standard: 4.99,
    express: 9.99,
    free: true, // Livraison gratuite activée
    freeThreshold: 0, // Seuil pour livraison gratuite
  },
  tax: {
    vat: 20, // TVA en pourcentage
    included: true, // TVA incluse dans le prix
  },
} as const;

// ============================================
// URLs EXTERNES
// ============================================

export const EXTERNAL_URLS = {
  // Messagerie
  whatsapp: {
    base: 'https://wa.me',
    businessNumber: '33123456789', // Numéro WhatsApp Business
  },

  // Cartes et localisation
  maps: {
    google: 'https://www.google.com/maps',
    googlePlus: 'https://www.google.com/maps/search/?api=1&query=',
  },

  // Réseaux sociaux
  social: {
    facebook: 'https://facebook.com/sharer/sharer.php?u=',
    twitter: 'https://twitter.com/intent/tweet?url=',
    linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=',
  },

  // Documentation et légal
  legal: {
    cgu: '/legal/cgu',
    privacy: '/legal/privacy',
    cookies: '/legal/cookies',
    mentions: '/legal/mentions-legales',
  },

  // Paiement
  payment: {
    stripe: 'https://stripe.com',
    // Les clés API sont dans les variables d'environnement
  },
} as const;

// ============================================
// LIMITES & CONTRAINTES
// ============================================

export const LIMITS = {
  // Profils enfants
  profiles: {
    maxPerParent: 10,
    minAge: 0,
    maxAge: 18,
  },

  // Documents médicaux
  documents: {
    maxFileSize: 10 * 1024 * 1024, // 10MB en bytes
    maxFileSizeMB: 10,
    allowedTypes: {
      images: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      documents: ['application/pdf'],
    },
    allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png', '.webp'],
    maxPerProfile: 50,
  },

  // Photos de profil
  photos: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxFileSizeMB: 5,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    dimensions: {
      min: 200, // pixels
      max: 2048,
      recommended: 512,
    },
  },

  // Codes PIN
  pin: {
    length: 4,
    minLength: 4,
    maxLength: 4,
    pattern: /^\d{4}$/,
  },

  // Contacts d'urgence
  emergencyContacts: {
    minRequired: 1,
    maxAllowed: 5,
  },

  // Récupérateurs école (Anges Gardiens)
  pickupPersons: {
    maxPerProfile: 20,
  },

  // Historique des scans
  scanHistory: {
    maxDisplayed: 100,
    retentionDays: 365, // 1 an
  },
} as const;

// ============================================
// FEATURES FLAGS
// ============================================

export const FEATURES = {
  aiAssistant: true, // Assistant IA activé
  geolocation: true, // Géolocalisation activée
  notifications: true, // Notifications push
  offlineMode: false, // Mode hors ligne (futur)
  multiLanguage: false, // Multi-langue (futur)
  darkMode: false, // Mode sombre (futur)

  // Modules spécifiques
  schoolModule: true, // Module portail école
  medicalModule: true, // Module documents médicaux
  emergencyModule: true, // Module urgence
} as const;

// ============================================
// MESSAGES & TEXTES STANDARDS
// ============================================

export const MESSAGES = {
  errors: {
    generic: 'Une erreur est survenue. Veuillez réessayer.',
    network: 'Erreur de connexion. Vérifiez votre connexion internet.',
    unauthorized: 'Vous devez être connecté pour accéder à cette page.',
    notFound: 'La ressource demandée n\'existe pas.',
    serverError: 'Erreur serveur. Veuillez réessayer plus tard.',
  },

  success: {
    saved: 'Enregistré avec succès',
    updated: 'Mis à jour avec succès',
    deleted: 'Supprimé avec succès',
    sent: 'Envoyé avec succès',
  },

  confirmation: {
    delete: 'Êtes-vous sûr de vouloir supprimer cet élément ?',
    logout: 'Êtes-vous sûr de vouloir vous déconnecter ?',
    cancel: 'Êtes-vous sûr de vouloir annuler ? Les modifications seront perdues.',
  },

  emergency: {
    scanAlert: '🚨 Alerte SecureID - Bracelet scanné',
    locationShared: 'Position GPS partagée avec succès',
    contactNotified: 'Contact d\'urgence notifié',
  },
} as const;

// ============================================
// DÉLAIS & DURÉES (en millisecondes)
// ============================================

export const TIMEOUTS = {
  toast: 3000, // 3 secondes
  autoRedirect: 5000, // 5 secondes
  debounce: 300, // 300ms
  apiRequest: 30000, // 30 secondes
  session: 24 * 60 * 60 * 1000, // 24 heures
  cache: 5 * 60 * 1000, // 5 minutes
} as const;

// ============================================
// ROUTES & NAVIGATION
// ============================================

export const ROUTES = {
  // Public
  home: '/',
  login: '/login',
  signup: '/signup',

  // Dashboard
  dashboard: '/dashboard',

  // Activation
  activate: '/activate',

  // Emergency (scan public)
  emergency: '/emergency',

  // Legal
  legal: {
    cgu: '/legal/cgu',
    privacy: '/legal/privacy',
    cookies: '/legal/cookies',
    mentions: '/legal/mentions-legales',
  },

  // Admin (future)
  admin: '/admin',
} as const;

// ============================================
// THÈME & COULEURS
// ============================================

export const THEME = {
  colors: {
    brand: {
      orange: '#FF6B35', // Couleur principale
      black: '#0F172A',  // Fond sombre
    },
    emergency: {
      red: '#EF4444',
      yellow: '#F59E0B',
    },
    school: {
      indigo: '#6366F1',
    },
    medical: {
      blue: '#3B82F6',
    },
  },

  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

// ============================================
// HELPERS - Fonctions utilitaires
// ============================================

/**
 * Formatte le prix avec la devise
 */
export function formatPrice(price: number, showCurrency = true): string {
  const formatted = price.toFixed(2).replace('.', ',');
  return showCurrency ? `${formatted} ${PRICING.bracelet.currencySymbol}` : formatted;
}

/**
 * Génère l'URL WhatsApp avec message
 */
export function getWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  return `${EXTERNAL_URLS.whatsapp.base}/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Génère l'URL Google Maps avec coordonnées
 */
export function getGoogleMapsUrl(lat: number, lng: number): string {
  return `${EXTERNAL_URLS.maps.google}?q=${lat},${lng}`;
}

/**
 * Génère l'URL de partage Facebook
 */
export function getFacebookShareUrl(url: string): string {
  return `${EXTERNAL_URLS.social.facebook}${encodeURIComponent(url)}`;
}

/**
 * Génère l'URL de partage Twitter
 */
export function getTwitterShareUrl(url: string, text?: string): string {
  const params = new URLSearchParams({ url });
  if (text) params.append('text', text);
  return `${EXTERNAL_URLS.social.twitter}${params.toString()}`;
}

/**
 * Valide un code PIN
 */
export function isValidPin(pin: string): boolean {
  return LIMITS.pin.pattern.test(pin);
}

/**
 * Valide la taille d'un fichier
 */
export function isValidFileSize(sizeInBytes: number, type: 'document' | 'photo'): boolean {
  const maxSize = type === 'document'
    ? LIMITS.documents.maxFileSize
    : LIMITS.photos.maxFileSize;
  return sizeInBytes <= maxSize;
}

/**
 * Valide le type MIME d'un fichier
 */
export function isValidFileType(mimeType: string, category: 'image' | 'document'): boolean {
  if (category === 'image') {
    const imageTypes: readonly string[] = [...LIMITS.documents.allowedTypes.images, ...LIMITS.photos.allowedTypes];
    return imageTypes.includes(mimeType);
  }
  const docTypes: readonly string[] = LIMITS.documents.allowedTypes.documents;
  return docTypes.includes(mimeType);
}

/**
 * Formate un numéro de téléphone pour WhatsApp
 */
export function formatPhoneForWhatsApp(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Obtient le message d'alerte d'urgence formatté
 */
export function getEmergencyAlertMessage(location: { lat: number; lng: number }): string {
  const mapsUrl = getGoogleMapsUrl(location.lat, location.lng);
  return `${MESSAGES.emergency.scanAlert} ici: ${mapsUrl}`;
}
