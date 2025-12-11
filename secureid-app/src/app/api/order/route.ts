import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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
    } = body;

    console.log('📧 API /api/order called', { orderId, customerName });

    // Validation basique
    if (!orderId || !customerName || !customerPhone || !deliveryAddress) {
      console.error('❌ Validation failed - missing required fields');
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      );
    }

    // Configuration du transporteur SMTP (EXACTEMENT comme partenariat)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER || 'tko364796@gmail.com',
        pass: process.env.SMTP_PASS || '',
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

    // Envoi de l'email (EXACTEMENT comme partenariat)
    const info = await transporter.sendMail({
      from: `"SecureID Commandes" <${process.env.SMTP_USER || 'tko364796@gmail.com'}>`,
      to: 'tko364796@gmail.com',
      subject: `🛒 Nouvelle Commande SecureID - ${orderId} (${quantity} bracelet${quantity > 1 ? 's' : ''})`,
      text: emailContent,
      html: `<pre style="font-family: monospace; white-space: pre-wrap;">${emailContent}</pre>`,
    });

    console.log('✅ Email commande envoyé:', info.messageId);

    return NextResponse.json(
      {
        success: true,
        message: 'Email de commande envoyé avec succès',
        messageId: info.messageId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Erreur envoi email commande:', error);
    return NextResponse.json(
      {
        error: "Erreur lors de l'envoi de l'email",
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
