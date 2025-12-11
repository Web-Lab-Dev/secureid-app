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

    // Vérifier la config SMTP
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    console.log('🔧 SMTP Config:', {
      user: smtpUser,
      hasPassword: !!smtpPass,
      passwordLength: smtpPass?.length || 0,
    });

    if (!smtpUser || !smtpPass) {
      console.error('❌ SMTP credentials missing!');
      return NextResponse.json(
        { error: 'Configuration SMTP manquante', details: 'SMTP_USER ou SMTP_PASS non configuré' },
        { status: 500 }
      );
    }

    // Configuration du transporteur SMTP (même config que partenariats)
    console.log('🔧 Creating SMTP transporter...');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Vérifier la connexion SMTP
    console.log('🔌 Verifying SMTP connection...');
    try {
      await transporter.verify();
      console.log('✅ SMTP connection verified');
    } catch (verifyError) {
      console.error('❌ SMTP verification failed:', verifyError);
      throw new Error(`SMTP verification failed: ${verifyError instanceof Error ? verifyError.message : 'Unknown error'}`);
    }

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
    console.log('📤 Sending email...', {
      from: smtpUser,
      to: smtpUser,
      subject: `🛒 Nouvelle Commande SecureID - ${orderId}`,
    });

    const info = await transporter.sendMail({
      from: `"SecureID Commandes" <${smtpUser}>`,
      to: smtpUser,
      subject: `🛒 Nouvelle Commande SecureID - ${orderId} (${quantity} bracelet${quantity > 1 ? 's' : ''})`,
      text: emailContent,
      html: `<pre style="font-family: 'Courier New', monospace; white-space: pre-wrap; background: #f5f5f5; padding: 20px; border-radius: 8px;">${emailContent}</pre>`,
    });

    console.log('✅ Email commande envoyé avec succès!', {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    });

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
