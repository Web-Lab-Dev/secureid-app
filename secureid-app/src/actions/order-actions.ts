'use server';

import { Resend } from 'resend';
import { adminDb as db, admin } from '@/lib/firebase-admin';
import { logger } from '@/lib/logger';
import type { OrderFormData, OrderDocument } from '@/types/order';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * PRIX FIXE: 5000 FCFA par bracelet
 */
const PRICE_PER_BRACELET = 5000;

/**
 * Génère un ID de commande unique au format ORD-YYYYMMDD-XXX
 */
function generateOrderId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');

  return `ORD-${year}${month}${day}-${random}`;
}

/**
 * Crée une nouvelle commande de bracelets
 * - Sauvegarde dans Firestore
 * - Envoie un email de notification à l'admin
 */
export async function createOrder(formData: OrderFormData): Promise<{
  success: boolean;
  orderId?: string;
  error?: string;
}> {
  try {
    // Validation des données
    if (
      !formData.customerName ||
      !formData.customerPhone ||
      !formData.quantity ||
      !formData.deliveryAddress
    ) {
      return {
        success: false,
        error: 'Tous les champs obligatoires doivent être remplis',
      };
    }

    if (formData.quantity < 1 || formData.quantity > 10) {
      return {
        success: false,
        error: 'La quantité doit être entre 1 et 10 bracelets',
      };
    }

    // Calcul du montant total
    const totalAmount = formData.quantity * PRICE_PER_BRACELET;

    // Génération de l'ID de commande
    const orderId = generateOrderId();

    // Création du document de commande
    const orderData = {
      orderId,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      quantity: formData.quantity,
      pricePerBracelet: PRICE_PER_BRACELET,
      totalAmount,
      deliveryAddress: formData.deliveryAddress,
      gpsLocation: formData.gpsLocation,
      deliveryNotes: formData.deliveryNotes || '',
      status: 'PENDING' as const,
      createdAt: admin.firestore.Timestamp.now(),
    };

    // Sauvegarde dans Firestore
    await db.collection('orders').doc(orderId).set(orderData);

    logger.info('Order created', { orderId });

    // Construction du lien Google Maps
    const mapsLink = formData.gpsLocation
      ? `https://www.google.com/maps?q=${formData.gpsLocation.lat},${formData.gpsLocation.lng}`
      : 'GPS non disponible';

    // Envoi de l'email de notification via Resend
    try {
      await resend.emails.send({
        from: 'SecureID <noreply@secureid.com>',
        to: process.env.ADMIN_EMAIL || 'admin@secureid.com',
        subject: `🛒 Nouvelle Commande SecureID - ${orderId}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #f97316 0%, #f59e0b 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
              .info-row { display: flex; margin-bottom: 12px; }
              .info-label { font-weight: bold; min-width: 150px; color: #6b7280; }
              .info-value { color: #111827; }
              .total { font-size: 24px; font-weight: bold; color: #f97316; margin-top: 20px; }
              .button { display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
              .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">🛒 Nouvelle Commande SecureID</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Commande #${orderId}</p>
              </div>

              <div class="content">
                <h2 style="color: #111827; margin-top: 0;">📋 Détails de la Commande</h2>

                <div class="info-row">
                  <div class="info-label">Client:</div>
                  <div class="info-value">${formData.customerName}</div>
                </div>

                <div class="info-row">
                  <div class="info-label">Téléphone:</div>
                  <div class="info-value">${formData.customerPhone}</div>
                </div>

                <div class="info-row">
                  <div class="info-label">Quantité:</div>
                  <div class="info-value">${formData.quantity} bracelet${formData.quantity > 1 ? 's' : ''}</div>
                </div>

                <div class="info-row">
                  <div class="info-label">Prix unitaire:</div>
                  <div class="info-value">${PRICE_PER_BRACELET.toLocaleString('fr-FR')} FCFA</div>
                </div>

                <div class="total">
                  Total: ${totalAmount.toLocaleString('fr-FR')} FCFA
                </div>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

                <h2 style="color: #111827;">📍 Informations de Livraison</h2>

                <div class="info-row">
                  <div class="info-label">Adresse:</div>
                  <div class="info-value">${formData.deliveryAddress}</div>
                </div>

                <div class="info-row">
                  <div class="info-label">GPS:</div>
                  <div class="info-value">
                    ${
                      formData.gpsLocation
                        ? `<a href="${mapsLink}" target="_blank">📍 Voir sur Google Maps</a>`
                        : 'Non disponible'
                    }
                  </div>
                </div>

                ${
                  formData.deliveryNotes
                    ? `
                <div class="info-row">
                  <div class="info-label">Notes:</div>
                  <div class="info-value">${formData.deliveryNotes}</div>
                </div>
                `
                    : ''
                }

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

                <p style="color: #6b7280; font-size: 14px;">
                  <strong>📅 Date:</strong> ${new Date().toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>

                <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                  ✅ <strong>Action requise:</strong> Contactez le client dans les 24h pour confirmer la livraison.
                </p>
              </div>

              <div class="footer">
                <p>SecureID - Système de Bracelets Connectés</p>
                <p>Cette notification a été générée automatiquement</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      logger.info('Order notification email sent', { orderId });
    } catch (emailError) {
      // Si l'email échoue, on log mais on ne bloque pas la commande
      logger.error('Failed to send order email', { error: emailError, orderId });
    }

    return {
      success: true,
      orderId,
    };
  } catch (error) {
    logger.error('Error creating order', { error });
    return {
      success: false,
      error: 'Une erreur est survenue lors de la création de la commande',
    };
  }
}
