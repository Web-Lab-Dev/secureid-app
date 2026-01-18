import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { logger } from '@/lib/logger';
import { OrderSchema, validateInput } from '@/lib/api-validation';
import { logApiRequest, logApiError, addCorrelationIdHeader } from '@/lib/api-logger';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();

    // Validation stricte avec Zod
    const validation = validateInput(OrderSchema, body);

    if (!validation.success) {
      // Log tentative avec données invalides (sécurité)
      await logApiRequest(request, 'order_validation_failed', {
        errors: validation.errors,
        hasOrderId: !!body.orderId,
      });

      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Données validées et typées
    const {
      orderId,
      customerName,
      customerPhone,
      quantity,
      pricePerBracelet,
      totalAmount,
      deliveryAddress,
      gpsLocation,
      deliveryNotes,
    } = validation.data;

    // Validation des variables d'environnement SMTP
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      logger.error('SMTP credentials not configured', {
        hasUser: !!process.env.SMTP_USER,
        hasPass: !!process.env.SMTP_PASS,
      });
      return NextResponse.json(
        { error: 'Service de messagerie non configuré' },
        { status: 500 }
      );
    }

    // Configuration du transporteur SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Construction du lien Google Maps
    const mapsLink = gpsLocation
      ? `https://www.google.com/maps?q=${gpsLocation.lat},${gpsLocation.lng}`
      : 'GPS non disponible';

    // Contenu de l'email
    const emailContent = `
🛒 NOUVELLE COMMANDE SECUREID
=============================

COMMANDE N° ${orderId}
Date : ${new Date().toLocaleString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}

INFORMATIONS CLIENT
-------------------
Nom : ${customerName}
Téléphone : ${customerPhone}

DÉTAILS COMMANDE
----------------
Quantité : ${quantity} bracelet${quantity > 1 ? 's' : ''}
Prix unitaire : ${pricePerBracelet.toLocaleString('fr-FR')} FCFA
TOTAL À PAYER : ${totalAmount.toLocaleString('fr-FR')} FCFA

INFORMATIONS LIVRAISON
----------------------
Adresse : ${deliveryAddress}

Position GPS : ${gpsLocation ? `${gpsLocation.lat}, ${gpsLocation.lng}` : 'Non disponible'}
${gpsLocation ? `📍 Voir sur Google Maps : ${mapsLink}` : ''}

${deliveryNotes ? `Notes livraison : ${deliveryNotes}` : 'Aucune note particulière'}

---
✅ ACTION REQUISE : Contactez le client dans les 24h pour confirmer la livraison

Email envoyé automatiquement depuis SecureID
    `.trim();

    // Envoi de l'email
    const info = await transporter.sendMail({
      from: `"SecureID Commandes" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Email de réception des commandes
      subject: `🛒 Nouvelle Commande SecureID - ${orderId} (${quantity} bracelet${quantity > 1 ? 's' : ''})`,
      text: emailContent,
      html: `<pre style="font-family: monospace; white-space: pre-wrap;">${emailContent}</pre>`,
    });

    // Log succès avec contexte complet
    const duration = Date.now() - startTime;
    await logApiRequest(request, 'order_created', {
      orderId,
      customerPhone,
      quantity,
      totalAmount,
      hasGpsLocation: !!gpsLocation,
      messageId: info.messageId,
      duration,
    });

    // Ajouter correlation ID à la réponse pour traçabilité
    const headers = addCorrelationIdHeader(request);

    return NextResponse.json(
      {
        success: true,
        message: 'Email de commande envoyé avec succès',
        messageId: info.messageId,
      },
      { status: 200, headers }
    );
  } catch (error) {
    // Log erreur avec contexte complet
    logApiError(request, 'order_creation_failed', error, {
      hasBody: !!request.body,
    });

    return NextResponse.json(
      {
        error: "Erreur lors de l'envoi de l'email",
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
