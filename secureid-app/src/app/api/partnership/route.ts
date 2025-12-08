import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { etablissement, type, responsable, email, telephone, ville, nombreEleves, message } = body;

    // Validation basique
    if (!etablissement || !responsable || !email) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      );
    }

    // Configuration du transporteur SMTP
    // Note: En production, utiliser des variables d'environnement sécurisées
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Ou autre service SMTP
      auth: {
        user: process.env.SMTP_USER || 'tko364796@gmail.com',
        pass: process.env.SMTP_PASS || '', // IMPORTANT: Ajouter le mot de passe dans .env.local
      },
    });

    // Contenu de l'email
    const emailContent = `
Nouvelle demande de partenariat école SecureID
=============================================

INFORMATIONS ÉTABLISSEMENT
--------------------------
Nom établissement : ${etablissement}
Type : ${type === 'ecole' ? 'École' : type === 'garderie' ? 'Garderie' : type === 'centre' ? "Centre d'accueil" : 'Autre'}
Ville : ${ville}
Nombre d'élèves : ${nombreEleves || 'Non renseigné'}

CONTACT RESPONSABLE
-------------------
Nom : ${responsable}
Email : ${email}
Téléphone : ${telephone || 'Non renseigné'}

MESSAGE
-------
${message || 'Aucun message'}

---
Email envoyé automatiquement depuis SecureID Landing Page
Date : ${new Date().toLocaleString('fr-FR')}
    `.trim();

    // Envoi de l'email
    const info = await transporter.sendMail({
      from: `"SecureID Partenariats" <${process.env.SMTP_USER || 'tko364796@gmail.com'}>`,
      to: 'tko364796@gmail.com',
      subject: `[SecureID] Nouvelle demande partenariat - ${etablissement}`,
      text: emailContent,
      html: `<pre style="font-family: monospace; white-space: pre-wrap;">${emailContent}</pre>`,
    });

    console.log('Email envoyé:', info.messageId);

    return NextResponse.json(
      {
        success: true,
        message: 'Demande envoyée avec succès',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de l\'envoi de la demande',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
