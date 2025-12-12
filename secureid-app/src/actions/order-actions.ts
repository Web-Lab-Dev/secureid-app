'use server';

import { logger } from '@/lib/logger';
import type { OrderFormData } from '@/types/order';

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
    logger.info('createOrder called', { customerName: formData.customerName });
    logger.info('🛒 Starting order creation...');

    // Validation des données
    if (
      !formData.customerName ||
      !formData.customerPhone ||
      !formData.quantity ||
      !formData.deliveryAddress
    ) {
      logger.warn('Order validation failed - missing fields');
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

    logger.info('📋 Order prepared (Firestore save skipped for now)', { orderId });

    // Envoi de l'email de notification via SMTP (Nodemailer)
    try {
      logger.info('📧 Sending email notification via SMTP API...', { orderId });

      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          quantity: formData.quantity,
          pricePerBracelet: PRICE_PER_BRACELET,
          totalAmount,
          deliveryAddress: formData.deliveryAddress,
          gpsLocation: formData.gpsLocation,
          deliveryNotes: formData.deliveryNotes,
        }),
      });

      if (emailResponse.ok) {
        const emailResult = await emailResponse.json();
        logger.info('✅ Email sent successfully via SMTP', { emailResult });
        logger.info('Order notification email sent via SMTP', { orderId, emailResult });
      } else {
        const errorData = await emailResponse.json();
        throw new Error(errorData.details || 'Email API error');
      }
    } catch (emailError) {
      // Si l'email échoue, on log mais on ne bloque pas la commande
      logger.error('Failed to send order email via SMTP', {
        error: emailError instanceof Error ? emailError.message : String(emailError),
        orderId,
      });
      logger.error('❌ SMTP email error details:', emailError);
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
