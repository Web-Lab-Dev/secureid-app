import { Timestamp } from 'firebase/firestore';

/**
 * Document représentant une commande de bracelets
 * Stocké dans Firestore collection "orders"
 */
export interface OrderDocument {
  /** ID unique de la commande (format: ORD-YYYYMMDD-XXX) */
  orderId: string;

  /** Nom complet du client */
  customerName: string;

  /** Numéro de téléphone (format: +226XXXXXXXX) */
  customerPhone: string;

  /** Nombre de bracelets commandés */
  quantity: number;

  /** Prix unitaire par bracelet (5000 FCFA) */
  pricePerBracelet: number;

  /** Montant total de la commande */
  totalAmount: number;

  /** Adresse de livraison complète */
  deliveryAddress: string;

  /** Coordonnées GPS de livraison */
  gpsLocation: {
    lat: number;
    lng: number;
  } | null;

  /** Notes supplémentaires pour la livraison (optionnel) */
  deliveryNotes?: string;

  /** Statut de la commande */
  status: 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';

  /** Date de création de la commande */
  createdAt: Timestamp;
}

/**
 * Interface pour le formulaire de commande
 */
export interface OrderFormData {
  customerName: string;
  customerPhone: string;
  quantity: number;
  deliveryAddress: string;
  gpsLocation: { lat: number; lng: number } | null;
  deliveryNotes?: string;
}
